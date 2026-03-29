'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { NotificationToast } from '@/components/Celebration'

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

const STEPS = [
  '📤 Uploading files',
  '🧠 AI extracting content',
  '📝 Generating lessons',
  '❓ Creating QBank questions',
  '🃏 Building flashcards',
  '🎉 All done!',
]

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState([]) // [{file, id, status, progress, error}]
  const [subject, setSubject] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()
  let fileCounter = useRef(0)

  function getFileInfo(f) {
    const mime = f.type
    const info = ACCEPTED[mime]
    return {
      name: f.name,
      size: f.size,
      icon: info?.icon || '📁',
      label: info?.label || f.name.split('.').pop().toUpperCase(),
      color: info?.color || '#6B6490',
    }
  }

  function addFiles(newFiles) {
    const valid = Array.from(newFiles).filter(f => ACCEPTED[f.type])
    const invalid = Array.from(newFiles).filter(f => !ACCEPTED[f.type])
    if (invalid.length > 0) {
      setToast({ message: `${invalid.length} unsupported file(s) skipped`, type: 'streak' })
    }
    const newEntries = valid.map(f => ({
      id: ++fileCounter.current,
      file: f,
      info: getFileInfo(f),
      status: 'queued', // queued | uploading | processing | done | error
      progress: 0,
      error: '',
    }))
    setFiles(prev => {
      const updated = [...prev, ...newEntries]
      if (updated.length > 10) {
        setToast({ message: 'Max 10 files at once. Excess files removed.', type: 'streak' })
        return updated.slice(0, 10)
      }
      return updated
    })
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleFileChange(e) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    setCurrentStep(1)
    setCompletedCount(0)

    let allDone = true
    for (const entry of files) {
      if (entry.status === 'done') continue

      // Update status
      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'uploading', progress: 10 } : f))

      const formData = new FormData()
      formData.append('file', entry.file)
      formData.append('subject', subject || entry.file.name.replace(/\.[^.]+$/, ''))

      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, progress: 30 } : f))
      setCurrentStep(2)

      try {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'processing', progress: 50 } : f))
        setCurrentStep(3)

        const res = await fetch('/api/documents/process', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Upload failed')

        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'done', progress: 100 } : f))
        setCurrentStep(4)
        setCompletedCount(c => c + 1)
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'error', error: err.message } : f))
        allDone = false
      }
    }

    setCurrentStep(5)
    setFiles(prev => prev.map(f => f.status === 'uploading' || f.status === 'processing' ? { ...f, status: 'done', progress: 100 } : f))

    const successCount = files.filter(f => f.status !== 'error').length
    setToast({ message: `+${successCount * 25} XP earned! ${successCount} file(s) processed.`, type: 'xp' })

    if (allDone && successCount > 0) {
      setTimeout(() => router.push('/learn'), 2500)
    } else if (successCount > 0) {
      setTimeout(() => setUploading(false), 2000)
    } else {
      setUploading(false)
    }
  }

  const queued = files.filter(f => f.status === 'queued').length
  const done = files.filter(f => f.status === 'done').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main className="main-content" style={{padding:'24px',paddingTop:'72px'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{marginBottom:24}}>
            <h1 style={{fontSize:'1.7rem',fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,letterSpacing:'-0.02em',marginBottom:6}}>
              📤 Upload Study Material
            </h1>
            <p style={{color:'#A29BCC',fontSize:'0.88rem',lineHeight:1.5}}>
              Upload up to 10 files at once — PDF, PPTX, DOCX, or TXT. AI generates lessons, QBank, and flashcards for each.
            </p>
          </div>

          {/* File type chips */}
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
            {Object.entries(ACCEPTED).map(([mime, info]) => (
              <div key={mime} style={{
                padding:'5px 10px',borderRadius:999,
                background:`${info.color}15`,border:`1px solid ${info.color}30`,
                fontSize:'0.72rem',fontWeight:700,color:info.color,display:'flex',alignItems:'center',gap:4
              }}>{info.icon} {info.label}</div>
            ))}
          </div>

          <div className="card" style={{padding:24}}>

            {/* Drop zone */}
            <div
              className={`upload-zone${dragging ? ' drag-over' : ''}`}
              style={{marginBottom:16,padding: files.length ? '24px' : '40px 24px'}}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.txt" multiple style={{display:'none'}} onChange={handleFileChange} />
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <div style={{fontSize:'2.5rem',animation: files.length ? 'none' : 'float 3s ease-in-out infinite'}}>
                  {files.length ? '📁' : '☁️'}
                </div>
                <p style={{fontWeight:700,fontSize:'0.95rem'}}>
                  {files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected — tap to add more` : 'Drop files here or click to browse'}
                </p>
                <p style={{color:'#A29BCC',fontSize:'0.8rem'}}>
                  {files.length ? `${queued} queued · ${done} done · ${errorCount} failed` : 'Up to 10 files · PDF, PPTX, DOCX, TXT, XLSX'}
                </p>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{marginBottom:20,display:'flex',flexDirection:'column',gap:8}}>
                {files.map(entry => (
                  <div key={entry.id} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'12px 16px',borderRadius:12,
                    background: entry.status === 'done' ? 'rgba(0,210,160,0.08)' :
                               entry.status === 'error' ? 'rgba(255,107,107,0.08)' :
                               entry.status === 'uploading' || entry.status === 'processing' ? 'rgba(108,92,231,0.08)' :
                               'rgba(255,255,255,0.03)',
                    border:`1px solid ${entry.status === 'done' ? 'rgba(0,210,160,0.2)' :
                                entry.status === 'error' ? 'rgba(255,107,107,0.2)' :
                                entry.status === 'uploading' || entry.status === 'processing' ? 'rgba(108,92,231,0.2)' :
                                'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{
                      width:40,height:40,borderRadius:10,
                      background:`${entry.info.color}20`,border:`1.5px solid ${entry.info.color}40`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'1.4rem',flexShrink:0
                    }}>
                      {entry.info.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:'0.88rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {entry.info.name}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                        {entry.status === 'queued' && <span style={{color:'#6B6490',fontSize:'0.72rem'}}>Waiting...</span>}
                        {entry.status === 'uploading' && <span style={{color:'#8B7CF6',fontSize:'0.72rem'}}>Uploading...</span>}
                        {entry.status === 'processing' && <span style={{color:'#FDCB6E',fontSize:'0.72rem'}}>AI processing...</span>}
                        {entry.status === 'done' && <span style={{color:'#00D2A0',fontSize:'0.72rem'}}>✓ Done · {(entry.file.size/1024/1024).toFixed(1)} MB</span>}
                        {entry.status === 'error' && <span style={{color:'#FF6B6B',fontSize:'0.72rem'}}>✗ {entry.error || 'Failed'}</span>}
                        {entry.status !== 'done' && entry.status !== 'error' && entry.status !== 'queued' && (
                          <div className="progress-bar" style={{flex:1}}>
                            <div className="progress-fill" style={{width:`${entry.progress}%`}} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      {entry.status === 'done' && <span style={{fontSize:'1.2rem'}}>✅</span>}
                      {entry.status === 'error' && <span style={{fontSize:'1.2rem'}}>❌</span>}
                      {(entry.status === 'queued' && !uploading) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(entry.id) }}
                          style={{background:'transparent',border:'none',color:'#6B6490',cursor:'pointer',fontSize:'0.9rem',padding:4}}
                          title="Remove"
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subject */}
            <div style={{marginBottom:16}}>
              <label className="input-label">Subject / Topic Name <span style={{color:'#6B6490'}}>(optional)</span></label>
              <input
                className="input"
                placeholder="e.g. Cardiovascular Pathology, USMLE Step 1..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={uploading}
              />
            </div>

            {/* Processing steps */}
            {uploading && (
              <div style={{marginBottom:16,padding:'14px 16px',borderRadius:12,background:'rgba(108,92,231,0.08)',border:'1px solid rgba(108,92,231,0.15)'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <span className="animate-spin" style={{fontSize:'1.2rem',display:'inline-block'}}>⟳</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.9rem',color:'#8B7CF6'}}>
                      Processing {files.length} file{files.length > 1 ? 's' : ''}...
                    </div>
                    <div style={{color:'#A29BCC',fontSize:'0.78rem'}}>
                      File {done + 1} of {files.length} · {STEPS[currentStep - 1] || STEPS[0]}
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${(done / files.length) * 100}%`}} />
                </div>
              </div>
            )}

            {/* What AI generates */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginBottom:20}}>
              {AI_OUTPUTS.map(output => (
                <div key={output.label} style={{
                  padding:'12px 10px',borderRadius:10,
                  background:`${output.color}10`,border:`1px solid ${output.color}25`,
                  textAlign:'center'
                }}>
                  <div style={{fontSize:'1.3rem',marginBottom:4}}>{output.icon}</div>
                  <div style={{fontWeight:700,fontSize:'0.75rem',color:output.color,marginBottom:2}}>{output.label}</div>
                  <div style={{fontSize:'0.65rem',color:'#6B6490',lineHeight:1.4}}>{output.desc}</div>
                </div>
              ))}
            </div>

            {toast && (
              <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {files.length > 0 && !uploading && (
              <button
                className="btn btn-primary"
                style={{width:'100%',padding:'15px',fontSize:'1rem'}}
                onClick={handleUpload}
              >
                ⚡ Generate All ({files.length} file{files.length > 1 ? 's' : ''})
              </button>
            )}

            {files.length === 0 && (
              <div style={{textAlign:'center',color:'#6B6490',fontSize:'0.8rem',padding:'8px'}}>
                Select files above to start generating
              </div>
            )}

            <p style={{textAlign:'center',color:'#6B6490',fontSize:'0.72rem',marginTop:10}}>
              {uploading ? 'Processing can take 1-3 min for multiple files' : 'Up to 10 files · +25 XP per file · Processing 30-90 sec each'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}