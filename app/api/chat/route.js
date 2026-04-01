import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding, generateStream, generateJSON } from '@/lib/ai/client'
import { SOCRATIC_SYSTEM } from '@/lib/ai/prompts'
import { validateString, validateUUID, sanitizeInput, containsXSS } from '@/lib/security/validation'
import { chatLimiter } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResult = await chatLimiter(request)
  if (rateLimitResult) return rateLimitResult

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    let { message, conversation_id, document_id } = body
    
    // Validate message input
    const messageValidation = validateString(message, {
      minLength: 1,
      maxLength: 5000,
      name: 'Message'
    })
    if (!messageValidation.valid) {
      return Response.json({ error: messageValidation.error }, { status: 400 })
    }
    
    // Additional XSS check
    if (containsXSS(message)) {
      return Response.json({ error: 'Message contains invalid content' }, { status: 400 })
    }
    
    // Sanitize message
    message = sanitizeInput(messageValidation.sanitized)
    
    // Validate conversation_id if provided
    if (conversation_id) {
      const convValidation = validateUUID(conversation_id)
      if (!convValidation.valid) {
        return Response.json({ error: 'Invalid conversation ID' }, { status: 400 })
      }
    }
    
    // Validate document_id if provided
    if (document_id) {
      const docValidation = validateUUID(document_id)
      if (!docValidation.valid) {
        return Response.json({ error: 'Invalid document ID' }, { status: 400 })
      }
    }

    const admin = createAdminClient()
    console.log('[Chat] Processing message from user:', user.id)

    // Get or create conversation
    let convId = conversation_id
    if (!convId) {
      try {
        const { data: conv } = await admin.from('chat_conversations').insert({
          user_id: user.id, context_document_id: document_id || null
        }).select().single()
        convId = conv?.id
      } catch (e) {
        console.log('[Chat] Could not create conversation:', e.message)
      }
    }

    // Get history
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

    // RAG: embed the question and find relevant chunks (non-critical)
    let context = '\n\nUse your medical knowledge to answer this question. Provide educational, Socratic guidance.'
    try {
      console.log('[Chat] Generating embedding for RAG...')
      const queryEmbedding = await generateEmbedding(message)
      if (queryEmbedding && queryEmbedding.length > 0) {
        console.log('[Chat] Embedding generated, searching chunks...')
        const { data: chunks } = await admin.rpc('match_chunks', {
          query_embedding: `[${queryEmbedding.join(',')}]`,
          match_threshold: 0.5, match_count: 4,
          filter_user_id: user.id
        })
        if (chunks?.length) {
          context = '\n\nRELEVANT STUDY MATERIAL:\n' + chunks.map(c => c.content).join('\n---\n')
          console.log('[Chat] Found', chunks.length, 'relevant chunks')
        }
      }
    } catch (e) {
      console.error('[Chat] RAG failed (non-critical):', e.message?.substring(0, 100))
    }

    // Save user message
    if (convId) {
      try {
        await admin.from('chat_messages').insert({ conversation_id: convId, role: 'user', content: message })
      } catch (e) {
        console.log('[Chat] Could not save user message:', e.message)
      }
    }

    // Build prompt
    const historyText = (history || []).map(m => `${m.role}: ${m.content}`).join('\n')
    const fullPrompt = `${historyText}\nuser: ${message}${context}`
    console.log('[Chat] Full prompt length:', fullPrompt.length)

    // ===== Try streaming first, fall back to non-streaming =====
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
          console.log('[Chat] Stream complete,', chunkCount, 'chunks,', fullResponse.length, 'chars')
        } catch (streamError) {
          console.error('[Chat] Stream failed:', streamError.message?.substring(0, 200))
          
          // FALLBACK: Try a non-streaming JSON call
          if (!fullResponse) {
            try {
              console.log('[Chat] Attempting non-streaming fallback...')
              const fallback = await generateJSON(
                `${fullPrompt}\n\nRespond as a medical tutor in plain text. Be helpful and educational.`,
                SOCRATIC_SYSTEM
              )
              const fallbackText = fallback.response || fallback.answer || fallback.text || fallback.content || JSON.stringify(fallback)
              fullResponse = fallbackText
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText, conversation_id: convId })}\n\n`))
              console.log('[Chat] Non-streaming fallback succeeded')
            } catch (fallbackError) {
              console.error('[Chat] Non-streaming fallback also failed:', fallbackError.message?.substring(0, 200))
              const errorMsg = "I'm temporarily experiencing high demand. Please try again in a few seconds — your question is important!"
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMsg, conversation_id: convId })}\n\n`))
            }
          }
        }

        // Save assistant message
        if (convId && fullResponse) {
          try {
            await admin.from('chat_messages').insert({ conversation_id: convId, role: 'assistant', content: fullResponse })
          } catch (e) {
            console.log('[Chat] Could not save assistant message:', e.message)
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Conversation-Id': convId || ''
      }
    })
  } catch (error) {
    console.error('[Chat] Top-level error:', error.message, error.stack?.substring(0, 300))
    return Response.json({ error: error.message }, { status: 500 })
  }
}
