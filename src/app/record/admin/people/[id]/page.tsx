'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Participant, MeasurementWithFeedback } from '@/types/database'
import { getLevel } from '@/lib/scoring'

interface PersonDetail {
  participant: Participant
  measurements: MeasurementWithFeedback[]
  stats: {
    measurementCount: number
    avgScore: number | null
    bestScore: number | null
    worstScore: number | null
  }
}

export default function PersonDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<PersonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/people/${id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

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

  function getRankBg(score: number): string {
    if (score >= 100) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    if (score >= 60) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    if (score >= 40) return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }

  function subjectiveLabel(val: number | undefined): string {
    if (!val) return '-'
    const labels = ['', '低い', 'やや低い', '普通', 'やや高い', '高い']
    return labels[val] || String(val)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-clover/30 border-t-clover rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted mt-3">読み込み中...</p>
      </div>
    )
  }

  if (!data || !data.participant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">参加者が見つかりません</p>
        <Link href="/record/admin/people" className="text-clover underline text-sm mt-2 block">
          一覧に戻る
        </Link>
      </div>
    )
  }

  const { participant, measurements, stats } = data
  const latest = measurements[0]
  const latestLevel = latest ? getLevel(latest.total_score) : null
  const previous = measurements[1]
  const scoreDiff = latest && previous ? latest.total_score - previous.total_score : null

  // Chart data (last 10, oldest first)
  const chartData = measurements.slice(0, 10).reverse()
  const chartMax = 120

  return (
    <div className="space-y-5">
      {/* Back + name */}
      <div className="flex items-center gap-3">
        <Link
          href="/record/admin/people"
          className="text-muted hover:text-foreground transition-colors text-lg"
        >
          ←
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-clover to-clover-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
            {participant.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {participant.name}
            </h2>
            {participant.company_name && (
              <p className="text-xs text-muted">{participant.company_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">測定回数</p>
          <p className="text-2xl font-bold text-foreground">{stats.measurementCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">平均スコア</p>
          <p className="text-2xl font-bold text-foreground">{stats.avgScore ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最高</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.bestScore ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最低</p>
          <p className="text-2xl font-bold text-foreground">{stats.worstScore ?? '—'}</p>
        </div>
      </div>

      {latest ? (
        <>
          {/* Latest score card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className={`bg-gradient-to-r ${getScoreColor(latest.total_score)} p-5 text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium tracking-wider uppercase">Latest Score</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-extrabold tracking-tighter">{latest.total_score}</span>
                    <span className="text-white/70 text-sm font-medium">/ 120</span>
                  </div>
                </div>
                <span className="inline-block px-3 py-1.5 rounded-lg text-lg font-extrabold bg-white/20 backdrop-blur-sm">
                  {latestLevel?.label}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {scoreDiff !== null ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    scoreDiff > 0 ? 'bg-white/20 text-white'
                    : scoreDiff < 0 ? 'bg-black/10 text-white/80'
                    : 'bg-white/10 text-white/70'
                  }`}>
                    {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff < 0 ? `${scoreDiff}` : '±0'}
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
              <div className="p-3 text-center">
                <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">安静時HR</p>
                <p className="text-lg font-bold text-foreground">{latest.resting_hr}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">最大HR</p>
                <p className="text-lg font-bold text-foreground">{latest.max_hr}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-0.5">リカバリー</p>
                <p className={`text-lg font-bold ${getScoreAccent(latest.total_score)}`}>{latest.recovery_amount}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
              </div>
            </div>
          </div>

          {/* Line chart */}
          {measurements.length > 1 && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h3 className="text-sm font-bold text-foreground tracking-tight">スコア推移</h3>
              </div>
              <div className="px-4 pb-4">
                <svg viewBox="0 0 320 140" className="w-full" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  {[0, 40, 60, 80, 100, 120].map(v => {
                    const y = 120 - (v / chartMax) * 110 + 10
                    return (
                      <g key={v}>
                        <line x1="35" y1={y} x2="310" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
                        <text x="30" y={y + 3} textAnchor="end" className="fill-current opacity-30" fontSize="8" fontFamily="system-ui">{v}</text>
                      </g>
                    )
                  })}

                  {/* Rank zones */}
                  <rect x="35" y={120 - (100 / chartMax) * 110 + 10} width="275" height={(20 / chartMax) * 110} fill="#f59e0b" fillOpacity="0.04" />
                  <rect x="35" y={120 - (80 / chartMax) * 110 + 10} width="275" height={(20 / chartMax) * 110} fill="#10b981" fillOpacity="0.04" />

                  {/* Line */}
                  {chartData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={chartData.map((m, i) => {
                        const x = 35 + (i / (chartData.length - 1)) * 275
                        const y = 120 - (Math.min(m.total_score, chartMax) / chartMax) * 110 + 10
                        return `${x},${y}`
                      }).join(' ')}
                    />
                  )}

                  {/* Dots + labels */}
                  {chartData.map((m, i) => {
                    const x = 35 + (chartData.length > 1 ? (i / (chartData.length - 1)) * 275 : 137.5)
                    const y = 120 - (Math.min(m.total_score, chartMax) / chartMax) * 110 + 10
                    const isLatest = i === chartData.length - 1
                    return (
                      <g key={m.id}>
                        <circle cx={x} cy={y} r={isLatest ? 4 : 3} fill={isLatest ? '#22c55e' : '#fff'} stroke="#22c55e" strokeWidth="2" />
                        <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fontWeight={isLatest ? '700' : '400'} className="fill-current opacity-60" fontFamily="system-ui">
                          {m.total_score}
                        </text>
                      </g>
                    )
                  })}

                  {/* X-axis dates */}
                  {chartData.map((m, i) => {
                    const x = 35 + (chartData.length > 1 ? (i / (chartData.length - 1)) * 275 : 137.5)
                    if (chartData.length > 5 && i !== 0 && i !== chartData.length - 1 && i % 3 !== 0) return null
                    const d = new Date(m.measurement_date)
                    return (
                      <text key={`date-${m.id}`} x={x} y={136} textAnchor="middle" fontSize="7" className="fill-current opacity-30" fontFamily="system-ui">
                        {`${d.getMonth() + 1}/${d.getDate()}`}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Measurement history (expandable) */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">測定履歴</h3>
            </div>
            <div className="border-t border-border">
              {measurements.map((m, i) => {
                const level = getLevel(m.total_score)
                const prev = measurements[i + 1]
                const diff = prev ? m.total_score - prev.total_score : null
                const isExpanded = expandedId === m.id
                const hasMemo = m.notes || m.fatigue || m.concentration || m.stress || m.sleep_quality
                const hasFeedback = m.feedback && (m.feedback.auto_score_feedback || m.feedback.auto_recovery_feedback || m.feedback.instructor_good_points)

                return (
                  <div key={m.id} className={i !== 0 ? 'border-t border-border/60' : ''}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : m.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-card/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getRankBg(m.total_score)}`}>
                          {level.label}
                        </span>
                        <span className="text-sm text-muted">
                          {new Date(m.measurement_date).toLocaleDateString('ja-JP', {
                            month: 'short', day: 'numeric'
                          })}
                        </span>
                        {(hasMemo || hasFeedback) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-clover/50" title="詳細あり" />
                        )}
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
                        <span className={`text-xs text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▾
                        </span>
                      </div>
                    </button>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-4 bg-background/50">
                        {/* HR data */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-card border border-border/60 p-2.5 text-center">
                            <p className="text-[10px] text-muted mb-0.5">安静時HR</p>
                            <p className="text-base font-bold text-foreground">{m.resting_hr}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
                          </div>
                          <div className="rounded-lg bg-card border border-border/60 p-2.5 text-center">
                            <p className="text-[10px] text-muted mb-0.5">最大HR</p>
                            <p className="text-base font-bold text-foreground">{m.max_hr}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
                          </div>
                          <div className="rounded-lg bg-card border border-border/60 p-2.5 text-center">
                            <p className="text-[10px] text-muted mb-0.5">回復量</p>
                            <p className={`text-base font-bold ${getScoreAccent(m.total_score)}`}>{m.recovery_amount}<span className="text-[10px] text-muted ml-0.5">bpm</span></p>
                          </div>
                        </div>

                        {/* Subjective */}
                        {(m.fatigue || m.concentration || m.stress || m.sleep_quality) && (
                          <div className="rounded-lg bg-card border border-border/60 p-3">
                            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-2">主観評価</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                              {m.fatigue && (
                                <div className="flex justify-between">
                                  <span className="text-muted">疲労度</span>
                                  <span className="font-medium text-foreground">{subjectiveLabel(m.fatigue)}</span>
                                </div>
                              )}
                              {m.concentration && (
                                <div className="flex justify-between">
                                  <span className="text-muted">集中力</span>
                                  <span className="font-medium text-foreground">{subjectiveLabel(m.concentration)}</span>
                                </div>
                              )}
                              {m.stress && (
                                <div className="flex justify-between">
                                  <span className="text-muted">ストレス</span>
                                  <span className="font-medium text-foreground">{subjectiveLabel(m.stress)}</span>
                                </div>
                              )}
                              {m.sleep_quality && (
                                <div className="flex justify-between">
                                  <span className="text-muted">睡眠の質</span>
                                  <span className="font-medium text-foreground">{subjectiveLabel(m.sleep_quality)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {m.notes && (
                          <div className="rounded-lg bg-card border border-border/60 p-3">
                            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1.5">メモ</p>
                            <p className="text-sm text-foreground leading-relaxed">{m.notes}</p>
                          </div>
                        )}

                        {/* Auto feedback */}
                        {m.feedback && (m.feedback.auto_score_feedback || m.feedback.auto_recovery_feedback) && (
                          <div className="rounded-lg bg-card border border-border/60 p-3 space-y-2.5">
                            <p className="text-[10px] text-muted font-medium tracking-wider uppercase">フィードバック</p>
                            {m.feedback.auto_score_feedback && (
                              <div>
                                <p className="text-[10px] font-semibold text-clover mb-0.5">スコア評価</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.auto_score_feedback}</p>
                              </div>
                            )}
                            {m.feedback.auto_recovery_feedback && (
                              <div>
                                <p className="text-[10px] font-semibold text-clover mb-0.5">リカバリー力</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.auto_recovery_feedback}</p>
                              </div>
                            )}
                            {m.feedback.auto_trend_feedback && (
                              <div>
                                <p className="text-[10px] font-semibold text-clover mb-0.5">推移</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.auto_trend_feedback}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Instructor feedback */}
                        {m.feedback && (m.feedback.instructor_good_points || m.feedback.instructor_improvements || m.feedback.next_suggestion) && (
                          <div className="rounded-lg bg-card border border-clover/20 p-3 space-y-2.5">
                            <p className="text-[10px] text-clover font-medium tracking-wider uppercase">インストラクターコメント</p>
                            {m.feedback.instructor_good_points && (
                              <div>
                                <p className="text-[10px] font-semibold text-foreground mb-0.5">良い点</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.instructor_good_points}</p>
                              </div>
                            )}
                            {m.feedback.instructor_improvements && (
                              <div>
                                <p className="text-[10px] font-semibold text-foreground mb-0.5">改善点</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.instructor_improvements}</p>
                              </div>
                            )}
                            {m.feedback.next_suggestion && (
                              <div>
                                <p className="text-[10px] font-semibold text-foreground mb-0.5">次回への提案</p>
                                <p className="text-sm text-foreground leading-relaxed">{m.feedback.next_suggestion}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted">まだ測定データがありません</p>
        </div>
      )}
    </div>
  )
}
