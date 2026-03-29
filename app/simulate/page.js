'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const EXAM_CONFIGS = {
  'usMLE': { name: 'USMLE Step 1', questions: 200, time: 3.5, negative: true, negativeWeight: 0.25, subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology', 'Behavioral Science', 'Immunology'] },
  'NEET': { name: 'NEET PG', questions: 200, time: 3.5, negative: true, negativeWeight: 0.25, subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine', 'ENT', 'Ophthalmology', 'PSM', 'Medicine', 'Surgery', 'OBG', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology'] },
  'PLAB': { name: 'PLAB 1', questions: 180, time: 3, negative: true, negativeWeight: 0.25, subjects: ['Cardiology', 'Respiratory', 'GI', 'Neurology', 'Psychiatry', 'Endocrine', 'Renal', 'Hematology', 'Infectious Disease', 'Dermatology', 'Musculoskeletal', 'Pediatrics', 'OBG', 'Ethics', 'Emergency Medicine'] },
  'AMC': { name: 'AMC Part 1', questions: 150, time: 3.5, negative: false, negativeWeight: 0, subjects: ['Internal Medicine', 'Surgery', 'Pediatrics', 'OBG', 'Psychiatry', 'General Practice', 'Emergency Medicine', 'Anaesthetics', 'Radiology'] },
}

const DEMO_QUESTIONS = [
  { id: 1, category: 'Cardiology', subject: 'Pathology', exam: 'usMLE', vignette: `A 58-year-old man presents with sudden-onset, severe, tearing chest pain radiating to his back. BP 180/100 (right), 145/90 (left). CXR shows widened mediastinum.`, question: 'What is the most likely diagnosis?', options: [{ label: 'A', text: 'STEMI' }, { label: 'B', text: 'Aortic dissection (Type A)' }, { label: 'C', text: 'Pulmonary embolism' }, { label: 'D', text: 'Boerhaave syndrome' }], correct: 'B', explanation: 'Classic aortic dissection: tearing pain, BP differential, widened mediastinum.' },
  { id: 2, category: 'Nephrology', subject: 'Physiology', exam: 'usMLE', vignette: `24F with facial puffiness, frothy urine. BP 120/78. Periorbital edema. Labs: Albumin 1.8 g/dL, Cholesterol 380 mg/dL. 4+ proteinuria.`, question: 'What causes the edema?', options: [{ label: 'A', text: 'Increased hydrostatic pressure' }, { label: 'B', text: 'Decreased oncotic pressure' }, { label: 'C', text: 'Vascular permeability' }, { label: 'D', text: 'Lymphatic obstruction' }], correct: 'B', explanation: 'Nephrotic syndrome: hypoalbuminemia → ↓ oncotic pressure → edema.' },
  { id: 3, category: 'Pharmacology', subject: 'Pharmacology', exam: 'usMLE', vignette: `45F RA on methotrexate develops oral ulcers, fatigue. CBC: WBC 2800, Hgb 9.2 (MCV 108), Platelets 95000.`, question: 'Mechanism of action?', options: [{ label: 'A', text: 'Inhibit PRPP amidotransferase' }, { label: 'B', text: 'Inhibit DHFR' }, { label: 'C', text: 'Alkylate DNA' }, { label: 'D', text: 'Inhibit microtubules' }], correct: 'B', explanation: 'Methotrexate inhibits DHFR → ↓ THF → no DNA synthesis → S-phase arrest.' },
  { id: 4, category: 'Anatomy', subject: 'Anatomy', exam: 'NEET', vignette: `A 25-year-old male presents with weakness in flexing the forearm. On examination, there is loss of flexion at the elbow and loss of pronation.`, question: 'Which nerve is most likely damaged?', options: [{ label: 'A', text: 'Radial nerve' }, { label: 'B', text: 'Median nerve' }, { label: 'C', text: 'Musculocutaneous nerve' }, { label: 'D', text: 'Ulnar nerve' }], correct: 'C', explanation: 'Musculocutaneous nerve supplies biceps brachii and brachialis - main flexors.' },
  { id: 5, category: 'Biochemistry', subject: 'Biochemistry', exam: 'NEET', vignette: `A child with failure to thrive, vomiting, irritability. Labs show metabolic acidosis with increased anion gap. Urine shows ketones.`, question: 'Most likely diagnosis?', options: [{ label: 'A', text: 'Maple syrup urine disease' }, { label: 'B', text: 'Phenylketonuria' }, { label: 'C', text: 'Galactosemia' }, { label: 'D', text: 'Glycogen storage disease' }], correct: 'A', explanation: 'MSUD: branched-chain ketoacidosis, sweet smell, neurological symptoms.' },
  { id: 6, category: 'Microbiology', subject: 'Microbiology', exam: 'PLAB', vignette: `35M with fever, headache, stiff neck. CSF: Opening pressure 250mmH2O, glucose 30, protein 150, WBC 500 (80% neutrophils).`, question: 'Most appropriate empiric therapy?', options: [{ label: 'A', text: 'Vancomycin + Ceftriaxone' }, { label: 'B', text: 'Ampicillin + Gentamicin' }, { label: 'C', text: 'Metronidazole' }, { label: 'D', text: 'Acyclovir' }], correct: 'A', explanation: 'Bacterial meningitis: Vancomycin + Ceftriaxone + Dexamethasone.' },
  { id: 7, category: 'Pathology', subject: 'Pathology', exam: 'AMC', vignette: `60M smoker presents with hemoptysis. CXR shows cavitating lesion in RUL. Bronchoscopy reveals bronchoscopy shows friable, bleeding mass.`, question: 'Most likely diagnosis?', options: [{ label: 'A', text: 'Tuberculosis' }, { label: 'B', text: 'Squamous cell carcinoma' }, { label: 'C', text: 'Adenocarcinoma' }, { label: 'D', text: 'Small cell carcinoma' }], correct: 'B', explanation: 'Squamous cell CA: central, cavitating, linked to smoking, hemoptysis.' },
]

