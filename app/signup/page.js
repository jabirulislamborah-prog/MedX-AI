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
      options: { data: { full_name: form.name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.name, xp: 0, streak_days: 0, level: 1 })
      router.push('/dashboard'); router.refresh()
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
          <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:16}}>
            <button className="btn btn-ghost" style={{width:'100%',padding:'14px',border:'1px solid #2D2654',background:'rgba(255,255,255,0.05)',display:'flex',justifyContent:'center',gap:12}} onClick={() => createClient().auth.signInWithOAuth({ provider: 'google' })}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M24 12.27c0-.85-.08-1.68-.22-2.47H12v4.67h6.73c-.29 1.49-1.12 2.75-2.38 3.59v2.98h3.85C22.46 18.98 24 15.9 24 12.27z"/><path fill="#34A853" d="M12 24c3.38 0 6.22-1.12 8.29-3.03l-3.85-2.98c-1.12.75-2.55 1.2-4.44 1.2-3.41 0-6.3-2.31-7.33-5.41H.69v3.08A11.996 11.996 0 0 0 12 24z"/><path fill="#FBBC05" d="M4.67 13.78c-.26-.78-.41-1.61-.41-2.47s.15-1.69.41-2.47V5.76H.69a11.99 11.99 0 0 0 0 11.1l3.98-3.08z"/><path fill="#4285F4" d="M12 4.79c1.84 0 3.49.63 4.79 1.88l3.61-3.61C18.2 1.12 15.37 0 12 0 7.39 0 3.32 2.69.69 5.76l3.98 3.08c1.03-3.1 3.92-5.41 7.33-5.41z"/></svg>
              Sign up with Google
            </button>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{flex:1,height:1,background:'#2D2654'}}></div>
              <span style={{color:'#6B6490',fontSize:'0.85rem'}}>OR USE EMAIL</span>
              <div style={{flex:1,height:1,background:'#2D2654'}}></div>
            </div>
          </div>
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
            {error && <div style={{background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.3)',borderRadius:8,padding:'10px 14px',color:'#FF6B6B',fontSize:'0.88rem'}}>{error}</div>}
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
