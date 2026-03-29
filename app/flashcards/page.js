'use client'
import { Suspense, useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FLASHCARDS } from '@/lib/data/qbank'

const EXAM_SOURCES = [
  { id: 'usmle', name: 'USMLE', icon: '🇺🇸', desc: 'USMLE flashcards' },
  { id: 'plab', name: 'PLAB', icon: '🇬🇧', desc: 'PLAB flashcards' },
  { id: 'neet', name: 'NEET PG', icon: '🇮🇳', desc: 'NEET PG flashcards' },
  { id: 'amc', name: 'AMC', icon: '🇦🇺', desc: 'AMC flashcards' },
]

function FlashcardsContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source') || 'select'
  const exam = searchParams.get('exam')
  const docId = searchParams.get('doc')
  
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewed, setReviewed] = useState(0)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (source === 'select') {
      setLoading(false)
      return
    }
    if (source === 'materials') {
      fetch('/api/documents/list').then(r => r.json()).then(d => {
        setDocuments(d.documents || [])
      }).catch(() => {})
    }
  }, [source])

  useEffect(() => {
    if (source === 'select' || (source === 'materials' && !exam && !docId)) {
      setLoading(false)
      return
    }
    
    async function load() {
      setLoading(true)
      
      if (source === 'general') {
        let filtered = [...FLASHCARDS]
        if (exam) {
          filtered = filtered.filter(c => (c.exam || '').toLowerCase().includes(exam.toLowerCase()) || (c.subject || '').toLowerCase().includes(exam.toLowerCase()))
        }
        filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 20)
        console.log('[Flashcards] Loaded', filtered.length, 'cards from', exam || 'general')
        setCards(filtered)
      } else if (source === 'materials' && docId) {
        try {
          const res = await fetch(`/api/flashcards/review?doc=${docId}`)
          const data = await res.json()
          if (data.cards && data.cards.length > 0) {
            console.log('[Flashcards] Loaded', data.cards.length, 'cards from doc', docId)
            setCards(data.cards.sort(() => Math.random() - 0.5).slice(0, 20))
          } else {
            setCards([])
          }
        } catch (e) {
          console.error('[Flashcards] API error:', e)
          setCards([])
        }
      }
      
      setLoading(false)
    }
    load()
  }, [source, exam, docId])

  async function rate(rating) {
    const card = cards[idx]
    if (source === 'materials') {
      await fetch('/api/flashcards/review', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ card_id: card.id, rating }) }).catch(() => {})
    }
    setReviewed(r => r + 1)
    setFlipped(false)
    if (idx + 1 >= cards.length) setDone(true)
    else { setTimeout(() => setIdx(i => i + 1), 200) }
  }

  if (source === 'select') {
    return <FlashcardsSelector />
  }

  if (source === 'materials' && !exam && !docId) {
    return <MaterialDocsSelector documents={documents} />
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A29BCC', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem', animation: 'bounce 2s infinite' }}>🃏</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem' }}>Loading cards...</div>
    </div>
  )

  if (cards.length === 0) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
          <h2 style={{ marginBottom: 12 }}>No flashcards available</h2>
          <p style={{ color: '#A29BCC', marginBottom: 24 }}>Try another source.</p>
          <Link href="/flashcards" className="btn btn-ghost">← Choose Source</Link>
        </div>
      </main>
    </div>
  )

  if (done) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px' }}>
        <div className="card animate-zoom" style={{ textAlign: 'center', padding: 48, maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ marginBottom: 8 }}>Session Complete!</h2>
          <p style={{ color: '#A29BCC', marginBottom: 24 }}>Reviewed {reviewed} cards • +{reviewed * 2} XP earned</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setIdx(0); setDone(false); setReviewed(0); setFlipped(false) }}>Review Again</button>
            <Link href="/flashcards" className="btn btn-ghost">Choose Source</Link>
          </div>
        </div>
      </main>
    </div>
  )

  const card = cards[idx]
  const RATINGS = [
    { r: 1, label: 'Again', color: '#FF6B6B', desc: '< 1 min' },
    { r: 2, label: 'Hard', color: '#F39C12', desc: '~1 day' },
    { r: 3, label: 'Good', color: '#6C5CE7', desc: '~3 days' },
    { r: 4, label: 'Easy', color: '#00D2A0', desc: '~1 week' },
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ padding: '16px', paddingTop: '72px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>🃏 {source === 'general' ? `${exam?.toUpperCase() || 'General'} Flashcards` : 'My Materials'}</h1>
            <p style={{ color: '#A29BCC', fontSize: '0.88rem' }}>Spaced repetition — study smarter</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1 }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${(idx / cards.length) * 100}%` }} /></div></div>
            <span style={{ color: '#A29BCC', fontSize: '0.85rem', flexShrink: 0 }}>{idx}/{cards.length}</span>
          </div>

          <div className="flashcard-scene" onClick={() => setFlipped(f => !f)}>
            <div className={`flashcard-inner${flipped ? ' flipped' : ''}`}>
              <div className="flashcard-face flashcard-front">
                <div>
                  <div style={{ color: '#6B6490', fontSize: '0.75rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {source === 'general' ? `📚 ${exam?.toUpperCase() || 'General'}` : '📄 My Material'} — tap to reveal
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>{card.front_text || card.front}</p>
                  {card.documents?.title && <div style={{ color: '#6B6490', fontSize: '0.75rem', marginTop: 16 }}>{card.documents.title}</div>}
                </div>
              </div>
              <div className="flashcard-face flashcard-back">
                <div>
                  <div style={{ color: '#00D2A0', fontSize: '0.75rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ANSWER</div>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7 }}>{card.back_text || card.back}</p>
                </div>
              </div>
            </div>
          </div>

          {flipped && (
            <div className="animate-fade-up" style={{ marginTop: 24 }}>
              <p style={{ textAlign: 'center', color: '#A29BCC', fontSize: '0.85rem', marginBottom: 14 }}>How well did you know this?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {RATINGS.map(({ r, label, color, desc }) => (
                  <button key={r} onClick={() => rate(r)} style={{ padding: '12px 8px', borderRadius: 10, border: `1.5px solid ${color}33`, background: `${color}11`, color, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div>{label}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!flipped && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setFlipped(true)}>Tap card or click to reveal →</button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/flashcards" style={{ color: '#A29BCC', fontSize: '0.85rem' }}>← Choose different source</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function FlashcardsSelector() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ padding: '16px', paddingTop: '76px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>🃏 Choose Your Flashcards</h1>
          <p style={{ color: '#A29BCC', marginBottom: 32 }}>Select a flashcard source to start studying</p>

          <div style={{ display: 'grid', gap: 16, textAlign: 'left' }}>
            <Link href="/flashcards?source=general&exam=usmle" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', border: '2px solid #6C5CE733' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🇺🇸</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#F8F7FF' }}>USMLE Flashcards</h3>
                    <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.9rem' }}>High-yield USMLE Step 1 & 2 facts</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/flashcards?source=general&exam=plab" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', border: '2px solid #6C5CE733' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🇬🇧</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#F8F7FF' }}>PLAB Flashcards</h3>
                    <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.9rem' }}>PLAB 1 & 2 flashcards</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/flashcards?source=general&exam=neet" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', border: '2px solid #6C5CE733' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🇮🇳</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#F8F7FF' }}>NEET PG Flashcards</h3>
                    <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.9rem' }}>NEET PG high-yield facts</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/flashcards?source=general&exam=amc" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', border: '2px solid #6C5CE733' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🇦🇺</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#F8F7FF' }}>AMC Flashcards</h3>
                    <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.9rem' }}>AMC MCQ flashcards</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/flashcards?source=materials" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 24, cursor: 'pointer', border: '2px solid #00D2A033' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #00D2A0, #00B894)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📄</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#F8F7FF' }}>My Materials</h3>
                    <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.9rem' }}>Flashcards from your uploaded documents</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function MaterialDocsSelector({ documents }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content" style={{ padding: '16px', paddingTop: '76px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>📄 Choose Document</h1>
          <p style={{ color: '#A29BCC', marginBottom: 32 }}>Select a document to generate flashcards from</p>

          {documents.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
              <h3 style={{ marginBottom: 8 }}>No documents uploaded</h3>
              <p style={{ color: '#A29BCC', marginBottom: 24 }}>Upload a PDF to generate flashcards from your materials.</p>
              <Link href="/upload" className="btn btn-primary">📤 Upload Material</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, textAlign: 'left' }}>
              {documents.map(doc => (
                <Link key={doc.id} href={`/flashcards?source=materials&doc=${doc.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#00D2A0'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,210,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📄</div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#F8F7FF' }}>{doc.title}</h4>
                        <p style={{ margin: 0, color: '#A29BCC', fontSize: '0.8rem' }}>{doc.subject}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: 24 }}>
            <Link href="/flashcards" style={{ color: '#A29BCC', fontSize: '0.9rem' }}>← Choose different source</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0F0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A29BCC' }}>Loading...</div>}>
      <FlashcardsContent />
    </Suspense>
  )
}
