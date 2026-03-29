'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id:'free', name:'Free', price:'$0', period:'forever',
    tag:'', color:'#2D2654',
    features:['5 PDF uploads/month','AI lesson generation','100 QBank questions','50 flashcards','Basic leaderboard','1 battle/day'],
    cta:'Get Started Free', ctaHref:'/signup', primary:false,
  },
  {
    id:'pro', name:'Pro', price:'$19', period:'/month',
    tag:'Most Popular 🔥', color:'#6C5CE7',
    features:['Unlimited PDF uploads','Unlimited lessons & QBank','Unlimited flashcards','Priority AI processing','Full leaderboard & battles','Study plan recommendations','Confidence score tracking','Weekly progress reports','Daily challenges'],
    cta:'Start 7-Day Free Trial', ctaHref:'/signup?plan=pro', primary:true,
  },
  {
    id:'annual', name:'Pro Annual', price:'$9', period:'/month',
    tag:'Best Value 💎 Save 53%', color:'#00D2A0',
    features:['Everything in Pro','Billed $108/year (save $120)','Early access to new features','Priority support','Export flashcards to Anki','Custom study reminders'],
    cta:'Get Annual Plan', ctaHref:'/signup?plan=annual', primary:false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState(null)

  async function handleSubscribe(planId) {
    if (planId === 'free') {
      router.push('/signup')
      return
    }
    
    setLoadingPlan(planId)
    // We'll route users to Razorpay first as the primary gateway, you can prompt an actual choice later
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await res.json()
      
      if (res.status === 401) {
        // Not logged in
        router.push(`/signup?plan=${planId}`)
        return
      }

      if (data.url) {
        // Mock success redirect for Dev
        router.push(data.url)
      } else if (data.order_id) {
        // This is where real Razorpay window popups would happen if keys are live
        alert(`Razorpay order created! Order ID: ${data.order_id}`)
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch (e) {
      alert('Error connecting to checkout')
    }
    setLoadingPlan(null)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0F0A1A',color:'#F8F7FF',padding:'80px 24px'}}>
      <div className="container">
        <div style={{textAlign:'center',marginBottom:64}}>
          <span className="badge badge-primary" style={{marginBottom:16,display:'inline-flex'}}>Pricing</span>
          <h1 style={{marginBottom:16}}>Simple, <span className="text-gradient">honest pricing</span></h1>
          <p style={{color:'#A29BCC',fontSize:'1.1rem',maxWidth:500,margin:'0 auto'}}>
            No predatory 2-year auto-renewals. No surprise paywalls. Cancel anytime.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,maxWidth:1000,margin:'0 auto'}}>
          {PLANS.map(p=>(
            <div key={p.id} className="card" style={{border:`2px solid ${p.primary?p.color:'#2D2654'}`,padding:32,position:'relative',background:p.primary?'rgba(108,92,231,0.05)':'#1A1432'}}>
              {p.tag&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:p.color,color:p.primary?'white':'#0F0A1A',padding:'4px 16px',borderRadius:20,fontSize:'0.75rem',fontWeight:700,whiteSpace:'nowrap'}}>{p.tag}</div>}
              <div style={{marginBottom:24}}>
                <div style={{fontSize:'0.85rem',color:'#A29BCC',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>{p.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                  <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'2.8rem',color:p.color}}>{p.price}</span>
                  <span style={{color:'#6B6490'}}>{p.period}</span>
                </div>
              </div>
              <div style={{marginBottom:32,display:'flex',flexDirection:'column',gap:10}}>
                {p.features.map(f=>(
                  <div key={f} style={{display:'flex',gap:10,fontSize:'0.88rem'}}>
                    <span style={{color:p.color,flexShrink:0}}>✓</span>
                    <span style={{color:'#A29BCC'}}>{f}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleSubscribe(p.id)} 
                disabled={loadingPlan === p.id}
                className={`btn ${p.primary?'btn-primary':'btn-ghost'}`} 
                style={{width:'100%',justifyContent:'center',background:p.primary?undefined:(p.id==='annual'?p.color:undefined),color:p.id==='annual'?'#0F0A1A':undefined}}
              >
                {loadingPlan === p.id ? 'Loading...' : p.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{textAlign:'center',marginTop:48,color:'#A29BCC'}}>
          <div style={{fontSize:'1.5rem',marginBottom:8}}>🛡️</div>
          <p style={{fontWeight:600,marginBottom:4}}>30-Day Money-Back Guarantee</p>
          <p style={{fontSize:'0.88rem'}}>Not satisfied? Full refund, no questions asked. Because we hate predatory subscriptions too.</p>
        </div>

        <div style={{textAlign:'center',marginTop:48}}>
          <Link href="/dashboard" style={{color:'#8B7CF6',fontSize:'0.9rem'}}>← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
