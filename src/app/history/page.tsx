'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

type BlogSummary = {
  id: string
  url: string
  summary_en: string
  summary_ur: string
  created_at: string
}

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<BlogSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummaries = async () => {
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching summaries:', error)
        setError('⚠️ Failed to fetch summaries. Please try again.')
      } else if (data) {
        setSummaries(data)
      }

      setLoading(false)
    }

    fetchSummaries()
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">📜 Blog Summary History</h1>

      {loading && <p className="text-gray-500">Loading summaries...</p>}

      {error && (
        <p className="text-red-600 bg-red-100 border border-red-300 rounded p-4 whitespace-pre-wrap">
          {error}
        </p>
      )}

      {!loading && summaries.length === 0 && !error && (
        <p className="text-gray-500">No summaries found yet.</p>
      )}

      {!loading && summaries.length > 0 && (
        <div className="grid gap-6">
          {summaries.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-blue-700 break-all">{item.url}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>📘 English:</strong> {item.summary_en}</p>
                <p><strong>🌐 Urdu:</strong> {item.summary_ur}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
