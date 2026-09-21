'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Participant } from '@/types/database'
import { calculateScore, generateAutoFeedback, type ScoreResult, type AutoFeedback } from '@/lib/scoring'
import ScoreResultView from '@/components/ScoreResultView'
import CloverIcon from '@/components/CloverIcon'

export default function SelfMeasurePage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().split('T')[0])

  // HR inputs
  const [restingHR, setRestingHR] = useState('')
  const [maxHR, setMaxHR] = useState('')
  const [recoveryHR, setRecoveryHR] = useState('')

  // Subjective inputs
  const [fatigue, setFatigue] = useState('')
  const [concentration, setConcentration] = useState('')
  const [stress, setStress] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')
  const [notes, setNotes] = useState('')

  // State
  const [preview, setPreview] = useState<ScoreResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Result data (preserved after form reset for the result screen)
  const [savedResult, setSavedResult] = useState<{
    score: ScoreResult
    feedback: AutoFeedback
    hrData: { restingHR: number; maxHR: number; recoveryHR: number }
  } | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('participant')
    if (!stored) {
      router.replace('/record/login')
      return
    }
    setParticipant(JSON.parse(stored) as Participant)
  }, [router])

  // Live score preview
  useEffect(() => {
    const r = Number(restingHR)
    const m = Number(maxHR)
    const rec = Number(recoveryHR)
    if (r > 0 && m > 0 && rec > 0 && rec < m) {
      const result = calculateScore(
        { restingHR: r, maxHR: m, recoveryHR: rec },
        {
          fatigue: fatigue ? Number(fatigue) : undefined,
          concentration: concentration ? Number(concentration) : undefined,
          stress: stress ? Number(stress) : undefined,
          sleepQuality: sleepQuality ? Number(sleepQuality) : undefined,
        }
      )
      setPreview(result)
    } else {
      setPreview(null)
    }
  }, [restingHR, maxHR, recoveryHR, fatigue, concentration, stress, sleepQuality])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!participant || !preview) return

    setError('')
    setSaving(true)
    setSuccess(false)

    const hrData = { restingHR: Number(restingHR), maxHR: Number(maxHR), recoveryHR: Number(recoveryHR) }
    const autoFeedback = generateAutoFeedback(hrData, preview.totalScore, undefined, preview.subjectiveScore)

    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participant.id,
          instructor_id: null,
          measurement_date: measurementDate,
          resting_hr: Number(restingHR),
          max_hr: Number(maxHR),
          recovery_hr: Number(recoveryHR),
          recovery_amount: preview.recoveryAmount,
          total_score: preview.totalScore,
          fatigue: fatigue ? Number(fatigue) : null,
          concentration: concentration ? Number(concentration) : null,
          stress: stress ? Number(stress) : null,
          sleep_quality: sleepQuality ? Number(sleepQuality) : null,
          subjective_score: preview.subjectiveScore,
          notes: notes || null,
          auto_feedback: {
            score_feedback: autoFeedback.scoreFeedback,
            recovery_feedback: autoFeedback.recoveryFeedback,
            trend_feedback: autoFeedback.trendFeedback || null,
            alignment_feedback: autoFeedback.alignmentFeedback || null,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '保存に失敗しました')
      }

      // Save result data for the result screen before resetting
      setSavedResult({
        score: preview,
        feedback: autoFeedback,
        hrData,
      })
      setSuccess(true)
      setRestingHR('')
      setMaxHR('')
      setRecoveryHR('')
      setFatigue('')
      setConcentration('')
      setStress('')
      setSleepQuality('')
      setNotes('')
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!participant) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/record/mypage" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg">←</span>
            <span className="text-lg font-bold text-clover tracking-tight">マイページ</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Page title */}
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">測定を記録する</h2>
            <p className="text-sm text-muted mt-1">心拍データを入力してスコアを確認できます</p>
          </div>

          {/* Result screen */}
          {success && savedResult && (
            <ScoreResultView
              score={savedResult.score}
              feedback={savedResult.feedback}
              hrData={savedResult.hrData}
              onNext={() => { setSuccess(false); setSavedResult(null) }}
              nextLabel="もう一度測定する"
              secondaryAction={
                <Link
                  href="/record/mypage"
                  className="block w-full rounded-xl border border-clover text-clover text-center font-medium py-3 hover:bg-clover-light transition-colors"
                >
                  マイページに戻る
                </Link>
              }
            />
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!success && <form onSubmit={handleSubmit} className="space-y-5">

            {/* Date */}
            <div className="rounded-xl border border-border bg-card p-5">
              <label className="block text-xs font-semibold text-muted mb-2 tracking-wider uppercase">測定日</label>
              <input
                type="date"
                value={measurementDate}
                onChange={e => setMeasurementDate(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
              />
            </div>

            {/* HR inputs */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">心拍データ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    安静時HR
                    <span className="text-xs text-muted ml-1.5 font-normal">運動前の安静時の心拍数</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={restingHR}
                      onChange={e => setRestingHR(e.target.value)}
                      placeholder="68"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-clover/40"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    最大HR
                    <span className="text-xs text-muted ml-1.5 font-normal">運動中の最大心拍数</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={maxHR}
                      onChange={e => setMaxHR(e.target.value)}
                      placeholder="152"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-clover/40"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    回復時HR
                    <span className="text-xs text-muted ml-1.5 font-normal">運動後1分間の心拍数</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={recoveryHR}
                      onChange={e => setRecoveryHR(e.target.value)}
                      placeholder="118"
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-clover/40"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 入力完了インジケーター（スコアは見せない） */}
            {preview && (
              <div className="rounded-xl border-2 border-clover/30 bg-gradient-to-br from-clover-light/30 to-card p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CloverIcon leaves={4} size={20} className="text-clover" />
                  <span className="text-sm font-semibold text-clover-dark">心拍データ入力済み</span>
                </div>
                <p className="text-xs text-muted mt-1">保存するとスコアが表示されます</p>
              </div>
            )}

            {/* Subjective inputs */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">
                主観評価
                <span className="text-xs font-normal ml-2 normal-case tracking-normal">（任意）</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: '疲労度', desc: '今日の疲れ具合', value: fatigue, set: setFatigue },
                  { label: '集中力', desc: '運動中の集中', value: concentration, set: setConcentration },
                  { label: 'ストレス', desc: '日頃のストレス', value: stress, set: setStress },
                  { label: '睡眠の質', desc: '昨晩の睡眠', value: sleepQuality, set: setSleepQuality },
                ].map(item => (
                  <div key={item.label}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {item.label}
                      <span className="text-xs text-muted ml-1.5 font-normal">{item.desc}</span>
                    </label>
                    <div className="flex gap-2">
                      {[
                        { n: 1, label: '低い' },
                        { n: 2, label: '' },
                        { n: 3, label: '普通' },
                        { n: 4, label: '' },
                        { n: 5, label: '高い' },
                      ].map(({ n, label }) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => item.set(item.value === String(n) ? '' : String(n))}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            item.value === String(n)
                              ? 'bg-clover text-white border-clover shadow-sm scale-105'
                              : 'bg-background text-muted border-border hover:border-clover/40'
                          }`}
                        >
                          <span className="block text-base">{n}</span>
                          {label && <span className="block text-[10px] opacity-70 mt-0.5">{label}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-border bg-card p-5">
              <label className="block text-xs font-semibold text-muted mb-2 tracking-wider uppercase">メモ（任意）</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="今日の体調や気づきなど..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || !preview}
              className="w-full rounded-xl bg-clover text-white font-bold py-4 text-base hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  保存中...
                </span>
              ) : (
                '測定データを保存'
              )}
            </button>
          </form>}

          {/* Back link (only when form is showing) */}
          {!success && (
            <div className="pt-2 pb-4">
              <Link
                href="/record/mypage"
                className="block text-center text-sm text-muted hover:text-foreground transition-colors"
              >
                ← マイページに戻る
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
