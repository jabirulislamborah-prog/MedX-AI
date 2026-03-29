'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Link from 'next/link'

const MODES = [
  { id:'quick', label:'Quick Battle', questions:10, time:60, icon:'⚡', desc:'10 questions • 1 min each' },
  { id:'standard', label:'Standard Battle', questions:30, time:90, icon:'⚔️', desc:'30 questions • 90 sec each' },
]

export default function BattlePage() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState(null)
  const supabaseRef = useRef(null)
  const [inviteCode] = useState(() => Math.random().toString(36).substring(2,8).toUpperCase())
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [phase, setPhase] = useState('lobby')
  const [battle, setBattle] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [battleEnded, setBattleEnded] = useState(false)
  const timerRef = useRef(null)

  const getSupabase = useCallback(async () => {
    if (!supabaseRef.current) {
      const { createClient } = await import('@/lib/supabase/client')
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }, [])

  useEffect(() => {
    getSupabase().then(s => s.auth.getUser().then(({ data }) => setUser(data?.user)))
  }, [getSupabase])

  const startBattleGame = useCallback(async (battleMode) => {
    const m = MODES.find(x => x.id === battleMode) || MODES[0]
    const limit = m.questions
    const res = await fetch(`/api/qbank/generate?limit=${limit}`)
    const data = await res.json()
    setQuestions(data.questions || [])
    setTimeLeft(m.time)
    setPhase('battle')
    setScore(0)
    setOpponentScore(0)
    setCurrentQ(0)
    setBattleEnded(false)
  }, [])

  // Timer for battle
  useEffect(() => {
    if (phase !== 'battle' || battleEnded) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setBattleEnded(true)
          setPhase('result')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, battleEnded])

  // Supabase realtime subscription
  useEffect(() => {
    if (!battle?.id || phase === 'lobby') return
    let channel
    getSupabase().then(supabase => {
      channel = supabase.channel('battle_updates')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battle.id}` }, (payload) => {
          const updated = payload.new
          setBattle(updated)
          if (updated.creator_id === user?.id) setOpponentScore(updated.opponent_score)
          else setOpponentScore(updated.creator_score)
          if (phase === 'waiting' && updated.status === 'active') {
            startBattleGame(updated.mode)
          } else if (updated.status === 'completed' && phase === 'battle') {
            clearInterval(timerRef.current)
            setBattleEnded(true)
            setPhase('result')
          }
        })
        .subscribe()
    })
    return () => {
      if (channel) getSupabase().then(s => s.removeChannel(channel))
    }
  }, [battle?.id, phase, user?.id, getSupabase, startBattleGame])

  function copyCode() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function createBattleRoom() {
    if (!user) return
    const supabase = await getSupabase()
    const { data, error } = await supabase.from('battles').insert({
      invite_code: inviteCode, creator_id: user.id, mode: mode || 'quick', status: 'waiting'
    }).select().single()
    if (!error && data) { setBattle(data); setPhase('waiting') }
  }

  async function joinBattleRoom() {
    if (!user || !joinCode) return
    const supabase = await getSupabase()
    const { data: found } = await supabase.from('battles').select('*').eq('invite_code', joinCode.toUpperCase()).single()
    if (!found) return alert('Invalid invite code!')
    if (found.status !== 'waiting') return alert('Battle already started or completed!')
    const { data, error } = await supabase.from('battles').update({ opponent_id: user.id, status: 'active' }).eq('id', found.id).select().single()
    if (!error && data) { setBattle(data); startBattleGame(data.mode) }
  }

  function handleAnswerSubmit(isCorrect) {
    const newScore = isCorrect ? score + 1 : score
    setScore(newScore)
    if (currentQ + 1 >= questions.length) {
      clearInterval(timerRef.current)
      setBattleEnded(true)
      setPhase('result')
    } else {
      setCurrentQ(c => c + 1)
    }
  }

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'24px',paddingTop:'72px'}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:'1.6rem',marginBottom:4}}>⚔️ Battle Mode</h1>
          <p style={{color:'#A29BCC',fontSize:'0.88rem'}}>Challenge friends in real-time duels</p>
        </div>

        <div style={{maxWidth:720,margin:'0 auto'}}>
          {phase === 'lobby' && (
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)} style={{
                    padding:'24px 20px',border:`2px solid ${mode===m.id?'#6C5CE7':'#2D2654'}`,
                    borderRadius:16,background:mode===m.id?'rgba(108,92,231,0.15)':'#1A1432',
                    color:'#F8F7FF',cursor:'pointer',textAlign:'center',transition:'all 0.2s'
                  }}>
                    <div style={{fontSize:'2.2rem',marginBottom:10}}>{m.icon}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1rem',marginBottom:4}}>{m.label}</div>
                    <div style={{color:'#A29BCC',fontSize:'0.8rem'}}>{m.desc}</div>
                  </button>
                ))}
              </div>

              {mode && (
                <div className="animate-fade-up">
                  <div className="card" style={{marginBottom:16,padding:24}}>
                    <h3 style={{marginBottom:12}}>🔗 Your Battle Code</h3>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <div style={{flex:1,background:'#0F0A1A',border:'1.5px solid #2D2654',borderRadius:10,padding:'14px 20px',fontWeight:700,fontSize:'1.4rem',letterSpacing:'0.15em',textAlign:'center',color:'#8B7CF6'}}>
                        {inviteCode}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={copyCode}>{copied ? '✓' : '📋'}</button>
                    </div>
                  </div>

                  <div className="card" style={{padding:20,marginBottom:16}}>
                    <h3 style={{marginBottom:10}}>🎯 Join a Battle</h3>
                    <div style={{display:'flex',gap:10}}>
                      <input className="input" placeholder="Enter code..." value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{letterSpacing:'0.1em',maxWidth:200}} />
                      <button className="btn btn-secondary btn-sm" onClick={joinBattleRoom}>Join</button>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'1rem'}} onClick={createBattleRoom}>
                    ⚔️ Create Battle Room
                  </button>
                </div>
              )}

              {!mode && (
                <div style={{textAlign:'center',padding:40,color:'#A29BCC'}}>
                  <div style={{fontSize:'2.5rem',marginBottom:12}}>👆</div>
                  <p>Select a battle mode above to get started</p>
                </div>
              )}
            </>
          )}

          {phase === 'waiting' && (
            <div className="card animate-fade-up" style={{textAlign:'center',padding:48}}>
              <div style={{fontSize:'3.5rem',marginBottom:16,animation:'bounce 2s infinite'}}>⚔️</div>
              <h3 style={{marginBottom:10}}>Waiting for opponent...</h3>
              <p style={{color:'#A29BCC',marginBottom:20}}>Share your code: <strong style={{color:'#8B7CF6',fontFamily:'monospace',letterSpacing:'0.1em'}}>{inviteCode}</strong></p>
              <div style={{padding:'12px 20px',borderRadius:12,background:'rgba(253,203,110,0.1)',border:'1px solid rgba(253,203,110,0.2)',color:'#FDCB6E',fontSize:'0.88rem',fontWeight:600}}>
                ⏳ Room is live — game starts when opponent joins
              </div>
            </div>
          )}

          {phase === 'battle' && questions[currentQ] && (() => {
            const q = questions[currentQ]
            const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            const isWin = score > opponentScore
            const isLose = score < opponentScore
            return (
              <div className="animate-fade-up">
                {/* Battle HUD */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{padding:'6px 16px',borderRadius:999,background:'rgba(0,210,160,0.15)',border:'1px solid rgba(0,210,160,0.3)',color:'#00D2A0',fontWeight:700}}>
                      You: {score}
                    </div>
                    <div style={{padding:'6px 16px',borderRadius:999,background:'rgba(255,107,107,0.15)',border:'1px solid rgba(255,107,107,0.3)',color:'#FF6B6B',fontWeight:700}}>
                      Opp: {opponentScore}
                    </div>
                  </div>
                  <div style={{
                    padding:'8px 16px',borderRadius:10,
                    background: timeLeft <= 10 ? 'rgba(255,107,107,0.2)' : 'rgba(26,79,214,0.2)',
                    border: `1px solid ${timeLeft <= 10 ? 'rgba(255,107,107,0.4)' : 'rgba(26,79,214,0.3)'}`,
                    color: timeLeft <= 10 ? '#FF6B6B' : 'white',
                    fontFamily:'monospace',fontSize:'1.1rem',fontWeight:700,
                    animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
                  }}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress */}
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <span style={{color:'#A29BCC',fontSize:'0.82rem',flexShrink:0}}>{currentQ+1}/{questions.length}</span>
                  <div style={{flex:1}}><div className="progress-bar"><div className="progress-fill" style={{width:`${(currentQ/questions.length)*100}%`}} /></div></div>
                </div>

                {/* Question */}
                <div className="card" style={{padding:24,marginBottom:16}}>
                  <p style={{fontSize:'1rem',lineHeight:1.8,marginBottom:20,color:'#E0DFF8'}}>{q.question_stem}</p>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {opts?.map((opt, i) => (
                      <button key={opt.id} className="option-btn" onClick={() => !battleEnded && handleAnswerSubmit(opt.is_correct)} style={{minHeight:52,padding:'12px 16px'}}>
                        <span className="option-label">{String.fromCharCode(65 + i)}</span>
                        <span style={{flex:1}}>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {phase === 'result' && (
            <div className="card animate-zoom" style={{textAlign:'center',padding:48}}>
              <div style={{fontSize:'4.5rem',marginBottom:16}}>
                {score > opponentScore ? '🏆' : score < opponentScore ? '💔' : '🤝'}
              </div>
              <h2 style={{marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>
                {score > opponentScore ? 'You Won!' : score < opponentScore ? 'You Lost!' : "It's a Tie!"}
              </h2>
              <div style={{display:'flex',justifyContent:'center',gap:40,margin:'24px 0'}}>
                <div>
                  <div style={{color:'#A29BCC',fontSize:'0.82rem',marginBottom:6}}>Your Score</div>
                  <div style={{fontSize:'2.8rem',fontWeight:800,color:'#00D2A0',fontFamily:"'Space Grotesk',sans-serif"}}>{score}</div>
                </div>
                <div style={{width:1,background:'#2D2654',margin:'0 8px'}} />
                <div>
                  <div style={{color:'#A29BCC',fontSize:'0.82rem',marginBottom:6}}>Opponent</div>
                  <div style={{fontSize:'2.8rem',fontWeight:800,color:'#FF6B6B',fontFamily:"'Space Grotesk',sans-serif"}}>{opponentScore}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="btn btn-primary" onClick={() => { setPhase('lobby'); setBattle(null); setScore(0); setOpponentScore(0) }}>Play Again</button>
                <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}