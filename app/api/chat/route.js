import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding, generateStream } from '@/lib/ai/client'
import { SOCRATIC_SYSTEM } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, conversation_id, document_id } = await request.json()
    
    if (!message || message.trim().length === 0) {
      return Response.json({ error: 'Empty message' }, { status: 400 })
    }

    const admin = createAdminClient()
    console.log('[Chat] Processing message from user:', user.id)

    // Get conversation history
    let convId = conversation_id
    if (!convId) {
      try {
        const { data: conv } = await admin.from('chat_conversations').insert({
          user_id: user.id, context_document_id: document_id || null
        }).select().single()
        convId = conv?.id
      } catch (e) {
        console.log('[Chat] Could not create conversation, continuing without:', e.message)
      }
    }

    // Get history if we have a conversation
    let history = []
    if (convId) {
      try {
        const { data: hist } = await admin.from('chat_messages')
          .select('role,content').eq('conversation_id', convId)
          .order('created_at').limit(10)
        history = hist || []
      } catch (e) {
        console.log('[Chat] Could not load history:', e.message)
      }
    }

    // RAG: embed the question and find relevant chunks
    let context = ''
    try {
      console.log('[Chat] Generating embedding for RAG...')
      const queryEmbedding = await generateEmbedding(message)
      console.log('[Chat] Embedding generated, searching chunks...')
      
      const { data: chunks } = await admin.rpc('match_chunks', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.5, match_count: 4,
        filter_user_id: user.id
      })
      if (chunks?.length) {
        context = '\n\nRELEVANT STUDY MATERIAL:\n' + chunks.map(c => c.content).join('\n---\n')
        console.log('[Chat] Found', chunks.length, 'relevant chunks')
      } else {
        console.log('[Chat] No chunks found, will use general medical knowledge')
        context = '\n\nUse your medical knowledge to answer this question. Provide educational, Socratic guidance.'
      }
    } catch (e) {
      console.error('[Chat] RAG failed:', e.message)
      context = '\n\nNo specific study material found. Answer using general medical knowledge with Socratic method.'
    }

    // Save user message
    if (convId) {
      try {
        await admin.from('chat_messages').insert({ conversation_id: convId, role: 'user', content: message })
      } catch (e) {
        console.log('[Chat] Could not save user message:', e.message)
      }
    }

    // Build prompt with history
    const historyText = (history || []).map(m => `${m.role}: ${m.content}`).join('\n')
    const fullPrompt = `${historyText}\nuser: ${message}${context}`
    console.log('[Chat] Full prompt length:', fullPrompt.length)

    // Stream response
    const encoder = new TextEncoder()
    let fullResponse = ''

    console.log('[Chat] Starting AI stream...')
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let chunkCount = 0
          for await (const chunk of generateStream(fullPrompt, SOCRATIC_SYSTEM)) {
            fullResponse += chunk
            chunkCount++
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk, conversation_id: convId })}\n\n`))
          }
          console.log('[Chat] Stream complete,', chunkCount, 'chunks')
          
          // Save assistant message
          if (convId) {
            try {
              await admin.from('chat_messages').insert({ conversation_id: convId, role: 'assistant', content: fullResponse })
            } catch (e) {
              console.log('[Chat] Could not save assistant message:', e.message)
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e) {
          console.error('[Chat] Stream error:', e.message)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: 'I apologize, but I encountered an error. Please try again or rephrase your question.', conversation_id: convId })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }
    })

    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Conversation-Id': convId || '' } })
  } catch (error) {
    console.error('[Chat] Error:', error.message, error.stack)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
