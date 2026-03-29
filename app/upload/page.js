'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Celebration, { NotificationToast } from '@/components/Celebration'

const ACCEPTED = {
  'application/pdf': { icon: '📄', label: 'PDF', color: '#FF6B6B' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📊', label: 'PPTX', color: '#FF6B35' },
  'application/vnd.ms-powerpoint': { icon: '📊', label: 'PPT', color: '#FF6B35' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'DOCX', color: '#3B82F6' },
  'application/msword': { icon: '📝', label: 'DOC', color: '#3B82F6' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📈', label: 'XLSX', color: '#00D2A0' },
  'text/plain': { icon: '📃', label: 'TXT', color: '#A29BCC' },
}

const AI_OUTPUTS = [
  { icon: '📝', label: 'Duolingo Drills', desc: 'Bite-sized lessons with gamified Q&A', color: '#6C5CE7' },
  { icon: '❓', label: 'QBank Questions', desc: 'Board-style vignettes + explanations', color: '#3B82F6' },
  { icon: '🃏', label: 'Flashcards (SRS)', desc: 'Spaced repetition — never forget', color: '#00D2A0' },
  { icon: '🧠', label: 'AI Tutor Context', desc: 'Chat gets smarter with your material', color: '#A855F7' },
]

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | uploading | processing | done
  const fileRef = useRef()

  function getFileInfo(f) {
    if (!f) return null
    const mime = f.type
    const info = ACCEPTED[mime]
    return {
      name: f.name,
      size: f.size,
      icon: info?.icon || '📁',
      label: info?.label || f.name.split('.').pop().toUpperCase(),
      color: info?.color || '#6B6490',
      ext: f.name.split('.').pop().toLowerCase(),
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && ACCEPTED[f.type]) {
      setFile(f); setError('')
    } else {
      setError('Unsupported file type. Try PDF, PPTX, DOCX, or TXT.')
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (f && ACCEPTED[f.type]) {
      setFile(f); setError('')
    } else if (f) {
      setError('Unsupported file type. Try PDF, PPTX, DOCX, or TXT.')
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true); setError(''); setPhase('uploading')
    setProgress(`📤 Uploading ${file.name}...`)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject || file.name.replace(/\.[^.]+$/, ''))

    try {
      setPhase('processing')
      setProgress('🧠 AI is analyzing your document...')

      const res = await fetch('/api/documents/process', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setPhase('done')
      setProgress('🎉 Processing complete! Redirecting...')
      setToast({ message: `+25 XP earned! Your ${file.name.split('.').pop().toUpperCase()} is ready.`, type: 'xp' })
      setTimeout(() => router.push(`/learn/${data.document_id}`), 2000)
    } catch (err) {
      setError(err.message); setUploading(false); setPhase('idle'); setProgress('')
    }
  }

  const fileInfo = getFileInfo(file)

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{marginBottom:28}}>
            <h1 style={{fontSize:'1.9rem',fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,letterSpacing:'-0.03em',marginBottom:6}}>
              📤 Upload Study Material
            </h1>
            <p style={{color:'#A29BCC',lineHeight:1.6}}>
              Drop in any file — PDF, PPTX slides, DOCX notes, or TXT. AI instantly generates lessons, QBank, and flashcards.
            </p>
          </div>

          {/* File type chips */}
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:20}}>
            {Object.entries(ACCEPTED).map(([mime, info]) => (
              <div key={mime} style={{
                padding:'6px 12px',borderRadius:999,
                background:`${info.color}15`,border:`1px solid ${info.color}30`,
                fontSize:'0.78rem',fontWeight:700,color:info.color,display:'flex',alignItems:'center',gap:6
              }}>
                <span>{info.icon}</span> {info.label}
              </div>
            ))}
          </div>

          <div className="card" style={{padding:28}}>
            {/* Drop zone */}
            <div
              className={`upload-zone${dragging ? ' drag-over' : ''}`}
              style={{marginBottom:24}}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept={Object.keys(ACCEPTED).join(',')} style={{display:'none'}} onChange={handleFileChange} />
              
              {fileInfo ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
                  <div style={{
                    width:72,height:72,borderRadius:18,
                    background:`${fileInfo.color}15`,border:`2px solid ${fileInfo.color}40`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.4rem'
                  }}>
                    {fileInfo.icon}
                  </div>
                  <div>
                    <p style={{fontWeight:700,fontSize:'1rem',marginBottom:4}}>{fileInfo.name}</p>
                    <p style={{color:'#A29BCC',fontSize:'0.85rem'}}>{(fileInfo.size / 1024 / 1024).toFixed(1)} MB · {fileInfo.label} file · tap to change</p>
                  </div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                  <div style={{fontSize:'3.5rem',animation:'float 3s ease-in-out infinite'}}>☁️</div>
                  <p style={{fontWeight:700,fontSize:'1.05rem',marginBottom:4}}>Drop your file here</p>
                  <p style={{color:'#A29BCC',fontSize:'0.88rem'}}>PDF, PPTX, DOCX, TXT, or XLSX — any format works</p>
                  <div style={{
                    marginTop:8,padding:'6px 16px',borderRadius:999,
                    background:'rgba(108,92,231,0.1)',border:'1px solid rgba(108,92,231,0.2)',
                    color:'#8B7CF6',fontSize:'0.78rem',fontWeight:600
                  }}>
                    Or click to browse files
                  </div>
                </div>
              )}
            </div>

            {/* Processing steps */}
            {phase !== 'idle' && (
              <div style={{marginBottom:20}}>
                {[
                  { label: '📤 Uploading file', done: phase !== 'idle' },
                  { label: '🧠 AI extracting content', done: phase === 'processing' || phase === 'done' },
                  { label: '📝 Generating lessons', done: phase === 'processing' || phase === 'done' },
                  { label: '❓ Creating QBank questions', done: phase === 'done' },
                  { label: '🃏 Building flashcards', done: phase === 'done' },
                ].map((step, i) => (
                  <div key={i} style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',
                    color: step.done ? '#00D2A0' : '#6B6490',
                    fontSize:'0.88rem',fontWeight: step.done ? 600 : 400
                  }}>
                    <span style={{fontSize:'1.1rem'}}>{step.done ? '✅' : '○'}</span>
                    {step.label}
                  </div>
                ))}
              </div>
            )}

            {/* Subject */}
            <div style={{marginBottom:20}}>
              <label className="input-label">Subject / Topic Name <span style={{color:'#6B6490'}}>(optional)</span></label>
              <input
                className="input"
                placeholder="e.g. Cardiovascular Pathology, USMLE Step 1 Pharmacology..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* What AI generates */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:24}}>
              {AI_OUTPUTS.map(output => (
                <div key={output.label} style={{
                  padding:'14px 12px',borderRadius:12,
                  background:`${output.color}10`,border:`1px solid ${output.color}25`,
                  textAlign:'center'
                }}>
                  <div style={{fontSize:'1.4rem',marginBottom:6}}>{output.icon}</div>
                  <div style={{fontWeight:700,fontSize:'0.82rem',color:output.color,marginBottom:2}}>{output.label}</div>
                  <div style={{fontSize:'0.68rem',color:'#6B6490',lineHeight:1.4}}>{output.desc}</div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.3)',
                borderRadius:10,padding:'12px 16px',color:'#FF6B6B',fontSize:'0.88rem',
                marginBottom:16,display:'flex',alignItems:'center',gap:10
              }}>
                <span style={{fontSize:'1.1rem'}}>⚠️</span>
                {error}
              </div>
            )}

            {uploading && (
              <div style={{
                background:'rgba(0,210,160,0.1)',border:'1px solid rgba(0,210,160,0.3)',
                borderRadius:10,padding:'14px 18px',color:'#00D2A0',
                marginBottom:16,display:'flex',alignItems:'center',gap:10
              }}>
                <span className="animate-spin" style={{display:'inline-block',fontSize:'1.1rem'}}>⟳</span>
                <span style={{fontWeight:600,fontSize:'0.9rem'}}>{progress}</span>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{width:'100%',padding:'16px',fontSize:'1.05rem'}}
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? '⟳ Processing with AI...' : '⚡ Generate My Study Materials'}
            </button>

            <p style={{textAlign:'center',color:'#6B6490',fontSize:'0.78rem',marginTop:12}}>
              Processing takes 30–90 seconds · You'll earn +25 XP when ready
            </p>
          </div>
        </div>
      </main>

      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}