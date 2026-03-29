'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const EXAM_OPTIONS = [
  {
    id: 'USMLE Step 1',
    icon: '🇺🇸',
    title: 'USMLE Step 1',
    desc: 'Basic science foundations. Pass required for residency.',
    tag: 'Most Popular',
    tagColor: '#6C5CE7'
  },
  {
    id: 'USMLE Step 2 CK',
    icon: '🏥',
    title: 'USMLE Step 2 CK',
    desc: 'Clinical knowledge and patient management.',
    tag: null
  },
  {
    id: 'PLAB 1',
    icon: '🇬🇧',
    title: 'PLAB 1',
    desc: 'UK GMC licensing exam for International Medical Graduates.',
    tag: 'IMG Pathway',
    tagColor: '#00D2A0'
  },
  {
    id: 'PLAB 2',
    icon: '🏡',
    title: 'PLAB 2',
    desc: 'UK clinical assessment (OSCE format).',
    tag: null
  },
  {
    id: 'NEET-PG',
    icon: '🇮🇳',
    title: 'NEET-PG',
    desc: 'India\'s national post-graduate medical entrance exam.',
    tag: 'IMG Pathway',
    tagColor: '#00D2A0'
  },
  {
    id: 'AMC CAT',
    icon: '🇦🇺',
    title: 'AMC CAT',
    desc: 'Australian Medical Council computer adaptive test.',
    tag: null
  },
]

const YEAR_OPTIONS = ['Pre-clinical (Year 1-2)', 'Clinical (Year 3-5)', 'Graduate/IMG', 'Intern/PGY1']

