import OpenAI from 'openai'
import { CohereClient } from 'cohere-ai'

const GROQ_BASE = 'https://api.groq.com/openai/v1'
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: GROQ_BASE,
})

const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'unused',
  baseURL: OPENROUTER_BASE,
  defaultHeaders: {
    'HTTP-Referer': 'https://med-x-ai-eight.vercel.app',
    'X-Title': 'MedX AI',
  },
})

let cohereClient = null

function getCohere() {
  if (!cohereClient && process.env.COHERE_API_KEY) {
    cohereClient = new CohereClient({
      token: process.env.COHERE_API_KEY,
    })
  }
  return cohereClient
}

const MODELS = {
  groq: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
}

// Helper: call Gemini for JSON generation
async function callGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

// Helper: call Gemini for streaming
async function* streamGemini(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContentStream(prompt)
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) yield text
  }
}

export async function generateJSON(prompt, systemPrompt = '') {
  const jsonInstruction = 'Respond ONLY with valid JSON. No markdown code fences, no explanation, no extra text — just the JSON object.'
  
  console.log('[AI] generateJSON called, prompt length:', prompt.length)
  
  // Provider order: Gemini first (highest rate limit), then Groq, then OpenRouter
  const providers = ['gemini', 'groq', 'openrouter']

  for (const name of providers) {
    try {
      console.log(`[AI] Trying ${name}...`)
      let rawText = ''

      if (name === 'gemini') {
        rawText = await callGemini(`${systemPrompt}\n\n${prompt}\n\n${jsonInstruction}`)
      } else {
        const client = name === 'groq' ? groqClient : openrouterClient
        const model = name === 'groq' ? MODELS.groq : MODELS.openrouter
        const response = await client.chat.completions.create({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: `${prompt}\n\n${jsonInstruction}` }
          ],
          temperature: 0.3,
          max_tokens: 4096,
        })
        rawText = response.choices[0].message.content
      }
      
      // Robust JSON extraction
      let text = rawText.trim()
      // Strip markdown fences
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      // Try to find JSON object/array in text
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (jsonMatch) text = jsonMatch[0]
      
      console.log(`[AI] ${name} response length:`, text.length)
      const parsed = JSON.parse(text)
      console.log(`[AI] ${name} JSON parsed successfully`)
      return parsed
    } catch (e) {
      console.error(`[AI] ${name} failed:`, e.message?.substring(0, 200))
      continue
    }
  }
  
  throw new Error('All AI providers failed')
}

export async function* generateStream(prompt, systemPrompt = '') {
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

  // Provider order: Gemini first, then Groq, then OpenRouter
  const providers = ['gemini', 'groq', 'openrouter']

  for (const name of providers) {
    try {
      console.log(`[AI Stream] Trying ${name}...`)
      
      if (name === 'gemini') {
        let yielded = false
        for await (const text of streamGemini(fullPrompt)) {
          yield text
          yielded = true
        }
        if (yielded) return
        throw new Error('Gemini stream produced no output')
      }

      const client = name === 'groq' ? groqClient : openrouterClient
      const model = name === 'groq' ? MODELS.groq : MODELS.openrouter
      
      const stream = await client.chat.completions.create({
        model,
        messages,
        stream: true,
        max_tokens: 2048,
      })

      let yielded = false
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) {
          yield delta
          yielded = true
        }
      }
      if (yielded) return
      throw new Error(`${name} stream produced no output`)
    } catch (e) {
      console.error(`[AI Stream] ${name} failed:`, e.message?.substring(0, 200))
      continue
    }
  }
  
  throw new Error('All streaming providers failed')
}

export async function generateEmbedding(text) {
  const cohere = getCohere()
  
  if (cohere) {
    try {
      console.log('[Embedding] Trying Cohere...')
      const response = await cohere.embed({
        texts: [text],
        model: 'embed-english-light-v3.0',
        inputType: 'search_document',
      })
      console.log('[Embedding] Cohere success, length:', response.embeddings[0]?.length)
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
  console.log('[Embedding] Gemini success, values length:', result.embedding.values?.length)
  return result.embedding.values
}

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