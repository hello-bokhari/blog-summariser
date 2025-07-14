// src/app/api/scrape/route.ts
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import axios from 'axios'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
      },
    })

    const $ = cheerio.load(res.data)
    const text = $('body').text().replace(/\s+/g, ' ').trim()

    return NextResponse.json({ fullText: text })
  } catch (error) {
    console.error('Scraping failed:', error)
    return NextResponse.json({ error: 'Failed to scrape blog' }, { status: 500 })
  }
}
