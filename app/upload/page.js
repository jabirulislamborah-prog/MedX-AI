'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else setError('Please upload a PDF file')
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true); setError('')
    setProgress('📤 Uploading PDF...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject || file.name.replace('.pdf',''))

    try {
      const res = await fetch('/api/documents/process', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setProgress('✅ Processing complete! Redirecting...')
      setTimeout(() => router.push(`/learn/${data.document_id}`), 1500)
    } catch (err) {
      setError(err.message); setUploading(false); setProgress('')
    }
  }

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'32px',maxWidth:800}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontSize:'1.8rem',marginBottom:4}}>📤 Upload Study Material</h1>
          <p style={{color:'#A29BCC'}}>Upload a PDF and AI will generate lessons, QBank questions, and flashcards instantly</p>
        </div>

        <div className="card" style={{padding:32}}>
          {/* Drop zone */}
          <div
            className={`upload-zone${dragging?' drag-over':''}`}
            style={{marginBottom:24}}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(f)setFile(f)}} />
            <div style={{fontSize:'3rem',marginBottom:12}}>{file?'📄':'☁️'}</div>
            {file ? (
              <div>
                <p style={{fontWeight:600,marginBottom:4}}>{file.name}</p>
                <p style={{color:'#A29BCC',fontSize:'0.85rem'}}>{(file.size/1024/1024).toFixed(1)} MB • Click to change</p>
              </div>
            ) : (
              <div>
                <p style={{fontWeight:600,marginBottom:4}}>Drop your PDF here or click to browse</p>
                <p style={{color:'#A29BCC',fontSize:'0.85rem'}}>Textbooks, lecture slides, clinical notes — any PDF works</p>
              </div>
            )}
          </div>

          {/* Subject */}
          <div style={{marginBottom:24}}>
            <label className="input-label">Subject / Topic Name</label>
            <input className="input" placeholder="e.g. Cardiovascular Pathology, Pharmacology USMLE..." value={subject} onChange={e=>setSubject(e.target.value)} />
          </div>

          {/* What AI will generate */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
            {[['📝','Lessons','Duolingo-style drills'],['❓','QBank','Board-style vignettes'],['🃏','Flashcards','SRS-ready cards']].map(([icon,t,d])=>(
              <div key={t} style={{background:'rgba(108,92,231,0.08)',border:'1px solid rgba(108,92,231,0.2)',borderRadius:10,padding:'14px',textAlign:'center'}}>
                <div style={{fontSize:'1.5rem',marginBottom:4}}>{icon}</div>
                <div style={{fontWeight:600,fontSize:'0.85rem',marginBottom:2}}>{t}</div>
                <div style={{color:'#6B6490',fontSize:'0.75rem'}}>{d}</div>
              </div>
            ))}
          </div>

          {error && <div style={{background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.3)',borderRadius:8,padding:'10px 14px',color:'#FF6B6B',fontSize:'0.88rem',marginBottom:16}}>{error}</div>}

          {uploading && (
            <div style={{background:'rgba(0,210,160,0.1)',border:'1px solid rgba(0,210,160,0.3)',borderRadius:8,padding:'14px',color:'#00D2A0',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
              <span className="animate-spin" style={{display:'inline-block'}}>⟳</span>
              <span>{progress}</span>
            </div>
          )}

          <button className="btn btn-primary" style={{width:'100%',padding:'14px'}} onClick={handleUpload} disabled={!file||uploading}>
            {uploading ? '⟳ Processing...' : '⚡ Generate AI Lessons'}
          </button>

          <p style={{textAlign:'center',color:'#6B6490',fontSize:'0.8rem',marginTop:12}}>
            Processing takes 30–90 seconds for a typical PDF
          </p>
        </div>
      </main>
    </div>
  )
}
