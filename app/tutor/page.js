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
  const textareaRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

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
    <div style={{display:'flex', height:'100vh'}}>
      <Sidebar />
      <main className="main-content" style={{display:'flex', flexDirection:'column', height:'100vh', padding:0, marginLeft:0}}>
        
        {/* Minimal Header */}
        <div style={{
          padding:'16px 24px', borderBottom:'1px solid #E5E7EB',
          display:'flex', alignItems:'center', gap:12, background:'#F9FAFB',
          position:'sticky', top:0, zIndex:10
        }}>
          <div style={{
            width:36, height:36, background:'linear-gradient(135deg,#10B981,#059669)',
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1rem', color:'white', fontWeight:700
          }}>🧠</div>
          <div>
            <h1 style={{fontSize:'1rem', fontWeight:600, color:'#111827', margin:0}}>AI Clinical Tutor</h1>
            <p style={{color:'#6B7280', fontSize:'0.75rem', margin:0}}>Socratic method • Grounded in your materials</p>
          </div>
        </div>

        {/* Messages Container - ChatGPT Style */}
        <div style={{
          flex:1, overflow:'auto', padding:'20px 24px',
          display:'flex', flexDirection:'column', gap:0,
          background:'white'
        }}>
          {messages.map((m,i)=>(
            <div key={i} style={{
              display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start',
              padding:'4px 0'
            }}>
              <div style={{
                display:'flex', gap:12, maxWidth:'85%',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                alignItems:'flex-start'
              }}>
                {/* Avatar */}
                {m.role === 'assistant' ? (
                  <div style={{
                    width:32, height:32, background:'#10B981',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.9rem', flexShrink:0
                  }}>🧠</div>
                ) : (
                  <div style={{
                    width:32, height:32, background:'#F3F4F6',
                    borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.9rem', flexShrink:0
                  }}>👤</div>
                )}
                
                {/* Message Bubble - ChatGPT Style */}
                <div style={{
                  padding:'12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize:'0.95rem', lineHeight:1.6, whiteSpace:'pre-wrap',
                  background: m.role === 'user' ? '#10B981' : '#F3F4F6',
                  color: m.role === 'user' ? 'white' : '#1F2937',
                  border: m.role === 'user' ? 'none' : '1px solid #E5E7EB'
                }}>
                  {m.content}{m.role==='assistant'&&loading&&i===messages.length-1&&<span style={{opacity:0.5}}> ▋</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area - ChatGPT Style */}
        <div style={{
          padding:'16px 24px 24px', borderTop:'1px solid #E5E7EB',
          background:'white'
        }}>
          <div style={{
            display:'flex', gap:12, maxWidth:'800px', margin:'0 auto',
            alignItems:'flex-end'
          }}>
            <textarea
              ref={textareaRef}
              className="input"
              placeholder="Ask about a concept, clinical scenario, or mechanism..."
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{
                if (e.key==='Enter'&&!e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              disabled={loading}
              rows={1}
              style={{
                flex:1, resize:'none', minHeight:'48px', maxHeight:'200px',
                borderRadius:'12px', padding:'12px 16px',
                background:'#F3F4F6', border:'1px solid #E5E7EB',
                fontSize:'0.95rem'
              }}
            />
            <button
              onClick={send}
              disabled={loading||!input.trim()}
              style={{
                width:44, height:44, borderRadius:12,
                background: input.trim() ? '#10B981' : '#E5E7EB',
                color: input.trim() ? 'white' : '#9CA3AF',
                border:'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem', transition:'all 0.2s'
              }}
            >
              {loading ? '...' : '↑'}
            </button>
          </div>
          <p style={{
            textAlign:'center', padding:'8px 0 0', color:'#9CA3AF',
            fontSize:'0.7rem', margin:'4px auto 0', maxWidth:'800px'
          }}>
            For educational purposes only. Not for clinical decision-making.
          </p>
        </div>
      </main>
    </div>
  )
}
