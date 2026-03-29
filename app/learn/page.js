import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: documents } = await supabase.from('documents').select('*,lessons(id,title,is_completed,xp_reward,total_questions)').eq('user_id', user.id).order('created_at', { ascending: false })

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={profile} />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.8rem',marginBottom:4}}>📚 My Learning Path</h1>
          <p style={{color:'#A29BCC'}}>Duolingo-style lessons generated from your uploads</p>
        </div>

        {!documents?.length ? (
          <div className="card" style={{textAlign:'center',padding:60}}>
            <div style={{fontSize:'4rem',marginBottom:16}}>📄</div>
            <h2 style={{marginBottom:12}}>No materials yet</h2>
            <p style={{color:'#A29BCC',marginBottom:24}}>Upload a PDF to generate your first lessons</p>
            <Link href="/upload" className="btn btn-primary">📤 Upload PDF</Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:32}}>
            {documents.map(doc=>(
              <div key={doc.id}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div>
                    <h2 style={{fontSize:'1.2rem',marginBottom:4}}>📖 {doc.title}</h2>
                    <span className={`badge ${doc.status==='ready'?'badge-success':'badge-warning'}`}>{doc.status}</span>
                  </div>
                  {doc.status==='ready' && <Link href={`/qbank?doc=${doc.id}`} className="btn btn-ghost btn-sm">Practice QBank →</Link>}
                </div>
                {doc.status==='processing'&&(
                  <div className="card" style={{padding:24,textAlign:'center',color:'#A29BCC'}}>
                    <div className="animate-spin" style={{fontSize:'2rem',display:'inline-block',marginBottom:8}}>⟳</div>
                    <p>AI is generating your lessons... usually takes 30–60 seconds</p>
                  </div>
                )}
                {doc.lessons?.length>0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
                    {doc.lessons.map((lesson,i)=>(
                      <Link key={lesson.id} href={`/learn/lesson/${lesson.id}`} className="card card-glow" style={{padding:24,display:'block',position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:16,right:16,width:40,height:40,borderRadius:'50%',background:lesson.is_completed?'#00D2A0':'#2D2654',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>
                          {lesson.is_completed?'✓':(i+1)}
                        </div>
                        <div style={{marginBottom:12,fontSize:'1.6rem'}}>{lesson.is_completed?'⭐':'📝'}</div>
                        <h3 style={{fontSize:'1rem',marginBottom:6,paddingRight:48}}>{lesson.title}</h3>
                        <div style={{color:'#A29BCC',fontSize:'0.8rem',marginBottom:12}}>{lesson.total_questions} questions</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <span style={{color:'#FDCB6E',fontSize:'0.82rem'}}>+{lesson.xp_reward} XP</span>
                          <span className={`badge ${lesson.is_completed?'badge-success':'badge-primary'}`} style={{fontSize:'0.68rem'}}>{lesson.is_completed?'Done':'Start'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
