'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const NAV = [
  { href:'/dashboard', icon:'🏠', label:'Dashboard' },
  { href:'/learn', icon:'📚', label:'Learn' },
  { href:'/simulate', icon:'🔬', label:'Exam Sim' },
  { href:'/qbank', icon:'🎯', label:'QBank' },
  { href:'/flashcards', icon:'🃏', label:'Flashcards' },
  { href:'/battle', icon:'⚔️', label:'Battle' },
  { href:'/squads', icon:'👥', label:'Study Squad' },
  { href:'/leaderboard', icon:'🏆', label:'Leaderboard' },
  { href:'/tutor', icon:'🧠', label:'AI Tutor' },
  { href:'/upload', icon:'📤', label:'Upload PDF' },
  { href:'/pricing', icon:'💎', label:'Upgrade' },
]

export default function Sidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [streakWarning, setStreakWarning] = useState(false)
  const [showStreakModal, setShowStreakModal] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const xp = profile?.xp || 0
  const levelXP = xp % 1000
  const levelProgress = (levelXP / 1000) * 100
  const streak = profile?.streak_days || 0

  // Show streak warning if streak > 0 and it's evening (after 8pm)
  useEffect(() => {
    const hour = new Date().getHours()
    if (streak > 0 && hour >= 20) setStreakWarning(true)
  }, [streak])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login'); router.refresh()
  }

  const streakColor = streak >= 30 ? '#FF4500' : streak >= 7 ? '#FF6B35' : '#FDCB6E'
  const streakGlow = streak >= 7 ? `0 0 20px ${streakColor}40` : 'none'

  return (
    <>
      {/* ── MOBILE HEADER (Visible only on <768px) ── */}
      <div className="show-on-mobile" style={{
        position:'fixed', top:0, left:0, right:0, height:60, background:'rgba(15,10,26,0.9)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid #2D2654', zIndex:90, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 16px'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button onClick={() => setMobileOpen(true)} style={{background:'transparent', border:'none', color:'#F8F7FF', fontSize:'1.5rem', cursor:'pointer', padding:4}}>
            ☰
          </button>
          <div style={{width:28,height:28,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem'}}>⚕️</div>
        </div>
        <div onClick={() => setShowStreakModal(true)} style={{display:'flex', alignItems:'center', gap:6, background:'rgba(253,203,110,0.1)', padding:'6px 12px', borderRadius:999, border:'1px solid rgba(253,203,110,0.2)', cursor:'pointer'}}>
           <span style={{fontSize:'1.1rem', animation: streak > 0 ? 'pulse 2s infinite' : 'none'}}>🔥</span>
           <span style={{fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, color:'#FDCB6E', letterSpacing:'-0.02em'}}>{streak}</span>
        </div>
      </div>

      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && (
        <div className="show-on-mobile" onClick={() => setMobileOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:95
        }} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:10,color:'inherit',textDecoration:'none'}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>⚕️</div>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.1rem'}}>MedX AI</span>
          </Link>
        </div>

        {/* ── STREAK HERO WIDGET ── */}
        <div
          role="button"
          onClick={() => setShowStreakModal(true)}
          style={{
            margin:'12px',borderRadius:14,cursor:'pointer',
            padding:'14px 16px',
            background: streak > 0
              ? `linear-gradient(135deg, rgba(${streak>=7?'255,69,0':'253,203,110'},0.15), rgba(${streak>=7?'255,69,0':'253,203,110'},0.05))`
              : 'rgba(255,255,255,0.03)',
            border:`1.5px solid ${streak > 0 ? streakColor+'55' : '#2D2654'}`,
            boxShadow: streakGlow,
            transition:'all 0.2s',
            position:'relative',overflow:'hidden'
          }}
        >
          {streakWarning && (
            <div style={{
              position:'absolute',top:8,right:8,
              width:8,height:8,borderRadius:'50%',
              background:'#FF6B6B',
              animation:'pulse 1.5s infinite',
              boxShadow:'0 0 8px rgba(255,107,107,0.8)'
            }} />
          )}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              fontSize:'1.8rem',
              animation: streak > 0 ? 'float 3s ease-in-out infinite' : 'none',
              filter: streak > 0 ? `drop-shadow(0 0 8px ${streakColor}80)` : 'grayscale(1) opacity(0.3)',
              lineHeight:1
            }}>
              🔥
            </div>
            <div>
              <div style={{
                fontFamily:"'Space Grotesk',sans-serif",
                fontWeight:800,fontSize:'1.5rem',
                color: streak > 0 ? streakColor : '#6B6490',
                lineHeight:1,letterSpacing:'-0.04em'
              }}>
                {streak}<span style={{fontSize:'0.9rem',fontWeight:600,letterSpacing:0}}> days</span>
              </div>
              <div style={{fontSize:'0.7rem',fontWeight:600,color: streak > 0 ? streakColor+'99' : '#6B6490',letterSpacing:'0.04em',textTransform:'uppercase'}}>
                {streak === 0 ? 'Start your streak' : streak >= 30 ? '🏆 Legend streak!' : streak >= 7 ? '🔥 On fire!' : 'Daily streak'}
              </div>
            </div>
          </div>
          {streakWarning && (
            <div style={{
              marginTop:10,padding:'6px 10px',borderRadius:8,
              background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.2)',
              fontSize:'0.72rem',color:'#FF6B6B',fontWeight:600,
              display:'flex',alignItems:'center',gap:6
            }}>
              ⚠️ Study today to keep your streak!
            </div>
          )}
        </div>

        {/* ── USER + XP ── */}
        <div style={{padding:'12px 16px',borderBottom:'1px solid #2D2654'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#6C5CE7,#8B7CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>
              {profile?.full_name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:600,fontSize:'0.85rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name || 'Med Student'}</div>
              <div style={{color:'#A29BCC',fontSize:'0.7rem'}}>
                Lv.{profile?.level||1} • {xp} XP
                {profile?.exam_target && <span style={{color:'#8B7CF6',marginLeft:4}}>• {profile.exam_target}</span>}
              </div>
            </div>
          </div>
          <div className="xp-bar-container"><div className="xp-bar-fill" style={{width:`${levelProgress}%`}} /></div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:'0.68rem',color:'#6B6490'}}>
            <span>{levelXP}/1000 XP to next level</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({href,icon,label})=>{
            const isActive = href==='/dashboard' ? pathname===href : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`sidebar-item${isActive?' active':''}`}>
                <span className="icon">{icon}</span><span>{label}</span>
                {href==='/pricing'&&<span className="badge badge-warning" style={{marginLeft:'auto',padding:'2px 6px',fontSize:'0.65rem'}}>PRO</span>}
                {href==='/squads'&&<span className="badge badge-success" style={{marginLeft:'auto',padding:'2px 6px',fontSize:'0.65rem'}}>NEW</span>}
                {href==='/simulate'&&<span className="badge badge-primary" style={{marginLeft:'auto',padding:'2px 6px',fontSize:'0.65rem'}}>NEW</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{width:'100%'}}>🚪 Log Out</button>
        </div>
      </aside>

      {/* ── STREAK MODAL ── */}
      {showStreakModal && (
        <div
          onClick={() => setShowStreakModal(false)}
          style={{
            position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',
            zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:'100%',maxWidth:400,borderRadius:24,
              background:'#0F0A1A',border:'1px solid rgba(253,203,110,0.3)',
              padding:36,textAlign:'center',
              boxShadow:'0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(253,203,110,0.1)'
            }}
          >
            <div style={{fontSize:'4rem',marginBottom:8,animation:'float 3s ease-in-out infinite'}}>🔥</div>
            <div style={{
              fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,
              fontSize:'3.5rem',color:streakColor,letterSpacing:'-0.05em',lineHeight:1
            }}>{streak}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.2rem',marginBottom:8}}>
              {streak === 1 ? '1 Day Streak!' : `${streak} Day Streak!`}
            </div>

            {/* Streak milestones */}
            <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:24,flexWrap:'wrap'}}>
              {[1,7,30,100].map(milestone => (
                <div key={milestone} style={{
                  padding:'4px 12px',borderRadius:999,fontSize:'0.75rem',fontWeight:700,
                  background: streak >= milestone ? 'rgba(253,203,110,0.15)' : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${streak >= milestone ? 'rgba(253,203,110,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: streak >= milestone ? '#FDCB6E' : '#6B6490'
                }}>
                  {milestone >= 100 ? '💎' : milestone >= 30 ? '🏆' : milestone >= 7 ? '🔥' : '✨'} {milestone}d
                </div>
              ))}
            </div>

            <p style={{color:'#A29BCC',fontSize:'0.9rem',lineHeight:1.6,marginBottom:24}}>
              {streakWarning
                ? "⚠️ Don't lose your streak! Complete a lesson or drill today to keep it alive."
                : streak === 0
                ? 'Complete a lesson or drill today to start your streak!'
                : `You've been studying for ${streak} consecutive days. Keep it up — don't break the chain!`}
            </p>

            <div style={{display:'flex',gap:12,flexDirection:'column'}}>
              <Link href="/qbank" onClick={() => setShowStreakModal(false)} style={{
                display:'inline-block',padding:'13px',borderRadius:999,textAlign:'center',
                background:'linear-gradient(135deg,#FDCB6E,#F39C12)',
                color:'#0F0A1A',fontWeight:700,fontSize:'0.95rem'
              }}>
                🎯 Start Daily Drill
              </Link>
              <button onClick={() => setShowStreakModal(false)} style={{
                background:'transparent',border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:999,padding:'10px',color:'#A29BCC',fontWeight:600,fontSize:'0.88rem',cursor:'pointer'
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
