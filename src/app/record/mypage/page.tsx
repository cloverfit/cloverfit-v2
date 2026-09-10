'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Participant, MeasurementWithFeedback } from '@/types/database'
import { getLevel } from '@/lib/scoring'

export default function MyPage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [measurements, setMeasurements] = useState<MeasurementWithFeedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('participant')
    if (!stored) {
      router.replace('/record/login')
      return
    }

    const p = JSON.parse(stored) as Participant
    setParticipant(p)

    fetch(`/api/measurements?participant_id=${p.id}`)
      .then(res => res.json())
      .then(data => {
        setMeasurements(data.measurements || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('participant')
    router.replace('/record/login')
  }

  if (!participant) return null

  const latest = measurements[0]
  const latestLevel = latest ? getLevel(latest.total_score) : null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🍀</span>
              <span className="text-xl font-bold text-clover">CloverFit</span>
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {participant.name}さんのマイページ
            </h2>
            {participant.company_name && (
              <p className="text-sm text-muted mt-0.5">{participant.company_name}</p>
            )}
          </div>

          {/* Latest score */}
          {latest ? (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-xs text-muted mb-1">最新スコア</p>
              <div className="text-5xl font-bold text-clover mb-1">
                {latest.total_score}
              </div>
              <div className="text-xl mb-0.5">{latestLevel?.emoji}</div>
              <div className="text-sm font-medium text-foreground">{latestLevel?.label}</div>
              <p className="text-xs text-muted mt-2">
                {new Date(latest.measurement_date).toLocaleDateString('ja-JP')} 測定
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-muted text-sm">まだ測定データがありません</p>
              <p className="text-xs text-muted mt-1">インストラクターに測定を依頼してください</p>
            </div>
          )}

          {/* Score trend (simple text list for now) */}
          {measurements.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">スコア履歴</h3>
              <div className="space-y-2">
                {measurements.slice(0, 10).map(m => {
                  const level = getLevel(m.total_score)
                  return (
                    <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{level.emoji}</span>
                        <span className="text-sm text-muted">
                          {new Date(m.measurement_date).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-foreground">{m.total_score}</span>
                        <span className="text-xs text-muted">{level.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Latest feedback */}
          {latest?.feedback && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">最新フィードバック</h3>

              {latest.feedback.auto_score_feedback && (
                <div>
                  <p className="text-xs font-medium text-clover mb-0.5">スコア評価</p>
                  <p className="text-sm text-foreground">{latest.feedback.auto_score_feedback}</p>
                </div>
              )}

              {latest.feedback.auto_recovery_feedback && (
                <div>
                  <p className="text-xs font-medium text-clover mb-0.5">リカバリー力</p>
                  <p className="text-sm text-foreground">{latest.feedback.auto_recovery_feedback}</p>
                </div>
              )}

              {latest.feedback.instructor_good_points && (
                <div>
                  <p className="text-xs font-medium text-accent mb-0.5">👍 良い点</p>
                  <p className="text-sm text-foreground">{latest.feedback.instructor_good_points}</p>
                </div>
              )}

              {latest.feedback.instructor_improvements && (
                <div>
                  <p className="text-xs font-medium text-accent mb-0.5">📝 改善点</p>
                  <p className="text-sm text-foreground">{latest.feedback.instructor_improvements}</p>
                </div>
              )}

              {latest.feedback.next_suggestion && (
                <div>
                  <p className="text-xs font-medium text-accent mb-0.5">🎯 次回の提案</p>
                  <p className="text-sm text-foreground">{latest.feedback.next_suggestion}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link
              href="/"
              className="block text-center text-sm text-muted hover:text-foreground transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
