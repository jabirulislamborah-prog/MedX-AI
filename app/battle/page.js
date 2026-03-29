'use client'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/client'

const MODES = [
  { id:'quick', label:'Quick Battle', questions:10, time:60, icon:'⚡', desc:'10 questions • 1 min each' },
  { id:'standard', label:'Standard Battle', questions:30, time:90, icon:'⚔️', desc:'30 questions • 90 sec each' },
]

export default function BattlePage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState(null)
  const [inviteCode] = useState(() => Math.random().toString(36).substring(2,8).toUpperCase())
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [phase, setPhase] = useState('lobby') // lobby | waiting | battle | result
  const [battle, setBattle] = useState(null)
  
  // Battle state
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)

  const startBattleGame = useCallback(async (battleMode) => {
    const limit = battleMode === 'quick' ? 10 : 30
    const res = await fetch(`/api/qbank/generate?limit=${limit}`)
    const data = await res.json()
    setQuestions(data.questions || [])
    setPhase('battle')
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
  }, [supabase.auth])

  useEffect(() => {
    if (!battle?.id) return
    // Listen for opponent joining or score updates
    const channel = supabase.channel('battle_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battle.id}` }, (payload) => {
        const updated = payload.new
        setBattle(updated)
        // Set opponent score based on who I am
        if (updated.creator_id === user?.id) setOpponentScore(updated.opponent_score)
        else setOpponentScore(updated.creator_score)

        if (phase === 'waiting' && updated.status === 'active') {
          startBattleGame(updated.mode)
        } else if (updated.status === 'completed' && phase === 'battle') {
          setPhase('result')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [battle?.id, phase, user?.id, supabase, startBattleGame])

  function copyCode() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  async function createBattleRoom() {
    if (!user) return
    const { data, error } = await supabase.from('battles').insert({
      invite_code: inviteCode,
      creator_id: user.id,
      mode: mode,
      status: 'waiting'
    }).select().single()

    if (!error && data) {
      setBattle(data)
      setPhase('waiting')
    }
  }

  async function joinBattleRoom() {
    if (!user || !joinCode) return
    // Find battle
    const { data: found } = await supabase.from('battles').select('*').eq('invite_code', joinCode.toUpperCase()).single()
    if (!found) return alert('Invalid invite code!')
    if (found.status !== 'waiting') return alert('Battle already started or completed!')

    // Join
    const { data, error } = await supabase.from('battles').update({
      opponent_id: user.id,
      status: 'active'
    }).eq('id', found.id).select().single()

    if (!error && data) {
      setBattle(data)
      startBattleGame(data.mode)
    }
  }

  async function handleAnswerSubmit(isCorrect) {
    const newScore = isCorrect ? score + 1 : score
    setScore(newScore)
    
    // Update score in supabase
    const updatePayload = battle.creator_id === user.id ? { creator_score: newScore } : { opponent_score: newScore }
    
    // If finished
    const isFinished = currentQ + 1 >= questions.length
    if (isFinished) {
      updatePayload.status = 'completed'
      // Determine winner if both completed... Since this is async, the DB trigger or last to finish logic usually handles it,
      // But we will just set completed for now. We can assign winner locally.
    }
    
    await supabase.from('battles').update(updatePayload).eq('id', battle.id)

    if (isFinished) {
      setPhase('result')
    } else {
      setCurrentQ(c => c + 1)
    }
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.8rem',marginBottom:4}}>⚔️ Battle Mode</h1>
          <p style={{color:'#A29BCC'}}>Challenge friends in real-time medical knowledge duels</p>
        </div>

        <div style={{maxWidth:800,margin:'0 auto'}}>
          {phase === 'lobby' && (
            <>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:32}}>
                {MODES.map(m=>(
                  <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:28,border:`2px solid ${mode===m.id?'#6C5CE7':'#2D2654'}`,borderRadius:16,background:mode===m.id?'rgba(108,92,231,0.15)':'#1A1432',color:'#F8F7FF',cursor:'pointer',textAlign:'center',transition:'all 0.2s'}}>
                    <div style={{fontSize:'2.5rem',marginBottom:12}}>{m.icon}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.1rem',marginBottom:6}}>{m.label}</div>
                    <div style={{color:'#A29BCC',fontSize:'0.85rem'}}>{m.desc}</div>
                  </button>
                ))}
              </div>

              {mode && (
                <div className="animate-fade-up">
                  <div className="card" style={{marginBottom:20,padding:28}}>
                    <h3 style={{marginBottom:16}}>🔗 Invite a Friend</h3>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <div style={{flex:1,background:'#0F0A1A',border:'1.5px solid #2D2654',borderRadius:10,padding:'14px 20px',fontWeight:700,fontSize:'1.5rem',letterSpacing:'0.15em',textAlign:'center',color:'#8B7CF6'}}>
                        {inviteCode}
                      </div>
                      <button className="btn btn-primary" onClick={copyCode}>{copied?'✓ Copied!':'📋 Copy'}</button>
                    </div>
                  </div>

                  <div className="card" style={{padding:24}}>
                    <h3 style={{marginBottom:12}}>🎯 Join a Battle</h3>
                    <div style={{display:'flex',gap:12}}>
                      <input className="input" placeholder="Enter battle code..." value={joinCode} onChange={e=>setJoinCode(e.target.value)} style={{letterSpacing:'0.1em',textTransform:'uppercase'}} />
                      <button className="btn btn-secondary" onClick={joinBattleRoom}>Join →</button>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{width:'100%',padding:'16px',marginTop:20,fontSize:'1rem'}} onClick={createBattleRoom}>
                    ⚔️ Start Battle Room
                  </button>
                </div>
              )}
            </>
          )}

          {phase === 'waiting' && (
            <div className="card animate-fade-up" style={{marginTop:20,textAlign:'center',padding:40}}>
              <div className="animate-bounce" style={{fontSize:'3rem',marginBottom:12}}>⚔️</div>
              <h3 style={{marginBottom:8}}>Waiting for opponent...</h3>
              <p style={{color:'#A29BCC',marginBottom:16}}>Share your code: <strong style={{color:'#8B7CF6'}}>{inviteCode}</strong></p>
              <div className="animate-pulse" style={{color:'#A29BCC',fontSize:'0.85rem'}}>Room is live. Game starts automatically when opponent joins.</div>
            </div>
          )}

          {phase === 'battle' && (
            <div className="animate-fade-up">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
                <div style={{fontSize:'1.2rem'}}>You: <strong style={{color:'#00D2A0'}}>{score}</strong></div>
                <div style={{fontSize:'1.2rem',color:'#A29BCC'}}>Q {currentQ+1} / {questions.length}</div>
                <div style={{fontSize:'1.2rem'}}>Opponent: <strong style={{color:'#FF6B6B'}}>{opponentScore}</strong></div>
              </div>

              {questions[currentQ] && (() => {
                const q = questions[currentQ]
                const opts = typeof q.options==='string'?JSON.parse(q.options):q.options
                return (
                  <div className="card" style={{padding:28}}>
                    <p style={{fontSize:'1.1rem',lineHeight:1.8,marginBottom:20}}>{q.question_stem}</p>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {opts?.map(opt=>(
                        <button key={opt.id} className="option-btn" onClick={()=>handleAnswerSubmit(opt.is_correct)}>
                          <span className="option-label">{opt.id.toUpperCase()}</span>
                          <span style={{flex:1}}>{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {phase === 'result' && (
            <div className="card animate-zoom" style={{textAlign:'center',padding:40}}>
              <div style={{fontSize:'4rem',marginBottom:16}}>🏆</div>
              <h2 style={{marginBottom:16}}>Battle Completed!</h2>
              <div style={{display:'flex',justifyContent:'center',gap:40,marginBottom:32}}>
                <div>
                  <div style={{fontSize:'0.9rem',color:'#A29BCC',marginBottom:8}}>Your Score</div>
                  <div style={{fontSize:'3rem',fontWeight:700,color:'#00D2A0'}}>{score}</div>
                </div>
                <div>
                  <div style={{fontSize:'0.9rem',color:'#A29BCC',marginBottom:8}}>Opponent Score</div>
                  <div style={{fontSize:'3rem',fontWeight:700,color:'#FF6B6B'}}>{opponentScore}</div>
                </div>
              </div>
              
              <h3 style={{marginBottom:24}}>
                {score > opponentScore ? 'You Won! 🎉' : score < opponentScore ? 'You Lost! 💔' : "It's a Tie! 🤝"}
              </h3>
              
              <button className="btn btn-primary" onClick={()=>{setPhase('lobby');setScore(0);setOpponentScore(0)}}>Play Again</button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
