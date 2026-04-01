import { createClient } from '@/lib/supabase/server'
import { validateString, validateUUID, sanitizeInput, containsXSS, containsSQLInjection } from '@/lib/security/validation'
import { apiLimiter } from '@/lib/security/rate-limit'

export async function GET(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return Response.json({ profile: data })
}

export async function PATCH(request) {
  const rateLimitResult = await apiLimiter(request)
  if (rateLimitResult) return rateLimitResult

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await request.json()
  
  // Validate and sanitize all inputs
  const allowedFields = ['full_name', 'bio', 'medical_school', 'exam_target', 'avatar_url']
  const updates = {}
  
  for (const [key, value] of Object.entries(body)) {
    if (!allowedFields.includes(key)) continue
    
    // Skip dangerous fields if not allowed
    if (['full_name', 'bio', 'medical_school'].includes(key)) {
      // Check for injection attempts
      if (containsSQLInjection(value) || containsXSS(value)) {
        return Response.json({ error: 'Invalid input detected' }, { status: 400 })
      }
      
      const validation = validateString(value, {
        maxLength: key === 'bio' ? 1000 : 200,
        allowHTML: false,
        name: key
      })
      
      if (!validation.valid) {
        return Response.json({ error: validation.error }, { status: 400 })
      }
      
      updates[key] = sanitizeInput(validation.sanitized)
    } else if (key === 'exam_target') {
      if (value && !['USMLE', 'NEET PG', 'PLAB', 'AMC', 'OTHER'].includes(value)) {
        return Response.json({ error: 'Invalid exam target' }, { status: 400 })
      }
      updates[key] = value
    } else if (key === 'avatar_url') {
      // Validate URL format
      if (value && !value.match(/^https?:\/\/.+/)) {
        return Response.json({ error: 'Invalid avatar URL' }, { status: 400 })
      }
      updates[key] = value
    }
  }
  
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').update(updates).eq('id', user.id).select().single()
  return Response.json({ profile: data })
}
