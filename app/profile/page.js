import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: flashcardCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: attemptCount } = await supabase.from('qbank_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={profile} />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{maxWidth:800, margin:'0 auto'}}>
          <div style={{marginBottom:32}}>
            <h1 style={{fontSize:'1.8rem',marginBottom:4}}>👤 Profile & Settings</h1>
            <p style={{color:'#A29BCC'}}>Manage your MedX AI experience and medical goals.</p>
          </div>

          <div className="card" style={{padding:40, marginBottom:32, display:'flex', alignItems:'center', gap:24}}>
            <div style={{width: 96, height: 96, borderRadius:'50%', background:'linear-gradient(135deg, #6C5CE7, #8B7CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', fontWeight:700, flexShrink:0}}>
              {profile?.full_name?.charAt(0) || 'D'}
            </div>
            <div style={{flex:1}}>
              <h2 style={{fontSize:'1.5rem', marginBottom:8}}>{profile?.full_name || 'Medical Student'}</h2>
              <p style={{color:'#A29BCC', marginBottom:4}}>{user.email}</p>
              <div style={{display:'flex', gap:10, marginTop:12}}>
                <span className="badge badge-primary">Lv. {profile?.level || 1}</span>
                <span className="badge badge-warning">🔥 {profile?.streak_days || 0} Day Streak</span>
                <span className="badge badge-success">⭐ {profile?.xp || 0} XP</span>
              </div>
            </div>
            <button className="btn btn-secondary">Edit Profile</button>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32}}>
            <div className="card" style={{padding:24}}>
              <h3 style={{marginBottom:16, borderBottom:'1px solid #2D2654', paddingBottom:12}}>🎓 Academic Info</h3>
              <div style={{marginBottom:16}}>
                <label className="input-label" style={{color:'#A29BCC', fontSize:'0.8rem'}}>MEDICAL SCHOOL</label>
                <div style={{fontWeight:600}}>{profile?.medical_school || 'Not specified'}</div>
              </div>
              <div style={{marginBottom:16}}>
                <label className="input-label" style={{color:'#A29BCC', fontSize:'0.8rem'}}>TARGET EXAM</label>
                <div style={{fontWeight:600}}>{profile?.exam_target || 'USMLE Step 1'}</div>
              </div>
              <div>
                <label className="input-label" style={{color:'#A29BCC', fontSize:'0.8rem'}}>BIO</label>
                <div style={{fontWeight:600, color: profile?.bio ? '#F8F7FF' : '#6B6490'}}>
                  {profile?.bio || 'No bio provided...'}
                </div>
              </div>
            </div>

            <div className="card" style={{padding:24}}>
              <h3 style={{marginBottom:16, borderBottom:'1px solid #2D2654', paddingBottom:12}}>📊 Study Statistics</h3>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#A29BCC'}}>QBank Attempts</span>
                <span style={{fontWeight:700}}>{attemptCount}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#A29BCC'}}>Flashcards Made</span>
                <span style={{fontWeight:700}}>{flashcardCount}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#A29BCC'}}>Documents Uploaded</span>
                <span style={{fontWeight:700}}>{docCount}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:'#A29BCC'}}>Current Plan</span>
                <span style={{fontWeight:700, color:'#00D2A0', textTransform:'capitalize'}}>{profile?.plan || 'Free'}</span>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
