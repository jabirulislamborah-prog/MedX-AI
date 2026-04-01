import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateNextReview } from '@/lib/srs/algorithm'
import { apiLimiter } from '@/lib/security/rate-limit'
import { validateNumber, validateUUID } from '@/lib/security/validation'

export async function GET(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const url = new URL(request.url)
  const docId = url.searchParams.get('doc')
  
  // Validate docId if provided
  if (docId) {
    const docValidation = validateUUID(docId)
    if (!docValidation.valid) {
      return Response.json({ error: 'Invalid document ID' }, { status: 400 })
    }
  }
  
  let query = supabase.from('flashcards').select('*,documents(title)')
    .eq('user_id', user.id).lte('next_review_at', new Date().toISOString())
  
  if (docId) {
    query = query.eq('document_id', docId)
  }
  
  const { data } = await query.order('next_review_at').limit(50)
  return Response.json({ cards: data || [] })
}

export async function POST(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  const { card_id, rating } = body
  
  // Validate card_id
  if (!card_id) {
    return Response.json({ error: 'Card ID is required' }, { status: 400 })
  }
  
  const cardIdValidation = validateUUID(card_id)
  if (!cardIdValidation.valid) {
    return Response.json({ error: 'Invalid card ID' }, { status: 400 })
  }
  
  // Validate rating
  if (rating === undefined || rating === null) {
    return Response.json({ error: 'Rating is required' }, { status: 400 })
  }
  
  const ratingValidation = validateNumber(rating, { min: 1, max: 4, name: 'Rating' })
  if (!ratingValidation.valid) {
    return Response.json({ error: ratingValidation.error }, { status: 400 })
  }
  
  const admin = createAdminClient()
  
  // Verify card belongs to user before updating (prevent IDOR)
  const { data: card } = await admin.from('flashcards').select('*').eq('id', card_id).eq('user_id', user.id).single()
  if (!card) return Response.json({ error: 'Card not found' }, { status: 404 })
  
  const updates = calculateNextReview(card, rating)
  await admin.from('flashcards').update(updates).eq('id', card_id)
  await admin.from('flashcard_reviews').insert({ flashcard_id: card_id, user_id: user.id, rating })
  
  // Award XP for reviews
  if (rating >= 3) await admin.rpc('increment_xp', { uid: user.id, amount: 2 })
  
  return Response.json({ success: true, next_review: updates.next_review_at })
}
