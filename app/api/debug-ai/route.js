export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  const providers = {
    groq_key: !!process.env.GROQ_API_KEY,
    groq_key_prefix: (process.env.GROQ_API_KEY || '').substring(0, 8),
    groq_model: (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim(),
    cerebras_key: !!process.env.CEREBRAS_API_KEY,
    cerebras_key_prefix: (process.env.CEREBRAS_API_KEY || '').substring(0, 8),
    gemini_key: !!process.env.GEMINI_API_KEY,
    openrouter_key: !!process.env.OPENROUTER_API_KEY,
    cohere_key: !!process.env.COHERE_API_KEY,
  }

  // Test 1: Groq with raw fetch (bypass openai SDK)
  let groqRawTest = 'not tested'
  try {
    const model = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim()
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      }),
    })
    const data = await r.json()
    if (data.choices) {
      groqRawTest = `OK: "${data.choices[0].message.content}" (model: ${model})`
    } else {
      groqRawTest = `API Error: ${JSON.stringify(data.error || data).substring(0, 200)}`
    }
  } catch (e) {
    groqRawTest = `Network Error: ${e.message?.substring(0, 200)}`
  }

  // Test 2: Cerebras with raw fetch
  let cerebrasRawTest = 'not tested'
  try {
    const r = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1-8b',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      }),
    })
    const data = await r.json()
    if (data.choices) {
      cerebrasRawTest = `OK: "${data.choices[0].message.content}"`
    } else {
      cerebrasRawTest = `API Error: ${JSON.stringify(data.error || data).substring(0, 200)}`
    }
  } catch (e) {
    cerebrasRawTest = `Network Error: ${e.message?.substring(0, 200)}`
  }

  // Test 3: Groq via openai SDK
  let groqSdkTest = 'not tested'
  try {
    const OpenAI = (await import('openai')).default
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 10000,
    })
    const model = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim()
    const r = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 5,
    })
    groqSdkTest = `OK: "${r.choices[0].message.content}"`
  } catch (e) {
    groqSdkTest = `SDK Error: ${e.message?.substring(0, 200)}`
  }

  return Response.json({
    providers,
    groqRawTest,
    cerebrasRawTest,
    groqSdkTest,
    timestamp: new Date().toISOString(),
  })
}
