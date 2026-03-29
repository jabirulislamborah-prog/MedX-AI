import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/profile/streak — call this on every lesson/drill completion
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('streak_days,last_activity_at,streak_frozen').eq('id', user.id).single()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const lastActivity = profile?.last_activity_at ? new Date(profile.last_activity_at) : null
  const lastDay = lastActivity?.toISOString().split('T')[0]

  let newStreak = profile?.streak_days || 0

  if (lastDay === today) {
    // Already logged activity today, no streak change
    return NextResponse.json({ streak: newStreak, message: 'already_logged_today' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (lastDay === yesterdayStr || newStreak === 0) {
    // Consecutive day — increment
    newStreak += 1
  } else if (profile?.streak_frozen) {
    // Streak freeze used — keep streak but reset freeze
    newStreak = newStreak // keep existing streak
  } else {
    // Streak broken — reset
    newStreak = 1
  }

  await supabase.from('profiles').update({
    streak_days: newStreak,
    last_activity_at: now.toISOString(),
    streak_frozen: false
  }).eq('id', user.id)

  // Award XP bonus for streak milestones
  let bonusXP = 0
  if ([7, 14, 30, 60, 100, 365].includes(newStreak)) {
    bonusXP = newStreak >= 100 ? 500 : newStreak >= 30 ? 200 : newStreak >= 7 ? 50 : 0
    if (bonusXP > 0) {
      await supabase.rpc('increment_xp', { user_id: user.id, amount: bonusXP })
    }
  }

  return NextResponse.json({
    streak: newStreak,
    bonusXP,
    milestone: [7, 14, 30, 60, 100, 365].includes(newStreak) ? newStreak : null,
    message: 'streak_updated'
  })
}

// GET /api/profile/streak — get current streak status
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_days,last_activity_at,streak_frozen')
    .eq('id', user.id).single()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const lastActivity = profile?.last_activity_at ? new Date(profile.last_activity_at) : null
  const lastDay = lastActivity?.toISOString().split('T')[0]

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const isAtRisk = profile?.streak_days > 0 && lastDay !== today && lastDay !== yesterdayStr ? false
    : profile?.streak_days > 0 && lastDay !== today

  return NextResponse.json({
    streak: profile?.streak_days || 0,
    isAtRisk,
    lastActivity: profile?.last_activity_at,
    streakFrozen: profile?.streak_frozen || false,
  })
}
