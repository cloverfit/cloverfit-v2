'use client'

import { useEffect, useState } from 'react'
import type { MeasurementWithFeedback } from '@/types/database'
import { getLevel } from '@/lib/scoring'

interface DashboardStats {
  totalParticipants: number
  totalMeasurements: number
  avgScore: number
  recentMeasurements: MeasurementWithFeedback[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12 text-muted">
        データを読み込み中...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">データの取得に失敗しました</p>
        <p className="text-xs text-muted mt-2">Supabaseの接続設定を確認してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">ダッシュボード</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted mb-1">参加者数</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalParticipants}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted mb-1">総測定回数</p>
          <p className="text-3xl font-bold text-foreground">{stats.totalMeasurements}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted mb-1">平均スコア</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-clover">
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '—'}
            </p>
            {stats.avgScore > 0 && (
              <span className="text-sm">{getLevel(stats.avgScore).emoji}</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent measurements */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-foreground text-sm">最近の測定</h3>
        </div>
        {stats.recentMeasurements.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm">
            まだ測定データがありません
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentMeasurements.map(m => {
              const level = getLevel(m.total_score)
              return (
                <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{level.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.participant?.name || '不明'}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(m.measurement_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{m.total_score}</p>
                    <p className="text-xs text-muted">{level.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
