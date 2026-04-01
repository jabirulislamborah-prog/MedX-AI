'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

const FACE_SHAPES = ['oval', 'round', 'square', 'heart']
const SKIN_TONES = ['#FFDFC4', '#F0C8A0', '#D4A574', '#A67B5B', '#8D5524', '#5C3317']
const HAIR_STYLES = ['short', 'medium', 'long', 'bald', 'curly', 'wavy']
const HAIR_COLORS = ['#1A1A1A', '#4A3728', '#8B4513', '#D4A574', '#B8860B', '#808080', '#FFD700', '#FF4500']
const ACCESSORIES = ['none', 'glasses', 'sunglasses', 'stethoscope', 'labcoat', 'headphones']
const BACKGROUNDS = ['#1E40AF', '#059669', '#7C3AED', '#DC2626', '#EA580C', '#0891B2', '#4F46E5', '#BE185D']

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ docs: 0, flashcards: 0, attempts: 0 })
  const [loading, setLoading] = useState(true)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [avatar, setAvatar] = useState({
    faceShape: 'oval',
    skinTone: '#F0C8A0',
    hairStyle: 'short',
    hairColor: '#1A1A1A',
    accessory: 'none',
    background: '#1E40AF'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    if (prof?.avatar_config) {
      try {
        setAvatar({ ...avatar, ...JSON.parse(prof.avatar_config) })
      } catch (e) {}
    }

    const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: flashcardCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const { count: attemptCount } = await supabase.from('qbank_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    setStats({ docs: docCount || 0, flashcards: flashcardCount || 0, attempts: attemptCount || 0 })
    setLoading(false)
  }

  async function saveAvatar() {
    setSaving(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('profiles').update({ avatar_config: JSON.stringify(avatar) }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setShowCustomizer(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function AvatarPreview({ size = 96 }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: avatar.background,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill={avatar.skinTone} />
          <circle cx="50" cy="40" r="25" fill={avatar.skinTone} />
          {avatar.hairStyle !== 'bald' && (
            <ellipse cx="50" cy="30" rx="28" ry="20" fill={avatar.hairColor} />
          )}
          <circle cx="40" cy="38" r="4" fill="#1A1A1A" />
          <circle cx="60" cy="38" r="4" fill="#1A1A1A" />
          <path d="M 42 50 Q 50 55 58 50" stroke="#1A1A1A" strokeWidth="2" fill="none" />
          {avatar.accessory === 'glasses' && (
            <g>
              <circle cx="40" cy="38" r="8" stroke="#1A1A1A" strokeWidth="2" fill="none" />
              <circle cx="60" cy="38" r="8" stroke="#1A1A1A" strokeWidth="2" fill="none" />
              <line x1="48" y1="38" x2="52" y2="38" stroke="#1A1A1A" strokeWidth="2" />
            </g>
          )}
          {avatar.accessory === 'stethoscope' && (
            <path d="M 35 70 Q 50 95 65 70" stroke="#4A4A4A" strokeWidth="3" fill="none" />
          )}
        </svg>
      </div>
    )
  }

  if (loading) return (
    <div style={{display:'flex'}}>
      <Sidebar profile={null} />
      <main className="main-content" style={{display:'flex', alignItems:'center', justifyContent:'center', flex:1}}>
        <div style={{color:'#94A3B8'}}>Loading profile...</div>
      </main>
    </div>
  )

  return (
    <div style={{display:'flex'}}>
      <Sidebar profile={profile} />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{maxWidth:800, margin:'0 auto'}}>
          <div style={{marginBottom:32}}>
            <h1 style={{fontSize:'1.8rem',marginBottom:4}}>👤 Profile & Settings</h1>
            <p style={{color:'#94A3B8'}}>Manage your MedDrill experience and medical goals.</p>
          </div>

          <div className="card" style={{padding:40, marginBottom:32, display:'flex', alignItems:'center', gap:24}}>
            <div style={{position:'relative', cursor:'pointer'}} onClick={() => setShowCustomizer(true)}>
              <AvatarPreview size={96} />
              <div style={{
                position:'absolute', bottom:0, right:0, width:28, height:28,
                background:'#1E40AF', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.8rem', border:'3px solid #1E293B'
              }}>✏️</div>
            </div>
            <div style={{flex:1}}>
              <h2 style={{fontSize:'1.5rem', marginBottom:8}}>{profile?.full_name || 'Medical Student'}</h2>
              <p style={{color:'#94A3B8', marginBottom:4}}>{profile?.email || 'doctor@example.com'}</p>
              <div style={{display:'flex', gap:10, marginTop:12}}>
                <span className="badge badge-primary">Lv. {profile?.level || 1}</span>
                <span className="badge badge-warning">🔥 {profile?.streak_days || 0} Day Streak</span>
                <span className="badge badge-success">⭐ {profile?.xp || 0} XP</span>
              </div>
            </div>
            {saved && <span style={{color:'#10B981', fontWeight:600}}>✓ Saved!</span>}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32}}>
            <div className="card" style={{padding:24}}>
              <h3 style={{marginBottom:16, borderBottom:'1px solid #334155', paddingBottom:12}}>🎓 Academic Info</h3>
              <div style={{marginBottom:16}}>
                <label className="input-label" style={{color:'#94A3B8', fontSize:'0.8rem'}}>MEDICAL SCHOOL</label>
                <div style={{fontWeight:600}}>{profile?.medical_school || 'Not specified'}</div>
              </div>
              <div style={{marginBottom:16}}>
                <label className="input-label" style={{color:'#94A3B8', fontSize:'0.8rem'}}>TARGET EXAM</label>
                <div style={{fontWeight:600}}>{profile?.exam_target || 'USMLE Step 1'}</div>
              </div>
              <div>
                <label className="input-label" style={{color:'#94A3B8', fontSize:'0.8rem'}}>BIO</label>
                <div style={{fontWeight:600, color: profile?.bio ? '#F8FAFC' : '#64748B'}}>
                  {profile?.bio || 'No bio provided...'}
                </div>
              </div>
            </div>

            <div className="card" style={{padding:24}}>
              <h3 style={{marginBottom:16, borderBottom:'1px solid #334155', paddingBottom:12}}>📊 Study Statistics</h3>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#94A3B8'}}>QBank Attempts</span>
                <span style={{fontWeight:700}}>{stats.attempts}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#94A3B8'}}>Flashcards Made</span>
                <span style={{fontWeight:700}}>{stats.flashcards}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <span style={{color:'#94A3B8'}}>Documents Uploaded</span>
                <span style={{fontWeight:700}}>{stats.docs}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:'#94A3B8'}}>Current Plan</span>
                <span style={{fontWeight:700, color:'#0D9488', textTransform:'capitalize'}}>{profile?.plan || 'Free'}</span>
              </div>
            </div>
          </div>

        </div>

        {showCustomizer && (
          <div style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000,
            display:'flex', alignItems:'center', justifyContent:'center', padding:20
          }} onClick={() => setShowCustomizer(false)}>
            <div style={{
              background:'#1E293B', borderRadius:20, padding:32, maxWidth:500, width:'100%',
              maxHeight:'90vh', overflow:'auto'
            }} onClick={e => e.stopPropagation()}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
                <h2 style={{fontSize:'1.3rem', margin:0}}>Customize Your Avatar</h2>
                <button onClick={() => setShowCustomizer(false)} style={{background:'none', border:'none', color:'#94A3B8', fontSize:'1.5rem', cursor:'pointer'}}>✕</button>
              </div>

              <div style={{display:'flex', justifyContent:'center', marginBottom:24}}>
                <AvatarPreview size={120} />
              </div>

              <div style={{marginBottom:20}}>
                <label className="input-label">Skin Tone</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {SKIN_TONES.map(tone => (
                    <button key={tone} onClick={() => setAvatar({...avatar, skinTone:tone})}
                      style={{
                        width:36, height:36, borderRadius:'50%', border: avatar.skinTone===tone ? '3px solid #3B82F6' : '2px solid transparent',
                        background:tone, cursor:'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label className="input-label">Hair Style</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {HAIR_STYLES.map(style => (
                    <button key={style} onClick={() => setAvatar({...avatar, hairStyle:style})}
                      style={{
                        padding:'8px 14px', borderRadius:8, border: avatar.hairStyle===style ? '2px solid #3B82F6' : '1px solid #475569',
                        background: avatar.hairStyle===style ? 'rgba(59,130,246,0.2)' : 'transparent',
                        color: '#F8FAFC', cursor:'pointer', fontSize:'0.85rem', textTransform:'capitalize'
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label className="input-label">Hair Color</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {HAIR_COLORS.map(color => (
                    <button key={color} onClick={() => setAvatar({...avatar, hairColor:color})}
                      style={{
                        width:32, height:32, borderRadius:'50%', border: avatar.hairColor===color ? '3px solid #3B82F6' : '2px solid #475569',
                        background:color, cursor:'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label className="input-label">Accessory</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {ACCESSORIES.map(acc => (
                    <button key={acc} onClick={() => setAvatar({...avatar, accessory:acc})}
                      style={{
                        padding:'8px 14px', borderRadius:8, border: avatar.accessory===acc ? '2px solid #3B82F6' : '1px solid #475569',
                        background: avatar.accessory===acc ? 'rgba(59,130,246,0.2)' : 'transparent',
                        color: '#F8FAFC', cursor:'pointer', fontSize:'0.85rem', textTransform:'capitalize'
                      }}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:24}}>
                <label className="input-label">Background Color</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {BACKGROUNDS.map(bg => (
                    <button key={bg} onClick={() => setAvatar({...avatar, background:bg})}
                      style={{
                        width:36, height:36, borderRadius:'50%', border: avatar.background===bg ? '3px solid #F8FAFC' : '2px solid transparent',
                        background:bg, cursor:'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button onClick={saveAvatar} disabled={saving}
                className="btn btn-primary" style={{width:'100%', padding:'14px'}}>
                {saving ? 'Saving...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
