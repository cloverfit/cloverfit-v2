'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLevel } from '@/lib/scoring'
import { ORGANIZATIONS } from '@/lib/organizations'

interface PersonSummary {
  id: string
  name: string
  company_name?: string
  gender?: string
  created_at: string
  measurementCount: number
  latestScore: number | null
  latestDate: string | null
  avgScore: number | null
  trend: 'up' | 'down' | 'stable' | null
}

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('')

  useEffect(() => {
    fetch('/api/admin/people')
      .then(res => res.json())
      .then(data => setPeople(data.people || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function getRankBg(score: number): string {
    if (score >= 100) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    if (score >= 60) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    if (score >= 40) return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }

  function trendIndicator(trend: PersonSummary['trend']) {
    if (trend === 'up') return <span className="text-emerald-500 text-xs font-bold">↑</span>
    if (trend === 'down') return <span className="text-red-400 text-xs font-bold">↓</span>
    if (trend === 'stable') return <span className="text-muted text-xs">→</span>
    return null
  }

  const filtered = people.filter(p => {
    if (orgFilter && p.company_name !== orgFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || (p.company_name || '').toLowerCase().includes(q)
    }
    return true
  })

  // Org-level stats
  const orgStats = orgFilter
    ? (() => {
        const orgPeople = people.filter(p => p.company_name === orgFilter)
        const withScores = orgPeople.filter(p => p.avgScore !== null)
        const avgAll = withScores.length > 0
          ? Math.round(withScores.reduce((s, p) => s + (p.avgScore || 0), 0) / withScores.length * 10) / 10
          : null
        const totalMeasurements = orgPeople.reduce((s, p) => s + p.measurementCount, 0)
        return { count: orgPeople.length, avgScore: avgAll, totalMeasurements }
      })()
    : null

  // Sort: people with measurements first (by latest date desc), then no data
  const sorted = [...filtered].sort((a, b) => {
    if (a.latestDate && !b.latestDate) return -1
    if (!a.latestDate && b.latestDate) return 1
    if (a.latestDate && b.latestDate) return b.latestDate.localeCompare(a.latestDate)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">参加者一覧</h2>
        <span className="text-sm text-muted">{people.length}名</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={orgFilter}
          onChange={e => setOrgFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
        >
          <option value="">すべての所属</option>
          {ORGANIZATIONS.map(org => (
            <option key={org.id} value={org.name}>{org.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="名前で検索..."
          className="flex-1 max-w-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
        />
      </div>

      {/* Org stats */}
      {orgStats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">人数</p>
            <p className="text-xl font-bold text-foreground">{orgStats.count}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">平均スコア</p>
            <p className="text-xl font-bold text-clover">{orgStats.avgScore ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">総測定回数</p>
            <p className="text-xl font-bold text-foreground">{orgStats.totalMeasurements}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">読み込み中...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted text-sm">
          {search ? '該当する参加者が見つかりません' : '参加者がまだいません'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map(p => {
            const level = p.latestScore !== null ? getLevel(p.latestScore) : null
            return (
              <Link
                key={p.id}
                href={`/record/admin/people/${p.id}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-clover/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clover to-clover-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-clover transition-colors">
                        {p.name}
                      </p>
                      {p.company_name && (
                        <p className="text-xs text-muted">{p.company_name}</p>
                      )}
                    </div>
                  </div>
                  {level && p.latestScore !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getRankBg(p.latestScore)}`}>
                      {level.label}
                    </span>
                  )}
                </div>

                {p.measurementCount > 0 ? (
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                    <div>
                      <span className="text-foreground font-bold text-base tabular-nums">{p.latestScore}</span>
                      <span className="ml-1">最新</span>
                      {trendIndicator(p.trend) && (
                        <span className="ml-1">{trendIndicator(p.trend)}</span>
                      )}
                    </div>
                    <div className="border-l border-border pl-4">
                      <span className="text-foreground font-medium">{p.avgScore}</span>
                      <span className="ml-1">平均</span>
                    </div>
                    <div className="border-l border-border pl-4">
                      <span className="text-foreground font-medium">{p.measurementCount}</span>
                      <span className="ml-1">回</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted">測定データなし</p>
                )}

                {p.latestDate && (
                  <p className="mt-2 text-[10px] text-muted">
                    最終測定: {new Date(p.latestDate).toLocaleDateString('ja-JP', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
