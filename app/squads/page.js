'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'

export default function SquadsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [squads, setSquads] = useState([])
  const [mySquad, setMySquad] = useState(null)
  const [squadMembers, setSquadMembers] = useState([])
  const [creating, setCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [squadName, setSquadName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my-squad') // 'my-squad' | 'create' | 'join'
  const [inviteCopied, setInviteCopied] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    if (prof?.squad_id) {
      // Load their squad
      const { data: squad } = await supabase.from('squads').select('*').eq('id', prof.squad_id).single()
      setMySquad(squad)

      // Load squad members with their XP this week
      const { data: members } = await supabase
        .from('profiles')
        .select('id,full_name,xp,streak_days,level,weekly_xp')
        .eq('squad_id', prof.squad_id)
        .order('weekly_xp', { ascending: false })
      setSquadMembers(members || [])
    }
    setLoading(false)
  }

  async function handleCreate() {
    if (!squadName.trim()) return
    setCreating(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data: squad, error } = await supabase.from('squads').insert({
      name: squadName.trim(),
      invite_code: inviteCode,
      created_by: user.id,
    }).select().single()

    if (!error && squad) {
      await supabase.from('profiles').update({ squad_id: squad.id }).eq('id', user.id)
      setMySquad(squad)
      setSquadMembers([profile])
      setActiveTab('my-squad')
    }
    setCreating(false)
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: squad } = await supabase.from('squads').select('*').eq('invite_code', joinCode.toUpperCase()).single()
    if (!squad) { alert('Invalid invite code. Check with your squad leader.'); return }

    const { data: memberCount } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('squad_id', squad.id)
    if (memberCount?.length >= 10) { alert('This squad is full (max 10 members).'); return }

    await supabase.from('profiles').update({ squad_id: squad.id }).eq('id', user.id)
    await loadData()
  }

  async function handleLeave() {
    if (!confirm('Leave your squad? Your weekly XP progress will be reset.')) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ squad_id: null }).eq('id', user.id)
    setMySquad(null); setSquadMembers([])
    loadData()
  }

  function copyInvite() {
    if (!mySquad) return
    navigator.clipboard.writeText(mySquad.invite_code)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
  }

  const rankEmoji = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`

  if (loading) return (
    <div style={{display:'flex'}}>
      <Sidebar profile={null} />
      <main className="main-content" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:32}}>
        <div style={{color:'#A29BCC'}}>Loading squads...</div>
      </main>
    </div>
  )

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={profile} />
      <main className="main-content" style={{padding:32}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          {/* Header */}
          <div style={{marginBottom:36}}>
            <h1 style={{fontSize:'2rem',fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,letterSpacing:'-0.03em',marginBottom:8}}>
              👥 Study Squads
            </h1>
            <p style={{color:'#A29BCC',lineHeight:1.6}}>
              Form a squad with your classmates. Compete on weekly XP. Accountability is the #1 driver of consistency.
            </p>
          </div>

          {/* No squad — create or join */}
          {!mySquad ? (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              {/* Create */}
              <div style={{
                padding:32,borderRadius:20,
                background:'rgba(108,92,231,0.07)',
                border:'1px solid rgba(108,92,231,0.2)'
              }}>
                <div style={{fontSize:'2rem',marginBottom:16}}>🏗️</div>
                <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.3rem',marginBottom:8}}>Create a Squad</h2>
                <p style={{color:'#A29BCC',fontSize:'0.88rem',lineHeight:1.6,marginBottom:20}}>Start a new squad and invite your classmates with a 6-character code.</p>
                <input
                  type="text"
                  placeholder="Squad name (e.g. USMLE Warriors)"
                  value={squadName}
                  onChange={e=>setSquadName(e.target.value)}
                  style={{width:'100%',padding:'12px 16px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#F0EEFF',fontSize:'0.93rem',marginBottom:14,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}
                />
                <button
                  onClick={handleCreate}
                  disabled={!squadName.trim() || creating}
                  style={{
                    width:'100%',padding:'13px',borderRadius:999,
                    background:'linear-gradient(135deg,#6C5CE7,#5A4BD1)',color:'white',fontWeight:700,fontSize:'0.95rem',
                    border:'none',cursor:'pointer',opacity: !squadName.trim() ? 0.5 : 1
                  }}
                >
                  {creating ? '⟳ Creating...' : '🚀 Create Squad'}
                </button>
              </div>

              {/* Join */}
              <div style={{
                padding:32,borderRadius:20,
                background:'rgba(0,210,160,0.06)',
                border:'1px solid rgba(0,210,160,0.15)'
              }}>
                <div style={{fontSize:'2rem',marginBottom:16}}>🔗</div>
                <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.3rem',marginBottom:8}}>Join a Squad</h2>
                <p style={{color:'#A29BCC',fontSize:'0.88rem',lineHeight:1.6,marginBottom:20}}>Enter the 6-character invite code from your squad leader.</p>
                <input
                  type="text"
                  placeholder="Enter code (e.g. XK9F2A)"
                  value={joinCode}
                  onChange={e=>setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{width:'100%',padding:'12px 16px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#F0EEFF',fontSize:'0.93rem',fontFamily:'monospace',letterSpacing:'0.1em',marginBottom:14,outline:'none',textTransform:'uppercase',boxSizing:'border-box'}}
                />
                <button
                  onClick={handleJoin}
                  disabled={joinCode.length < 6}
                  style={{
                    width:'100%',padding:'13px',borderRadius:999,
                    background:'linear-gradient(135deg,#00D2A0,#00A880)',color:'#0F0A1A',fontWeight:700,fontSize:'0.95rem',
                    border:'none',cursor:'pointer',opacity:joinCode.length<6?0.5:1
                  }}
                >
                  Join Squad →
                </button>
              </div>
            </div>
          ) : (
            /* ── HAS A SQUAD ── */
            <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24}}>
              {/* Left — leaderboard */}
              <div>
                <div style={{
                  padding:'24px 28px',borderRadius:20,marginBottom:20,
                  background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'
                }}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                    <div>
                      <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:'1.5rem',marginBottom:4,letterSpacing:'-0.03em'}}>{mySquad?.name}</h2>
                      <div style={{color:'#A29BCC',fontSize:'0.85rem'}}>{squadMembers.length}/10 members · Weekly XP race</div>
                    </div>
                    <div style={{
                      padding:'4px 14px',borderRadius:999,
                      background:'rgba(253,203,110,0.1)',border:'1px solid rgba(253,203,110,0.25)',
                      fontSize:'0.78rem',fontWeight:700,color:'#FDCB6E',letterSpacing:'0.04em'
                    }}>
                      📅 Resets Sunday
                    </div>
                  </div>

                  {/* Leaderboard rows */}
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    {squadMembers.map((member, i) => {
                      const isMe = member.id === profile?.id
                      return (
                        <div key={member.id} style={{
                          display:'flex',alignItems:'center',gap:14,
                          padding:'14px 16px',borderRadius:14,
                          background: i===0 ? 'rgba(253,203,110,0.06)' : isMe ? 'rgba(108,92,231,0.08)' : 'transparent',
                          border: i===0 ? '1px solid rgba(253,203,110,0.15)' : isMe ? '1px solid rgba(108,92,231,0.2)' : '1px solid transparent',
                          transition:'all 0.2s'
                        }}>
                          <div style={{
                            width:36,height:36,borderRadius:'50%',
                            background: i===0?'rgba(253,203,110,0.2)':i===1?'rgba(163,163,163,0.1)':i===2?'rgba(180,120,80,0.1)':'rgba(255,255,255,0.05)',
                            border:`1px solid ${i===0?'rgba(253,203,110,0.3)':i===1?'rgba(163,163,163,0.2)':i===2?'rgba(180,120,80,0.2)':'rgba(255,255,255,0.08)'}`,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize: i < 3 ? '1.1rem' : '0.75rem',fontWeight:700,flexShrink:0,
                            color: i>=3?'#6B6490':'inherit'
                          }}>
                            {rankEmoji(i)}
                          </div>
                          <div style={{
                            width:34,height:34,borderRadius:'50%',
                            background:'linear-gradient(135deg,#6C5CE7,#8B7CF6)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontWeight:700,fontSize:'0.85rem',flexShrink:0,
                            outline: isMe ? '2px solid #8B7CF6' : 'none',outlineOffset:2
                          }}>
                            {member.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:'0.93rem',color:isMe?'#8B7CF6':'#F0EEFF'}}>
                              {member.full_name || 'Anonymous'} {isMe && <span style={{fontSize:'0.75rem',color:'#6B6490'}}>(you)</span>}
                            </div>
                            <div style={{fontSize:'0.75rem',color:'#6B6490',marginTop:2}}>
                              🔥 {member.streak_days||0}d · Lv.{member.level||1}
                            </div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:'1.1rem',color:'#FDCB6E',letterSpacing:'-0.02em'}}>
                              {(member.weekly_xp||0).toLocaleString()}
                            </div>
                            <div style={{fontSize:'0.7rem',color:'#6B6490',letterSpacing:'0.04em',textTransform:'uppercase'}}>XP this week</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right — squad info */}
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {/* Invite code card */}
                <div style={{
                  padding:24,borderRadius:20,
                  background:'rgba(108,92,231,0.07)',border:'1px solid rgba(108,92,231,0.2)'
                }}>
                  <div style={{fontSize:'0.75rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>
                    Invite Code
                  </div>
                  <div style={{
                    padding:'14px',borderRadius:12,background:'rgba(0,0,0,0.3)',
                    border:'1px solid rgba(108,92,231,0.2)',textAlign:'center',
                    fontFamily:'monospace',fontSize:'2rem',letterSpacing:'0.15em',fontWeight:700,
                    color:'#8B7CF6',marginBottom:14
                  }}>
                    {mySquad?.invite_code}
                  </div>
                  <button
                    onClick={copyInvite}
                    style={{
                      width:'100%',padding:'11px',borderRadius:999,
                      background: inviteCopied ? 'rgba(0,210,160,0.15)' : 'rgba(108,92,231,0.15)',
                      border: `1px solid ${inviteCopied ? 'rgba(0,210,160,0.3)' : 'rgba(108,92,231,0.3)'}`,
                      color: inviteCopied ? '#00D2A0' : '#8B7CF6',fontWeight:700,fontSize:'0.88rem',cursor:'pointer',
                      transition:'all 0.2s'
                    }}
                  >
                    {inviteCopied ? '✅ Copied!' : '📋 Copy Invite Code'}
                  </button>
                </div>

                {/* Quick stats */}
                <div style={{padding:20,borderRadius:20,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{fontSize:'0.75rem',fontWeight:700,color:'#A29BCC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:14}}>Squad Stats</div>
                  {[
                    { label:'Total Squad XP (Week)', value: squadMembers.reduce((s,m)=>s+(m.weekly_xp||0),0).toLocaleString()+' XP' },
                    { label:'Members', value: `${squadMembers.length}/10` },
                    { label:'Avg Streak', value: `${Math.round(squadMembers.reduce((s,m)=>s+(m.streak_days||0),0)/Math.max(1,squadMembers.length))} days` },
                  ].map(s=>(
                    <div key={s.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.85rem'}}>
                      <span style={{color:'#A29BCC'}}>{s.label}</span>
                      <span style={{fontWeight:700,color:'#F0EEFF'}}>{s.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleLeave}
                  style={{
                    padding:'11px',borderRadius:999,
                    background:'transparent',border:'1px solid rgba(255,107,107,0.2)',
                    color:'rgba(255,107,107,0.6)',fontWeight:600,fontSize:'0.85rem',cursor:'pointer',
                    transition:'all 0.2s'
                  }}
                >
                  Leave Squad
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
