import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function generateJSON(prompt, systemPrompt = '') {
  const full = `${systemPrompt ? systemPrompt + '\n\n' : ''}${prompt}\n\nRespond ONLY with valid JSON. No markdown.`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: full }],
    temperature: 0.3,
    max_tokens: 4096,
  })

  const text = response.choices[0].message.content.trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(text)
}

export async function generateEmbedding(text) {
  // Groq doesn't have embeddings. Use Gemini for embeddings only.
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

export async function* generateStream(prompt, systemPrompt = '') {
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages,
    stream: true,
    max_tokens: 2048,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content
    if (delta) yield delta
  }
}
