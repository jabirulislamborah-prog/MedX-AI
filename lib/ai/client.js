import { CohereClient } from 'cohere-ai'

// ===== Model Config =====
const MODELS = {
  groq: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
  cerebras: 'llama3.1-8b',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
}

let cohereClient = null
function getCohere() {
  if (!cohereClient && process.env.COHERE_API_KEY) {
    cohereClient = new CohereClient({ token: process.env.COHERE_API_KEY })
  }
  return cohereClient
}

// ===== Provider List (order = priority) =====
function getProviders() {
  const providers = []

  // 1. Groq — fastest, best quality (70B), but strict rate limits
  if (process.env.GROQ_API_KEY) {
    providers.push({ 
      name: 'groq', 
      model: MODELS.groq, 
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY
    })
  }

  // 2. Cerebras — 1M tokens/day, very fast
  if (process.env.CEREBRAS_API_KEY) {
    providers.push({ 
      name: 'cerebras', 
      model: MODELS.cerebras,
      url: 'https://api.cerebras.ai/v1/chat/completions',
      key: process.env.CEREBRAS_API_KEY
    })
  }

  // 3. Gemini — Google, generous but requires separate SDK
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: 'gemini', model: 'gemini-1.5-flash' })
  }

  // 4. OpenRouter — aggregator fallback
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ 
      name: 'openrouter', 
      model: MODELS.openrouter,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      headers: {
        'HTTP-Referer': 'https://med-x-ai-eight.vercel.app',
        'X-Title': 'MedDrill',
      }
    })
  }

  return providers
}

// ===== Gemini Helpers =====
async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function* streamGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContentStream(prompt)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

// ===== JSON Generation =====
export async function generateJSON(prompt, systemPrompt = '') {
  const jsonInstruction = 'Respond ONLY with valid JSON. No markdown code fences, no explanation, no extra text — just the raw JSON object.'
  console.log('[AI] generateJSON called, prompt length:', prompt.length)

  for (const provider of getProviders()) {
    try {
      console.log(`[AI] Trying ${provider.name} (${provider.model})...`)
      let rawText = ''

      if (provider.name === 'gemini') {
        rawText = await callGemini(`${systemPrompt}\n\n${prompt}\n\n${jsonInstruction}`)
      } else {
        // OpenAI-compatible providers using native fetch
        const messages = []
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
        messages.push({ role: 'user', content: `${prompt}\n\n${jsonInstruction}` })

        const headers = {
          'Authorization': `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
          ...(provider.headers || {})
        }

        const res = await fetch(provider.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages,
            temperature: 0.3,
            max_tokens: 4096,
          }),
        })

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${await res.text()}`)
        }

        const data = await res.json()
        rawText = data.choices[0].message.content
      }

      // Robust JSON extraction
      let text = (rawText || '').trim()
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (jsonMatch) text = jsonMatch[0]

      const parsed = JSON.parse(text)
      console.log(`[AI] ${provider.name} JSON parsed OK`)
      return parsed
    } catch (e) {
      console.error(`[AI] ${provider.name} JSON failed:`, e.message?.substring(0, 200))
      continue
    }
  }

  throw new Error('All AI providers failed to generate JSON')
}

// ===== Streaming =====
export async function* generateStream(prompt, systemPrompt = '') {
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

  for (const provider of getProviders()) {
    try {
      console.log(`[AI Stream] Trying ${provider.name} (${provider.model})...`)

      if (provider.name === 'gemini') {
        let yielded = false
        for await (const text of streamGemini(fullPrompt)) {
          yield text
          yielded = true
        }
        if (yielded) return
        throw new Error('Gemini stream produced no output')
      }

      // OpenAI-compatible streaming using native fetch
      const messages = []
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
      messages.push({ role: 'user', content: prompt })

      const headers = {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
        ...(provider.headers || {})
      }

      const res = await fetch(provider.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: provider.model,
          messages,
          stream: true,
          max_tokens: 2048,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${await res.text()}`)
      }

      // Parse SSE stream manually
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let yielded = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          
          const dataStr = trimmed.substring(6).trim()
          if (dataStr === '[DONE]') break
          
          try {
            const data = JSON.parse(dataStr)
            const delta = data.choices?.[0]?.delta?.content
            if (delta) {
              yield delta
              yielded = true
            }
          } catch (e) {
            // Ignore parse errors on incomplete chunks
          }
        }
      }

      if (yielded) return
      throw new Error(`${provider.name} stream produced no output`)
    } catch (e) {
      console.error(`[AI Stream] ${provider.name} failed:`, e.message?.substring(0, 200))
      continue
    }
  }

  throw new Error('All streaming providers failed')
}

// ===== Embeddings =====
export async function generateEmbedding(text) {
  const cohere = getCohere()

  if (cohere) {
    try {
      const response = await cohere.embed({
        texts: [text],
        model: 'embed-english-light-v3.0',
        inputType: 'search_document',
      })
      return response.embeddings[0]
    } catch (e) {
      console.error('[Embedding] Cohere failed:', e.message)
    }
  }

  console.log('[Embedding] Falling back to Gemini...')
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// ===== Medical Search Utilities =====
export async function searchMedicalConditions(query) {
  try {
    const res = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?df=description&terms=${encodeURIComponent(query)}&maxList=10`
    )
    const data = await res.json()
    return data.results || []
  } catch (e) {
    console.error('Clinical tables search failed:', e.message)
    return []
  }
}

export async function searchProcedures(query) {
  try {
    const res = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/procedures/v3/search?df=description&terms=${encodeURIComponent(query)}&maxList=10`
    )
    const data = await res.json()
    return data.results || []
  } catch (e) {
    console.error('Clinical tables search failed:', e.message)
    return []
  }
}