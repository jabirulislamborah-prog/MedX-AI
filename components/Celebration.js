'use client'
import { useEffect, useState } from 'react'

const COLORS = ['#6C5CE7','#00D2A0','#FDCB6E','#FF6B6B','#8B7CF6','#00F5BA']

export default function Celebration({ type = 'confetti', duration = 3000, onComplete }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (type === 'confetti') {
      const newPieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 6,
        duration: Math.random() * 2 + 2,
      }))
      setPieces(newPieces)
      const timer = setTimeout(() => { setPieces([]); onComplete?.() }, duration)
      return () => clearTimeout(timer)
    }
    if (type === 'xp') {
      const timer = setTimeout(() => onComplete?.(), duration)
      return () => clearTimeout(timer)
    }
    if (type === 'level') {
      const timer = setTimeout(() => onComplete?.(), 4000)
      return () => clearTimeout(timer)
    }
    if (type === 'streak') {
      const timer = setTimeout(() => onComplete?.(), 3000)
      return () => clearTimeout(timer)
    }
  }, [type, duration, onComplete])

  if (type === 'confetti' && pieces.length === 0) return null

  return (
    <div className="confetti-container">
      {type === 'confetti' && pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {type === 'xp' && (
        <div style={{
          position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          zIndex:9999,textAlign:'center',pointerEvents:'none'
        }}>
          <div className="xp-pop" style={{
            fontFamily:"'Space Grotesk',sans-serif",fontSize:'4rem',fontWeight:800,
            background:'linear-gradient(135deg,#FDCB6E,#00D2A0)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            textShadow:'none',filter:'drop-shadow(0 0 20px rgba(0,210,160,0.6))'
          }}>
            +{Math.floor(Math.random()*50+10)} XP
          </div>
        </div>
      )}

      {type === 'level' && (
        <div style={{
          position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          zIndex:9999,textAlign:'center',pointerEvents:'none'
        }}>
          <div className="level-up-pulse" style={{
            padding:'32px 48px',borderRadius:24,
            background:'linear-gradient(135deg,rgba(108,92,231,0.2),rgba(0,210,160,0.2))',
            border:'3px solid rgba(108,92,231,0.5)',
            boxShadow:'0 0 80px rgba(108,92,231,0.5), 0 0 160px rgba(0,210,160,0.3)'
          }}>
            <div style={{fontSize:'5rem',marginBottom:8}}>🚀</div>
            <div style={{
              fontFamily:"'Space Grotesk',sans-serif",fontSize:'2.5rem',fontWeight:800,
              background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
            }}>LEVEL UP!</div>
            <div style={{color:'#A29BCC',fontSize:'1.1rem',marginTop:8}}>New level unlocked!</div>
          </div>
        </div>
      )}

      {type === 'streak' && (
        <div style={{
          position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          zIndex:9999,textAlign:'center',pointerEvents:'none'
        }}>
          <div className="streak-arc" style={{
            padding:'28px 40px',borderRadius:20,
            background:'linear-gradient(135deg,rgba(253,203,110,0.25),rgba(255,69,0,0.2))',
            border:'2px solid rgba(253,203,110,0.5)'
          }}>
            <div style={{fontSize:'4rem',marginBottom:8,filter:'drop-shadow(0 0 15px #FDCB6E)'}}>🔥</div>
            <div style={{
              fontFamily:"'Space Grotesk',sans-serif",fontSize:'2rem',fontWeight:800,
              color:'#FDCB6E'
            }}>STREAK!</div>
            <div style={{color:'#A29BCC',fontSize:'1rem',marginTop:4}}>Day {Math.floor(Math.random()*30+1)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Hearts({ count = 5, max = 5 }) {
  return (
    <div className={`hearts-container ${count <= 1 ? 'low' : ''}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`heart ${i >= count ? 'lost' : ''} ${i === count - 1 && count <= 2 ? 'heart-beat' : ''}`}>
          ❤️
        </span>
      ))}
    </div>
  )
}

export function NotificationToast({ message, type = 'xp', duration = 3000, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div className={`notification-toast notification-pop ${type}`}>
      <div style={{fontSize:'1.5rem'}}>
        {type === 'streak' ? '🔥' : type === 'xp' ? '⭐' : type === 'level' ? '🚀' : '✨'}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:'0.9rem'}}>{message}</div>
      </div>
      <button onClick={onClose} style={{background:'transparent',border:'none',color:'#6B6490',cursor:'pointer',fontSize:'1.1rem',padding:4}}>✕</button>
    </div>
  )
}

export function XPBar({ current, max, size = 'md' }) {
  const pct = Math.min((current / max) * 100, 100)
  return (
    <div className="xp-bar-glow" style={size === 'sm' ? {height: 8} : {}}>
      <div className="fill" style={{ width: `${pct}%` }} />
    </div>
  )
}