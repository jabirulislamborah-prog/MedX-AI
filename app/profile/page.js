'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const [activeTab, setActiveTab] = useState('posts')

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

  function AvatarPreview({ size = 120 }) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: avatar.background,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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

  const StatItem = ({ value, label }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{label}</div>
    </div>
  )

  const MenuItem = ({ icon, label, onClick, danger }) => (
    <div 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
        borderBottom: '1px solid #334155', cursor: 'pointer'
      }}
    >
      <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, color: danger ? '#EF4444' : '#F8FAFC', fontSize: '0.95rem' }}>{label}</span>
      <span style={{ color: '#64748B' }}>›</span>
    </div>
  )

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', background: '#0F172A', 
      display: 'flex', alignItems: 'center', justifyContent: 'center' 
    }}>
      <div style={{ color: '#94A3B8' }}>Loading profile...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #334155', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href="/dashboard" style={{ color: '#94A3B8', fontSize: '1.5rem' }}>‹</Link>
        <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC' }}>Profile</h1>
        <Link href="/dashboard" style={{ color: '#3B82F6', fontSize: '0.9rem', fontWeight: 500 }}>Done</Link>
      </header>

      <div style={{ padding: '24px 16px' }}>
        {/* Profile Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 16 }} onClick={() => setShowCustomizer(true)}>
            <AvatarPreview size={100} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 32, height: 32,
              background: '#3B82F6', borderRadius: '50%', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              border: '3px solid #0F172A', cursor: 'pointer'
            }}>
              <span style={{ fontSize: '0.9rem' }}>✏️</span>
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
            {profile?.full_name || 'Medical Student'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 12 }}>
            {profile?.email || 'doctor@example.com'}
          </p>
          
          {/* Level & Streak Row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <div style={{
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span>⭐</span>
              <span style={{ color: '#3B82F6', fontWeight: 600, fontSize: '0.85rem' }}>
                Level {profile?.level || 1}
              </span>
            </div>
            <div style={{
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span>🔥</span>
              <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem' }}>
                {profile?.streak_days || 0} days
              </span>
            </div>
            <div style={{
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span>⚡</span>
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
                {profile?.xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          background: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 24,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8
        }}>
          <StatItem value={stats.attempts} label="Questions" />
          <StatItem value={stats.flashcards} label="Cards" />
          <StatItem value={stats.docs} label="Documents" />
          <StatItem value={profile?.level || 1} label="Level" />
        </div>

        {/* Academic Info Card */}
        <div style={{
          background: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 24
        }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Academic Info
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🎓
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Medical School</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#F8FAFC' }}>
                {profile?.medical_school || 'Not specified'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Target Exam</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#F8FAFC' }}>
                {profile?.exam_target || 'USMLE Step 1'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💎
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Current Plan</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#10B981', textTransform: 'capitalize' }}>
                {profile?.plan || 'Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24, background: '#1E293B', 
          borderRadius: 12, padding: 4
        }}>
          {['posts', 'media', 'likes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                background: activeTab === tab ? '#334155' : 'transparent',
                color: activeTab === tab ? '#F8FAFC' : '#64748B',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'posts' ? '📚 Lessons' : tab === 'media' ? '📄 Documents' : '🃏 Cards'}
            </button>
          ))}
        </div>

        {/* Menu Section */}
        <div style={{ background: '#1E293B', borderRadius: 16, padding: '0 20px', marginBottom: 24 }}>
          <MenuItem icon="⚙️" label="Edit Profile" onClick={() => {}} />
          <MenuItem icon="🔔" label="Notifications" onClick={() => {}} />
          <MenuItem icon="🔒" label="Privacy & Security" onClick={() => {}} />
        </div>

        <div style={{ background: '#1E293B', borderRadius: 16, padding: '0 20px', marginBottom: 24 }}>
          <MenuItem icon="💳" label="Billing & Subscription" onClick={() => router.push('/pricing')} />
          <MenuItem icon="❓" label="Help & Support" onClick={() => {}} />
          <MenuItem icon="ℹ️" label="About MedDrill" onClick={() => {}} />
        </div>

        <div style={{ background: '#1E293B', borderRadius: 16, padding: '0 20px' }}>
          <MenuItem icon="🚪" label="Log Out" danger onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
          }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: '#64748B', fontSize: '0.8rem' }}>
          MedDrill v1.0.0 • Made with ❤️ for med students
        </div>
      </div>

      {/* Avatar Customizer Modal */}
      {showCustomizer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setShowCustomizer(false)}>
          <div style={{
            background: '#1E293B', borderRadius: 24, padding: 24, maxWidth: 420, width: '100%',
            maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Customize Avatar</h2>
              <button onClick={() => setShowCustomizer(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <AvatarPreview size={100} />
            </div>

            {/* Skin Tone */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Skin Tone
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SKIN_TONES.map(tone => (
                  <button key={tone} onClick={() => setAvatar({ ...avatar, skinTone: tone })}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: avatar.skinTone === tone ? '3px solid #3B82F6' : '2px solid transparent',
                      background: tone, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hair Style
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HAIR_STYLES.map(style => (
                  <button key={style} onClick={() => setAvatar({ ...avatar, hairStyle: style })}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: avatar.hairStyle === style ? '2px solid #3B82F6' : '1px solid #475569',
                      background: avatar.hairStyle === style ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: '#F8FAFC', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s'
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hair Color
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HAIR_COLORS.map(color => (
                  <button key={color} onClick={() => setAvatar({ ...avatar, hairColor: color })}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', border: avatar.hairColor === color ? '3px solid #3B82F6' : '2px solid #475569',
                      background: color, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Accessory */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Accessory
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ACCESSORIES.map(acc => (
                  <button key={acc} onClick={() => setAvatar({ ...avatar, accessory: acc })}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: avatar.accessory === acc ? '2px solid #3B82F6' : '1px solid #475569',
                      background: avatar.accessory === acc ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: '#F8FAFC', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.2s'
                    }}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Background Color
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {BACKGROUNDS.map(bg => (
                  <button key={bg} onClick={() => setAvatar({ ...avatar, background: bg })}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', border: avatar.background === bg ? '3px solid #F8FAFC' : '2px solid transparent',
                      background: bg, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            <button onClick={saveAvatar} disabled={saving}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: saving ? '#64748B' : '#3B82F6', color: 'white',
                fontSize: '1rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
