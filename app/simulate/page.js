'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const DEMO_QUESTIONS = [
  {
    id: 1,
    number: 1,
    category: 'Cardiology',
    vignette: `A 58-year-old man presents to the emergency department with sudden-onset, severe, tearing chest pain that radiates to his back. The pain began 2 hours ago while he was lifting boxes. His past medical history includes hypertension and type 2 diabetes mellitus. He takes lisinopril and metformin. On examination, blood pressure is 180/100 mmHg in the right arm and 145/90 mmHg in the left arm. Heart rate is 98/min. Chest X-ray shows widening of the mediastinum.`,
    question: 'Which of the following is the most likely diagnosis?',
    options: [
      { label: 'A', text: 'Acute ST-elevation myocardial infarction' },
      { label: 'B', text: 'Aortic dissection (Type A)' },
      { label: 'C', text: 'Pulmonary embolism' },
      { label: 'D', text: 'Esophageal rupture (Boerhaave syndrome)' },
      { label: 'E', text: 'Tension pneumothorax' },
    ],
    correct: 'B',
    explanation: `Aortic dissection is the most likely diagnosis given: (1) tearing chest pain radiating to the back — classic descriptor, (2) BP differential between arms (>20 mmHg) — pathognomonic, (3) widened mediastinum on CXR, and (4) hypertension as the primary risk factor. STEMI typically presents with crushing/pressure-like pain. PE presents with dyspnea and pleuritic pain. Boerhaave's follows forceful vomiting. This is a Type A dissection (ascending aorta involved) — requires emergency surgery.`,
  },
  {
    id: 2,
    number: 2,
    category: 'Nephrology',
    vignette: `A 24-year-old woman presents with 3 days of facial puffiness and frothy urine. She has no significant past medical history. On examination, blood pressure is 120/78 mmHg. There is periorbital edema and 2+ pitting edema of the lower extremities. Laboratory results: Serum albumin 1.8 g/dL (normal: 3.5–5.0), Serum cholesterol 380 mg/dL, Urinalysis shows 4+ protein, no RBCs, no RBC casts.`,
    question: 'Which of the following mechanisms is most directly responsible for the peripheral edema in this patient?',
    options: [
      { label: 'A', text: 'Increased hydrostatic pressure due to sodium retention' },
      { label: 'B', text: 'Decreased oncotic pressure due to hypoalbuminemia' },
      { label: 'C', text: 'Increased vascular permeability due to inflammation' },
      { label: 'D', text: 'Lymphatic obstruction' },
      { label: 'E', text: 'Increased ADH secretion' },
    ],
    correct: 'B',
    explanation: `This patient has nephrotic syndrome: massive proteinuria (>3.5g/day), hypoalbuminemia, hyperlipidemia, and edema. The edema is primarily caused by decreased oncotic pressure (↓albumin → ↓plasma oncotic pressure → fluid moves from intravascular to interstitium). The "underfill" theory: ↓oncotic pressure → edema → relative hypovolemia → RAAS activation → further sodium and water retention. This is differentiated from nephritic syndrome by absence of hematuria and RBC casts.`,
  },
  {
    id: 3,
    number: 3,
    category: 'Pharmacology',
    vignette: `A 45-year-old woman with rheumatoid arthritis is started on methotrexate. Two weeks later, she develops oral ulcers, fatigue, and a CBC shows: WBC 2,800/μL, Hgb 9.2 g/dL (MCV 108 fL), Platelets 95,000/μL. Her physician explains that her symptoms are related to the mechanism of action of her medication.`,
    question: 'Which of the following best describes the mechanism by which methotrexate caused this patient\'s findings?',
    options: [
      { label: 'A', text: 'Inhibition of purine synthesis by blocking PRPP amidotransferase' },
      { label: 'B', text: 'Inhibition of dihydrofolate reductase, preventing tetrahydrofolate regeneration' },
      { label: 'C', text: 'Direct alkylation of DNA, causing double-strand breaks' },
      { label: 'D', text: 'Inhibition of microtubule assembly, blocking mitosis' },
      { label: 'E', text: 'Inhibition of topoisomerase II, causing DNA strand breaks' },
    ],
    correct: 'B',
    explanation: `Methotrexate is a folate analog that inhibits dihydrofolate reductase (DHFR). This prevents the regeneration of THF (tetrahydrofolate) from DHF. Without THF: thymidylate synthesis fails → no dTMP → no DNA synthesis → S-phase arrest. This causes megaloblastic anemia (high MCV), mucositis (oral ulcers), and pancytopenia. Leucovorin (folinic acid = pre-formed THF) is given as rescue. This mechanism is amplified in rapidly dividing cells — bone marrow and GI epithelium.`,
  },
]