const LAB_VALUES = [
  { section: 'Serum Electrolytes', values: [
    { name: 'Na⁺', range: '136–145 mEq/L' },
    { name: 'K⁺', range: '3.5–5.0 mEq/L' },
    { name: 'Cl⁻', range: '98–108 mEq/L' },
    { name: 'HCO₃⁻', range: '22–28 mEq/L' },
    { name: 'BUN', range: '7–21 mg/dL' },
    { name: 'Creatinine', range: '0.6–1.2 mg/dL' },
    { name: 'Glucose', range: '70–99 mg/dL' },
    { name: 'Ca²⁺', range: '8.5–10.5 mg/dL' },
  ]},
  { section: 'CBC', values: [
    { name: 'WBC', range: '4,500–11,000/μL' },
    { name: 'Hemoglobin (M)', range: '13.5–17.5 g/dL' },
    { name: 'Hemoglobin (F)', range: '12.0–15.5 g/dL' },
    { name: 'Platelets', range: '150K–400K/μL' },
    { name: 'MCV', range: '80–100 fL' },
  ]},
  { section: 'LFT', values: [
    { name: 'ALT', range: '7–40 U/L' },
    { name: 'AST', range: '10–40 U/L' },
    { name: 'Albumin', range: '3.5–5.0 g/dL' },
    { name: 'Bilirubin', range: '0.2–1.2 mg/dL' },
    { name: 'ALP', range: '30–120 U/L' },
  ]},
  { section: 'ABG', values: [
    { name: 'pH', range: '7.35–7.45' },
    { name: 'PaO₂', range: '75–100 mmHg' },
    { name: 'PaCO₂', range: '35–45 mmHg' },
    { name: 'HCO₃⁻', range: '22–26 mEq/L' },
  ]},
]

