'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/dashboard', icon:'🏠', label:'Dashboard' },
  { href:'/learn', icon:'📚', label:'Learn' },
  { href:'/qbank', icon:'🎯', label:'QBank' },
  { href:'/flashcards', icon:'🃏', label:'Flashcards' },
  { href:'/battle', icon:'⚔️', label:'Battle' },
  { href:'/leaderboard', icon:'🏆', label:'Leaderboard' },
  { href:'/tutor', icon:'🧠', label:'AI Tutor' },
  { href:'/upload', icon:'📤', label:'Upload PDF' },
  { href:'/pricing', icon:'💎', label:'Upgrade' },
]

export default function Sidebar({ profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login'); router.refresh()
  }

  const xp = profile?.xp || 0
  const levelXP = xp % 1000
  const levelProgress = (levelXP / 1000) * 100

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:10,color:'inherit',textDecoration:'none'}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>⚕️</div>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.1rem'}}>MedDrill</span>
        </Link>
      </div>

      <div style={{padding:'14px 16px',borderBottom:'1px solid #2D2654'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#6C5CE7,#8B7CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>
            {profile?.full_name?.[0]?.toUpperCase() || 'M'}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:600,fontSize:'0.85rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name || 'Med Student'}</div>
            <div style={{color:'#A29BCC',fontSize:'0.72rem'}}>Lv.{profile?.level||1} • {xp} XP</div>
          </div>
        </div>
        <div className="xp-bar-container"><div className="xp-bar-fill" style={{width:`${levelProgress}%`}} /></div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:'0.7rem',color:'#6B6490'}}>
          <span>🔥 {profile?.streak_days||0} day streak</span>
          <span>{levelXP}/1000</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({href,icon,label})=>{
          const isActive = href==='/dashboard' ? pathname===href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`sidebar-item${isActive?' active':''}`}>
              <span className="icon">{icon}</span><span>{label}</span>
              {href==='/pricing'&&<span className="badge badge-warning" style={{marginLeft:'auto',padding:'2px 6px',fontSize:'0.65rem'}}>PRO</span>}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{width:'100%'}}>🚪 Log Out</button>
      </div>
    </aside>
  )
}