const LAB_VALUES = [
  { section: 'Serum Electrolytes', values: [
    { name: 'Na⁺', range: '136–145 mEq/L' },
    { name: 'K⁺', range: '3.5–5.0 mEq/L' },
    { name: 'Cl⁻', range: '98–108 mEq/L' },
    { name: 'HCO₃⁻', range: '22–28 mEq/L' },
    { name: 'BUN', range: '7–21 mg/dL' },
    { name: 'Creatinine', range: '0.6–1.2 mg/dL' },
    { name: 'Glucose (fasting)', range: '70–99 mg/dL' },
    { name: 'Ca²⁺', range: '8.5–10.5 mg/dL' },
  ]},
  { section: 'Hematology (CBC)', values: [
    { name: 'WBC', range: '4,500–11,000/μL' },
    { name: 'Hemoglobin (M)', range: '13.5–17.5 g/dL' },
    { name: 'Hemoglobin (F)', range: '12.0–15.5 g/dL' },
    { name: 'Hematocrit (M)', range: '41–53%' },
    { name: 'Hematocrit (F)', range: '36–46%' },
    { name: 'MCV', range: '80–100 fL' },
    { name: 'Platelets', range: '150,000–400,000/μL' },
  ]},
  { section: 'Liver Function', values: [
    { name: 'ALT', range: '7–40 U/L' },
    { name: 'AST', range: '10–40 U/L' },
    { name: 'Albumin', range: '3.5–5.0 g/dL' },
    { name: 'Total Bilirubin', range: '0.2–1.2 mg/dL' },
    { name: 'Alk Phosphatase', range: '30–120 U/L' },
    { name: 'PT/INR', range: '11–15 sec / 0.9–1.1' },
  ]},
  { section: 'Arterial Blood Gas', values: [
    { name: 'pH', range: '7.35–7.45' },
    { name: 'PaO₂', range: '75–100 mmHg' },
    { name: 'PaCO₂', range: '35–45 mmHg' },
    { name: 'HCO₃⁻', range: '22–26 mEq/L' },
    { name: 'O₂ Sat', range: '95–100%' },
  ]},
]

const BLOCK_MINUTES = 60 * 60 // 60 min per block in seconds

