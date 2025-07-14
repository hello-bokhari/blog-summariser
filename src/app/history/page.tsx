'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type SessionSummary = {
  url: string
  summary: string
  translated: string
  created_at: string
}

export default function HistoryPage() {
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([])

  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem('sessionHistory') || '[]')
    setSessionHistory(history)
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          🕘 Session History
        </h1>

        {sessionHistory.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            No summaries created in this session.
          </div>
        ) : (
          <div className="grid gap-6">
            {sessionHistory.map((item, i) => (
              <Card key={i} className="border border-purple-300 shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-blue-700 text-lg break-words">{item.url}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-800">
                  <div>
                    <h2 className="text-base font-semibold mb-1 text-purple-700">English Summary</h2>
                    <p>{item.summary}</p>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold mb-1 text-green-700">Urdu Summary</h2>
                    <p>{item.translated}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
