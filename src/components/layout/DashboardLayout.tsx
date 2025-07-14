// src/components/layout/DashboardLayout.tsx
'use client'

import SidebarNav from '@/components/layout/SidebarNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 bg-muted">
        <h2 className="text-lg font-semibold mb-4">📰 Blog Summariser</h2>
        <SidebarNav />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}