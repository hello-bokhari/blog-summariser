import { supabase } from './supabase'

export async function saveToSupabase({ url, summary, translated }: {
  url: string
  summary: string
  translated: string
}) {
  const { error } = await supabase.from('summaries').insert([
    {
      url,
      summary,
      translated,
      created_at: new Date().toISOString()
    }
  ])

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`)
  }
}

