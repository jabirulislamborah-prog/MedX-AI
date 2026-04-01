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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      })
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      if (data?.session) {
        window.location.href = '/dashboard'
      } else {
        setError('Please check your email to verify your account')
        setLoading(false)
      }
    } catch (err) {
      setError('Unable to connect. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0F172A', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(30,64,175,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(13,148,136,0.15) 0%, transparent 50%)'
      }} />
      
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ 
              width: 56, height: 56, 
              background: 'linear-gradient(135deg, #1E40AF, #0D9488)', 
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
              boxShadow: '0 8px 32px rgba(30,64,175,0.3)'
            }}>
              ⚕️
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ 
          background: '#1E293B', 
          borderRadius: 24, 
          padding: 32,
          border: '1px solid #334155'
        }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F8FAFC', marginBottom: 4, textAlign: 'center' }}>
            Welcome back
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', marginBottom: 28 }}>
            Continue your streak 🔥
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input 
                type="email" 
                placeholder="you@medschool.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 12, color: '#F8FAFC', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
                  Forgot?
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 12, color: '#F8FAFC', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>
            
            {error && (
              <div style={{ 
                background: 'rgba(239,68,68,0.1)', 
                border: '1px solid rgba(239,68,68,0.3)', 
                borderRadius: 12, padding: '14px 16px', 
                color: '#EF4444', fontSize: '0.88rem' 
              }}>
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: loading ? '#64748B' : '#3B82F6', 
                color: 'white', fontSize: '1rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Signing in...
                </>
              ) : (
                '🔑 Sign In'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#334155' }} />
            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#334155' }} />
          </div>

          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#3B82F6', fontWeight: 600 }}>
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
