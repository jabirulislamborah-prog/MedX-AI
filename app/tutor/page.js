'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function TutorPage() {
  const [messages, setMessages] = useState([
    { role:'assistant', content:"Hello! I'm your AI Clinical Tutor 🧠\n\nI use the Socratic method — I'll guide you to answers through questions rather than just telling you. What medical concept would you like to explore today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m=>[...m, { role:'user', content:userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:userMsg, conversation_id:convId })
      })

      if (!res.ok) {
        throw new Error('Failed to connect to AI')
      }

      if (!convId) {
        const cid = res.headers.get('X-Conversation-Id')
        if (cid) setConvId(cid)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ''
      setMessages(m=>[...m, { role:'assistant', content:'' }])

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim()
            if (data === '[DONE]') break
            try {
              const { text: chunk } = JSON.parse(data)
              assistantMsg += chunk
              setMessages(m=>[...m.slice(0,-1), { role:'assistant', content:assistantMsg }])
            } catch (err) {
              console.error('Failed to parse SSE chunk:', data, err)
            }
          }
        }
      }
    } catch (e) {
      console.error('Chat error:', e)
      setMessages(m=>[...m, { role:'assistant', content:'I apologize, but I encountered an error processing your request. This could be due to rate limits or a temporary service issue. Please try again in a moment.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{display:'flex',flexDirection:'column',height:'100vh',padding:0}}>
        {/* Header */}
        <div style={{padding:'24px 32px',borderBottom:'1px solid #2D2654',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🧠</div>
          <div>
            <h1 style={{fontSize:'1.1rem',marginBottom:2}}>AI Clinical Tutor</h1>
            <p style={{color:'#A29BCC',fontSize:'0.8rem'}}>Socratic method • Grounded in your materials • RAG-powered</p>
          </div>
          <div style={{marginLeft:'auto'}}><span className="badge badge-success">Online</span></div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflow:'auto',padding:'24px 32px',display:'flex',flexDirection:'column',gap:16}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
              {m.role==='assistant'&&<div style={{width:32,height:32,background:'linear-gradient(135deg,#6C5CE7,#00D2A0)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',flexShrink:0,marginRight:10,alignSelf:'flex-end'}}>🧠</div>}
              <div className={`chat-bubble ${m.role}`} style={{whiteSpace:'pre-wrap'}}>
                {m.content}{m.role==='assistant'&&loading&&i===messages.length-1&&<span className="animate-pulse">▋</span>}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{padding:'20px 32px',borderTop:'1px solid #2D2654',display:'flex',gap:12}}>
          <input className="input" placeholder="Ask about a concept, clinical scenario, or mechanism..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} disabled={loading} style={{flex:1}} />
          <button className="btn btn-primary" onClick={send} disabled={loading||!input.trim()}>
            {loading?<span className="animate-spin" style={{display:'inline-block'}}>⟳</span>:'→'}
          </button>
        </div>
        <p style={{textAlign:'center',padding:'0 0 12px',color:'#6B6490',fontSize:'0.72rem'}}>For educational purposes only. Not for clinical decision-making.</p>
      </main>
    </div>
  )
}
