'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function FlashcardsPage() {
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    fetch('/api/flashcards/review').then(r=>r.json()).then(d=>{ setCards(d.cards||[]); setLoading(false) })
  }, [])

  async function rate(rating) {
    const card = cards[idx]
    await fetch('/api/flashcards/review', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ card_id: card.id, rating }) })
    setReviewed(r=>r+1)
    setFlipped(false)
    if (idx + 1 >= cards.length) setDone(true)
    else { setTimeout(()=>setIdx(i=>i+1), 200) }
  }

  const card = cards[idx]
  const RATINGS = [
    { r:1, label:'Again', color:'#FF6B6B', desc:'< 1 min' },
    { r:2, label:'Hard', color:'#F39C12', desc:'~1 day' },
    { r:3, label:'Good', color:'#6C5CE7', desc:'~3 days' },
    { r:4, label:'Easy', color:'#00D2A0', desc:'~1 week' },
  ]

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.8rem',marginBottom:4}}>🃏 Flashcard Review</h1>
          <p style={{color:'#A29BCC'}}>Spaced repetition — study smarter, not longer</p>
        </div>

        {loading && <div style={{textAlign:'center',padding:80,color:'#A29BCC'}}>Loading cards...</div>}

        {!loading && cards.length === 0 && (
          <div className="card" style={{textAlign:'center',padding:60}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>🎉</div>
            <h2 style={{marginBottom:8}}>All caught up!</h2>
            <p style={{color:'#A29BCC',marginBottom:24}}>No cards due right now. Come back later or upload more materials.</p>
          </div>
        )}

        {!loading && done && cards.length > 0 && (
          <div className="card animate-zoom" style={{textAlign:'center',padding:60,maxWidth:600,margin:'0 auto'}}>
            <div style={{fontSize:'4rem',marginBottom:16}}>🎉</div>
            <h2 style={{marginBottom:8}}>Session Complete!</h2>
            <p style={{color:'#A29BCC',marginBottom:24}}>Reviewed {reviewed} cards • +{reviewed*2} XP earned</p>
            <button className="btn btn-primary" onClick={()=>{setIdx(0);setDone(false);setReviewed(0);setFlipped(false)}}>Review Again</button>
          </div>
        )}

        {!loading && !done && card && (
          <div style={{maxWidth:640,margin:'0 auto'}}>
            {/* Progress */}
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
              <div style={{flex:1}}><div className="progress-bar"><div className="progress-fill" style={{width:`${(idx/cards.length)*100}%`}} /></div></div>
              <span style={{color:'#A29BCC',fontSize:'0.85rem',flexShrink:0}}>{idx}/{cards.length}</span>
            </div>

            {/* Card */}
            <div className="flashcard-scene" onClick={()=>setFlipped(f=>!f)}>
              <div className={`flashcard-inner${flipped?' flipped':''}`}>
                <div className="flashcard-face flashcard-front">
                  <div>
                    <div style={{color:'#6B6490',fontSize:'0.75rem',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em'}}>QUESTION — tap to reveal</div>
                    <p style={{fontSize:'1.1rem',fontWeight:600,lineHeight:1.6}}>{card.front_text}</p>
                    {card.documents?.title && <div style={{color:'#6B6490',fontSize:'0.75rem',marginTop:16}}>{card.documents.title}</div>}
                  </div>
                </div>
                <div className="flashcard-face flashcard-back">
                  <div>
                    <div style={{color:'#00D2A0',fontSize:'0.75rem',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em'}}>ANSWER</div>
                    <p style={{fontSize:'1rem',lineHeight:1.7}}>{card.back_text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating buttons */}
            {flipped && (
              <div className="animate-fade-up" style={{marginTop:24}}>
                <p style={{textAlign:'center',color:'#A29BCC',fontSize:'0.85rem',marginBottom:14}}>How well did you know this?</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                  {RATINGS.map(({r,label,color,desc})=>(
                    <button key={r} onClick={()=>rate(r)} style={{padding:'12px 8px',borderRadius:10,border:`1.5px solid ${color}33`,background:`${color}11`,color,fontWeight:700,fontSize:'0.85rem',cursor:'pointer',transition:'all 0.2s'}}>
                      <div>{label}</div>
                      <div style={{fontSize:'0.7rem',opacity:0.7,marginTop:2}}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!flipped && (
              <div style={{textAlign:'center',marginTop:16}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setFlipped(true)}>Tap card or click to reveal →</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
