// src/components/layout/SidebarNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, History } from 'lucide-react'

const navLinks = [
  {
    href: '/',
    label: 'Summariser',
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
  },
  {
    href: '/history',
    label: 'History',
    icon: <History className="h-4 w-4 mr-2" />,
  },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted',
            pathname === link.href && 'bg-muted text-primary'
          )}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  )
}