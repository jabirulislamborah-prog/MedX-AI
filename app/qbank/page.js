'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Celebration, { NotificationToast, Hearts } from '@/components/Celebration'

function QBankContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'all'
  const track = searchParams.get('track')

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)
  const [hearts, setHearts] = useState(5)
  const [xp, setXp] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [toast, setToast] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [streak, setStreak] = useState(0)
  const startTimeRef = useRef(0)
  const [streakBonus, setStreakBonus] = useState(false)

  useEffect(() => {
    async function load() {
      const url = track ? `/api/qbank/generate?track=${track}` : `/api/qbank/generate?mode=${mode}`
      const res = await fetch(url)
      const data = await res.json()
      setQuestions(data.questions || []); setLoading(false)
      startTimeRef.current = new Date().getTime()
    }
    load()
  }, [mode, track])

  const q = questions[current]

  async function handleSelect(opt) {
    if (answered || !q) return
    const timeTaken = new Date().getTime() - startTimeRef.current
    const isCorrect = opt.is_correct
    setSelected(opt.id); setAnswered(true)
    
    if (isCorrect) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
      const gained = 15 + (streakBonus ? 5 : 0)
      setXp(x => x + gained)
      setXpGained(gained)
      setStreak(s => s + 1)
      setStreakBonus(s >= 4)
      setCelebration('xp')
      setToast({ message: `+${gained} XP ${streakBonus ? '🔥 STREAK BONUS!' : ''}`, type: 'xp' })
      if (gained > 0) {
        await fetch('/api/profile/streak', { method: 'POST' }).catch(() => {})
      }
      setTimeout(() => setCelebration(null), 800)
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }))
      setHearts(h => Math.max(0, h - 1))
      setStreak(0)
      setStreakBonus(false)
      setCelebration('wrong')
      setToast({ message: 'Wrong answer — lose a heart!', type: 'streak' })
      setTimeout(() => setCelebration(null), 600)
    }

    fetch('/api/qbank/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: q.id,
        selected_option_id: opt.id,
        is_correct: isCorrect,
        time_taken_ms: timeTaken
      })
    }).catch(() => {})
  }

  function next() {
    setSelected(null); setAnswered(false); setShowDetail(false)
    if (current + 1 >= questions.length) {
      setDone(true)
      if (score.correct / questions.length >= 0.7) setCelebration('confetti')
    } else {
      setCurrent(c => c + 1)
      startTimeRef.current = new Date().getTime()
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A29BCC', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem', animation: 'bounce 2s infinite' }}>🎯</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem' }}>Loading your drill...</div>
    </div>
  )

  if (!questions.length) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
          <h2 style={{ marginBottom: 12 }}>No questions yet</h2>
          <p style={{ color: '#A29BCC', marginBottom: 24 }}>Upload a PDF or choose a pre-built track to start drilling.</p>
          <Link href="/upload" className="btn btn-primary">📤 Upload Material</Link>
        </div>
      </main>
    </div>
  )

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1A', color: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card animate-zoom" style={{ textAlign: 'center', padding: 48, maxWidth: 480 }}>
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>{score.correct / questions.length >= 0.8 ? '🎉' : score.correct / questions.length >= 0.6 ? '📈' : '📚'}</div>
        <h2 style={{ marginBottom: 8 }}>Session Complete!</h2>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '3rem', fontWeight: 800, color: score.correct / questions.length >= 0.7 ? '#00D2A0' : '#FF6B6B', margin: '16px 0', letterSpacing: '-0.04em' }}>
          {score.correct}/{questions.length}
        </div>
        <p style={{ color: '#A29BCC', marginBottom: 20 }}>{Math.round(score.correct / questions.length * 100)}% accuracy</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(0,210,160,0.1)', border: '1px solid rgba(0,210,160,0.3)', color: '#00D2A0', fontWeight: 700 }}>⭐ {xp} XP earned</span>
          <span style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B', fontWeight: 700 }}>❤️ {hearts} hearts left</span>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => { setCurrent(0); setScore({ correct: 0, total: 0 }); setDone(false); setSelected(null); setAnswered(false); setHearts(5); setXp(0); setStreak(0) }}>
            🔄 Try Again
          </button>
          <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </div>
    </div>
  )

  if (!q) return null
  const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ padding: '16px', paddingTop: '76px' }}>
        
        {/* Mobile Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Hearts count={hearts} max={5} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(253,203,110,0.1)', border: '1px solid rgba(253,203,110,0.2)' }}>
              <span style={{ fontSize: '1.1rem', animation: streak >= 3 ? 'pulse 1s infinite' : 'none' }}>🔥</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#FDCB6E', fontSize: '1.1rem' }}>{streak}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#FDCB6E', fontWeight: 700, fontSize: '0.9rem' }}>⭐ {xp} XP</span>
            <Link href="/dashboard" style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#A29BCC', fontSize: '0.82rem', fontWeight: 600 }}>Exit</Link>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ color: '#A29BCC', fontSize: '0.85rem', flexShrink: 0, minWidth: 40 }}>{current + 1}/{questions.length}</span>
            <div style={{ flex: 1 }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%` }} /></div></div>
            <span style={{ color: '#00D2A0', fontSize: '0.82rem', flexShrink: 0 }}>✓{score.correct} ✗{score.total - score.correct}</span>
          </div>

          {/* Question Navigator Pills */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, WebkitOverflowScrolling: 'touch' }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0, fontSize: '0.75rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === current ? '#6C5CE7' : i < current && questions[i] ? 'rgba(0,210,160,0.15)' : 'rgba(255,255,255,0.05)',
                border: i === current ? '2px solid #8B7CF6' : '1.5px solid rgba(255,255,255,0.1)',
                color: i === current ? 'white' : i < current ? '#00D2A0' : '#6B6490'
              }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Vignette */}
          <div className="card" style={{ marginBottom: 16, padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{q.subject || 'USMLE'}</span>
              <span className={`badge ${q.difficulty === 'hard' ? 'badge-error' : q.difficulty === 'easy' ? 'badge-success' : 'badge-warning'}`}>
                {q.difficulty?.toUpperCase() || 'MEDIUM'}
              </span>
              {streakBonus && <span className="badge" style={{ background: 'rgba(253,203,110,0.15)', color: '#FDCB6E', border: '1px solid rgba(253,203,110,0.3)' }}>🔥 5x BONUS</span>}
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#E0DFF8', marginBottom: 14 }}>{q.question_stem}</p>
            {q.lead_in && <p style={{ fontWeight: 600, color: '#F8F7FF', fontSize: '0.95rem' }}>{q.lead_in}</p>}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {opts?.map((opt, i) => {
              let cls = 'option-btn'
              if (answered) {
                if (opt.is_correct) cls += ' correct'
                else if (selected === opt.id) cls += ' incorrect'
              } else if (selected === opt.id) cls += ' selected'
              return (
                <button key={opt.id} className={cls} onClick={() => handleSelect(opt)} disabled={answered} style={{ padding: '14px 16px', minHeight: 52 }}>
                  <span className="option-label">{String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {answered && opt.is_correct && <span style={{ color: '#00D2A0', fontSize: '1.1rem' }}>✓</span>}
                  {answered && selected === opt.id && !opt.is_correct && <span style={{ color: '#FF6B6B', fontSize: '1.1rem' }}>✗</span>}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="animate-fade-up card" style={{ marginBottom: 16, padding: 20, borderColor: 'rgba(108,92,231,0.4)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: opts?.find(o => o.id === selected)?.is_correct ? '#00D2A0' : '#FF6B6B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>{opts?.find(o => o.id === selected)?.is_correct ? '✅' : '❌'}</span>
                {opts?.find(o => o.id === selected)?.is_correct ? 'Correct!' : 'Incorrect'}
              </div>
              <p style={{ color: '#A29BCC', fontSize: '0.88rem', lineHeight: 1.7 }}>{q.explanation_brief}</p>
            </div>
          )}

          {answered && (
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={next}>
              {current + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
            </button>
          )}
        </div>
      </main>

      {celebration && <Celebration type={celebration} onComplete={() => setCelebration(null)} />}
      {toast && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default function QBankPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0F0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A29BCC' }}>Loading QBank...</div>}>
      <QBankContent />
    </Suspense>
  )
}