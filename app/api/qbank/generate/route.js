import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiLimiter } from '@/lib/security/rate-limit'
import { validateNumber, validateUUID } from '@/lib/security/validation'

export async function GET(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  let limit = 20
  const limitParam = url.searchParams.get('limit')
  const docId = url.searchParams.get('doc')

  // Validate limit
  if (limitParam) {
    const limitValidation = validateNumber(limitParam, { min: 1, max: 100, name: 'Limit' })
    if (!limitValidation.valid) {
      return Response.json({ error: limitValidation.error }, { status: 400 })
    }
    limit = limitValidation.sanitized
  }

  // Validate docId if provided
  if (docId) {
    const docValidation = validateUUID(docId)
    if (!docValidation.valid) {
      return Response.json({ error: 'Invalid document ID' }, { status: 400 })
    }
  }

  let query = supabase.from('qbank_questions').select('*, qbank_attempts(is_correct)')
    .eq('user_id', user.id)

  if (docId) {
    query = query.eq('document_id', docId)
  }

  const { data: qbankData, error } = await query

  if (error || !qbankData) return Response.json({ questions: [] })

  let finalQuestions = qbankData.sort(() => 0.5 - Math.random()).slice(0, limit)
  const output = finalQuestions.map(({ qbank_attempts, ...rest }) => rest)

  return Response.json({ questions: output })
}

export async function POST(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { question_id, selected_option_id, is_correct, time_taken_ms } = await request.json()
  
  // Validate required fields
  if (!question_id || !selected_option_id || typeof is_correct !== 'boolean') {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  
  // Validate time_taken_ms if provided
  if (time_taken_ms !== undefined) {
    const timeValidation = validateNumber(time_taken_ms, { min: 0, max: 600000, name: 'Time' })
    if (!timeValidation.valid) {
      return Response.json({ error: timeValidation.error }, { status: 400 })
    }
  }
  
  const admin = createAdminClient()
  
  // Log the attempt
  await admin.from('qbank_attempts').insert({ 
    user_id: user.id, 
    question_id, 
    selected_option_id, 
    is_correct,
    time_taken_ms: time_taken_ms || 0
  })
  
  // Award XP based on correctness
  if (is_correct) {
    await admin.rpc('increment_xp', { uid: user.id, amount: 5 })
  } else {
    await admin.rpc('increment_xp', { uid: user.id, amount: 1 })
  }
  
  return Response.json({ success: true })
}
