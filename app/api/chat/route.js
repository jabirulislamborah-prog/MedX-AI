import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding, generateStream } from '@/lib/ai/gemini'
import { SOCRATIC_SYSTEM } from '@/lib/ai/prompts'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, conversation_id, document_id } = await request.json()
    const admin = createAdminClient()

    // Get conversation history
    let convId = conversation_id
    if (!convId) {
      const { data: conv } = await admin.from('chat_conversations').insert({
        user_id: user.id, context_document_id: document_id || null
      }).select().single()
      convId = conv.id
    }

    const { data: history } = await admin.from('chat_messages')
      .select('role,content').eq('conversation_id', convId)
      .order('created_at').limit(20)

    // RAG: embed the question and find relevant chunks
    let context = ''
    try {
      const queryEmbedding = await generateEmbedding(message)
      const { data: chunks } = await admin.rpc('match_chunks', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.5, match_count: 4,
        filter_user_id: user.id
      })
      if (chunks?.length) {
        context = '\n\nRELEVANT STUDY MATERIAL:\n' + chunks.map(c => c.content).join('\n---\n')
      }
    } catch { /* RAG failed, continue without context */ }

    // Save user message
    await admin.from('chat_messages').insert({ conversation_id: convId, role: 'user', content: message })

    // Build prompt with history
    const historyText = (history || []).map(m => `${m.role}: ${m.content}`).join('\n')
    const fullPrompt = `${historyText}\nuser: ${message}${context}`

    // Stream response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateStream(fullPrompt, SOCRATIC_SYSTEM)) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk, conversation_id: convId })}\n\n`))
          }
          // Save assistant message
          await admin.from('chat_messages').insert({ conversation_id: convId, role: 'assistant', content: fullResponse })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      }
    })

    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Conversation-Id': convId } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
