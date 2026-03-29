import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return Response.json({ profile: data })
}

export async function PATCH(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const allowed = ['full_name', 'bio', 'medical_school', 'exam_target', 'avatar_url']
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').update(updates).eq('id', user.id).select().single()
  return Response.json({ profile: data })
}
