'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
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
            ? '⚠️ Gemini servers are busy. Try again shortly.\n\n' + errorText
            : '❌ Failed to generate summary.\n\n' + errorText
        )
        return
      }

      const summaries = await geminiRes.json()
      setEnglishSummary(summaries.summary || summaries.summary_en || '')
      setSummary(summaries.urduSummary || summaries.translated || '')
      setStatus('💾 Saving summary...')
      setActiveTab('english')

      await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl,
          text: scraped.fullText,
          summary: summaries.summary,
          urduSummary: summaries.urduSummary,
        }),
      })

      const newSummary = {
        url: inputUrl,
        summary: summaries.summary,
        translated: summaries.urduSummary,
        created_at: new Date().toISOString(),
      }
      const sessionHistory = JSON.parse(sessionStorage.getItem('sessionHistory') || '[]')
      sessionHistory.unshift(newSummary)
      sessionStorage.setItem('sessionHistory', JSON.stringify(sessionHistory))

      setStatus('✅ Summary complete and saved!')
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow">
          {/* Gemini AI Blog Summariser */}
        </h1>

        {status && (
          <div className="mb-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-lg shadow-md transition-all">
            {status}
          </div>
        )}

        {error && (
          <div className="text-white whitespace-pre-wrap mb-4 bg-red-600 p-4 rounded-lg shadow-md transition-all">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-center mb-6 gap-2">
            {['urdu', 'english', 'full'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold px-4 py-2 rounded-md transition"
              >
                {tab === 'urdu' ? 'اردو خلاصہ' : tab === 'english' ? 'English Summary' : 'Full Blog'}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="urdu">
            <Card className="bg-gradient-to-br from-green-50 to-purple-50 border-l-4 border-purple-400">
              <CardContent className="p-6 text-gray-800 space-y-3">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                  {summary || '🛈 Urdu summary will appear here after generation.'}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="english">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-indigo-400">
              <CardContent className="p-6 text-gray-800 space-y-3">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                  {englishSummary || '🛈 English summary will appear here after generation.'}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="full">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-l-4 border-blue-400">
              <CardContent className="p-6 whitespace-pre-wrap text-gray-700 space-y-2">
                <p>{fullText || '🛈 Full blog text will appear here after scraping.'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md p-4 flex items-center justify-center gap-2 z-50">
        <Input
          placeholder="Paste blog URL here..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="max-w-lg w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Button
          onClick={handleSummarise}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
        >
          ✨ Summarise
        </Button>
      </div>
    </DashboardLayout>
  )
}
