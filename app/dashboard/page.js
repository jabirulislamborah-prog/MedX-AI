import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6)
  const { data: recentLessons } = await supabase.from('lessons').select('*,documents(title)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4)
  const { data: dueFlashcards } = await supabase.from('flashcards').select('id').eq('user_id', user.id).lte('next_review_at', new Date().toISOString())
  const { data: leaderboard } = await supabase.from('profiles').select('id,full_name,xp,streak_days,level').order('xp', { ascending: false }).limit(5)

  const dueCount = dueFlashcards?.length || 0

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={profile} />
      <main className="main-content" style={{padding:'32px'}}>
        {/* Header */}
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.8rem',marginBottom:4}}>
            Good {new Date().getHours()<12?'morning':'evening'}, {profile?.full_name?.split(' ')[0] || 'Doctor'} 👋
          </h1>
          <p style={{color:'#A29BCC'}}>Your daily drill awaits. Keep that streak alive! 🔥</p>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{marginBottom:32}}>
          {[
            { icon:'🔥', value: profile?.streak_days||0, label:'Day Streak', color:'#FDCB6E' },
            { icon:'⭐', value: profile?.xp||0, label:'Total XP', color:'#6C5CE7' },
            { icon:'🃏', value: dueCount, label:'Cards Due', color:'#00D2A0' },
            { icon:'📊', value: `Lv.${profile?.level||1}`, label:'Level', color:'#8B7CF6' },
          ].map(s=>(
            <div key={s.label} className="stat-card card-glow" style={{borderColor: s.color+'33'}}>
              <div style={{fontSize:'1.8rem',marginBottom:6}}>{s.icon}</div>
              <div className="stat-value" style={{color:s.color}}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
          {/* Left column */}
          <div style={{display:'flex',flexDirection:'column',gap:24}}>

            {/* Daily Challenge */}
            <div className="card" style={{background:'linear-gradient(135deg,rgba(108,92,231,0.2),rgba(0,210,160,0.1))',borderColor:'#6C5CE7'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h3 style={{fontSize:'1rem'}}>🎯 Daily Challenge</h3>
                <span className="badge badge-primary">TODAY</span>
              </div>
              <p style={{color:'#A29BCC',fontSize:'0.9rem',marginBottom:16}}>40% weak topics • 20% untested • 20% hard • 20% review</p>
              <div style={{display:'flex',gap:12}}>
                <Link href="/qbank?mode=daily" className="btn btn-primary btn-sm">Start Challenge</Link>
                <Link href="/battle" className="btn btn-ghost btn-sm">⚔️ Battle Friend</Link>
              </div>
            </div>

            {/* My Documents */}
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{fontSize:'1.2rem'}}>📚 My Study Materials</h2>
                <Link href="/upload" className="btn btn-primary btn-sm">+ Upload PDF</Link>
              </div>
              {!documents?.length ? (
                <div className="upload-zone" onClick={()=>window.location.href='/upload'}>
                  <div style={{fontSize:'3rem',marginBottom:12}}>📄</div>
                  <h3 style={{marginBottom:8}}>Upload your first PDF</h3>
                  <p style={{color:'#A29BCC',fontSize:'0.9rem'}}>Drop in textbooks, lecture slides, or notes. AI does the rest.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {documents.map(doc=>(
                    <Link key={doc.id} href={`/learn/${doc.id}`} className="card card-glow" style={{display:'block',padding:20,cursor:'pointer'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <div style={{fontSize:'1.8rem'}}>📖</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:'0.9rem',marginBottom:2}}>{doc.title}</div>
                          <span className={`badge ${doc.status==='ready'?'badge-success':'badge-warning'}`}>{doc.status}</span>
                        </div>
                      </div>
                      <div style={{color:'#6B6490',fontSize:'0.78rem'}}>{new Date(doc.created_at).toLocaleDateString()}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Lessons */}
            {recentLessons?.length > 0 && (
              <div>
                <h2 style={{fontSize:'1.2rem',marginBottom:16}}>⚡ Continue Learning</h2>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {recentLessons.map(lesson=>(
                    <Link key={lesson.id} href={`/learn/lesson/${lesson.id}`} className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',cursor:'pointer'}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:'0.9rem',marginBottom:2}}>{lesson.title}</div>
                        <div style={{color:'#A29BCC',fontSize:'0.78rem'}}>{lesson.documents?.title} • {lesson.total_questions} questions</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <span style={{color:'#FDCB6E',fontSize:'0.85rem'}}>{lesson.xp_reward} XP</span>
                        <span style={{color:'#6C5CE7'}}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            {/* Flashcard due */}
            <div className="card" style={{borderColor: dueCount>0?'#00D2A0':'#2D2654',textAlign:'center',padding:28}}>
              <div style={{fontSize:'2.5rem',marginBottom:8}}>🃏</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'2rem',color:'#00D2A0'}}>{dueCount}</div>
              <div style={{color:'#A29BCC',fontSize:'0.85rem',marginBottom:16}}>cards due today</div>
              <Link href="/flashcards" className="btn btn-secondary btn-sm" style={{width:'100%'}}>Review Now</Link>
            </div>

            {/* Mini leaderboard */}
            <div className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h3 style={{fontSize:'1rem'}}>🏆 Top Students</h3>
                <Link href="/leaderboard" style={{color:'#8B7CF6',fontSize:'0.8rem'}}>View All →</Link>
              </div>
              {leaderboard?.map((p,i)=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom: i<leaderboard.length-1?'1px solid #2D2654':'none'}}>
                  <span style={{width:24,height:24,borderRadius:'50%',background:i===0?'#FDCB6E':i===1?'#A0A0A0':'#CD7F32',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>{i+1}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'0.85rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color: p.id===user.id?'#8B7CF6':'inherit'}}>{p.full_name}{p.id===user.id?' (you)':''}</div>
                  </div>
                  <span style={{color:'#FDCB6E',fontSize:'0.8rem',fontWeight:700}}>{p.xp} XP</span>
                </div>
              ))}
            </div>

            {/* Battle shortcut */}
            <div className="card" style={{background:'linear-gradient(135deg,rgba(253,203,110,0.1),rgba(108,92,231,0.1))',borderColor:'rgba(253,203,110,0.3)',textAlign:'center',padding:24}}>
              <div style={{fontSize:'2rem',marginBottom:8}}>⚔️</div>
              <h3 style={{fontSize:'1rem',marginBottom:6}}>Challenge a Friend</h3>
              <p style={{color:'#A29BCC',fontSize:'0.82rem',marginBottom:16}}>10 or 30 question battles</p>
              <Link href="/battle" className="btn btn-sm" style={{background:'linear-gradient(135deg,#FDCB6E,#F39C12)',color:'#0F0A1A',width:'100%',fontWeight:700}}>⚔️ Battle Now</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
