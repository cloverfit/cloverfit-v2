'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Instructor } from '@/types/database'

const NAV_ITEMS = [
  { href: '/record/admin', label: 'ダッシュボード' },
  { href: '/record/admin/people', label: '人' },
  { href: '/record/admin/measure', label: '測定入力' },
  { href: '/record/admin/participants', label: '参加者管理' },
  { href: '/record/admin/feedback', label: 'フィードバック' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [instructor, setInstructor] = useState<Instructor | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('instructor')
    if (!stored) {
      router.replace('/record/login')
      return
    }
    setInstructor(JSON.parse(stored))
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('instructor')
    router.replace('/record/login')
  }

  if (!instructor) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-clover">CloverFit</span>
            </Link>
            <span className="text-xs text-muted bg-clover-light px-2 py-0.5 rounded-full">
              管理画面
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:block">{instructor.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="border-b border-border bg-card overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-clover text-clover'
                    : 'border-transparent text-muted hover:text-foreground hover:border-border'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
