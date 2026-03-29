import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'all'
  const limit = parseInt(url.searchParams.get('limit')) || 20
  const docId = url.searchParams.get('doc')

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { question_id, selected_option_id, is_correct, time_taken_ms } = await request.json()
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
    // 5 XP for a correct QBank question
    await admin.rpc('increment_xp', { uid: user.id, amount: 5 })
  } else {
    // Consolation XP for attempting
    await admin.rpc('increment_xp', { uid: user.id, amount: 1 })
  }
  
  return Response.json({ success: true })
}
