import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'MedDrill | The AI-Powered Med School QBank',
  description: 'Stop watching 810-hour lectures. Upload your PDFs and let AI generate USMLE QBank vignettes, Duolingo-style quizzes, and Spaced Repetition flashcards instantly.',
  openGraph: {
    title: 'MedDrill | AI Medical QBank & Flashcards',
    description: 'Transform your medical PDFs into interactive quizzes and spaced repetition flashcards powered by AI.',
    url: 'https://meddrill.com',
    siteName: 'MedDrill',
    images: [{ url: '/assets/hero-dashboard.png', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0F0A1A',color:'#F8F7FF',fontFamily:"'Inter',sans-serif"}}>
      {/* Nav */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px',borderBottom:'1px solid #2D2654',position:'sticky',top:0,background:'rgba(15,10,26,0.9)',backdropFilter:'blur(20px)',zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>⚕️</div>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.3rem'}}>MedX AI</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{textAlign:'center',padding:'80px 24px 60px',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%, rgba(108,92,231,0.2) 0%, transparent 60%)',pointerEvents:'none'}} />
        
        <div className="badge badge-success animate-fade-up" style={{marginBottom:24,display:'inline-flex'}}>🎓 The Duolingo for Medicine</div>
        
        <h1 className="animate-fade-up" style={{maxWidth:800,margin:'0 auto 24px',lineHeight:1.1,animationDelay:'0.1s'}}>
          Stop watching{' '}
          <span className="text-gradient">810-hour lectures.</span>
          <br />Start drilling what matters.
        </h1>
        
        <p className="animate-fade-up" style={{fontSize:'1.2rem',color:'#A29BCC',maxWidth:560,margin:'0 auto 40px',lineHeight:1.7,animationDelay:'0.2s'}}>
          Upload your PDFs. AI generates Duolingo-style lessons, QBank questions, and smart flashcards instantly.
          Battle friends. Climb the leaderboard. Ace USMLE & NEET-PG.
        </p>
        
        <div className="animate-fade-up" style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:40,animationDelay:'0.3s'}}>
          <Link href="/signup" className="btn btn-primary btn-lg">🚀 Start Free Today</Link>
          <Link href="/login" className="btn btn-ghost btn-lg">See Demo →</Link>
        </div>
        
        {/* Sleek Hero Dashboard Image */}
        <div className="animate-zoom" style={{maxWidth:1000,width:'100%',margin:'0 auto',borderRadius:20,border:'1px solid rgba(108,92,231,0.3)',boxShadow:'0 20px 80px -10px rgba(108,92,231,0.25)',overflow:'hidden',animationDelay:'0.4s',background:'#1A1432'}}>
          <Image src="/assets/hero-dashboard.png" alt="MedX AI Interactive Dashboard Mockup" width={1000} height={600} style={{width:'100%',height:'auto',display:'block',opacity:0.95}} priority />
        </div>
        <p style={{marginTop:24,fontSize:'0.85rem',color:'#6B6490'}}>No credit card required • Free tier available</p>
      </section>

      {/* Stats */}
      <section style={{padding:'60px 24px 80px',position:'relative',zIndex:2}}>
        <div className="container" style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
          {[['🔥','Streak System','Like Duolingo, but for boards'],['⚔️','Battle Mode','10-question PvP duels'],['🧠','AI Tutor','Socratic learning — never gives answers'],['📊','Smart Scheduling','Half-life regression SRS']].map(([icon,title,desc])=>(
            <div key={title} className="card card-glow" style={{flex:'1',minWidth:200,textAlign:'center',padding:32}}>
              <div style={{fontSize:'2rem',marginBottom:12}}>{icon}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:8}}>{title}</div>
              <div style={{color:'#A29BCC',fontSize:'0.88rem'}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{padding:'80px 24px',background:'rgba(26,20,50,0.5)',borderTop:'1px solid #2D2654',borderBottom:'1px solid #2D2654'}}>
        <div className="container">
          <h2 style={{textAlign:'center',marginBottom:16}}>How It Works</h2>
          <p style={{textAlign:'center',color:'#A29BCC',marginBottom:60}}>Three steps to medical mastery</p>
          <div className="grid-3">
            {[
              ['1','📄','Upload Your Notes','Drop in your PDFs, textbooks, or lecture slides. Our AI reads everything.'],
              ['2','✨','AI Generates Content','Duolingo-style lessons, QBank vignettes, and flashcards — instantly.'],
              ['3','🏆','Drill, Battle & Win','Study daily, battle friends, climb leaderboards, ace your boards.'],
            ].map(([num,icon,title,desc])=>(
              <div key={num} className="card" style={{textAlign:'center',padding:40,position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-20,right:-20,fontSize:'8rem',color:'rgba(255,255,255,0.02)',fontWeight:900}}>{num}</div>
                <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'1.4rem',margin:'0 auto 24px',boxShadow:'0 8px 30px rgba(108,92,231,0.4)'}}>{icon}</div>
                <h3 style={{marginBottom:12,fontSize:'1.2rem',position:'relative'}}>{title}</h3>
                <p style={{color:'#A29BCC',fontSize:'0.9rem',lineHeight:1.7,position:'relative'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'100px 24px',textAlign:'center'}}>
        <h2 style={{marginBottom:16}}>Ready to <span className="text-gradient">dominate your boards?</span></h2>
        <p style={{color:'#A29BCC',marginBottom:40,fontSize:'1.1rem'}}>Join thousands of med students drilling smarter, not longer.</p>
        <Link href="/signup" className="btn btn-primary btn-lg" style={{boxShadow:'0 10px 40px -10px #6C5CE7'}}>Start Drilling Free →</Link>
      </section>

      <footer style={{padding:'40px',textAlign:'center',borderTop:'1px solid #2D2654',color:'#6B6490',fontSize:'0.85rem'}}>
        © 2026 MedX AI (MedDrill). For educational purposes only. Not for clinical use.
      </footer>
    </div>
  )
}
