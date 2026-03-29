'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      // If email confirmation is required, show a message
      if (!data.session) {
        setError('✅ Check your email to confirm your account!')
        setLoading(false)
        return
      }
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.name, xp: 0, streak_days: 0, level: 1, onboarding_complete: false })
      router.push('/onboarding'); router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card animate-fade-up">
        <div style={{textAlign:'center',marginBottom:32}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:24,color:'inherit'}}>
            <div style={{width:44,height:44,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>⚕️</div>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.4rem'}}>MedDrill</span>
          </Link>
          <h1 style={{fontSize:'1.8rem',marginBottom:8}}>Start free today</h1>
          <p style={{color:'#A29BCC',fontSize:'0.95rem'}}>No credit card required</p>
        </div>
        <div className="card" style={{padding:32}}>
          {['📚 AI lessons from your PDFs','⚔️ Battle mode & leaderboards','🔥 Streaks & gamification'].map(f=>(
            <div key={f} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,color:'#A29BCC',fontSize:'0.88rem'}}>
              <span style={{color:'#00D2A0'}}>✓</span>{f}
            </div>
          ))}
          <div className="divider" />
          <div className="divider" />
          <form onSubmit={handleSignup} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label className="input-label">Full Name</label>
              <input id="name" type="text" className="input" placeholder="Dr. Future" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input id="email" type="email" className="input" placeholder="you@med.edu" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input id="password" type="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} />
            </div>
            {error && <div style={{background: error.startsWith('✅') ? 'rgba(0,210,160,0.1)' : 'rgba(255,107,107,0.1)',border:`1px solid ${error.startsWith('✅') ? 'rgba(0,210,160,0.3)' : 'rgba(255,107,107,0.3)'}`,borderRadius:8,padding:'10px 14px',color: error.startsWith('✅') ? '#00D2A0' : '#FF6B6B',fontSize:'0.88rem'}}>{error}</div>}
            <button type="submit" className="btn btn-secondary" disabled={loading} style={{width:'100%',padding:'14px'}}>
              {loading ? '⟳ Creating...' : '🚀 Create Free Account'}
            </button>
          </form>
          <div className="divider" />
          <p style={{textAlign:'center',color:'#A29BCC',fontSize:'0.9rem'}}>
            Have an account? <Link href="/login" style={{color:'#8B7CF6',fontWeight:600}}>Log in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
