'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function HomePage() {
  const [inputUrl, setInputUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [englishSummary, setEnglishSummary] = useState('')
  const [fullText, setFullText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('full')

  const handleSummarise = async () => {
    if (!inputUrl.trim()) return

    setError(null)
    setStatus('🔍 Scraping blog content...')
    setSummary('')
    setEnglishSummary('')
    setFullText('')
    setActiveTab('full')

    try {
      // Step 1: Scrape
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      })

      if (!scrapeRes.ok) {
        const errText = await scrapeRes.text()
        setError(`❌ Failed to scrape blog.\n\n${errText}`)
        setStatus(null)
        return
      }

      const scraped = await scrapeRes.json()
      setFullText(scraped.fullText)
      setStatus('⚙️ Sending text to Gemini for summarisation...')

      // Step 2: Summarise
      const geminiRes = await fetch('/api/gemini-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scraped.fullText }),
      })

      if (!geminiRes.ok) {
        const errorText = await geminiRes.text()
        setStatus(null)
        setError(
          errorText.includes('503')
            ? '⚠️ Gemini servers are busy (503). Try again in a few minutes.\n\n' + errorText
            : '❌ Failed to generate summary.\n\n' + errorText
        )
        return
      }

      const summaries = await geminiRes.json()
      const english = summaries.summary || summaries.summary_en || ''
      const urdu = summaries.urduSummary || summaries.translated || ''

      setEnglishSummary(english)
      setSummary(urdu)
      setActiveTab('english')
      setStatus('💾 Storing summary in the database...')

      // Step 3: Store to DB
      const saveRes = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl,
          text: scraped.fullText,
          summary: english,
          urduSummary: urdu,
        }),
      })

      if (!saveRes.ok) {
        const dbError = await saveRes.text()
        setError(`⚠️ Summary shown, but failed to store in database.\n\n${dbError}`)
        setStatus(null)
      } else {
        setStatus('✅ Summary complete and saved!')
      }

      // Step 4: Store to sessionStorage (local-only history)
      const newSummary = {
        url: inputUrl,
        summary: english,
        translated: urdu,
        created_at: new Date().toISOString(),
      }

      const sessionHistory = JSON.parse(sessionStorage.getItem('sessionHistory') || '[]')
      sessionHistory.unshift(newSummary)
      sessionStorage.setItem('sessionHistory', JSON.stringify(sessionHistory))
    } catch (err: any) {
      console.error('Unexpected Error:', err)
      setError(`❌ Unexpected error: ${err?.message}`)
      setStatus(null)
    } finally {
      setTimeout(() => setStatus(null), 5000)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Summarise a Blog Post</h1>

      {status && (
        <div className="mt-4 text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-300 shadow">
          {status}
        </div>
      )}

      {error && (
        <div className="text-red-700 whitespace-pre-wrap mt-4 font-medium bg-red-100 p-4 rounded-lg border border-red-300 shadow">
          {error}
        </div>
      )}

      <div className="mt-10 pb-40">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="urdu">Urdu</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="full">Full Text</TabsTrigger>
          </TabsList>

          <TabsContent value="urdu">
            <Card className="mt-4">
              <CardContent className="p-4">
                <p>{summary || '🛈 Urdu summary will appear here after generation.'}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="english">
            <Card className="mt-4">
              <CardContent className="p-4">
                <p>{englishSummary || '🛈 English summary will appear here after generation.'}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="full">
            <Card className="mt-4">
              <CardContent className="p-4 whitespace-pre-wrap">
                <p>{fullText || '🛈 Full blog text will appear here after scraping.'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md p-4 flex items-center justify-center gap-2 z-50">
        <Input
          placeholder="Enter blog URL"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="max-w-lg w-full"
        />
        <Button onClick={handleSummarise}>Summarise</Button>
      </div>
    </DashboardLayout>
  )
}
