import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'
import mongoose from 'mongoose'
import Blog from '@/models/Blog'
import { summariseText, translateToUrdu } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'
import { isRateLimited } from '@/lib/rateLimiter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

mongoose.connect(process.env.MONGODB_URI!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url, text, summary, urduSummary } = body

    if (!url || !text || !summary || !urduSummary) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Supabase insert
    const { error } = await supabase.from('summaries').insert({
      url,
      original_text: text,
      summary_en: summary,
      summary_ur: urduSummary,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return new Response('Supabase insert failed: ' + error.message, {
        status: 500,
      })
    }

    return new Response(JSON.stringify({ success: true }))
  } catch (err: any) {
    console.error('Summarisation failed:', err)
    return new Response('Server Error: ' + err.message, { status: 500 })
  }
}
