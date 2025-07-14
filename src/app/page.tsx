'use client'

import { useState } from 'react'
import UrlForm from '@/components/UrlForm'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const [summary, setSummary] = useState('')
  const [englishSummary, setEnglishSummary] = useState('')
  const [fullText, setFullText] = useState('')

  const handleSummarise = async (url: string) => {
  try {
    const res = await fetch('/api/summarise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Error Response:', text)
      return
    }

    const data = await res.json()
    setSummary(data.translated)
    setEnglishSummary(data.summary) // ✅ Add this
    setFullText(data.fullText) // ✅ Add this (if your backend supports it)
  } catch (err) {
    console.error('Error in handleSummarise:', err)
  }
}


  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Summarise a Blog Post</h1>
      <UrlForm onSubmit={handleSummarise} />

      {(summary || englishSummary || fullText) && (
        <div className="mt-10">
          <Tabs defaultValue="urdu" className="w-full">
            <TabsList>
              <TabsTrigger value="urdu">Urdu</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
              <TabsTrigger value="full">Full Text</TabsTrigger>
            </TabsList>

            <TabsContent value="urdu">
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p>{summary}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="english">
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p>{englishSummary}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="full">
              <Card className="mt-4">
                <CardContent className="p-4 whitespace-pre-wrap">
                  <p>{fullText}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  )
}
