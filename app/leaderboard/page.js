import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: weekly } = await supabase.from('profiles').select('id,full_name,xp,streak_days,level').order('xp', { ascending: false }).limit(50)
  const { data: streaks } = await supabase.from('profiles').select('id,full_name,streak_days,xp,level').order('streak_days', { ascending: false }).limit(20)

  const medals = ['🥇','🥈','🥉']
  const myRank = weekly?.findIndex(p=>p.id===user.id) + 1

  const safeProfile = profile ? { full_name: profile.full_name || null, xp: profile.xp || 0, level: profile.level || 1, streak_days: profile.streak_days || 0 } : null

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={safeProfile} />
      <main className="main-content" style={{padding:'24px',paddingTop:'72px'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{marginBottom:24}}>
            <h1 style={{fontSize:'1.6rem',marginBottom:4,fontFamily:"'Space Grotesk',sans-serif"}}>🏆 Leaderboard</h1>
            <p style={{color:'#A29BCC',fontSize:'0.88rem'}}>Compete with med students worldwide</p>
          </div>

          {myRank > 0 && (
            <div className="card" style={{background:'linear-gradient(135deg,rgba(108,92,231,0.2),rgba(0,210,160,0.1))',borderColor:'#6C5CE7',marginBottom:20,padding:18}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{color:'#A29BCC',fontSize:'0.82rem',marginBottom:4}}>Your Ranking</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.8rem',color:'#8B7CF6'}}>#{myRank}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#FDCB6E',fontWeight:700}}>⭐ {profile?.xp?.toLocaleString() || 0} XP</div>
                  <div style={{color:'#A29BCC',fontSize:'0.78rem'}}>🔥 {profile?.streak_days||0} day streak</div>
                </div>
              </div>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
            {/* XP Leaderboard */}
            <div className="card">
                <h2 style={{fontSize:'1rem',marginBottom:16,fontFamily:"'Space Grotesk', sans-serif"}}>XP Rankings</h2>
              {weekly?.map((p,i)=>(
                <div key={p.id} className={`leaderboard-row${i===0?' top-1':i===1?' top-2':i===2?' top-3':''}`} style={{borderBottom: i<weekly.length-1?'1px solid #2D2654':'none',padding:'12px 16px'}}>
                  <div className="rank-badge" style={{background:i===0?'rgba(253,203,110,0.2)':i===1?'rgba(163,163,163,0.2)':i===2?'rgba(180,120,80,0.2)':'rgba(108,92,231,0.1)',color:i===0?'#FDCB6E':i===1?'#A0A0A0':i===2?'#CD7F32':'#8B7CF6',width:28,height:28}}>
                    {i<3?medals[i]:i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:'0.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:p.id===user.id?'#8B7CF6':'inherit'}}>
                      {p.full_name}{p.id===user.id?' (you)':''}
                    </div>
                    <div style={{color:'#6B6490',fontSize:'0.72rem'}}>Level {p.level}</div>
                  </div>
                  <div style={{fontWeight:700,color:'#FDCB6E',fontSize:'0.88rem',flexShrink:0}}>{p.xp.toLocaleString()} XP</div>
                </div>
              ))}
            </div>

            {/* Streak Leaderboard + Battle */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="card">
                <h2 style={{fontSize:'1rem',marginBottom:16,fontFamily:"'Space Grotesk',sans-serif"}}>🔥 Streak Kings</h2>
                {streaks?.slice(0,10).map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<9?'1px solid #2D2654':'none'}}>
                    <span style={{color:'#FDCB6E',fontWeight:700,width:20,textAlign:'center',fontSize:'0.85rem'}}>{i+1}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'0.85rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:p.id===user.id?'#8B7CF6':'inherit'}}>{p.full_name}</div>
                    </div>
                    <span style={{color:'#FF6B6B',fontWeight:700,fontSize:'0.88rem',flexShrink:0}}>🔥 {p.streak_days}d</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{textAlign:'center',padding:20,background:'linear-gradient(135deg,rgba(253,203,110,0.1),rgba(108,92,231,0.1))',borderColor:'rgba(253,203,110,0.3)'}}>
                <div style={{fontSize:'1.8rem',marginBottom:6}}>⚔️</div>
                <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Challenge Anyone</h3>
                <p style={{color:'#A29BCC',fontSize:'0.78rem',marginBottom:14}}>Pick a player and battle!</p>
                <a href="/battle" className="btn btn-sm" style={{background:'linear-gradient(135deg,#FDCB6E,#F39C12)',color:'#0F0A1A',fontWeight:700,width:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>⚔️ Start Battle</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
