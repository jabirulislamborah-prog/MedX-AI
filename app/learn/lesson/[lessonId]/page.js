'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LessonPage({ params }) {
  const router = useRouter()
  const [lessonId, setLessonId] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [hearts, setHearts] = useState(5)
  const [xpGained, setXpGained] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [textInput, setTextInput] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    params.then(p => setLessonId(p.lessonId))
  }, [params])

  useEffect(() => {
    if (!lessonId) return
    async function load() {
      const supabase = createClient()
      const { data: l } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      const { data: q } = await supabase.from('lesson_questions').select('*').eq('lesson_id', lessonId).order('question_order')
      setLesson(l); setQuestions(q || []); setLoading(false)
    }
    load()
  }, [lessonId])

  const q = questions[current]
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0

  function handleSelect(opt) {
    if (answered) return
    setSelected(opt.id)
    setAnswered(true)
    const isCorrect = opt.is_correct
    if (isCorrect) setXpGained(x => x + 10)
    else {
      setHearts(h => h - 1)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    // Auto-advance after 1.5s
    setTimeout(() => advance(isCorrect), 1500)
  }

  function handleTrueFalse(ans) {
    if (answered) return
    setSelected(ans)
    setAnswered(true)
    const isCorrect = ans === q.correct_answer
    if (isCorrect) setXpGained(x => x + 10)
    else { setHearts(h => h - 1); setShake(true); setTimeout(() => setShake(false), 600) }
    setTimeout(() => advance(isCorrect), 1500)
  }

  function handleCloze() {
    if (answered) return
    const isCorrect = textInput.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()
    setSelected(isCorrect ? 'correct' : 'wrong')
    setAnswered(true)
    if (isCorrect) setXpGained(x => x + 10)
    else { setHearts(h => h - 1); setShake(true); setTimeout(() => setShake(false), 600) }
    setTimeout(() => advance(isCorrect), 1500)
  }

  async function advance(wasCorrect) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId, question_id: q.id, is_correct: wasCorrect, selected_answer: selected })
    }

    if (hearts <= 1 && !wasCorrect) { setDone(true); return }
    if (current + 1 >= questions.length) {
      // Mark complete, award XP
      if (user) {
        await supabase.from('lessons').update({ is_completed: true }).eq('id', lessonId)
        await supabase.rpc('increment_xp', { uid: user.id, amount: xpGained + (lesson?.xp_reward || 20) })
      }
      setDone(true)
    } else {
      setCurrent(c => c + 1); setSelected(null); setAnswered(false); setTextInput('')
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0A1A',color:'#F8F7FF'}}>
      <div className="animate-spin" style={{fontSize:'2rem'}}>⟳</div>
    </div>
  )

  if (done) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0F0A1A',color:'#F8F7FF',gap:24,padding:24}}>
      <div className="animate-zoom" style={{textAlign:'center'}}>
        <div style={{fontSize:'5rem',marginBottom:16}}>{hearts > 0 ? '🎉' : '💔'}</div>
        <h1 style={{marginBottom:8}}>{hearts > 0 ? 'Lesson Complete!' : 'Out of Hearts'}</h1>
        <p style={{color:'#A29BCC',marginBottom:24}}>{hearts > 0 ? `You earned ${xpGained} XP!` : 'Better luck next time!'}</p>
        {hearts > 0 && <div style={{fontSize:'2rem',fontWeight:700,color:'#FDCB6E',marginBottom:32}}>+{xpGained} XP ⭐</div>}
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => router.push('/learn')}>Continue Learning →</button>
          <button className="btn btn-ghost" onClick={() => { setCurrent(0); setSelected(null); setAnswered(false); setHearts(5); setXpGained(0); setDone(false) }}>Try Again</button>
        </div>
      </div>
    </div>
  )

  if (!q) return null

  return (
    <div style={{minHeight:'100vh',background:'#0F0A1A',color:'#F8F7FF',padding:'24px'}}>
      {/* Header */}
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => router.push('/learn')} style={{flexShrink:0}}>✕</button>
          <div style={{flex:1}}>
            <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
          </div>
          <div className="hearts">{Array.from({length:5}).map((_,i)=>(
            <span key={i} className={`heart${i >= hearts?' lost':''}`}>❤️</span>
          ))}</div>
        </div>

        {/* Question */}
        <div className={`question-card animate-fade-up${shake?' animate-shake':''}`}>
          <div style={{marginBottom:8}}>
            <span className="badge badge-primary">{q.type.toUpperCase()}</span>
          </div>
          <h2 style={{fontSize:'1.3rem',marginBottom:28,lineHeight:1.5}}>{q.question_text}</h2>

          {/* MCQ */}
          {q.question_type==='mcq' && q.options && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {(typeof q.options==='string'?JSON.parse(q.options):q.options).map(opt=>{
                let cls='option-btn'
                if(answered){
                  if(opt.is_correct) cls+=' correct'
                  else if(selected===opt.id) cls+=' incorrect'
                } else if(selected===opt.id) cls+=' selected'
                return (
                  <button key={opt.id} className={cls} onClick={()=>handleSelect(opt)} disabled={answered}>
                    <span className="option-label">{opt.id.toUpperCase()}</span>
                    <span>{opt.text}</span>
                    {answered&&opt.is_correct&&<span style={{marginLeft:'auto'}}>✓</span>}
                    {answered&&selected===opt.id&&!opt.is_correct&&<span style={{marginLeft:'auto'}}>✗</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* True/False */}
          {q.question_type==='true_false' && (
            <div style={{display:'flex',gap:16}}>
              {['true','false'].map(val=>{
                let style={flex:1,padding:'20px',fontSize:'1.1rem',fontWeight:700,border:'1.5px solid',borderRadius:12,cursor:'pointer',transition:'all 0.2s'}
                if(answered){
                  if(val===q.correct_answer) style={...style,borderColor:'#00D2A0',background:'rgba(0,210,160,0.15)',color:'#00D2A0'}
                  else if(val===selected) style={...style,borderColor:'#FF6B6B',background:'rgba(255,107,107,0.15)',color:'#FF6B6B'}
                  else style={...style,borderColor:'#2D2654',color:'#6B6490'}
                } else {
                  style={...style,borderColor:'#2D2654',background:'#1A1432',color:'#F8F7FF'}
                }
                return <button key={val} style={style} onClick={()=>handleTrueFalse(val)} disabled={answered}>{val==='true'?'✅ True':'❌ False'}</button>
              })}
            </div>
          )}

          {/* Cloze */}
          {q.question_type==='cloze' && (
            <div>
              <input
                className="input"
                placeholder="Type your answer..."
                value={textInput}
                onChange={e=>setTextInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!answered&&handleCloze()}
                disabled={answered}
                style={{marginBottom:12,borderColor: answered?(selected==='correct'?'#00D2A0':'#FF6B6B'):'#2D2654'}}
                autoFocus
              />
              {!answered && <button className="btn btn-primary" style={{width:'100%'}} onClick={handleCloze} disabled={!textInput.trim()}>Check Answer</button>}
              {answered && <div style={{padding:'12px 16px',borderRadius:8,background:selected==='correct'?'rgba(0,210,160,0.15)':'rgba(255,107,107,0.15)',color:selected==='correct'?'#00D2A0':'#FF6B6B',fontWeight:600}}>
                {selected==='correct'?'✓ Correct!':'✗ Answer: '+q.correct_answer}
              </div>}
            </div>
          )}

          {/* Explanation */}
          {answered && q.explanation && (
            <div style={{marginTop:20,padding:'16px',background:'rgba(108,92,231,0.1)',border:'1px solid rgba(108,92,231,0.3)',borderRadius:12,fontSize:'0.9rem',lineHeight:1.6,color:'#A29BCC',animationDelay:'0.3s'}} className="animate-fade-up">
              <strong style={{color:'#8B7CF6'}}>💡 Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:24,color:'#6B6490',fontSize:'0.85rem'}}>
          {current + 1} / {questions.length}
        </div>
      </div>
    </div>
  )
}
