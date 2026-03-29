'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card animate-fade-up">
        <div style={{textAlign:'center',marginBottom:40}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:32,color:'inherit'}}>
            <div style={{width:44,height:44,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>⚕️</div>
            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.4rem'}}>MedDrill</span>
          </Link>
          <h1 style={{fontSize:'1.8rem',marginBottom:8}}>Welcome back</h1>
          <p style={{color:'#A29BCC',fontSize:'0.95rem'}}>Continue your streak 🔥</p>
        </div>

        <div className="card" style={{padding:32}}>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <button className="btn btn-ghost" style={{width:'100%',padding:'14px',border:'1px solid #2D2654',background:'rgba(255,255,255,0.05)',display:'flex',justifyContent:'center',gap:12}} onClick={() => createClient().auth.signInWithOAuth({ provider: 'google' })}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M24 12.27c0-.85-.08-1.68-.22-2.47H12v4.67h6.73c-.29 1.49-1.12 2.75-2.38 3.59v2.98h3.85C22.46 18.98 24 15.9 24 12.27z"/><path fill="#34A853" d="M12 24c3.38 0 6.22-1.12 8.29-3.03l-3.85-2.98c-1.12.75-2.55 1.2-4.44 1.2-3.41 0-6.3-2.31-7.33-5.41H.69v3.08A11.996 11.996 0 0 0 12 24z"/><path fill="#FBBC05" d="M4.67 13.78c-.26-.78-.41-1.61-.41-2.47s.15-1.69.41-2.47V5.76H.69a11.99 11.99 0 0 0 0 11.1l3.98-3.08z"/><path fill="#4285F4" d="M12 4.79c1.84 0 3.49.63 4.79 1.88l3.61-3.61C18.2 1.12 15.37 0 12 0 7.39 0 3.32 2.69.69 5.76l3.98 3.08c1.03-3.1 3.92-5.41 7.33-5.41z"/></svg>
              Continue with Google
            </button>
            <div style={{display:'flex',alignItems:'center',gap:16,margin:'8px 0'}}>
              <div style={{flex:1,height:1,background:'#2D2654'}}></div>
              <span style={{color:'#6B6490',fontSize:'0.85rem'}}>OR USE EMAIL</span>
              <div style={{flex:1,height:1,background:'#2D2654'}}></div>
            </div>
          </div>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:20,marginTop:16}}>
            <div>
              <label className="input-label">Email</label>
              <input id="email" type="email" className="input" placeholder="you@medschool.edu" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <label className="input-label">Password</label>
                <a href="#" style={{fontSize:'0.8rem',color:'#8B7CF6'}}>Forgot?</a>
              </div>
              <input id="password" type="password" className="input" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            {error && <div style={{background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.3)',borderRadius:8,padding:'10px 14px',color:'#FF6B6B',fontSize:'0.88rem'}}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',padding:'14px'}}>
              {loading ? <span className="animate-spin" style={{display:'inline-block'}}>⟳</span> : '🔑 Log In'}
            </button>
          </form>
          <div className="divider" />
          <p style={{textAlign:'center',color:'#A29BCC',fontSize:'0.9rem'}}>
            No account? <Link href="/signup" style={{color:'#8B7CF6',fontWeight:600}}>Sign up free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
