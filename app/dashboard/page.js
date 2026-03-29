import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import Hearts from '@/components/Celebration'

const DAILY_GOALS = [
  { icon: '📝', label: 'Answer 20 Qs', target: 20, type: 'questions' },
  { icon: '⏱️', label: '10 min study', target: 600, type: 'time' },
  { icon: '🔥', label: '3 day streak', target: 3, type: 'streak' },
]

const ACTIONS = [
  { href: '/qbank', icon: '🎯', label: 'QBank Drill', xp: 15, color: '#6C5CE7', bg: 'rgba(108,92,231,0.15)', desc: 'Board-style questions' },
  { href: '/simulate', icon: '🔬', label: 'Exam Sim', xp: 25, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', desc: 'Timed blocks' },
  { href: '/flashcards', icon: '🃏', label: 'Flashcards', xp: 10, color: '#00D2A0', bg: 'rgba(0,210,160,0.15)', desc: 'Spaced repetition' },
  { href: '/battle', icon: '⚔️', label: 'Battle', xp: 20, color: '#FDCB6E', bg: 'rgba(253,203,110,0.15)', desc: 'PvP duels' },
  { href: '/tutor', icon: '🧠', label: 'AI Tutor', xp: 10, color: '#A855F7', bg: 'rgba(168,85,247,0.15)', desc: 'Ask anything' },
  { href: '/upload', icon: '📤', label: 'Upload', xp: 5, color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)', desc: 'New material' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
  const { data: recentLessons } = await supabase.from('lessons').select('*,documents(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
  const { data: dueFlashcards } = await supabase.from('flashcards').select('id').eq('user_id', user.id).lte('next_review_at', new Date().toISOString())
  const { data: leaderboard } = await supabase.from('profiles').select('id,full_name,xp,streak_days,level').order('xp', { ascending: false }).limit(3)

  const dueCount = dueFlashcards?.length || 0
  const xp = profile?.xp || 0
  const levelXP = xp % 1000
  const nextLevel = Math.floor(xp / 1000) + 1
  const currentLevel = profile?.level || 1
  const streak = profile?.streak_days || 0
  const hearts = 5 // TODO: fetch from profile.hearts or use default

  const safeProfile = {
    full_name: profile?.full_name || null,
    xp,
    level: currentLevel,
    streak_days: streak,
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'Doctor'

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={safeProfile} />
      <main className="main-content" style={{padding:'32px'}}>
        
        {/* ── HEADER: Greeting + Hearts + Streak ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontSize:'1.8rem',marginBottom:4}}>
              {greeting}, {firstName} 👋
            </h1>
            <p style={{color:'#A29BCC',fontSize:'0.9rem'}}>
              {streak > 0 ? `🔥 ${streak}-day streak! Keep it alive today.` : 'Start your streak today — just 1 lesson!'}
            </p>
          </div>
          <Hearts count={hearts} max={5} />
        </div>

        {/* ── LEVEL PROGRESS BAR (Duolingo style) ── */}
        <div className="card" style={{marginBottom:24,padding:'20px 24px',border:'1px solid rgba(108,92,231,0.3)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="level-badge">{currentLevel}</div>
              <div>
                <div style={{fontWeight:700,fontSize:'1rem',fontFamily:"'Space Grotesk',sans-serif"}}>Level {currentLevel}</div>
                <div style={{color:'#A29BCC',fontSize:'0.78rem'}}>{nextLevel} XP to Level {currentLevel + 1}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <span style={{color:'#FDCB6E',fontWeight:700,fontSize:'0.9rem'}}>⭐ {xp.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="xp-bar-glow">
            <div className="fill" style={{width:`${(levelXP/1000)*100}%`}} />
          </div>
        </div>

        {/* ── QUICK ACTION GRID (Home Screen Cards) ── */}
        <div style={{marginBottom:24}}>
          <h2 style={{fontSize:'1.1rem',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>What do you want to do?</h2>
          <div className="grid-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))'}}>
            {ACTIONS.map(action => (
              <Link key={action.href} href={action.href} className="card card-glow" style={{
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                padding:'24px 16px',textAlign:'center',gap:10,
                background: action.bg,
                border:`1.5px solid ${action.color}30`,
                transition:'all 0.2s',
                minHeight: 140
              }}>
                <div style={{fontSize:'2rem'}}>{action.icon}</div>
                <div style={{fontWeight:700,fontSize:'0.92rem',color:action.color}}>{action.label}</div>
                <div style={{fontSize:'0.72rem',color:'#6B6490',marginTop:2}}>+{action.xp} XP · {action.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── DAILY GOAL PROGRESS ── */}
        <div className="daily-goal-widget" style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{fontSize:'1.4rem'}}>🎯</div>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Daily Goals</h3>
            <span className="badge badge-warning" style={{marginLeft:'auto'}}>RESETS AT MIDNIGHT</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12}}>
            {DAILY_GOALS.map(goal => {
              const progress = Math.min(Math.random() * 100, 100)
              return (
                <div key={goal.label} style={{
                  padding:'16px',borderRadius:14,
                  background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                  textAlign:'center'
                }}>
                  <div style={{fontSize:'1.8rem',marginBottom:8}}>{goal.icon}</div>
                  <div style={{fontWeight:700,fontSize:'0.85rem',marginBottom:6}}>{goal.label}</div>
                  <div className="progress-bar" style={{marginBottom:6}}>
                    <div className="progress-fill" style={{width:`${progress}%`}} />
                  </div>
                  <div style={{color:'#6B6490',fontSize:'0.72rem'}}>{Math.round(progress)}% done</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:24}}>
          
          {/* ── FLASHCARDS DUE ── */}
          {dueCount > 0 && (
            <div className="card" style={{
              border:`2px solid ${dueCount >= 10 ? '#FF6B6B' : 'rgba(0,210,160,0.5)'}`,
              borderBottom:'6px solid rgba(0,210,160,0.5)',
              textAlign:'center',padding:28,
              background: dueCount >= 10 ? 'rgba(255,107,107,0.08)' : 'rgba(0,210,160,0.06)'
            }}>
              <div style={{fontSize:'3rem',marginBottom:12,animation:dueCount > 5 ? 'bounce 2s infinite' : 'tada 2s infinite'}}>
                {dueCount >= 10 ? '🚨' : '🃏'}
              </div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:'2.8rem',color:'#00D2A0',letterSpacing:'-0.04em'}}>
                {dueCount}
              </div>
              <div style={{color:'#A29BCC',fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:20}}>
                cards due now
              </div>
              <Link href="/flashcards" className="btn btn-secondary" style={{width:'100%',boxShadow:'0 6px 0 #00A67E'}}>
                Review Now 🧠
              </Link>
            </div>
          )}

          {/* ── RECENT LESSONS ── */}
          {recentLessons?.length > 0 && (
            <div className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h3 style={{fontSize:'1rem',fontFamily:"'Space Grotesk',sans-serif"}}>Continue Learning</h3>
                <Link href="/learn" style={{color:'#8B7CF6',fontSize:'0.8rem',fontWeight:600}}>View All</Link>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {recentLessons.map(lesson => (
                  <Link key={lesson.id} href={`/learn/lesson/${lesson.id}`} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'12px 16px',borderRadius:12,
                    background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',
                    transition:'all 0.2s',gap:12
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
                      <span style={{fontSize:'1.2rem',flexShrink:0}}>{lesson.is_completed ? '✅' : '📝'}</span>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:'0.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lesson.title}</div>
                        <div style={{color:'#6B6490',fontSize:'0.72rem'}}>{lesson.documents?.title}</div>
                      </div>
                    </div>
                    <span style={{color:'#FDCB6E',fontSize:'0.8rem',fontWeight:700,flexShrink:0}}>+{lesson.xp_reward} XP</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── TOP LEADERBOARD ── */}
          <div className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontSize:'1rem',fontFamily:"'Space Grotesk',sans-serif"}}>🏆 Top Students</h3>
              <Link href="/leaderboard" style={{color:'#8B7CF6',fontSize:'0.8rem',fontWeight:600}}>Full Board →</Link>
            </div>
            {leaderboard?.map((p, i) => (
              <div key={p.id} style={{
                display:'flex',alignItems:'center',gap:10,padding:'10px 0',
                borderBottom: i < leaderboard.length - 1 ? '1px solid #2D2654' : 'none'
              }}>
                <span style={{
                  width:28,height:28,borderRadius:'50%',flexShrink:0,
                  background: i === 0 ? '#FDCB6E' : i === 1 ? '#A0A0A0' : '#CD7F32',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{
                    fontWeight:600,fontSize:'0.85rem',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                    color: p.id === user.id ? '#8B7CF6' : 'inherit'
                  }}>
                    {p.full_name}{p.id === user.id ? ' (you)' : ''}
                  </div>
                </div>
                <span style={{color:'#FDCB6E',fontSize:'0.82rem',fontWeight:700}}>{p.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SOCIAL PROOF FOMO WIDGET ── */}
        <div className="social-proof" style={{marginTop:24}}>
          <div style={{fontSize:'1.2rem',animation:'pulse 2s infinite'}}>💬</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.85rem',fontWeight:600}}>
              <span style={{color:'#00D2A0'}}>47 students</span>
              <span style={{color:'#A29BCC'}}> studied in the last 10 minutes</span>
            </div>
          </div>
          <div style={{display:'flex',gap:-4}}>
            {['🧑‍⚕️','👩‍⚕️','🧑‍⚕️','👨‍⚕️'].map((emoji, i) => (
              <div key={i} style={{
                width:28,height:28,borderRadius:'50%',
                background:'linear-gradient(135deg,#6C5CE7,#8B7CF6)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'0.9rem',marginLeft: i > 0 ? -8 : 0,border:'2px solid var(--surface)'
              }}>{emoji}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}