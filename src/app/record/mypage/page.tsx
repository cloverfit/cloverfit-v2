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
  const previous = measurements[1]
  const scoreDiff = latest && previous ? latest.total_score - previous.total_score : null

  // Calculate score bar width (cap at 120 for display)
  const scoreBarWidth = latest ? Math.min((latest.total_score / 120) * 100, 100) : 0

  // Score color based on level
  function getScoreColor(score: number): string {
    if (score >= 100) return 'from-amber-400 to-yellow-500'
    if (score >= 80) return 'from-emerald-500 to-green-600'
    if (score >= 60) return 'from-teal-400 to-emerald-500'
    if (score >= 40) return 'from-sky-400 to-blue-500'
    return 'from-slate-400 to-slate-500'
  }

  function getScoreAccent(score: number): string {
    if (score >= 100) return 'text-amber-500'
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-teal-600 dark:text-teal-400'
    if (score >= 40) return 'text-sky-600 dark:text-sky-400'
    return 'text-slate-500'
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🍀</span>
            <span className="text-lg font-bold text-clover tracking-tight">CloverFit</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:border-foreground/20"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Profile greeting */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-clover to-clover-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
              {participant.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight leading-tight">
                {participant.name}
              </h2>
              {participant.company_name && (
                <p className="text-xs text-muted">{participant.company_name}</p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <div className="w-8 h-8 border-2 border-clover/30 border-t-clover rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted mt-3">読み込み中...</p>
            </div>
          ) : latest ? (
            <>
              {/* Main score card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Score header with gradient */}
                <div className={`bg-gradient-to-r ${getScoreColor(latest.total_score)} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-xs font-medium tracking-wider uppercase">Latest Score</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl font-extrabold tracking-tighter">{latest.total_score}</span>
                        <span className="text-white/70 text-sm font-medium">/ 120</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl">{latestLevel?.emoji}</div>
                      <p className="text-white/90 text-sm font-semibold mt-0.5">{latestLevel?.label}</p>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-4">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/60 rounded-full transition-all duration-700"
                        style={{ width: `${scoreBarWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Diff and date */}
                  <div className="flex items-center justify-between mt-3">
                    {scoreDiff !== null ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        scoreDiff > 0
                          ? 'bg-white/20 text-white'
                          : scoreDiff < 0
                          ? 'bg-black/10 text-white/80'
                          : 'bg-white/10 text-white/70'
                      }`}>
                        {scoreDiff > 0 ? `↑ +${scoreDiff}` : scoreDiff < 0 ? `↓ ${scoreDiff}` : '→ ±0'}
                        <span className="ml-1 opacity-70">前回比</span>
                      </span>
                    ) : <span />}
                    <span className="text-white/60 text-xs">
                      {new Date(latest.measurement_date).toLocaleDateString('ja-JP', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* HR breakdown */}
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="p-4 text-center">
                    <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">安静時HR</p>
                    <p className="text-xl font-bold text-foreground">{latest.resting_hr}</p>
                    <p className="text-[10px] text-muted">bpm</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最大HR</p>
                    <p className="text-xl font-bold text-foreground">{latest.max_hr}</p>
                    <p className="text-[10px] text-muted">bpm</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">リカバリー</p>
                    <p className={`text-xl font-bold ${getScoreAccent(latest.total_score)}`}>{latest.recovery_amount}</p>
                    <p className="text-[10px] text-muted">bpm</p>
                  </div>
                </div>
              </div>

              {/* Score history */}
              {measurements.length > 1 && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-5 pt-4 pb-2">
                    <h3 className="text-sm font-bold text-foreground tracking-tight">スコア推移</h3>
                  </div>

                  {/* Mini chart - simple bar visualization */}
                  <div className="px-5 pb-3">
                    <div className="flex items-end gap-1 h-16">
                      {measurements.slice(0, 10).reverse().map((m, i) => {
                        const height = Math.max((m.total_score / 120) * 100, 8)
                        const level = getLevel(m.total_score)
                        const isLatest = i === measurements.slice(0, 10).length - 1
                        return (
                          <div
                            key={m.id}
                            className="flex-1 flex flex-col items-center gap-0.5"
                          >
                            <span className={`text-[9px] font-bold ${isLatest ? getScoreAccent(m.total_score) : 'text-muted'}`}>
                              {m.total_score}
                            </span>
                            <div
                              className={`w-full rounded-sm transition-all ${
                                isLatest
                                  ? `bg-gradient-to-t ${getScoreColor(m.total_score)} opacity-90`
                                  : 'bg-border'
                              }`}
                              style={{ height: `${height}%` }}
                              title={`${new Date(m.measurement_date).toLocaleDateString('ja-JP')} — ${level.label}`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* History list */}
                  <div className="border-t border-border">
                    {measurements.slice(0, 8).map((m, i) => {
                      const level = getLevel(m.total_score)
                      const prev = measurements[i + 1]
                      const diff = prev ? m.total_score - prev.total_score : null
                      return (
                        <div key={m.id} className={`flex items-center justify-between px-5 py-3 ${
                          i !== 0 ? 'border-t border-border/60' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="text-base">{level.emoji}</span>
                            <div>
                              <span className="text-sm text-muted">
                                {new Date(m.measurement_date).toLocaleDateString('ja-JP', {
                                  month: 'short', day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {diff !== null && (
                              <span className={`text-xs font-medium ${
                                diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-400' : 'text-muted'
                              }`}>
                                {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : diff}
                              </span>
                            )}
                            <span className={`text-lg font-bold tabular-nums ${
                              i === 0 ? getScoreAccent(m.total_score) : 'text-foreground'
                            }`}>{m.total_score}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Self-measure button */}
              <Link
                href="/record/mypage/measure"
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:border-clover/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-clover-light flex items-center justify-center shrink-0">
                    <span className="text-lg">💓</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">自分で測定を記録する</p>
                    <p className="text-xs text-muted mt-0.5">心拍データを入力してスコアを確認</p>
                  </div>
                </div>
                <span className="text-muted group-hover:text-clover transition-colors text-lg">→</span>
              </Link>

              {/* Feedback card */}
              {latest?.feedback && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-5 pt-4 pb-2">
                    <h3 className="text-sm font-bold text-foreground tracking-tight">フィードバック</h3>
                    <p className="text-[10px] text-muted mt-0.5">
                      {new Date(latest.measurement_date).toLocaleDateString('ja-JP')} の測定に基づく分析
                    </p>
                  </div>

                  <div className="px-5 pb-5 space-y-4">
                    {latest.feedback.auto_score_feedback && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-clover-light flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">📊</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-clover mb-0.5">スコア評価</p>
                          <p className="text-sm text-foreground leading-relaxed">{latest.feedback.auto_score_feedback}</p>
                        </div>
                      </div>
                    )}

                    {latest.feedback.auto_recovery_feedback && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-clover-light flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">💓</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-clover mb-0.5">リカバリー力</p>
                          <p className="text-sm text-foreground leading-relaxed">{latest.feedback.auto_recovery_feedback}</p>
                        </div>
                      </div>
                    )}

                    {latest.feedback.instructor_good_points && (
                      <div className="flex gap-3 pt-3 border-t border-border/60">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">👍</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-accent mb-0.5">インストラクターからの評価</p>
                          <p className="text-sm text-foreground leading-relaxed">{latest.feedback.instructor_good_points}</p>
                        </div>
                      </div>
                    )}

                    {latest.feedback.instructor_improvements && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">📝</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-0.5">改善ポイント</p>
                          <p className="text-sm text-foreground leading-relaxed">{latest.feedback.instructor_improvements}</p>
                        </div>
                      </div>
                    )}

                    {latest.feedback.next_suggestion && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">🎯</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-0.5">次回の提案</p>
                          <p className="text-sm text-foreground leading-relaxed">{latest.feedback.next_suggestion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No data state */
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-clover-light flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-base font-bold text-foreground">まだ測定データがありません</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                自分で測定データを記録するか、<br className="hidden sm:block" />
                インストラクターによる測定を受けましょう。
              </p>
              <Link
                href="/record/mypage/measure"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-clover text-white font-bold py-3 px-6 hover:bg-clover-dark transition-colors shadow-sm"
              >
                <span className="text-lg">💓</span>
                自分で測定を記録する
              </Link>
            </div>
          )}

          {/* Footer nav */}
          <div className="pt-2 pb-4">
            <Link
              href="/"
              className="block text-center text-sm text-muted hover:text-foreground transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