export default function SimulatePage() {
  const TOTAL_Q = DEMO_QUESTIONS.length
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({}) // { qId: selectedLabel }
  const [flagged, setFlagged] = useState(new Set())
  const [revealed, setRevealed] = useState({}) // { qId: true } → show explanation
  const [timeLeft, setTimeLeft] = useState(BLOCK_MINUTES)
  const [showReview, setShowReview] = useState(false)
  const [rightPanel, setRightPanel] = useState('labs') // 'labs' | 'notes'
  const [mobileTab, setMobileTab] = useState('question') // 'question' | 'labs' | 'notes'
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [shakeQ, setShakeQ] = useState(false)
  const [mascotVisible, setMascotVisible] = useState(false)

  const q = DEMO_QUESTIONS[currentQ]

  // Timer
  useEffect(() => {
    if (!started || submitted) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [started, submitted])

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`
  }

  const handleAnswer = (label) => {
    if (revealed[q.id]) return // already revealed
    setAnswers(prev => ({...prev, [q.id]: label}))
  }

  const handleConfirm = () => {
    if (!answers[q.id]) return
    setRevealed(prev => ({...prev, [q.id]: true}))
    
    // Dopamine / Loss Aversion Triggers
    if (answers[q.id] === q.correct) {
      setMascotVisible(true)
      setTimeout(() => setMascotVisible(false), 2500)
    } else {
      setShakeQ(true)
      setTimeout(() => setShakeQ(false), 600)
    }
  }

  const handleNext = () => {
    if (currentQ < TOTAL_Q - 1) setCurrentQ(i => i + 1)
    else setShowReview(true)
  }

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(i => i - 1)
  }

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev)
      next.has(q.id) ? next.delete(q.id) : next.add(q.id)
      return next
    })
  }

  const handleSubmit = () => setSubmitted(true)

  const score = Object.entries(answers).filter(([id, ans]) =>
    DEMO_QUESTIONS.find(q => q.id === parseInt(id))?.correct === ans
  ).length

  const pct = Math.round((score / TOTAL_Q) * 100)

  // ── PRE-START SCREEN ──
  if (!started) return (
    <div style={{minHeight:'100vh',background:'#040816',color:'#E8E6F5',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:600,width:'100%',textAlign:'center'}}>
        <Link href="/dashboard" style={{
          display:'inline-flex',alignItems:'center',gap:8,color:'rgba(162,155,204,0.6)',
          fontSize:'0.85rem',fontWeight:600,marginBottom:40,textDecoration:'none',letterSpacing:'0.04em'
        }}>← Return to Dashboard</Link>

        <div style={{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#1a4fd6,#0d3ba8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',margin:'0 auto 24px',boxShadow:'0 0 40px rgba(26,79,214,0.3)'}}>🔬</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2rem',fontWeight:800,marginBottom:8,letterSpacing:'-0.03em'}}>USMLE Exam Simulator</h1>
        <p style={{color:'rgba(162,155,204,0.8)',marginBottom:40,fontSize:'1rem',lineHeight:1.65}}>
          Experience the real USMLE interface. Timed blocks, split-screen lab values, and flagging system — mirroring the 2026 NBME Prometric experience.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:40,textAlign:'left'}}>
          {[
            {icon:'⏱️', label:'60 Minutes', sub:'Per block (real timing)'},
            {icon:'🔬', label:'Split Screen', sub:'Live lab reference panel'},
            {icon:'🏳️', label:'Flagging', sub:'Mark for review — real NBME feature'},
          ].map(f=>(
            <div key={f.label} style={{padding:'20px 18px',borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{fontSize:'1.6rem',marginBottom:8}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:'0.9rem',marginBottom:4}}>{f.label}</div>
              <div style={{fontSize:'0.78rem',color:'rgba(162,155,204,0.65)'}}>{f.sub}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'14px 20px',borderRadius:12,background:'rgba(26,79,214,0.08)',border:'1px solid rgba(26,79,214,0.2)',marginBottom:28,fontSize:'0.85rem',color:'rgba(162,155,204,0.7)',textAlign:'left',lineHeight:1.6}}>
          ⚠️ <strong style={{color:'rgba(232,230,245,0.9)'}}>Demo Block:</strong> {TOTAL_Q} questions for this preview. Full blocks will contain 40 questions. Your answers are saved and scored at the end.
        </div>

        <button onClick={() => setStarted(true)} className="btn btn-primary btn-lg" style={{width:'100%'}}>
          Begin Block →
        </button>
      </div>
    </div>
  )

  // ── RESULTS SCREEN ──
  if (submitted) return (
    <div style={{minHeight:'100vh',background:'#040816',color:'#E8E6F5',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:640,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>{pct >= 70 ? '🎉' : pct >= 50 ? '📈' : '📚'}</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.5rem',fontWeight:800,letterSpacing:'-0.04em',marginBottom:8}}>Block Complete</h1>

        {/* Score circle */}
        <div style={{
          width:160,height:160,borderRadius:'50%',margin:'32px auto',
          background:`conic-gradient(${pct>=70?'#00D2A0':pct>=50?'#FDCB6E':'#FF6B6B'} ${pct*3.6}deg, rgba(255,255,255,0.05) 0)`,
          display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
          boxShadow:`0 0 40px ${pct>=70?'rgba(0,210,160,0.3)':pct>=50?'rgba(253,203,110,0.3)':'rgba(255,107,107,0.2)'}`
        }}>
          <div style={{
            width:130,height:130,borderRadius:'50%',background:'#040816',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
          }}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.5rem',fontWeight:800,lineHeight:1,color:pct>=70?'#00D2A0':pct>=50?'#FDCB6E':'#FF6B6B'}}>{pct}%</div>
            <div style={{fontSize:'0.75rem',color:'rgba(162,155,204,0.6)',letterSpacing:'0.04em',textTransform:'uppercase'}}>{score}/{TOTAL_Q} correct</div>
          </div>
        </div>

        {/* Per-question review */}
        <div style={{textAlign:'left',marginBottom:32}}>
          <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:16,fontSize:'1.1rem'}}>Question Review</h3>
          {DEMO_QUESTIONS.map((dq, i) => {
            const selected = answers[dq.id]
            const correct = dq.correct
            const isCorrect = selected === correct
            return (
              <div key={dq.id} style={{
                padding:'16px 20px',borderRadius:14,marginBottom:8,
                background: isCorrect ? 'rgba(0,210,160,0.06)' : 'rgba(255,107,107,0.06)',
                border:`1px solid ${isCorrect ? 'rgba(0,210,160,0.2)' : 'rgba(255,107,107,0.2)'}`
              }}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontWeight:700,fontSize:'0.92rem'}}>Q{i+1}. {dq.category}</span>
                  <span style={{color:isCorrect?'#00D2A0':'#FF6B6B',fontWeight:700,fontSize:'0.88rem'}}>{isCorrect?'✓ Correct':'✗ Incorrect'}</span>
                </div>
                {!isCorrect && (
                  <div style={{fontSize:'0.82rem',color:'rgba(162,155,204,0.7)'}}>
                    Your answer: <strong style={{color:'#FF6B6B'}}>{selected || 'Not answered'}</strong> · Correct: <strong style={{color:'#00D2A0'}}>{correct}</strong>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{display:'flex',gap:12}}>
          <Link href="/dashboard" className="btn btn-ghost">← Dashboard</Link>
          <button onClick={()=>{setStarted(false);setSubmitted(false);setAnswers({});setRevealed({});setCurrentQ(0);setTimeLeft(BLOCK_MINUTES)}} className="btn btn-primary" style={{flex:2}}>
            🔄 Retry Block
          </button>
        </div>
      </div>
    </div>
  )

  // ── MAIN SIM INTERFACE (NBME Split-Screen) ──
  return (
    <div style={{
      minHeight:'100vh',background:'#040816',color:'#E8E6F5',
      display:'flex',flexDirection:'column',fontFamily:"'Inter',sans-serif",fontSize:'0.93rem'
    }}>
      {/* TOP BAR — NBME style */}
      <div style={{
        height:48,background:'rgba(26,79,214,0.9)',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 20px',flexShrink:0,
        boxShadow:'0 2px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontWeight:700,fontSize:'0.88rem',letterSpacing:'0.04em',color:'rgba(255,255,255,0.9)',textTransform:'uppercase'}}>
            USMLE Step 1 · Block 1
          </div>
          <div style={{height:16,width:1,background:'rgba(255,255,255,0.2)'}} />
          <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.7)'}}>
            {Object.keys(answers).length}/{TOTAL_Q} answered · {flagged.size} flagged
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display:'flex',alignItems:'center',gap:8,
          padding:'6px 16px',borderRadius:8,
          background: timeLeft < 300 ? 'rgba(255,107,107,0.3)' : 'rgba(0,0,0,0.3)',
          border: `1px solid ${timeLeft < 300 ? 'rgba(255,107,107,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: timeLeft < 300 ? '#FF6B6B' : 'white'
        }}>
          <span style={{fontSize:'1rem'}}>⏱</span>
          <span style={{fontFamily:'monospace',fontWeight:700,fontSize:'1rem',letterSpacing:'0.08em'}}>{formatTime(timeLeft)}</span>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button onClick={() => setShowReview(!showReview)} style={{padding:'6px 14px',borderRadius:6,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>
            📋 Review
          </button>
          <button onClick={handleSubmit} style={{padding:'6px 14px',borderRadius:6,background:'rgba(255,107,107,0.3)',border:'1px solid rgba(255,107,107,0.5)',color:'white',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>
            End Block
          </button>
        </div>
      </div>

      {/* QUESTION NAVIGATOR (slim strip) */}
      <div style={{
        background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'8px 20px',display:'flex',alignItems:'center',gap:6,overflowX:'auto',flexShrink:0
      }}>
        {DEMO_QUESTIONS.map((dq,i)=>{
          const isAnswered = !!answers[dq.id]
          const isFlagged = flagged.has(dq.id)
          const isActive = currentQ === i
          return (
            <button key={dq.id} onClick={()=>setCurrentQ(i)} style={{
              width:32,height:32,borderRadius:6,flexShrink:0,
              background: isActive ? '#1a4fd6' : isAnswered ? 'rgba(0,210,160,0.15)' : 'rgba(255,255,255,0.05)',
              border:`1.5px solid ${isActive ? '#4173e8' : isFlagged ? '#FDCB6E' : isAnswered ? 'rgba(0,210,160,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: isActive ? 'white' : isAnswered ? '#00D2A0' : '#A29BCC',
              fontWeight: isActive ? 700 : 600, fontSize:'0.8rem', cursor:'pointer',
              position:'relative'
            }}>
              {i+1}
              {isFlagged && <span style={{position:'absolute',top:-4,right:-4,width:8,height:8,borderRadius:'50%',background:'#FDCB6E',display:'block'}} />}
            </button>
          )
        })}
      </div>

      {/* MAIN SPLIT LAYOUT + MOBILE TAB LOGIC */}
      <div style={{display:'flex',flex:1,overflow:'hidden',position:'relative'}}>
        
        {/* MOBILE TABS HEADER (Only visible on small screens) */}
        <div className="show-on-mobile" style={{
          position:'absolute',top:0,left:0,right:0,zIndex:10,display:'flex',
          background:'rgba(15,10,26,0.95)',borderBottom:'1px solid rgba(255,255,255,0.1)'
        }}>
          {[
            { id: 'question', label: 'Question' },
            { id: 'labs', label: 'Lab Values' },
            { id: 'notes', label: 'Notes' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)} style={{
              flex:1,padding:'12px 0',background:'transparent',border:'none',
              color: mobileTab === tab.id ? '#1a4fd6' : '#A29BCC',
              fontWeight: mobileTab === tab.id ? 700 : 500,
              borderBottom: `2px solid ${mobileTab === tab.id ? '#1a4fd6' : 'transparent'}`
            }}>{tab.label}</button>
          ))}
        </div>

        {/* LEFT PANEL — Question */}
        <div className={mobileTab === 'question' ? '' : 'hide-on-mobile'} style={{
          flex:'1 1 60%',display:'flex',flexDirection:'column',
          borderRight:'1px solid rgba(255,255,255,0.06)',
          overflow:'hidden',
          paddingTop: mobileTab !== 'question' ? 0 : 'var(--mobile-tab-offset, 0)' // We'll handle spacing via CSS but inline is faster:
        }}>
          {/* Add spacing on mobile to account for the tab bar */}
          <style>{`@media(max-width:768px) { .question-panel { margin-top: 45px; } }`}</style>
          
          {/* Question meta */}
          <div className="question-panel" style={{
            padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.04)',
            display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0
          }}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{
                padding:'3px 10px',borderRadius:999,fontSize:'0.72rem',fontWeight:700,
                background:'rgba(26,79,214,0.15)',border:'1px solid rgba(26,79,214,0.3)',color:'#7ca3f0',
                letterSpacing:'0.04em',textTransform:'uppercase'
              }}>{q.category}</span>
              <span style={{color:'rgba(162,155,204,0.5)',fontSize:'0.8rem'}}>Question {q.number} of {TOTAL_Q}</span>
            </div>
            <button
              onClick={toggleFlag}
              style={{
                padding:'5px 14px',borderRadius:6,fontSize:'0.78rem',fontWeight:600,cursor:'pointer',
                background: flagged.has(q.id) ? 'rgba(253,203,110,0.15)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${flagged.has(q.id) ? 'rgba(253,203,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: flagged.has(q.id) ? '#FDCB6E' : '#A29BCC'
              }}
            >
              🏳️ {flagged.has(q.id) ? 'Flagged' : 'Flag'}
            </button>
          </div>

          {/* Scrollable question content */}
          <div className={shakeQ ? 'animate-shake-hard' : ''} style={{flex:1,overflowY:'auto',padding:'24px'}}>
            {/* Vignette */}
            <div style={{
              padding:'20px 24px',borderRadius:12,marginBottom:24,
              background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',
              lineHeight:1.8,color:'rgba(232,230,245,0.9)',fontSize:'0.95rem'
            }}>
              {q.vignette}
            </div>

            {/* Question stem */}
            <p style={{fontWeight:700,fontSize:'1rem',marginBottom:20,color:'#E8E6F5',lineHeight:1.6}}>
              {q.question}
            </p>

            {/* Answer options */}
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.label
                const isRevealed = revealed[q.id]
                const isCorrect = opt.label === q.correct
                const isWrong = selected && !isCorrect && isRevealed

                let bg = 'rgba(255,255,255,0.03)'
                let border = 'rgba(255,255,255,0.08)'
                let color = 'rgba(232,230,245,0.85)'

                if (!isRevealed && selected) { bg='rgba(26,79,214,0.12)'; border='rgba(26,79,214,0.4)'; color='#c5d5fc' }
                if (isRevealed && isCorrect) { bg='rgba(0,210,160,0.1)'; border='rgba(0,210,160,0.4)'; color='#00F5BA' }
                if (isWrong) { bg='rgba(255,107,107,0.1)'; border='rgba(255,107,107,0.4)'; color='#FF6B6B' }

                return (
                  <button key={opt.label} onClick={()=>handleAnswer(opt.label)} disabled={!!revealed[q.id]} style={{
                    display:'flex',alignItems:'flex-start',gap:12,padding:'13px 16px',
                    borderRadius:10,cursor:revealed[q.id]?'default':'pointer',textAlign:'left',
                    background:bg,border:`1.5px solid ${border}`,color,
                    transition:'all 0.15s',
                  }}>
                    <div style={{
                      width:28,height:28,borderRadius:6,flexShrink:0,
                      background:`rgba(255,255,255,0.06)`,border:`1.5px solid ${border}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontWeight:700,fontSize:'0.82rem',fontFamily:'monospace',marginTop:1
                    }}>{opt.label}</div>
                    <span style={{lineHeight:1.6,fontSize:'0.93rem'}}>{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {/* Confirm / Explanation */}
            {!revealed[q.id] ? (
              <button
                onClick={handleConfirm}
                disabled={!answers[q.id]}
                className="btn btn-primary" style={{width:'auto'}}
              >
                Confirm Answer →
              </button>
            ) : (
              <div style={{
                padding:'20px 22px',borderRadius:12,lineHeight:1.75,
                background:'rgba(0,210,160,0.06)',border:'1px solid rgba(0,210,160,0.2)',
                fontSize:'0.9rem',color:'rgba(232,230,245,0.85)'
              }}>
                <div style={{fontWeight:700,color:'#00D2A0',marginBottom:10,fontSize:'0.8rem',letterSpacing:'0.06em',textTransform:'uppercase'}}>
                  🎓 Explanation
                </div>
                {q.explanation}
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div style={{
            padding:'14px 24px',borderTop:'1px solid rgba(255,255,255,0.04)',
            display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,
            background:'rgba(255,255,255,0.015)'
          }}>
            <button onClick={handlePrev} disabled={currentQ===0} style={{padding:'9px 20px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,fontSize:'0.85rem',cursor:currentQ===0?'not-allowed':'pointer',opacity:currentQ===0?0.4:1}}>← Previous</button>
            <span style={{color:'rgba(162,155,204,0.5)',fontSize:'0.82rem'}}>
              {currentQ+1} / {TOTAL_Q}
            </span>
            {currentQ < TOTAL_Q - 1
              ? <button onClick={handleNext} style={{padding:'9px 20px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>Next →</button>
              : <button onClick={()=>setShowReview(true)} style={{padding:'9px 20px',borderRadius:8,background:'rgba(0,210,160,0.15)',border:'1px solid rgba(0,210,160,0.3)',color:'#00D2A0',fontWeight:700,fontSize:'0.85rem',cursor:'pointer'}}>Review All</button>
            }
          </div>
        </div>

        {/* RIGHT PANEL — Labs / Notes */}
        <div className={mobileTab === 'question' ? 'hide-on-mobile' : ''} style={{
          flex:'0 0 40%',display:'flex',flexDirection:'column',overflow:'hidden',
          minWidth: 320
        }}>
          {/* Panel tabs (Hidden on mobile since handled by header) */}
          <style>{`@media(max-width:768px) { .desktop-panel-tabs { display: none !important; } .right-panel-content { margin-top: 45px; } }`}</style>
          <div className="desktop-panel-tabs" style={{
            display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0,
            background:'rgba(255,255,255,0.02)'
          }}>
            {[['labs','📋 Lab Values'],['notes','📝 Notes']].map(([id,label])=>(
              <button key={id} onClick={()=>{setRightPanel(id); setMobileTab(id)}} style={{
                flex:1,padding:'13px',border:'none',cursor:'pointer',
                background:'transparent',fontWeight:rightPanel===id?700:500,
                color:rightPanel===id?'#E8E6F5':'rgba(162,155,204,0.5)',
                fontSize:'0.85rem',
                borderBottom:`2px solid ${rightPanel===id?'#1a4fd6':'transparent'}`,
                transition:'all 0.15s'
              }}>{label}</button>
            ))}
          </div>

          <div className="right-panel-content" style={{flex:1,overflowY:'auto',padding:'0'}}>
            {(rightPanel === 'labs' || mobileTab === 'labs') ? (
              <div>
                {LAB_VALUES.map(section=>(
                  <div key={section.section}>
                    <div style={{
                      padding:'10px 20px',
                      background:'rgba(26,79,214,0.07)',
                      borderBottom:'1px solid rgba(255,255,255,0.04)',
                      fontSize:'0.75rem',fontWeight:700,color:'#7ca3f0',letterSpacing:'0.06em',textTransform:'uppercase'
                    }}>{section.section}</div>
                    {section.values.map((v,i)=>(
                      <div key={v.name} style={{
                        display:'flex',justifyContent:'space-between',alignItems:'center',
                        padding:'8px 20px',
                        background: i%2===0?'transparent':'rgba(255,255,255,0.01)',
                        borderBottom:'1px solid rgba(255,255,255,0.025)',fontSize:'0.82rem'
                      }}>
                        <span style={{color:'rgba(232,230,245,0.8)'}}>{v.name}</span>
                        <span style={{color:'rgba(162,155,204,0.7)',fontFamily:'monospace',fontSize:'0.8rem'}}>{v.range}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{padding:16,height:'100%'}}>
                <textarea
                  value={notes}
                  onChange={e=>setNotes(e.target.value)}
                  placeholder="Scratch pad — notes are not saved after the block ends..."
                  style={{
                    width:'100%',height:'100%',minHeight:300,
                    background:'transparent',border:'none',outline:'none',
                    color:'rgba(232,230,245,0.8)',fontSize:'0.88rem',lineHeight:1.7,
                    resize:'none',fontFamily:"'Inter',sans-serif"
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MASCOT REWARD POPUP */}
      {mascotVisible && (
        <div className="animate-pop-in" style={{
          position:'fixed',bottom:24,left:24,zIndex:100,
          background:'#0F0A1A',border:'2px solid rgba(0,210,160,0.5)',
          borderRadius:20,padding:'16px 20px',boxShadow:'0 10px 40px rgba(0,210,160,0.2), 0 0 20px rgba(0,210,160,0.4)',
          display:'flex',alignItems:'center',gap:16,maxWidth:320
        }}>
          <div style={{fontSize:'3rem',filter:'drop-shadow(0 4px 10px rgba(0,210,160,0.4))',animation:'bounce 1s infinite'}}>🧠</div>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:'1.2rem',color:'#00F5BA',marginBottom:4}}>Outstanding!</div>
            <div style={{fontSize:'0.85rem',color:'rgba(232,230,245,0.9)',lineHeight:1.4}}>Your logic is flawless. Keep crushing it doc!</div>
          </div>
        </div>
      )}
    </div>
  )
}
