import { NextRequest, NextResponse } from 'next/server'
import { summariseText, translateToUrdu } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 })
    }

    const summary = await summariseText(text)
    const urduSummary = await translateToUrdu(summary)

    return NextResponse.json({ summary, urduSummary }, { status: 200 })
  } catch (err: any) {
    console.error('Gemini summarisation error:', err)
    return NextResponse.json(
      {
        error: err?.message || 'Unknown Gemini error',
      },
      { status: 503 }
    )
  }
}
