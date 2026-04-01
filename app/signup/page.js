'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.name || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      setLoading(false)
      return
    }

    if (!form.email || !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein']
    if (commonPasswords.includes(form.password.toLowerCase())) {
      setError('Password is too common. Please choose a stronger password.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.toLowerCase().trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (signUpError) {
      setError(signUpError.message.includes('already') ? 'An account with this email already exists' : 'Unable to create account. Please try again.')
      setLoading(false)
      return
    }

    if (data.user) {
      if (!data.session) {
        setError('✅ Check your email to confirm your account!')
        setLoading(false)
        return
      }
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.name.trim(),
        xp: 0,
        streak_days: 0,
        level: 1,
        onboarding_complete: false
      })
      router.push('/onboarding')
      router.refresh()
    }
    setLoading(false)
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
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(30,64,175,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(13,148,136,0.15) 0%, transparent 50%)'
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
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

        <div style={{
          background: '#1E293B',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #334155'
        }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F8FAFC', marginBottom: 4, textAlign: 'center' }}>
            Create your account
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', textAlign: 'center', marginBottom: 24 }}>
            Start studying smarter — no credit card required
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {['📚 AI lessons from your PDFs', '⚔️ Battle mode & leaderboards', '🔥 Streaks & gamification'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: '0.88rem' }}>
                <span style={{ color: '#10B981' }}>✓</span>
                {f}
              </div>
            ))}
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. Future"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 12, color: '#F8FAFC', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@medschool.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 12, color: '#F8FAFC', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 12, color: '#F8FAFC', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            </div>

            {error && (
              <div style={{
                background: error.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${error.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: 12, padding: '14px 16px',
                color: error.startsWith('✅') ? '#10B981' : '#EF4444',
                fontSize: '0.88rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: loading ? '#64748B' : '#10B981',
                color: 'white', fontSize: '1rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Creating account...
                </>
              ) : (
                '🚀 Create Free Account'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#3B82F6', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
