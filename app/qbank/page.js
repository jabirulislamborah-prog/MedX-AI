'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function QBankContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'all'
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState({ correct:0, total:0 })
  const [done, setDone] = useState(false)
  
  const startTimeRef = useRef(0)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/qbank/generate?mode=${mode}`)
      const data = await res.json()
      setQuestions(data.questions || []); setLoading(false)
      startTimeRef.current = new Date().getTime()
    }
    load()
  }, [mode])

  const q = questions[current]

  function handleSelect(opt) {
    if (answered) return
    const timeTaken = new Date().getTime() - startTimeRef.current
    setSelected(opt.id); setAnswered(true)
    setScore(s=>({ correct: s.correct+(opt.is_correct?1:0), total:s.total+1 }))
    // Log attempt
    fetch('/api/qbank/generate', { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ 
        question_id: q.id, 
        selected_option_id: opt.id, 
        is_correct: opt.is_correct,
        time_taken_ms: timeTaken
      }) 
    }).catch(()=>{})
  }

  function next() {
    setSelected(null); setAnswered(false); setShowDetail(false)
    if (current+1 >= questions.length) setDone(true)
    else {
      setCurrent(c=>c+1)
      startTimeRef.current = new Date().getTime()
    }
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#0F0A1A',display:'flex',alignItems:'center',justifyContent:'center',color:'#A29BCC'}}>Loading QBank...</div>

  if (!questions.length) return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',padding:60}}>
          <div style={{fontSize:'4rem',marginBottom:16}}>📭</div>
          <h2 style={{marginBottom:12}}>No QBank questions yet</h2>
          <p style={{color:'#A29BCC',marginBottom:24}}>Upload a PDF to generate board-style questions</p>
          <Link href="/upload" className="btn btn-primary">📤 Upload PDF</Link>
        </div>
      </main>
    </div>
  )

  if (done) return (
    <div style={{minHeight:'100vh',background:'#0F0A1A',color:'#F8F7FF',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card animate-zoom" style={{textAlign:'center',padding:60,maxWidth:480}}>
        <div style={{fontSize:'4rem',marginBottom:16}}>{score.correct/score.total>=0.7?'🎉':'📚'}</div>
        <h2 style={{marginBottom:8}}>Session Complete</h2>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'3rem',fontWeight:700,color:score.correct/score.total>=0.7?'#00D2A0':'#FF6B6B',margin:'16px 0'}}>
          {score.correct}/{score.total}
        </div>
        <p style={{color:'#A29BCC',marginBottom:24}}>{Math.round(score.correct/score.total*100)}% accuracy</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button className="btn btn-primary" onClick={()=>{setCurrent(0);setScore({correct:0,total:0});setDone(false);setSelected(null);setAnswered(false)}}>Try Again</button>
          <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </div>
    </div>
  )

  if (!q) return null
  const opts = typeof q.options==='string'?JSON.parse(q.options):q.options

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          {/* Progress */}
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:28}}>
            <span style={{color:'#A29BCC',fontSize:'0.85rem',flexShrink:0}}>{current+1}/{questions.length}</span>
            <div style={{flex:1}}><div className="progress-bar"><div className="progress-fill" style={{width:`${(current/questions.length)*100}%`}} /></div></div>
            <span style={{color:'#00D2A0',fontSize:'0.85rem',flexShrink:0}}>✓{score.correct} ✗{score.total-score.correct}</span>
          </div>

          {/* Vignette */}
          <div className="card" style={{marginBottom:20,padding:28}}>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <span className="badge badge-primary">USMLE STYLE</span>
              <span className={`badge ${q.difficulty==='hard'?'badge-error':q.difficulty==='easy'?'badge-success':'badge-warning'}`}>{q.difficulty?.toUpperCase()}</span>
            </div>
            <p style={{fontSize:'1rem',lineHeight:1.8,color:'#E0DFF8',marginBottom:16}}>{q.question_stem}</p>
            {q.lead_in && <p style={{fontWeight:600,color:'#F8F7FF',fontSize:'1rem'}}>{q.lead_in}</p>}
          </div>

          {/* Options */}
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
            {opts?.map(opt=>{
              let cls='option-btn'
              if(answered){
                if(opt.is_correct) cls+=' correct'
                else if(selected===opt.id) cls+=' incorrect'
              } else if(selected===opt.id) cls+=' selected'
              return (
                <button key={opt.id} className={cls} onClick={()=>handleSelect(opt)} disabled={answered}>
                  <span className="option-label">{opt.id.toUpperCase()}</span>
                  <span style={{flex:1}}>{opt.text}</span>
                  {answered&&opt.is_correct&&<span>✓</span>}
                  {answered&&selected===opt.id&&!opt.is_correct&&<span>✗</span>}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="animate-fade-up card" style={{marginBottom:20,padding:24,borderColor:'rgba(108,92,231,0.4)'}}>
              <div style={{fontWeight:600,marginBottom:8,color:opts?.find(o=>o.id===selected)?.is_correct?'#00D2A0':'#FF6B6B'}}>
                {opts?.find(o=>o.id===selected)?.is_correct?'✓ Correct!':'✗ Incorrect'}
              </div>
              <p style={{color:'#A29BCC',fontSize:'0.9rem',lineHeight:1.7}}>{q.explanation_brief}</p>
              {q.explanation_detailed && (
                <div style={{marginTop:12}}>
                  <button onClick={()=>setShowDetail(d=>!d)} className="btn btn-ghost btn-sm">{showDetail?'Hide':'Show'} detailed explanation</button>
                  {showDetail && <p style={{marginTop:12,color:'#A29BCC',fontSize:'0.88rem',lineHeight:1.8}}>{q.explanation_detailed}</p>}
                </div>
              )}
            </div>
          )}

          {answered && <button className="btn btn-primary" style={{width:'100%',padding:'14px'}} onClick={next}>{current+1>=questions.length?'See Results →':'Next Question →'}</button>}
        </div>
      </main>
    </div>
  )
}

export default function QBankPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#0F0A1A',display:'flex',alignItems:'center',justifyContent:'center',color:'#A29BCC'}}>Loading QBank...</div>}>
      <QBankContent />
    </Suspense>
  )
}
