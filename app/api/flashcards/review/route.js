import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateNextReview } from '@/lib/srs/algorithm'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase.from('flashcards').select('*,documents(title)')
    .eq('user_id', user.id).lte('next_review_at', new Date().toISOString()).order('next_review_at').limit(50)
  return Response.json({ cards: data || [] })
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { card_id, rating } = await request.json()
  const admin = createAdminClient()
  const { data: card } = await admin.from('flashcards').select('*').eq('id', card_id).single()
  if (!card) return Response.json({ error: 'Card not found' }, { status: 404 })
  const updates = calculateNextReview(card, rating)
  await admin.from('flashcards').update(updates).eq('id', card_id)
  await admin.from('flashcard_reviews').insert({ flashcard_id: card_id, user_id: user.id, rating })
  // Award XP for reviews
  if (rating >= 3) await admin.rpc('increment_xp', { uid: user.id, amount: 2 })
  return Response.json({ success: true, next_review: updates.next_review_at })
}
