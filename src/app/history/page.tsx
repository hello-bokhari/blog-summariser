'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'

const getSupabaseClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

type BlogSummary = {
  id: string
  url: string
  summary: string
  translated: string
  created_at: string
}

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<BlogSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummaries = async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setSummaries(data)
      setLoading(false)
    }

    fetchSummaries()
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">📜 Blog Summary History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : summaries.length === 0 ? (
        <p>No summaries found.</p>
      ) : (
        <div className="grid gap-6">
          {summaries.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-blue-700 break-all">{item.url}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2"><strong>English:</strong> {item.summary}</p>
                <p><strong>Urdu:</strong> {item.translated}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
