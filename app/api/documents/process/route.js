import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateJSON, generateEmbedding } from '@/lib/ai/gemini'
import { LESSON_PROMPT, FLASHCARD_PROMPT, QBANK_PROMPT } from '@/lib/ai/prompts'

export const maxDuration = 300

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')
    const subject = formData.get('subject') || 'Medical Content'

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const admin = createAdminClient()

    // 1. Check user plan constraints
    const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single()
    const userPlan = profile?.plan || 'free'

    if (userPlan === 'free') {
      // Check uploads in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: currentUploads, error: countErr } = await admin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (currentUploads >= 5) {
        return Response.json({ error: 'Free tier limit reached. Please upgrade to Pro to upload more documents.' }, { status: 403 })
      }
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await admin.storage.from('documents').upload(fileName, buffer, { contentType: 'application/pdf' })

    // Create document record
    const { data: doc } = await admin.from('documents').insert({
      user_id: user.id, title: subject, file_path: fileName,
      file_size: file.size, status: 'processing', subject
    }).select().single()

    // Parse PDF text (using Gemini's multimodal)
    const base64 = buffer.toString('base64')

    // Generate content from PDF using Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const extractResult = await model.generateContent([
      { inlineData: { mimeType: 'application/pdf', data: base64 } },
      'Extract all the medical text content from this PDF. Return the full text content organized by sections.'
    ])
    const extractedText = extractResult.response.text()

    // Chunk text into ~1000 char segments
    const chunkSize = 1000
    const overlap = 100
    const chunks = []
    for (let i = 0; i < extractedText.length; i += chunkSize - overlap) {
      chunks.push(extractedText.slice(i, i + chunkSize))
    }

    // Embed and store chunks (batch to avoid rate limits)
    const chunkRecords = []
    for (let i = 0; i < Math.min(chunks.length, 30); i++) {
      try {
        const embedding = await generateEmbedding(chunks[i])
        chunkRecords.push({
          document_id: doc.id, user_id: user.id, content: chunks[i],
          chunk_index: i, embedding: `[${embedding.join(',')}]`,
          metadata: { subject, chunkIndex: i }
        })
      } catch { /* skip failed embeddings */ }
    }

    if (chunkRecords.length > 0) {
      await admin.from('document_chunks').insert(chunkRecords)
    }

    // Use first 3 chunks for lesson/QBank generation
    const contentForGeneration = chunks.slice(0, 5).join('\n\n')

    // Generate lessons
    try {
      const lessonData = await generateJSON(LESSON_PROMPT(contentForGeneration, subject))
      for (let li = 0; li < (lessonData.lessons || []).length; li++) {
        const l = lessonData.lessons[li]
        const { data: lesson } = await admin.from('lessons').insert({
          user_id: user.id, document_id: doc.id, title: l.title,
          description: l.description, subject, lesson_order: li,
          total_questions: l.questions?.length || 0, xp_reward: 20 + li * 5
        }).select().single()

        if (lesson && l.questions) {
          const qRecords = l.questions.map((q, qi) => ({
            lesson_id: lesson.id, question_type: q.type,
            question_text: q.question, options: q.options ? JSON.stringify(q.options) : null,
            correct_answer: q.correct_answer, explanation: q.explanation,
            difficulty: qi < 3 ? 1 : qi < 6 ? 2 : 3, question_order: qi
          }))
          await admin.from('lesson_questions').insert(qRecords)
        }
      }
    } catch (e) { console.error('Lesson gen error:', e) }

    // Generate flashcards
    try {
      const fcData = await generateJSON(FLASHCARD_PROMPT(contentForGeneration))
      if (fcData.flashcards?.length) {
        await admin.from('flashcards').insert(
          fcData.flashcards.map(fc => ({
            user_id: user.id, document_id: doc.id,
            front_text: fc.front, back_text: fc.back, card_type: fc.type || 'basic'
          }))
        )
      }
    } catch (e) { console.error('Flashcard gen error:', e) }

    // Generate QBank
    try {
      const qbData = await generateJSON(QBANK_PROMPT(contentForGeneration))
      if (qbData.questions?.length) {
        await admin.from('qbank_questions').insert(
          qbData.questions.map(q => ({
            user_id: user.id, document_id: doc.id, subject,
            question_stem: q.stem, lead_in: q.lead_in,
            options: JSON.stringify(q.options),
            correct_option_id: q.options?.find(o=>o.is_correct)?.id,
            explanation_brief: q.explanation_brief,
            explanation_detailed: q.explanation_detailed,
            difficulty: q.difficulty || 'medium'
          }))
        )
      }
    } catch (e) { console.error('QBank gen error:', e) }

    // Mark document ready
    await admin.from('documents').update({ status: 'ready', total_chunks: chunkRecords.length }).eq('id', doc.id)

    return Response.json({ document_id: doc.id, status: 'ready' })
  } catch (error) {
    console.error('Process error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
