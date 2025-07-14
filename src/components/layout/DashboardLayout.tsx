'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem('sessionHistory')
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="mb-6 flex justify-between items-center px-2 sm:px-4 py-2 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-100">
        <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600 text-transparent bg-clip-text">
          AI Blog Summariser
        </h2>

        {pathname === '/history' ? (
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition"
          >
            ← Back to Home
          </Link>
        ) : (
          <Link
            href="/history"
            className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition"
          >
            📜 View History
          </Link>
        )}
      </div>

      {/* Main Page Content */}
      {children}
    </div>
  )
}
