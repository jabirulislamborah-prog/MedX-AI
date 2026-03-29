import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'

const PRE_BUILT_TRACKS = [
  {
    id: 'neuro-core',
    icon: '🧠',
    title: 'Neurology Core',
    subtitle: 'First Aid + BRS Neuroscience',
    tag: 'USMLE Step 1',
    questions: 120,
    xp: 600,
    difficulty: 'Medium',
    topics: ['Cranial Nerves', 'UMN vs LMN', 'Demyelinating Diseases', 'Stroke', 'Seizure'],
    color: '#FF6B6B',
    href: '/qbank?track=neuro',
    status: 'available',
  },
  {
    id: 'renal-core',
    icon: '🫘',
    title: 'Nephrology & Renal',
    subtitle: 'Pathoma + First Aid',
    tag: 'USMLE Step 1',
    questions: 96,
    xp: 480,
    difficulty: 'Hard',
    topics: ['GN Syndromes', 'AKI vs CKD', 'Acid-Base', 'Tubular Disorders', 'Drugs & Kidneys'],
    color: '#00D2A0',
    href: '/qbank?track=renal',
    status: 'available',
  },
  {
    id: 'cardio-core',
    icon: '❤️',
    title: 'Cardiology Core',
    subtitle: 'First Aid + Pathoma',
    tag: 'USMLE Step 1',
    questions: 140,
    xp: 700,
    difficulty: 'Hard',
    topics: ['MI & ACS', 'Heart Failure', 'Arrhythmias', 'Valvular Disease', 'Congenital Heart'],
    color: '#FF4757',
    href: '/qbank?track=cardio',
    status: 'available',
  },
  {
    id: 'pharm-essentials',
    icon: '💊',
    title: 'Pharmacology Essentials',
    subtitle: 'First Aid Pharmacology',
    tag: 'USMLE Step 1',
    questions: 160,
    xp: 800,
    difficulty: 'Hard',
    topics: ['Autonomic Drugs', 'Antibiotics', 'CV Drugs', 'CNS Drugs', 'Antineoplastics'],
    color: '#A855F7',
    href: '/qbank?track=pharm',
    status: 'available',
  },
  {
    id: 'pulm-core',
    icon: '🫁',
    title: 'Pulmonology Core',
    subtitle: 'First Aid + Robbins',
    tag: 'USMLE Step 1',
    questions: 88,
    xp: 440,
    difficulty: 'Medium',
    topics: ['Asthma vs COPD', 'Pneumonia', 'Pleural Effusion', 'PFTs', 'Lung Cancer'],
    color: '#3B82F6',
    href: '/qbank?track=pulm',
    status: 'available',
  },
  {
    id: 'immuno-micro',
    icon: '🦠',
    title: 'Immunology & Micro',
    subtitle: 'First Aid Microbiology',
    tag: 'USMLE Step 1',
    questions: 110,
    xp: 550,
    difficulty: 'Medium',
    topics: ['Bugs & Drugs', 'Hypersensitivity', 'Immunodeficiencies', 'HIV', 'Vaccines'],
    color: '#F59E0B',
    href: '/qbank?track=immuno',
    status: 'coming-soon',
  },
]