const GOAL_OPTIONS = [
  { id: 'pass', label: '🎯 Pass comfortably', desc: 'I just need to pass' },
  { id: 'competitive', label: '🏆 Score competitively', desc: 'Top percentile — competitive speciality' },
  { id: 'retake', label: '🔄 Retake / improve score', desc: 'Preparing for a second attempt' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [exam, setExam] = useState('')
  const [year, setYear] = useState('')
  const [goal, setGoal] = useState('')
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('profiles').update({
      exam_target: exam,
      study_year: year,
      study_goal: goal,
      exam_date: examDate || null,
      onboarding_complete: true,
    }).eq('id', user.id)

    router.push('/dashboard')
  }

  const TOTAL = 4

  return (
    <div style={{
      minHeight:'100vh',background:'#050510',color:'#F0EEFF',
      display:'flex',alignItems:'center',justifyContent:'center',padding:24,
      fontFamily:"'Inter',sans-serif",position:'relative',overflow:'hidden'
    }}>
      {/* Background */}
      <div style={{
        position:'fixed',inset:0,pointerEvents:'none',
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, rgba(108,92,231,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,210,160,0.06) 0%, transparent 50%)`
      }} />

      <div style={{width:'100%',maxWidth:560,position:'relative',zIndex:1}}>
        {/* Logo + Progress */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:32,color:'inherit'}}>
            <div style={{width:40,height:40,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>⚕️</div>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.2rem'}}>MedX AI</span>
          </Link>

          {/* Step progress */}
          <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'center',marginBottom:12}}>
            {Array.from({length:TOTAL}).map((_,i)=>(
              <div key={i} style={{
                height:4,flex:1,maxWidth:60,borderRadius:999,
                background: i < step ? 'linear-gradient(90deg,#6C5CE7,#00D2A0)' : 'rgba(255,255,255,0.08)',
                transition:'all 0.4s ease'
              }} />
            ))}
          </div>
          <div style={{fontSize:'0.78rem',color:'rgba(107,100,144,0.8)',fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase'}}>
            Step {step} of {TOTAL}
          </div>
        </div>

        {/* ── STEP 1: EXAM SELECTION ── */}
        {step === 1 && (
          <div style={{animation:'fadeInUp 0.4s ease both'}}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'1.9rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.03em'}}>
                Which exam are you<br/>preparing for?
              </h1>
              <p style={{color:'rgba(162,155,204,0.8)',fontSize:'0.95rem'}}>
                We'll personalize your entire study track for your specific exam.
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:32}}>
              {EXAM_OPTIONS.map(opt=>(
                <button
                  key={opt.id}
                  onClick={()=>setExam(opt.id)}
                  style={{
                    padding:'18px 16px',borderRadius:16,cursor:'pointer',textAlign:'left',
                    background: exam===opt.id ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${exam===opt.id ? '#6C5CE7' : 'rgba(255,255,255,0.08)'}`,
                    color:'#F0EEFF',transition:'all 0.2s',position:'relative',
                    boxShadow: exam===opt.id ? '0 0 20px rgba(108,92,231,0.2)' : 'none'
                  }}
                >
                  {opt.tag && (
                    <div style={{
                      position:'absolute',top:10,right:10,
                      padding:'2px 8px',borderRadius:999,fontSize:'0.64rem',fontWeight:700,
                      letterSpacing:'0.04em',background:`${opt.tagColor}22`,color:opt.tagColor,
                      border:`1px solid ${opt.tagColor}44`
                    }}>{opt.tag}</div>
                  )}
                  <div style={{fontSize:'1.6rem',marginBottom:8}}>{opt.icon}</div>
                  <div style={{fontWeight:700,fontSize:'0.92rem',marginBottom:4,fontFamily:"'Space Grotesk',sans-serif"}}>{opt.title}</div>
                  <div style={{fontSize:'0.78rem',color:'rgba(162,155,204,0.7)',lineHeight:1.5}}>{opt.desc}</div>
                </button>
              ))}
            </div>
            <button
              disabled={!exam}
              onClick={()=>setStep(2)}
              style={{
                width:'100%',padding:'15px',borderRadius:999,
                background: exam ? 'linear-gradient(135deg,#6C5CE7,#5A4BD1)' : 'rgba(255,255,255,0.06)',
                color: exam ? 'white' : '#6B6490',fontWeight:700,fontSize:'1rem',cursor: exam ? 'pointer' : 'not-allowed',
                border:'none',transition:'all 0.2s',
                boxShadow: exam ? '0 6px 30px rgba(108,92,231,0.35)' : 'none'
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: YEAR / STATUS ── */}
        {step === 2 && (
          <div style={{animation:'fadeInUp 0.4s ease both'}}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'1.9rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.03em'}}>
                Where are you in<br/>your medical journey?
              </h1>
              <p style={{color:'rgba(162,155,204,0.8)',fontSize:'0.95rem'}}>This helps us calibrate the difficulty and focus area.</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:32}}>
              {YEAR_OPTIONS.map(y=>(
                <button
                  key={y}
                  onClick={()=>setYear(y)}
                  style={{
                    padding:'16px 20px',borderRadius:14,cursor:'pointer',textAlign:'left',
                    background: year===y ? 'rgba(0,210,160,0.1)' : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${year===y ? '#00D2A0' : 'rgba(255,255,255,0.08)'}`,
                    color: year===y ? '#00D2A0' : '#F0EEFF',fontWeight:600,fontSize:'0.95rem',transition:'all 0.2s'
                  }}
                >{y}</button>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(1)} style={{padding:'14px',borderRadius:999,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,cursor:'pointer',flex:1}}>← Back</button>
              <button disabled={!year} onClick={()=>setStep(3)} style={{flex:2,padding:'15px',borderRadius:999,background:year?'linear-gradient(135deg,#6C5CE7,#5A4BD1)':'rgba(255,255,255,0.06)',color:year?'white':'#6B6490',fontWeight:700,fontSize:'1rem',cursor:year?'pointer':'not-allowed',border:'none',boxShadow:year?'0 6px 30px rgba(108,92,231,0.35)':'none'}}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: GOAL ── */}
        {step === 3 && (
          <div style={{animation:'fadeInUp 0.4s ease both'}}>
            <div style={{textAlign:'center',marginBottom:32}}>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'1.9rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.03em'}}>
                What's your goal for<br/>{exam}?
              </h1>
              <p style={{color:'rgba(162,155,204,0.8)',fontSize:'0.95rem'}}>No judgment — we just calibrate your study intensity.</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
              {GOAL_OPTIONS.map(g=>(
                <button
                  key={g.id}
                  onClick={()=>setGoal(g.id)}
                  style={{
                    padding:'18px 20px',borderRadius:16,cursor:'pointer',textAlign:'left',
                    background: goal===g.id ? 'rgba(108,92,231,0.12)' : 'rgba(255,255,255,0.03)',
                    border:`1.5px solid ${goal===g.id ? '#8B7CF6' : 'rgba(255,255,255,0.08)'}`,
                    color:'#F0EEFF',transition:'all 0.2s'
                  }}
                >
                  <div style={{fontWeight:700,fontSize:'1rem',marginBottom:4,fontFamily:"'Space Grotesk',sans-serif"}}>{g.label}</div>
                  <div style={{fontSize:'0.82rem',color:'rgba(162,155,204,0.7)'}}>{g.desc}</div>
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(2)} style={{padding:'14px',borderRadius:999,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,cursor:'pointer',flex:1}}>← Back</button>
              <button disabled={!goal} onClick={()=>setStep(4)} style={{flex:2,padding:'15px',borderRadius:999,background:goal?'linear-gradient(135deg,#6C5CE7,#5A4BD1)':'rgba(255,255,255,0.06)',color:goal?'white':'#6B6490',fontWeight:700,fontSize:'1rem',cursor:goal?'pointer':'not-allowed',border:'none',boxShadow:goal?'0 6px 30px rgba(108,92,231,0.35)':'none'}}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: EXAM DATE + LAUNCH ── */}
        {step === 4 && (
          <div style={{animation:'fadeInUp 0.4s ease both',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>🎓</div>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'1.9rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.03em'}}>
              When is your exam? <span style={{color:'rgba(162,155,204,0.5)',fontSize:'1.1rem',fontWeight:500}}>(optional)</span>
            </h1>
            <p style={{color:'rgba(162,155,204,0.8)',fontSize:'0.95rem',marginBottom:32}}>
              We'll create a smart countdown and pace your study plan accordingly.
            </p>
            <input
              type="date"
              value={examDate}
              onChange={e=>setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width:'100%',padding:'14px 18px',borderRadius:14,marginBottom:24,
                background:'rgba(255,255,255,0.04)',border:'1.5px solid rgba(255,255,255,0.1)',
                color:'#F0EEFF',fontSize:'1rem',outline:'none',
                fontFamily:"'Inter',sans-serif"
              }}
            />

            {/* Summary card */}
            <div style={{
              padding:'20px 24px',borderRadius:16,marginBottom:28,textAlign:'left',
              background:'rgba(108,92,231,0.07)',border:'1px solid rgba(108,92,231,0.2)'
            }}>
              <div style={{fontSize:'0.8rem',color:'#8B7CF6',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>Your Study Profile</div>
              {[
                ['🎯 Exam', exam],
                ['📅 Year', year],
                ['🏆 Goal', goal === 'pass' ? 'Pass comfortably' : goal === 'competitive' ? 'Score competitively' : 'Improve on retake'],
                examDate ? ['📆 Exam Date', new Date(examDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})] : null
              ].filter(Boolean).map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.9rem'}}>
                  <span style={{color:'rgba(162,155,204,0.7)'}}>{k}</span>
                  <span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(3)} style={{padding:'14px',borderRadius:999,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#A29BCC',fontWeight:600,cursor:'pointer',flex:1}}>← Back</button>
              <button
                onClick={handleComplete}
                disabled={loading}
                style={{
                  flex:2,padding:'15px',borderRadius:999,
                  background:'linear-gradient(135deg,#6C5CE7,#5A4BD1)',color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',border:'none',
                  boxShadow:'0 6px 30px rgba(108,92,231,0.4)',opacity:loading?0.7:1
                }}
              >
                {loading ? '⟳ Setting up...' : '🚀 Launch My Study Track'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