export default function SimulatePage() {
  const [selectedExam, setSelectedExam] = useState('usMLE')
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [revealed, setRevealed] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [rightPanel, setRightPanel] = useState('labs')
  const [mobileTab, setMobileTab] = useState('question')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [shakeQ, setShakeQ] = useState(false)
  const [mascotVisible, setMascotVisible] = useState(false)

  const exam = EXAM_CONFIGS[selectedExam]
  const TOTAL_Q = DEMO_QUESTIONS.length
  const timeSeconds = exam.time * 60 * 60

  const q = DEMO_QUESTIONS[currentQ]

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
    if (revealed[q.id]) return
    setAnswers(prev => ({...prev, [q.id]: label}))
  }

  const handleConfirm = () => {
    if (!answers[q.id]) return
    setRevealed(prev => ({...prev, [q.id]: true}))
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

  const handleStart = () => {
    setStarted(true)
    setTimeLeft(timeSeconds)
  }

  const handleSubmit = () => setSubmitted(true)

  const score = Object.entries(answers).filter(([id, ans]) =>
    DEMO_QUESTIONS.find(q => q.id === parseInt(id))?.correct === ans
  ).length

  const negativeMarking = exam.negative ? Object.entries(answers).filter(([id, ans]) => {
    const question = DEMO_QUESTIONS.find(q => q.id === parseInt(id))
    return ans && question && question.correct !== ans
  }).length * exam.negativeWeight : 0

  const rawScore = score
  const netScore = Math.max(0, Math.round(rawScore - negativeMarking))
  const pct = Math.round((netScore / TOTAL_Q) * 100)

  // EXAM SELECTION SCREEN
  if (!started) return (
    <div style={{minHeight:'100vh',background:'#040816',color:'#E8E6F5',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:900,width:'100%'}}>
        <Link href="/dashboard" style={{display:'inline-flex',alignItems:'center',gap:8,color:'rgba(162,155,204,0.6)',fontSize:'0.85rem',fontWeight:600,marginBottom:32,textDecoration:'none'}}>← Dashboard</Link>
        
        <div style={{textAlign:'center',marginBottom:48}}>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.2rem',fontWeight:800,marginBottom:12}}>Exam Simulator</h1>
          <p style={{color:'rgba(162,155,204,0.7)',fontSize:'1.05rem'}}>Select your exam and test yourself with timed mock exams</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:40}}>
          {Object.entries(EXAM_CONFIGS).map(([key, config]) => (
            <button key={key} onClick={() => setSelectedExam(key)} style={{
              padding:'24px 20px',borderRadius:16,textAlign:'left',
              background: selectedExam === key ? 'rgba(26,79,214,0.15)' : 'rgba(255,255,255,0.03)',
              border:`2px solid ${selectedExam === key ? '#1a4fd6' : 'rgba(255,255,255,0.08)'}`,
              cursor:'pointer',transition:'all 0.2s'
            }}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.15rem',marginBottom:8,color:selectedExam === key ? '#7ca3f0' : '#E8E6F5'}}>{config.name}</div>
              <div style={{display:'flex',gap:16,fontSize:'0.82rem',color:'rgba(162,155,204,0.6)'}}>
                <span>{config.questions} Q</span>
                <span>{config.time}h</span>
                <span>{config.negative ? '−¼' : 'No -ve'}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{padding:'20px 24px',borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <span style={{fontWeight:600}}>{exam.name}</span>
            <span style={{color:'rgba(162,155,204,0.6)'}}>{exam.subjects.length} subjects</span>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {exam.subjects.slice(0,8).map(s => (
              <span key={s} style={{padding:'4px 12px',borderRadius:20,fontSize:'0.75rem',background:'rgba(26,79,214,0.15)',color:'#7ca3f0'}}>{s}</span>
            ))}
            {exam.subjects.length > 8 && <span style={{fontSize:'0.75rem',color:'rgba(162,155,204,0.5)'}}>+{exam.subjects.length - 8} more</span>}
          </div>
        </div>

        <button onClick={handleStart} className="btn btn-primary btn-lg" style={{width:'100%',marginTop:32}}>
          Begin {exam.name} Mock Exam →
        </button>
      </div>
    </div>
  )

  // RESULTS SCREEN
  if (submitted) return (
    <div style={{minHeight:'100vh',background:'#040816',color:'#E8E6F5',display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:640,width:'100%'}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>{pct >= 70 ? '🎉' : pct >= 50 ? '📈' : '📚'}</div>
        <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:8}}>{exam.name} Complete</h1>
        
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
          <div style={{padding:20,borderRadius:16,background:'rgba(255,255,255,0.03)',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:800,color:'#7ca3f0'}}>{rawScore}</div>
            <div style={{fontSize:'0.8rem',color:'rgba(162,155,204,0.6)'}}>Correct</div>
          </div>
          <div style={{padding:20,borderRadius:16,background:'rgba(255,255,255,0.03)',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:800,color:'#FF6B6B'}}>{negativeMarking.toFixed(1)}</div>
            <div style={{fontSize:'0.8rem',color:'rgba(162,155,204,0.6)'}}>Negative</div>
          </div>
          <div style={{padding:20,borderRadius:16,background:'rgba(255,255,255,0.03)',textAlign:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:800,color:'#00D2A0'}}>{netScore}</div>
            <div style={{fontSize:'0.8rem',color:'rgba(162,155,204,0.6)'}}>Net Score</div>
          </div>
        </div>

        <div style={{width:140,height:140,borderRadius:'50%',margin:'0 auto 32px',background:`conic-gradient(${pct>=70?'#00D2A0':pct>=50?'#FDCB6E':'#FF6B6B'} ${pct*3.6}deg, rgba(255,255,255,0.05) 0)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:110,height:110,borderRadius:'50%',background:'#040816',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{fontSize:'2rem',fontWeight:800,color:pct>=70?'#00D2A0':pct>=50?'#FDCB6E':'#FF6B6B'}}>{pct}%</div>
          </div>
        </div>

        <div style={{display:'flex',gap:12}}>
          <Link href="/dashboard" className="btn btn-ghost">← Dashboard</Link>
          <button onClick={()=>{setStarted(false);setSubmitted(false);setAnswers({});setRevealed({});setCurrentQ(0);setTimeLeft(0)}} className="btn btn-primary" style={{flex:1}}>🔄 Retry</button>
        </div>
      </div>
    </div>
  )

  // MAIN SIM INTERFACE
  return (
    <div style={{minHeight:'100vh',background:'#040816',color:'#E8E6F5',display:'flex',flexDirection:'column',fontSize:'0.93rem'}}>
      <div style={{height:48,background:'rgba(26,79,214,0.9)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontWeight:700,fontSize:'0.88rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>{exam.name}</div>
          <div style={{height:16,width:1,background:'rgba(255,255,255,0.2)'}} />
          <div style={{fontSize:'0.82rem'}}>{Object.keys(answers).length}/{TOTAL_Q} · {flagged.size} flagged</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:8,background:timeLeft < 300 ? 'rgba(255,107,107,0.3)' : 'rgba(0,0,0,0.3)'}}>
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button onClick={handleSubmit} style={{padding:'6px 14px',borderRadius:6,background:'rgba(255,107,107,0.3)',border:'1px solid rgba(255,107,107,0.5)',color:'white',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>End</button>
      </div>

      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'8px 20px',display:'flex',gap:6,overflowX:'auto'}}>
        {DEMO_QUESTIONS.map((dq,i)=>(
          <button key={dq.id} onClick={()=>setCurrentQ(i)} style={{
            width:32,height:32,borderRadius:6,flexShrink:0,
            background: currentQ === i ? '#1a4fd6' : !!answers[dq.id] ? 'rgba(0,210,160,0.15)' : 'rgba(255,255,255,0.05)',
            border:`1.5px solid ${currentQ === i ? '#4173e8' : flagged.has(dq.id) ? '#FDCB6E' : 'rgba(255,255,255,0.1)'}`,
            color: currentQ === i ? 'white' : !!answers[dq.id] ? '#00D2A0' : '#A29BCC',
            fontWeight:600,fontSize:'0.8rem',cursor:'pointer'
          }}>{i+1}</button>
        ))}
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <div style={{flex:'1 1 60%',display:'flex',flexDirection:'column',borderRight:'1px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{padding:'3px 10px',borderRadius:999,fontSize:'0.72rem',fontWeight:700,background:'rgba(26,79,214,0.15)',color:'#7ca3f0'}}>{q.category}</span>
              <span style={{color:'rgba(162,155,204,0.5)',fontSize:'0.8rem'}}>Q{q.number}</span>
            </div>
            <button onClick={toggleFlag} style={{padding:'5px 14px',borderRadius:6,fontSize:'0.78rem',fontWeight:600,cursor:'pointer',background:flagged.has(q.id)?'rgba(253,203,110,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${flagged.has(q.id)?'rgba(253,203,110,0.4)':'rgba(255,255,255,0.1)'}`,color:flagged.has(q.id)?'#FDCB6E':'#A29BCC'}}>🏳️</button>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
            <div style={{padding:'20px 24px',borderRadius:12,marginBottom:24,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',lineHeight:1.8}}>{q.vignette}</div>
            <p style={{fontWeight:700,fontSize:'1rem',marginBottom:20}}>{q.question}</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.label
                const isRevealed = revealed[q.id]
                const isCorrect = opt.label === q.correct
                const isWrong = selected && !isCorrect && isRevealed
                let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.08)', color = 'rgba(232,230,245,0.85)'
                if (!isRevealed && selected) { bg='rgba(26,79,214,0.12)'; border='rgba(26,79,214,0.4)' }
                if (isRevealed && isCorrect) { bg='rgba(0,210,160,0.1)'; border='rgba(0,210,160,0.4)'; color='#00F5BA' }
                if (isWrong) { bg='rgba(255,107,107,0.1)'; border='rgba(255,107,107,0.4)'; color='#FF6B6B' }
                return (
                  <button key={opt.label} onClick={()=>handleAnswer(opt.label)} disabled={!!revealed[q.id]} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'13px 16px',borderRadius:10,cursor:revealed[q.id]?'default':'pointer',textAlign:'left',background:bg,border:`1.5px solid ${border}`,color,transition:'all 0.15s'}}>
                    <div style={{width:28,height:28,borderRadius:6,flexShrink:0,background:`rgba(255,255,255,0.06)`,border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.82rem'}}>{opt.label}</div>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
            {!revealed[q.id] ? (
              <button onClick={handleConfirm} disabled={!answers[q.id]} className="btn btn-primary" style={{marginTop:20}}>Confirm →</button>
            ) : (
              <div style={{padding:'20px 22px',borderRadius:12,marginTop:20,background:'rgba(0,210,160,0.06)',border:'1px solid rgba(0,210,160,0.2)'}}>
                <div style={{fontWeight:700,color:'#00D2A0',marginBottom:10}}>🎓 Explanation</div>
                {q.explanation}
              </div>
            )}
          </div>

          <div style={{padding:'14px 24px',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <button onClick={handlePrev} disabled={currentQ===0} style={{padding:'9px 20px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,opacity:currentQ===0?0.4:1}}>←</button>
            <span>{currentQ+1}/{TOTAL_Q}</span>
            <button onClick={handleNext} style={{padding:'9px 20px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600}}>→</button>
          </div>
        </div>

        <div style={{flex:'0 0 40%',display:'flex',flexDirection:'column',overflow:'hidden',minWidth:280}}>
          <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {[['labs','📋'],['notes','📝']].map(([id,label])=>(
              <button key={id} onClick={()=>setRightPanel(id)} style={{flex:1,padding:13,border:'none',cursor:'pointer',background:'transparent',fontWeight:rightPanel===id?700:500,color:rightPanel===id?'#E8E6F5':'rgba(162,155,204,0.5)',borderBottom:`2px solid ${rightPanel===id?'#1a4fd6':'transparent'}`}}>{label}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {rightPanel === 'labs' ? (
              <div>{LAB_VALUES.map(section=>(
                <div key={section.section}>
                  <div style={{padding:'10px 20px',background:'rgba(26,79,214,0.07)',fontSize:'0.75rem',fontWeight:700,color:'#7ca3f0',textTransform:'uppercase'}}>{section.section}</div>
                  {section.values.map((v,i)=>(
                    <div key={v.name} style={{display:'flex',justifyContent:'space-between',padding:'8px 20px',background:i%2===0?'transparent':'rgba(255,255,255,0.01)',borderBottom:'1px solid rgba(255,255,255,0.025)'}}>
                      <span>{v.name}</span>
                      <span style={{fontFamily:'monospace',fontSize:'0.8rem'}}>{v.range}</span>
                    </div>
                  ))}
                </div>
              ))}</div>
            ) : (
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes..." style={{width:'100%',height:'100%',minHeight:300,padding:16,background:'transparent',border:'none',outline:'none',color:'rgba(232,230,245,0.8)',resize:'none'}} />
            )}
          </div>
        </div>
      </div>

      {mascotVisible && (
        <div style={{position:'fixed',bottom:24,left:24,zIndex:100,background:'#0F0A1A',border:'2px solid rgba(0,210,160,0.5)',borderRadius:20,padding:'16px 20px',boxShadow:'0 10px 40px rgba(0,210,160,0.2)'}}>
          <div style={{fontSize:'2rem'}}>🧠</div>
          <div style={{fontWeight:700,color:'#00F5BA'}}>Correct!</div>
        </div>
      )}
    </div>
  )
}