import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'
import mongoose from 'mongoose'
import Blog from '@/models/Blog'
import { summariseText, translateToUrdu } from '@/lib/gemini'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ Use the public anon key
)


mongoose.connect(process.env.MONGODB_URI!)

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  // Scrape text
  const res = await axios.get(url, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
  },
})

  const $ = cheerio.load(res.data)
  const text = $('body').text().replace(/\s+/g, ' ').trim()

  // Gemini AI summary
  const summary = await summariseText(text)

  // Translate to Urdu
  const translated = await translateToUrdu(summary)

  // Save full blog to MongoDB
  await Blog.create({ url, content: text })

  // Save summary to Supabase
  await supabase.from('summaries').insert([{ url, summary }])

  return NextResponse.json({ summary, translated })
}
