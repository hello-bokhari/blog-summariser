import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Retry helper
async function generateWithRetry(model: any, prompt: string, retries = 3, delay = 2000): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (err: any) {
      if (i < retries - 1 && err.status === 503) {
        console.warn(`Retrying... attempt ${i + 1}`)
        await new Promise((res) => setTimeout(res, delay))
      } else {
        throw err
      }
    }
  }
  throw new Error('Failed after maximum retries')
}

// Summarise blog post
export async function summariseText(text: string) {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })
  const prompt = `Summarise the following blog post:\n\n${text}`
  return await generateWithRetry(model, prompt)
}

// Translate to Urdu
export async function translateToUrdu(text: string) {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })
  const prompt = `Translate this English summary into Urdu:\n\n${text}`
  return await generateWithRetry(model, prompt)
}
