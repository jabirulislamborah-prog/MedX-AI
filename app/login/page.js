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
