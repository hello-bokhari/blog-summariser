// src/lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * Retry helper with exponential backoff
 */
async function generateWithRetry(
  model: any,
  prompt: string,
  retries = 3,
  delay = 2000
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      console.warn(`Attempt ${i + 1} failed`, status, err?.message)

      if (i < retries - 1 && status === 503) {
        const waitTime = delay * (i + 1)
        console.warn(`Retrying in ${waitTime}ms...`)
        await new Promise((res) => setTimeout(res, waitTime))
      } else {
        throw new Error(`Gemini API Error: ${err?.message || 'Unknown error'}`)
      }
    }
  }
  throw new Error('Failed after maximum retries.')
}

/**
 * Summarise blog post content
 */
export async function summariseText(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' }) // You can fallback to gemini-pro here if needed
  const prompt = `Summarise the following blog post:\n\n${text}`
  return await generateWithRetry(model, prompt)
}

/**
 * Translate English summary to Urdu
 */
export async function translateToUrdu(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })
  const prompt = `Translate this English summary into Urdu:\n\n${text}`
  return await generateWithRetry(model, prompt)
}
