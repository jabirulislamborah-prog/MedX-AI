import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'MedDrill — Your PDF → Board-Ready in 60 Seconds',
  description: 'Upload any medical PDF. MedDrill instantly generates USMLE-style questions, spaced repetition flashcards, and a Socratic AI tutor from YOUR exact material. Built for med students who actually want to pass.',
  openGraph: {
    title: 'MedDrill — The AI Study Engine for Medical Students',
    description: 'Stop building Anki cards for 10 hours. MedDrill converts your professor\'s PDF into a complete gamified study system in 60 seconds.',
    url: 'https://med-x-ai-eight.vercel.app',
    siteName: 'MedDrill',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#050510',color:'#F0EEFF',fontFamily:"'Inter',sans-serif",overflowX:'hidden'}}>

      {/* ── GLOBAL BG MESH ── */}
      <div style={{
        position:'fixed',inset:0,pointerEvents:'none',zIndex:0,
        background:`
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30,64,175,0.2) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(13,148,136,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 20% 60%, rgba(30,64,175,0.08) 0%, transparent 50%)
        `
      }} />

      {/* ── NAVIGATION ── */}
      <nav style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 40px',height:64,
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        position:'sticky',top:0,
        background:'rgba(5,5,16,0.8)',backdropFilter:'blur(24px)',
        zIndex:100,position:'sticky',top:0
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:32,height:32,
            background:'linear-gradient(135deg,#1E40AF,#0D9488)',
            borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'1rem',boxShadow:'0 0 20px rgba(30,64,175,0.4)'
          }}>⚕️</div>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.1rem',letterSpacing:'-0.02em'}}>MedDrill</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link href="/login" style={{padding:'8px 18px',borderRadius:999,fontSize:'0.875rem',fontWeight:500,color:'rgba(240,238,255,0.7)',transition:'color 0.2s'}}>Log In</Link>
          <Link href="/signup" style={{
            padding:'9px 22px',borderRadius:999,fontSize:'0.875rem',fontWeight:600,
            background:'rgba(108,92,231,1)',color:'white',
            boxShadow:'0 0 0 1px rgba(139,124,246,0.5), 0 4px 20px rgba(108,92,231,0.3)',
            transition:'all 0.2s',display:'inline-block'
          }}>Start Free →</Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,textAlign:'center',padding:'100px 24px 80px',display:'flex',flexDirection:'column',alignItems:'center'}}>

        {/* Social proof pill */}
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,
          padding:'6px 16px',borderRadius:999,marginBottom:32,
          background:'rgba(108,92,231,0.12)',
          border:'1px solid rgba(108,92,231,0.25)',
          fontSize:'0.8rem',fontWeight:600,color:'#A29BCC',letterSpacing:'0.04em',
          textTransform:'uppercase'
        }}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#00D2A0',display:'inline-block',animation:'pulse 2s infinite'}} />
          500+ Med Students · 12 Universities
        </div>

        {/* Headline */}
        <h1 style={{
          maxWidth:800,margin:'0 auto 24px',
          fontSize:'clamp(2.8rem, 6vw, 5rem)',
          fontFamily:"'Space Grotesk',sans-serif",
          fontWeight:800,lineHeight:1.05,letterSpacing:'-0.03em',
          color:'#F0EEFF'
        }}>
          Your professor's PDF →{' '}
          <span style={{
            background:'linear-gradient(135deg,#3B82F6,#0D9488)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'
          }}>Board-ready in 60 seconds.</span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          maxWidth:580,margin:'0 auto 40px',
          fontSize:'1.2rem',lineHeight:1.7,
          color:'rgba(162,155,204,0.9)',fontWeight:400
        }}>
          Upload any medical PDF. MedDrill instantly generates USMLE-style vignettes, spaced repetition flashcards, and a Socratic AI tutor — all from <em>your exact material</em>. No other platform does this.
        </p>

        {/* CTAs */}
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:20,width:'100%'}}>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{width:'fit-content',background:'linear-gradient(135deg,#6C5CE7,#5A4BD1)'}}>
            🚀 Start Free — No Credit Card
          </Link>
          <Link href="#how-it-works" className="btn btn-ghost btn-lg" style={{width:'fit-content'}}>
            See How It Works ↓
          </Link>
        </div>
        <p style={{fontSize:'0.8rem',color:'rgba(107,100,144,0.8)',marginBottom:60}}>Free forever on Starter · Cancel Pro anytime</p>

        {/* Hero Product Screenshot */}
        <div style={{
          maxWidth:1000,width:'100%',borderRadius:20,overflow:'hidden',
          border:'1px solid rgba(108,92,231,0.2)',
          boxShadow:'0 0 0 1px rgba(108,92,231,0.1), 0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(108,92,231,0.08)',
          background:'#0F0A1A',position:'relative'
        }}>
          <div style={{
            height:36,background:'rgba(15,10,26,0.9)',borderBottom:'1px solid rgba(255,255,255,0.06)',
            display:'flex',alignItems:'center',gap:8,padding:'0 16px'
          }}>
            {['#FF5F57','#FFBD2E','#28C840'].map(c=>(
              <div key={c} style={{width:12,height:12,borderRadius:'50%',background:c}} />
            ))}
          </div>
          <Image
            src="/assets/hero-dashboard.png"
            alt="MedDrill Dashboard — Generate USMLE Questions from Your PDFs"
            width={1000} height={580} priority
            style={{display:'block',width:'100%',height:'auto',opacity:0.95}}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — THE PAIN (Problem Agitation)
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'100px 24px',background:'rgba(255,255,255,0.015)',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <div style={{maxWidth:1080,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{
              display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
              background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.2)',
              fontSize:'0.75rem',fontWeight:700,color:'#FF6B6B',letterSpacing:'0.08em',textTransform:'uppercase'
            }}>The Problem</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.03em',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>
              You're studying 14 hours a day<br/>and <span style={{color:'#FF6B6B'}}>still not retaining.</span>
            </h2>
            <p style={{color:'rgba(162,155,204,0.8)',fontSize:'1.1rem',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>
              The med school study stack is broken. You're paying for 5 platforms, spending hours making cards, and forgetting everything by morning.
            </p>
          </div>

          {/* Pain stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:1,borderRadius:20,overflow:'hidden',border:'1px solid rgba(255,255,255,0.06)'}}>
            {[
              { stat:'67%', label:'of what you study is forgotten within 24 hours', source:'Ebbinghaus Forgetting Curve', color:'#FF6B6B' },
              { stat:'10+ hrs', label:'wasted every week just building Anki cards — not studying them', source:'r/medicalschool survey', color:'#FDCB6E' },
              { stat:'$1,200+', label:'spent per year on UWorld, BnB, Pathoma, Sketchy, Anki Pro', source:'Based on platform pricing', color:'#A855F7' },
            ].map((item,i)=>(
              <div key={i} style={{
                padding:'40px 36px',
                background:'rgba(255,255,255,0.02)',
                borderRight: i<2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{fontSize:'clamp(2.5rem,5vw,3.5rem)',fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",color:item.color,marginBottom:12,letterSpacing:'-0.04em'}}>{item.stat}</div>
                <p style={{color:'rgba(240,238,255,0.8)',fontSize:'1rem',lineHeight:1.6,marginBottom:12}}>{item.label}</p>
                <p style={{color:'rgba(107,100,144,0.7)',fontSize:'0.75rem',fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase'}}>{item.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" style={{position:'relative',zIndex:1,padding:'100px 24px'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <div style={{
              display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
              background:'rgba(0,210,160,0.1)',border:'1px solid rgba(0,210,160,0.2)',
              fontSize:'0.75rem',fontWeight:700,color:'#00D2A0',letterSpacing:'0.08em',textTransform:'uppercase'
            }}>How It Works</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.03em',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>
              From PDF to <span style={{background:'linear-gradient(135deg,#8B7CF6,#00D2A0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>passing score</span> in three steps.
            </h2>
            <p style={{color:'rgba(162,155,204,0.8)',fontSize:'1.1rem'}}>No setup. No card creation. No wasted hours.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24,position:'relative'}}>
            {/* Connecting lines (decorative) */}
            {[
              {
                num:'01',icon:'📄',title:'Upload Your PDF',
                desc:'Drop your professor\'s slides, a First Aid chapter, or any medical PDF. We accept anything.',
                accent:'#6C5CE7'
              },
              {
                num:'02',icon:'⚡',title:'AI Generates Everything',
                desc:'In 60 seconds: USMLE-style vignettes, concept flashcards, and a Socratic AI tutor — tuned to YOUR material.',
                accent:'#00D2A0'
              },
              {
                num:'03',icon:'🎮',title:'Play & Master',
                desc:'5-minute gamified drills with spaced repetition push information into long-term memory. Study 5× faster than passive reading.',
                accent:'#FDCB6E'
              },
            ].map((step,i)=>(
              <div key={i} style={{
                padding:'36px 32px',borderRadius:20,position:'relative',
                background:`rgba(255,255,255,0.025)`,
                border:`1px solid rgba(255,255,255,0.07)`,
                transition:'all 0.2s',
              }}>
                <div style={{
                  display:'inline-flex',alignItems:'center',justifyContent:'center',
                  width:48,height:48,borderRadius:14,
                  background:`rgba(255,255,255,0.06)`,
                  border:`1px solid rgba(255,255,255,0.1)`,
                  fontSize:'1.5rem',marginBottom:24
                }}>{step.icon}</div>
                <div style={{
                  position:'absolute',top:32,right:32,
                  fontFamily:"'Space Grotesk',sans-serif",fontSize:'3rem',fontWeight:800,
                  color:'rgba(255,255,255,0.04)',letterSpacing:'-0.05em',lineHeight:1
                }}>{step.num}</div>
                <h3 style={{fontSize:'1.25rem',fontWeight:700,marginBottom:12,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>{step.title}</h3>
                <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.7,fontSize:'0.95rem'}}>{step.desc}</p>
                <div style={{marginTop:24,height:2,borderRadius:999,background:`linear-gradient(90deg,${step.accent},transparent)`}} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — FEATURES BENTO GRID
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'0 24px 100px'}}>
        <div style={{maxWidth:1080,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{
              display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
              background:'rgba(108,92,231,0.1)',border:'1px solid rgba(108,92,231,0.2)',
              fontSize:'0.75rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.08em',textTransform:'uppercase'
            }}>The Engine</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.03em',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>
              One platform. Your entire study stack — <span style={{color:'#8B7CF6'}}>replaced.</span>
            </h2>
          </div>

          <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
            {/* BIG card — AI QBank */}
            <div style={{
              gridColumn:'1 / -1',padding:'44px 40px',borderRadius:20,
              background:'rgba(108,92,231,0.08)',border:'1px solid rgba(108,92,231,0.2)',
              position:'relative',overflow:'hidden',minHeight:280
            }}>
              <div className="hide-on-mobile" style={{position:'absolute',right:-20,bottom:-20,fontSize:'8rem',opacity:0.06,pointerEvents:'none'}}>⚡</div>
              <div style={{
                display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:999,
                background:'rgba(108,92,231,0.2)',border:'1px solid rgba(108,92,231,0.3)',
                fontSize:'0.72rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.06em',
                textTransform:'uppercase',marginBottom:24
              }}>Instant AI Generation</div>
              <h3 style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:800,marginBottom:16,lineHeight:1.2,letterSpacing:'-0.03em',fontFamily:"'Space Grotesk',sans-serif"}}>Save 10+ hours<br/>every week.</h3>
              <p style={{color:'rgba(162,155,204,0.85)',lineHeight:1.75,fontSize:'1rem',maxWidth:400}}>
                Making quality Anki cards takes longer than actually studying them. Our AI reads your PDF, extracts highest-yield facts, and builds USMLE-style vignettes and flashcards — while you sleep.
              </p>
            </div>

            {/* PvP Battles */}
            <div style={{
              padding:'36px 32px',borderRadius:20,
              background:'rgba(253,203,110,0.06)',border:'1px solid rgba(253,203,110,0.15)',
            }}>
              <div style={{fontSize:'2.5rem',marginBottom:20}}>⚔️</div>
              <h3 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:10,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>PvP Medical Duels</h3>
              <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.65,fontSize:'0.93rem'}}>
                Challenge classmates in real-time 10-question medical battles. Competition forces recall. Recall forces retention.
              </p>
            </div>

            {/* Socratic AI */}
            <div style={{
              padding:'36px 32px',borderRadius:20,
              background:'rgba(0,210,160,0.06)',border:'1px solid rgba(0,210,160,0.15)',
            }}>
              <div style={{fontSize:'2.5rem',marginBottom:20}}>🧠</div>
              <h3 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:10,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>Socratic AI Tutor</h3>
              <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.65,fontSize:'0.93rem'}}>
                Stuck on a concept? The AI tutor questions you back, guiding you to the answer using your own reasoning — not just giving the answer.
              </p>
            </div>
            
            {/* Daily Streaks */}
            <div style={{
              padding:'36px 32px',borderRadius:20,
              background:'rgba(255,107,107,0.06)',border:'1px solid rgba(255,107,107,0.15)',
            }}>
              <div style={{fontSize:'2.5rem',marginBottom:4}}>🔥</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.5rem',fontWeight:800,color:'#FF6B6B',marginBottom:4,letterSpacing:'-0.04em'}}>47</div>
              <div style={{fontSize:'0.75rem',fontWeight:700,color:'rgba(107,100,144,0.8)',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:12}}>Day Streak 🔥</div>
              <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.65,fontSize:'0.93rem'}}>Daily streaks + loss aversion keep you showing up. Students hate losing streaks.</p>
            </div>

            {/* IMG Track */}
            <div style={{
              gridColumn:'1 / -1',padding:'36px 40px',borderRadius:20,
              background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',
              display:'flex',alignItems:'center',gap:32,flexWrap:'wrap'
            }}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:999,marginBottom:16,
                  background:'rgba(0,210,160,0.1)',border:'1px solid rgba(0,210,160,0.2)',
                  fontSize:'0.72rem',fontWeight:700,color:'#00D2A0',letterSpacing:'0.06em',textTransform:'uppercase'
                }}>Pre-Built Tracks</div>
                <h3 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:10,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>Zero-upload Quick Start</h3>
                <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.65,fontSize:'0.93rem'}}>Don't have a PDF? We've pre-mapped First Aid, Pathoma, and Robbins Pathology into ready-to-play gamified USMLE tracks. Hit play in 30 seconds.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10,flexShrink:0}}>
                {[
                  {label:'Neurology Core',tag:'USMLE Step 1',color:'#FF6B6B'},
                  {label:'Nephrology & Renal',tag:'USMLE Step 1',color:'#00D2A0'},
                  {label:'Cardiology Basics',tag:'Coming Soon',color:'#8B7CF6'},
                ].map((t,i)=>(
                  <div key={i} style={{
                    display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderRadius:12,
                    background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'
                  }}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:t.color,flexShrink:0}} />
                    <span style={{fontSize:'0.88rem',fontWeight:600,color:'rgba(240,238,255,0.9)'}}>{t.label}</span>
                    <span style={{fontSize:'0.72rem',color:'rgba(107,100,144,0.7)',marginLeft:'auto',flexShrink:0,fontWeight:600,letterSpacing:'0.03em'}}>{t.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — US VS THEM (Expanded)
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'100px 24px',background:'rgba(255,255,255,0.015)',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <div style={{maxWidth:1080,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{
              display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
              background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.2)',
              fontSize:'0.75rem',fontWeight:700,color:'#FF6B6B',letterSpacing:'0.08em',textTransform:'uppercase'
            }}>The Honest Comparison</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.03em',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>
              Why med students are leaving<br/><span style={{color:'#FF6B6B'}}>UWorld, BnB & Anki</span> for MedDrill.
            </h2>
            <p style={{color:'rgba(162,155,204,0.8)',fontSize:'1.05rem',maxWidth:520,margin:'0 auto'}}>Not a fair fight. But it's an honest one.</p>
          </div>

          <div style={{borderRadius:20,border:'1px solid rgba(255,255,255,0.07)',boxShadow:'0 40px 100px rgba(0,0,0,0.4)',overflowX:'auto'}}>
            <table style={{width:'100%',minWidth:'800px',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'rgba(0,0,0,0.3)'}}>
                  <th style={{padding:'20px 28px',textAlign:'left',fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:'0.85rem',color:'rgba(162,155,204,0.7)',letterSpacing:'0.04em',textTransform:'uppercase',width:'30%',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>Feature</th>
                  <th style={{padding:'20px 28px',textAlign:'left',fontWeight:600,fontSize:'0.9rem',color:'#FF6B6B',borderBottom:'1px solid rgba(255,255,255,0.05)',width:'35%',borderRight:'1px solid rgba(255,255,255,0.04)'}}>UWorld / BnB / Anki</th>
                  <th style={{padding:'20px 28px',textAlign:'left',fontWeight:700,fontSize:'1rem',color:'#00D2A0',borderBottom:'1px solid rgba(255,255,255,0.05)',width:'35%',background:'rgba(0,210,160,0.04)'}}>🚀 MedDrill</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Personalized to YOUR syllabus', '❌  Generic content for everyone', '✅  Upload YOUR professor\'s exact PDF'],
                  ['Card creation time', '❌  10+ hrs/week on Anki alone', '✅  0 hours. AI builds them for you.'],
                  ['Learning method', '❌  Passive video watching', '✅  Active recall + AI Socratic drills'],
                  ['Exam interface simulation', '❌  Nothing like the real USMLE UI', '✅  Mirrors the 2026 NBME layout'],
                  ['Time to master a module', '❌  15–20 hours', '✅  2–3 hours (active recall method)'],
                  ['Platform count needed', '❌  4–6 separate platforms', '✅  One platform. Everything included.'],
                  ['Daily accountability', '❌  None. You decide (and usually don\'t)', '✅  Streaks, XP, leaderboards, PvP'],
                ].map(([feature, them, us], i)=>(
                  <tr key={i} style={{
                    borderBottom: i<6 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td style={{padding:'18px 28px',fontSize:'0.95rem',fontWeight:600,color:'rgba(240,238,255,0.85)'}}>{feature}</td>
                    <td style={{padding:'18px 28px',fontSize:'0.93rem',color:'rgba(162,155,204,0.65)',borderRight:'1px solid rgba(255,255,255,0.04)'}}>{them}</td>
                    <td style={{padding:'18px 28px',fontSize:'0.95rem',color:'#00F5BA',fontWeight:600,background:'rgba(0,210,160,0.03)'}}>{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — SOCIAL PROOF / TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'100px 24px'}}>
        <div style={{maxWidth:1080,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{
              display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
              background:'rgba(253,203,110,0.1)',border:'1px solid rgba(253,203,110,0.2)',
              fontSize:'0.75rem',fontWeight:700,color:'#FDCB6E',letterSpacing:'0.08em',textTransform:'uppercase'
            }}>What Students Say</div>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:800,letterSpacing:'-0.03em',fontFamily:"'Space Grotesk',sans-serif"}}>
              Built by med students.<br/>Trusted by med students.
            </h2>
          </div>

          {/* Stats bar */}
          <div style={{
            display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:1,
            border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,overflow:'hidden',
            marginBottom:48
          }}>
            {[
              {val:'2,400+',label:'Drills Completed'},
              {val:'500+',label:'PDFs Processed'},
              {val:'12',label:'Universities'},
              {val:'5×',label:'Faster Retention'},
            ].map((s,i)=>(
              <div key={i} style={{
                padding:'28px 24px',textAlign:'center',
                background:'rgba(255,255,255,0.02)',
                borderRight: i<3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.2rem',fontWeight:800,color:'#F0EEFF',letterSpacing:'-0.04em',marginBottom:6}}>{s.val}</div>
                <div style={{fontSize:'0.8rem',color:'rgba(107,100,144,0.8)',fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
            {[
              {
                quote:'I used to spend 3 hours every Sunday just making Anki cards for one lecture. Now I upload the PDF and start drilling in 60 seconds. It\'s genuinely insane.',
                name:'S. Rehman', role:'MS2 · Tbilisi State Medical University',
                accent:'#8B7CF6'
              },
              {
                quote:'As an IMG, I had zero study group. MedDrill became my tutor, my flashcard system, and my QBank. Passed Step 1 with a 234. Nothing else comes close for personalized prep.',
                name:'A. Hassan', role:'IMG · USMLE Step 1 Candidate',
                accent:'#00D2A0'
              },
              {
                quote:'The PvP battles are genuinely addictive. I competed with my roommate on Nephrology and we both scored in the 90th percentile on that NBME block. Peak accountability.',
                name:'M. Khoury', role:'MS3 · Preparing for Step 2 CK',
                accent:'#FDCB6E'
              },
            ].map((t,i)=>(
              <div key={i} style={{
                padding:'32px',borderRadius:20,
                background:'rgba(255,255,255,0.025)',
                border:'1px solid rgba(255,255,255,0.07)',
                transition:'all 0.2s',position:'relative',overflow:'hidden'
              }}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${t.accent},transparent)`}} />
                <div style={{fontSize:'1.5rem',fontFamily:'Georgia,serif',color:`${t.accent}`,marginBottom:16,opacity:0.8}}>❝</div>
                <p style={{color:'rgba(240,238,255,0.85)',lineHeight:1.75,fontSize:'0.97rem',marginBottom:24,fontStyle:'italic'}}>
                  {t.quote}
                </p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{
                    width:38,height:38,borderRadius:'50%',
                    background:`linear-gradient(135deg,${t.accent}40,${t.accent}20)`,
                    border:`1px solid ${t.accent}40`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'0.9rem',fontWeight:700,color:t.accent
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontSize:'0.9rem',fontWeight:700,color:'rgba(240,238,255,0.9)'}}>{t.name}</div>
                    <div style={{fontSize:'0.78rem',color:'rgba(107,100,144,0.7)',marginTop:2}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — PRICING TEASER
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'0 24px 100px'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{
            borderRadius:24,overflow:'hidden',
            border:'1px solid rgba(108,92,231,0.25)',
            background:'rgba(108,92,231,0.06)',
            boxShadow:'0 0 80px rgba(108,92,231,0.08)',
            padding:'60px 56px',
            position:'relative'
          }}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(108,92,231,0.1) 0%, transparent 60%)',pointerEvents:'none'}} />

            <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:40}}>
              <div style={{flex:1,minWidth:280}}>
                <div style={{
                  display:'inline-block',padding:'4px 14px',borderRadius:999,marginBottom:20,
                  background:'rgba(108,92,231,0.2)',border:'1px solid rgba(108,92,231,0.3)',
                  fontSize:'0.75rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.08em',textTransform:'uppercase'
                }}>The Math</div>
                <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.5rem)',fontWeight:800,letterSpacing:'-0.03em',fontFamily:"'Space Grotesk',sans-serif",marginBottom:16,lineHeight:1.2}}>
                  Replace your entire<br/><span style={{color:'#8B7CF6'}}>$1,200/yr study stack.</span>
                </h2>
                <p style={{color:'rgba(162,155,204,0.8)',lineHeight:1.7,fontSize:'1rem'}}>
                  Your current stack: UWorld ($399) + BnB ($249) + Sketchy ($300) + Pathoma ($100) + Anki Pro ($25) = <strong style={{color:'#FF6B6B'}}>$1,073/yr</strong> — and you still need to make the cards yourself.
                </p>
              </div>
              <div style={{flexShrink:0,textAlign:'center'}}>
                <div style={{fontSize:'0.85rem',color:'rgba(107,100,144,0.7)',fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:8}}>MedDrill Pro</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'4rem',fontWeight:800,color:'#F0EEFF',letterSpacing:'-0.05em',lineHeight:1}}>$19<span style={{fontSize:'1.2rem',color:'rgba(162,155,204,0.7)',fontWeight:500}}>/mo</span></div>
                <div style={{fontSize:'0.85rem',color:'rgba(107,100,144,0.7)',marginBottom:24}}>or $149/yr · Save 35%</div>
                <Link href="/signup" style={{
                  display:'inline-flex',alignItems:'center',gap:8,
                  padding:'14px 28px',borderRadius:999,
                  background:'linear-gradient(135deg,#6C5CE7,#5A4BD1)',
                  color:'white',fontWeight:700,fontSize:'0.95rem',
                  boxShadow:'0 0 0 1px rgba(139,124,246,0.4), 0 6px 30px rgba(108,92,231,0.4)',
                }}>
                  See All Plans →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — FINAL CTA + FAQ
      ══════════════════════════════════════════════ */}
      <section style={{position:'relative',zIndex:1,padding:'100px 24px 80px',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(108,92,231,0.1) 0%, transparent 60%)',pointerEvents:'none'}} />

        <div style={{position:'relative',maxWidth:680,margin:'0 auto'}}>
          <Image
            src="/mascots/master.png" alt="Drilly — Your AI Study Companion"
            width={80} height={80}
            style={{
              margin:'0 auto 28px',display:'block',
              WebkitMaskImage:'radial-gradient(circle,black 50%,transparent 70%)',
              maskImage:'radial-gradient(circle,black 50%,transparent 70%)',
              filter:'drop-shadow(0 0 24px rgba(108,92,231,0.7))',
              animation:'float 4s ease-in-out infinite'
            }}
          />
          <h2 style={{fontSize:'clamp(2.2rem,5vw,3.5rem)',fontWeight:800,letterSpacing:'-0.04em',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.1}}>
            Your classmates are<br/><span style={{background:'linear-gradient(135deg,#8B7CF6,#00D2A0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>already using this.</span>
          </h2>
          <p style={{color:'rgba(162,155,204,0.8)',marginBottom:40,fontSize:'1.15rem',lineHeight:1.7}}>
            Set up your first gamified study track in 30 seconds. No credit card required. The starter plan is free forever.
          </p>

          <Link href="/signup" className="btn btn-primary btn-lg animate-fade-up" style={{
            boxShadow:'0 0 0 1px rgba(139,124,246,0.5), 0 12px 0 rgba(90,75,209,1)',
            marginBottom:20,width:'fit-content',margin:'0 auto 20px',animationDelay:'0.3s'
          }}>
            🎓 Start Your Free Track →
          </Link>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,flexWrap:'wrap',marginBottom:72}}>
            {['✓ No Credit Card','✓ Cancel Anytime','✓ Instant Access','✓ Free Tier Forever'].map(item=>(
              <span key={item} style={{fontSize:'0.85rem',fontWeight:600,color:'rgba(0,210,160,0.8)'}}>{item}</span>
            ))}
          </div>

          {/* FAQ */}
          <div style={{textAlign:'left',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:60}}>
            <h3 style={{textAlign:'center',fontSize:'1.5rem',fontWeight:700,marginBottom:32,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>Frequently Asked Questions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {[
                {
                  q:'Is this HIPAA compliant? Can I upload patient cases?',
                  a:'Do NOT upload real patient data. MedDrill is a study tool for educational materials only — textbook chapters, lecture slides, and study guides. Your educational PDFs are processed and not shared with third parties.'
                },
                {
                  q:'What if UWorld is still the "gold standard" for USMLE?',
                  a:'UWorld is excellent for its question quality. MedDrill is not a replacement for doing UWorld — it\'s what replaces Anki, Boards & Beyond, and your manual card creation workflow. Use both. But spend your prep time drilling, not making cards.'
                },
                {
                  q:'Can I use this for PLAB, NEET-PG, or other exams?',
                  a:'Yes. Because you upload YOUR OWN material, MedDrill works for any medical exam. The AI generates questions based on your specific PDF content, not a fixed curriculum.'
                },
                {
                  q:'How accurate are the AI-generated questions?',
                  a:'Questions are generated by Gemini 2.0, trained on the content of your PDF. They are high-yield and follow USMLE-style vignette format. Always cross-reference with your source material for clinical accuracy.'
                },
              ].map((faq,i)=>(
                <div key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'24px 0'}}>
                  <div style={{fontSize:'0.97rem',fontWeight:700,color:'rgba(240,238,255,0.9)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>{faq.q}</div>
                  <p style={{fontSize:'0.92rem',color:'rgba(162,155,204,0.75)',lineHeight:1.75}}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop:'1px solid rgba(255,255,255,0.05)',
        padding:'32px 40px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        flexWrap:'wrap',gap:16,
        color:'rgba(107,100,144,0.7)',fontSize:'0.83rem',position:'relative',zIndex:1
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:24,height:24,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem'}}>⚕️</div>
          <span style={{fontWeight:600,color:'rgba(162,155,204,0.6)'}}>MedDrill</span>
        </div>
        <div>© 2026 · Not for clinical use · Built for medical students, by medical students.</div>
        <div style={{display:'flex',gap:20}}>
          <Link href="/pricing" style={{color:'rgba(107,100,144,0.7)',transition:'color 0.2s'}}>Pricing</Link>
          <Link href="/login" style={{color:'rgba(107,100,144,0.7)',transition:'color 0.2s'}}>Log In</Link>
          <Link href="/signup" style={{color:'rgba(107,100,144,0.7)',transition:'color 0.2s'}}>Sign Up</Link>
        </div>
      </footer>

    </div>
  )
}
