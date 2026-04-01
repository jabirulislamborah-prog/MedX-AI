import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateJSON, generateEmbedding } from '@/lib/ai/client'
import { LESSON_PROMPT, FLASHCARD_PROMPT, QBANK_PROMPT } from '@/lib/ai/prompts'
import { validateFileUpload, validateString, sanitizeInput } from '@/lib/security/validation'
import { uploadLimiter } from '@/lib/security/rate-limit'

export const maxDuration = 300

function withTimeout(promise, ms, errorMsg) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ])
}

// Apply rate limiting
export async function POST(request) {
  // Check rate limit
  const rateLimitResult = await uploadLimiter(request)
  if (rateLimitResult) return rateLimitResult

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')
    const subjectInput = formData.get('subject') || 'Medical Content'

    // Validate file upload
    const fileValidation = validateFileUpload(file)
    if (!fileValidation.valid) {
      return Response.json({ error: fileValidation.error }, { status: 400 })
    }

    // Validate and sanitize subject
    const subjectValidation = validateString(subjectInput, {
      maxLength: 200,
      allowSpecialChars: false,
      name: 'Subject'
    })
    if (!subjectValidation.valid) {
      return Response.json({ error: subjectValidation.error }, { status: 400 })
    }
    
    const subject = sanitizeInput(subjectValidation.sanitized)

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const admin = createAdminClient()

    // 1. Check user plan constraints
    const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single()
    const userPlan = profile?.plan || 'free'

    if (userPlan === 'free') {
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

    // Secure filename - use sanitized name with timestamp
    const timestamp = Date.now()
    const sanitizedName = fileValidation.sanitizedName
    const fileName = `${user.id}/${timestamp}_${sanitizedName}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'application/pdf'

    await admin.storage.from('documents').upload(fileName, buffer, { contentType: mimeType })

    // Create document record
    const { data: doc } = await admin.from('documents').insert({
      user_id: user.id, title: subject, file_path: fileName,
      file_size: file.size, status: 'processing', subject
    }).select().single()

    // Parse text from file using appropriate parser
    let extractedText = ''
    console.log('[Process] Starting file parsing, mimeType:', mimeType)

    const isPdf = mimeType === 'application/pdf'
    const isTextFile = mimeType === 'text/plain' || mimeType === 'text/csv'
    const isDocx = mimeType.includes('wordprocessingml') || file.name.endsWith('.docx')
    const isPptx = mimeType.includes('presentationml') || file.name.endsWith('.pptx')
    const isXlsx = mimeType.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

    if (isPdf) {
      try {
        console.log('[Process] Parsing PDF...')
        const { default: pdfParse } = await import('pdf-parse')
        const pdfData = await withTimeout(pdfParse(buffer), 45000, 'PDF parsing timed out after 45s')
        extractedText = pdfData.text || ''
        console.log('[Process] PDF parsed, text length:', extractedText.length)
      } catch (e) {
        console.error('[Process] PDF parse error:', e)
      }
    } else if (isDocx) {
      try {
        console.log('[Process] Parsing DOCX...')
        const mammoth = await import('mammoth')
        const result = await withTimeout(mammoth.default.extractRawText({ buffer }), 30000, 'DOCX parsing timed out')
        extractedText = result.value || ''
        console.log('[Process] DOCX parsed, text length:', extractedText.length)
      } catch (e) {
        console.error('[Process] DOCX parse error:', e)
        try {
          const officeparser = await import('officeparser')
        const parse = officeparser.parseOffice || officeparser.default?.parseOffice || officeparser.default
        extractedText = await withTimeout(parse(buffer), 30000, 'DOCX fallback timed out')
          console.log('[Process] DOCX fallback (officeparser), text length:', extractedText.length)
        } catch (e2) {
          console.error('[Process] DOCX fallback also failed:', e2)
        }
      }
    } else if (isPptx) {
      try {
        console.log('[Process] Parsing PPTX with officeparser...')
        const officeparser = await import('officeparser')
        const parse = officeparser.parseOffice || officeparser.default?.parseOffice || officeparser.default
        extractedText = await withTimeout(parse(buffer), 30000, 'PPTX parsing timed out')
        console.log('[Process] PPTX parsed, text length:', extractedText.length)
      } catch (e) {
        console.error('[Process] PPTX parse error:', e)
      }
    } else if (isXlsx) {
      try {
        console.log('[Process] Parsing XLSX...')
        const XLSX = await import('xlsx')
        const workbook = XLSX.default.read(buffer, { type: 'buffer' })
        let sheetText = ''
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName]
          sheetText += `\n=== ${sheetName} ===\n${XLSX.default.utils.sheet_to_csv(sheet)}`
        }
        extractedText = sheetText
        console.log('[Process] XLSX parsed, text length:', extractedText.length)
      } catch (e) {
        console.error('[Process] XLSX parse error:', e)
      }
    } else if (isTextFile) {
      extractedText = buffer.toString('utf-8')
      console.log('[Process] Text file parsed, text length:', extractedText.length)
    } else {
      try {
        console.log('[Process] Trying officeparser as universal fallback...')
        const officeparser = await import('officeparser')
        const parse = officeparser.parseOffice || officeparser.default?.parseOffice || officeparser.default
        extractedText = await withTimeout(parse(buffer), 30000, 'Office parser timed out')
        console.log('[Process] Officeparser fallback, text length:', extractedText.length)
      } catch {
        try {
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
          console.log('[Process] Raw text fallback, text length:', extractedText.length)
        } catch {}
      }
    }

    // Clean and validate extracted text
    if (!extractedText || extractedText.length < 50) {
      console.log('[Process] Warning: Low extracted text length:', extractedText?.length)
      extractedText = `Document: ${file.name}. Subject: ${subject}.`
    }
    
    // Clean up any problematic characters that could confuse the AI
    extractedText = extractedText
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08]/g, '') // Remove control characters
      .replace(/={3,}/g, '=') // Normalize multiple equals
      .replace(/-{3,}/g, '-') // Normalize multiple dashes
      .replace(/\n{4,}/g, '\n\n\n') // Limit excessive newlines
      .trim()
    
    console.log('[Process] Cleaned text length:', extractedText.length)

    // Chunk text into ~1000 char segments
    const chunkSize = 1000
    const overlap = 100
    const chunks = []
    for (let i = 0; i < extractedText.length; i += chunkSize - overlap) {
      chunks.push(extractedText.slice(i, i + chunkSize))
    }
    console.log('[Process] Created', chunks.length, 'chunks')

    // Embed and store chunks (batch to avoid rate limits)
    console.log('[Process] Starting embedding generation...')
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

    // Use first 5 chunks for lesson/QBank generation
    const contentForGeneration = chunks.slice(0, 5).join('\n\n')
    console.log('[Process] Content for generation length:', contentForGeneration.length)
    
    if (contentForGeneration.length < 100) {
      throw new Error('Not enough text extracted from the document to generate questions. Please upload a PDF or document with readable text content.')
    }

    // Generate content in parallel for faster processing
    console.log('[Process] Generating content in parallel...')
    let lessonsGenerated = 0
    let flashcardsGenerated = 0
    let questionsGenerated = 0

    try {
      const [lessonData, fcData, qbData] = await Promise.all([
        generateJSON(LESSON_PROMPT(contentForGeneration, subject)).catch(e => {
          console.error('Lesson gen error:', e.message)
          return { lessons: [] }
        }),
        generateJSON(FLASHCARD_PROMPT(contentForGeneration)).catch(e => {
          console.error('Flashcard gen error:', e.message)
          return { flashcards: [], cards: [] }
        }),
        generateJSON(QBANK_PROMPT(contentForGeneration)).catch(e => {
          console.error('QBank gen error:', e.message)
          return { questions: [], qbank: [] }
        })
      ])

      console.log('[Process] All generation calls completed')

      // Process lessons
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
        lessonsGenerated++
      }

      // Process flashcards
      const fcArr = fcData.flashcards || fcData.cards || []
      if (fcArr.length) {
        const toInsert = fcArr.map((fc, i) => ({
          user_id: user.id, document_id: doc.id,
          front_text: fc.front || fc.question || fc.front_text || `Review card ${i+1}`,
          back_text: fc.back || fc.answer || fc.back_text || 'See text for answer',
          card_type: fc.type || fc.card_type || 'basic'
        }))
        const { error: fcErr } = await admin.from('flashcards').insert(toInsert)
        if (fcErr) throw new Error('Flashcard Insert Error: ' + fcErr.message)
        flashcardsGenerated = fcArr.length
      }

      // Process QBank
      const qbArr = qbData.questions || qbData.qbank || []
      if (qbArr.length) {
        const toInsert = qbArr.map((q, i) => {
          const opts = Array.isArray(q.options) ? q.options : []
          const correctOpt = opts.find(o => o.is_correct === true || o.correct === true)
          const correctId = correctOpt?.id || q.correct_option_id || 'a'
          
          return {
            user_id: user.id, document_id: doc.id, subject,
            question_stem: q.stem || q.question || q.question_stem || `Diagnostic question ${i+1}`,
            lead_in: q.lead_in || 'What is the most likely diagnosis?',
            options: JSON.stringify(opts.length > 0 ? opts : [{id:'a',text:'True'},{id:'b',text:'False'}]),
            correct_option_id: correctId,
            explanation_brief: q.explanation_brief || q.explanation || '',
            explanation_detailed: q.explanation_detailed || q.explanation || '',
            difficulty: q.difficulty || 'medium'
          }
        })
        const { error: qbErr } = await admin.from('qbank_questions').insert(toInsert)
        if (qbErr) throw new Error('QBank Insert Error: ' + qbErr.message)
        questionsGenerated = qbArr.length
      }
    } catch (e) {
      console.error('Content generation error:', e.message)
    }

    console.log('[Process] Summary - Lessons:', lessonsGenerated, 'Flashcards:', flashcardsGenerated, 'Questions:', questionsGenerated)
    
    // If nothing generated, throw error
    if (lessonsGenerated === 0 && flashcardsGenerated === 0 && questionsGenerated === 0) {
      throw new Error('Failed to generate content from this document. Please try a different file or ensure the document contains readable text.')
    }

    // Mark document ready
    await admin.from('documents').update({ status: 'ready', total_chunks: chunkRecords.length }).eq('id', doc.id)

    return Response.json({ 
      document_id: doc.id, 
      status: 'ready',
      generated: {
        lessons: lessonsGenerated,
        flashcards: flashcardsGenerated,
        questions: questionsGenerated
      }
    })
  } catch (error) {
    console.error('[Process] ERROR:', error.message)
    console.error('[Process] Stack:', error.stack)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