const DIFFICULTY_COLOR = { Easy: '#00D2A0', Medium: '#FDCB6E', Hard: '#FF6B6B' }

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: documents } = await supabase
    .from('documents')
    .select('*,lessons(id,title,is_completed,xp_reward,total_questions)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const safeProfile = profile ? {
    full_name: profile.full_name || null,
    xp: profile.xp || 0,
    level: profile.level || 1,
    streak_days: profile.streak_days || 0,
    exam_target: profile.exam_target || null,
  } : null

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={safeProfile} />
      <main className="main-content" style={{padding:'24px',paddingTop:'72px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>

          {/* Header */}
          <div style={{marginBottom:28,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <h1 style={{fontSize:'1.6rem',fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,letterSpacing:'-0.03em',marginBottom:6}}>
                📚 Learning Library
              </h1>
              <p style={{color:'#A29BCC',lineHeight:1.5,fontSize:'0.88rem'}}>
                Pre-built tracks ready to play, or upload your own PDFs for custom lessons.
                {safeProfile?.exam_target && <span style={{color:'#8B7CF6',fontWeight:600}}> · {safeProfile.exam_target}</span>}
              </p>
            </div>
            <Link href="/upload" className="btn btn-primary btn-sm">+ Upload</Link>
          </div>

          {/* ── PRE-BUILT TRACKS ── */}
          <div style={{marginBottom:48}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{
                padding:'4px 12px',borderRadius:999,
                background:'rgba(0,210,160,0.1)',border:'1px solid rgba(0,210,160,0.2)',
                fontSize:'0.72rem',fontWeight:700,color:'#00D2A0',letterSpacing:'0.06em',textTransform:'uppercase'
              }}>Pre-Built Tracks</div>
              <p style={{color:'#6B6490',fontSize:'0.85rem'}}>Zero upload needed — play immediately</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
              {PRE_BUILT_TRACKS.map(track => (
                <div key={track.id} style={{
                  borderRadius:20,overflow:'hidden',
                  background:'rgba(255,255,255,0.025)',
                  border:`1px solid rgba(255,255,255,0.07)`,
                  transition:'all 0.2s',
                  opacity: track.status === 'coming-soon' ? 0.6 : 1,
                  position:'relative'
                }}>
                  {/* Accent top bar */}
                  <div style={{height:3,background:`linear-gradient(90deg,${track.color},transparent)`}} />

                  <div style={{padding:'24px'}}>
                    {/* Icon + badges row */}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                      <div style={{
                        width:52,height:52,borderRadius:14,
                        background:`${track.color}15`,border:`1px solid ${track.color}30`,
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem'
                      }}>{track.icon}</div>
                      <div style={{display:'flex',gap:6,flexDirection:'column',alignItems:'flex-end'}}>
                        <div style={{
                          padding:'3px 10px',borderRadius:999,
                          background:'rgba(108,92,231,0.1)',border:'1px solid rgba(108,92,231,0.2)',
                          fontSize:'0.68rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.04em'
                        }}>{track.tag}</div>
                        <div style={{
                          padding:'3px 10px',borderRadius:999,
                          background:`${DIFFICULTY_COLOR[track.difficulty]}15`,
                          border:`1px solid ${DIFFICULTY_COLOR[track.difficulty]}30`,
                          fontSize:'0.68rem',fontWeight:700,
                          color:DIFFICULTY_COLOR[track.difficulty]
                        }}>{track.difficulty}</div>
                      </div>
                    </div>

                    <h3 style={{fontSize:'1.05rem',fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4,letterSpacing:'-0.01em'}}>
                      {track.title}
                    </h3>
                    <div style={{fontSize:'0.78rem',color:'#6B6490',marginBottom:14}}>{track.subtitle}</div>

                    {/* Topics pills */}
                    <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:18}}>
                      {track.topics.slice(0,3).map(t=>(
                        <span key={t} style={{
                          padding:'2px 9px',borderRadius:999,
                          background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
                          fontSize:'0.72rem',color:'rgba(162,155,204,0.8)'
                        }}>{t}</span>
                      ))}
                      {track.topics.length > 3 && (
                        <span style={{padding:'2px 9px',borderRadius:999,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',fontSize:'0.72rem',color:'rgba(107,100,144,0.7)'}}>
                          +{track.topics.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{display:'flex',gap:16,marginBottom:18}}>
                      <div style={{fontSize:'0.8rem',color:'rgba(162,155,204,0.7)'}}>
                        <span style={{fontWeight:700,color:'#F0EEFF'}}>{track.questions}</span> questions
                      </div>
                      <div style={{fontSize:'0.8rem',color:'rgba(162,155,204,0.7)'}}>
                        <span style={{fontWeight:700,color:'#FDCB6E'}}>+{track.xp} XP</span>
                      </div>
                    </div>

                    {track.status === 'coming-soon' ? (
                      <div style={{
                        width:'100%',padding:'11px',borderRadius:12,textAlign:'center',
                        background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                        color:'#6B6490',fontSize:'0.85rem',fontWeight:600
                      }}>⏳ Coming Soon</div>
                    ) : (
                      <Link href={track.href} style={{
                        display:'block',width:'100%',padding:'11px',borderRadius:12,textAlign:'center',
                        background:`${track.color}15`,border:`1px solid ${track.color}30`,
                        color:track.color,fontWeight:700,fontSize:'0.9rem',
                        transition:'all 0.2s'
                      }}>
                        Start Track →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MY UPLOADS ── */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{
                padding:'4px 12px',borderRadius:999,
                background:'rgba(108,92,231,0.1)',border:'1px solid rgba(108,92,231,0.2)',
                fontSize:'0.72rem',fontWeight:700,color:'#8B7CF6',letterSpacing:'0.06em',textTransform:'uppercase'
              }}>My Uploads</div>
              <p style={{color:'#6B6490',fontSize:'0.85rem'}}>From your custom PDFs</p>
            </div>

            {!documents?.length ? (
              <Link href="/upload" className="upload-zone" style={{display:'block',textDecoration:'none',color:'inherit',maxWidth:480}}>
                <div style={{fontSize:'3rem',marginBottom:12}}>📄</div>
                <h3 style={{marginBottom:8}}>Upload your first PDF</h3>
                <p style={{color:'#A29BCC',fontSize:'0.9rem'}}>Drop in your professor's slides, First Aid chapters, or any medical PDF. AI creates lessons in 60 seconds.</p>
              </Link>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:28}}>
                {documents.map(doc=>(
                  <div key={doc.id}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                      <div>
                        <h2 style={{fontSize:'1.1rem',marginBottom:4,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>📖 {doc.title}</h2>
                        <span className={`badge ${doc.status==='ready'?'badge-success':'badge-warning'}`}>{doc.status}</span>
                      </div>
                      {doc.status==='ready' && <Link href={`/qbank?doc=${doc.id}`} className="btn btn-ghost btn-sm">Practice QBank →</Link>}
                    </div>
                    {doc.status==='processing' && (
                      <div className="card" style={{padding:24,textAlign:'center',color:'#A29BCC'}}>
                        <div className="animate-spin" style={{fontSize:'2rem',display:'inline-block',marginBottom:8}}>⟳</div>
                        <p>AI is generating your lessons... usually takes 30–60 seconds</p>
                      </div>
                    )}
                    {doc.lessons?.length > 0 && (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
                        {doc.lessons.map((lesson,i)=>(
                          <Link key={lesson.id} href={`/learn/lesson/${lesson.id}`} className="card card-glow" style={{padding:22,display:'block',position:'relative',overflow:'hidden'}}>
                            <div style={{position:'absolute',top:14,right:14,width:36,height:36,borderRadius:'50%',background:lesson.is_completed?'#00D2A0':'#2D2654',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>
                              {lesson.is_completed?'✓':(i+1)}
                            </div>
                            <div style={{marginBottom:10,fontSize:'1.5rem'}}>{lesson.is_completed?'⭐':'📝'}</div>
                            <h3 style={{fontSize:'0.95rem',marginBottom:5,paddingRight:44,fontWeight:600}}>{lesson.title}</h3>
                            <div style={{color:'#A29BCC',fontSize:'0.78rem',marginBottom:10}}>{lesson.total_questions} questions</div>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                              <span style={{color:'#FDCB6E',fontSize:'0.8rem'}}>+{lesson.xp_reward} XP</span>
                              <span className={`badge ${lesson.is_completed?'badge-success':'badge-primary'}`} style={{fontSize:'0.66rem'}}>{lesson.is_completed?'Done':'Start'}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
