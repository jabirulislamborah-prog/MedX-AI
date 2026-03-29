import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'all'
  const limit = parseInt(url.searchParams.get('limit')) || 20

  let query = supabase.from('qbank_questions').select('*, qbank_attempts(is_correct)')
    .eq('user_id', user.id)

  const { data: qbankData, error } = await query

  if (error || !qbankData) return Response.json({ questions: [] })

  // Smart filtering based on mode
  let finalQuestions = []
  
  if (mode === 'daily') {
    // 40% weak (previously answered incorrectly)
    // 40% untested (never answered)
    // 20% random review (answered correctly)
    const weak = qbankData.filter(q => q.qbank_attempts?.some(a => a.is_correct === false))
    const untested = qbankData.filter(q => !q.qbank_attempts || q.qbank_attempts.length === 0)
    const review = qbankData.filter(q => q.qbank_attempts?.some(a => a.is_correct === true))

    // Shuffle arrays
    const shuffle = arr => arr.sort(() => 0.5 - Math.random())
    finalQuestions = [
      ...shuffle(weak).slice(0, Math.floor(limit * 0.4)),
      ...shuffle(untested).slice(0, Math.floor(limit * 0.4)),
      ...shuffle(review).slice(0, Math.ceil(limit * 0.2))
    ]
    
    // Fill remaining if shortages exist
    if (finalQuestions.length < limit) {
      const remaining = shuffle([...untested, ...weak, ...review]).filter(q => !finalQuestions.includes(q))
      finalQuestions = [...finalQuestions, ...remaining.slice(0, limit - finalQuestions.length)]
    }
    
    finalQuestions = shuffle(finalQuestions)
  } else {
    // Standard mode: prefer untested, random order
    finalQuestions = qbankData.sort(() => 0.5 - Math.random()).slice(0, limit)
  }

  // Remove the nested tracking data before sending to client
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
