import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export function getModel(modelName = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

export async function generateJSON(prompt, systemPrompt = '') {
  const model = getModel()
  const full = `${systemPrompt}\n\n${prompt}\n\nRespond ONLY with valid JSON. No markdown.`
  const result = await model.generateContent(full)
  const text = result.response.text().trim()
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(text)
}

export async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
}

export async function* generateStream(prompt, systemPrompt = '') {
  const model = getModel()
  const full = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
  const result = await model.generateContentStream(full)
  for await (const chunk of result.stream) {
    yield chunk.text()
  }
}
