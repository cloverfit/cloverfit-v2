'use client'

import { useEffect, useState } from 'react'
import type { Participant } from '@/types/database'
import { calculateScore, generateAutoFeedback, type ScoreResult, type AutoFeedback } from '@/lib/scoring'
import ScoreResultView from '@/components/ScoreResultView'
import CloverIcon from '@/components/CloverIcon'

export default function MeasurePage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedId, setSelectedId] = useState('')
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
    participantName: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => setParticipants(data.participants || []))
      .catch(console.error)
  }, [])

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
    if (!selectedId || !preview) return

    setError('')
    setSaving(true)
    setSuccess(false)

    const instructor = JSON.parse(sessionStorage.getItem('instructor') || '{}')
    const hrData = { restingHR: Number(restingHR), maxHR: Number(maxHR), recoveryHR: Number(recoveryHR) }
    const autoFeedback = generateAutoFeedback(hrData, preview.totalScore, undefined, preview.subjectiveScore)

    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: selectedId,
          instructor_id: instructor.id,
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

      // Save result data for the result screen
      const selectedParticipant = participants.find(p => p.id === selectedId)
      setSavedResult({
        score: preview,
        feedback: autoFeedback,
        hrData,
        participantName: selectedParticipant?.name || '',
      })
      setSuccess(true)
      // Reset form
      setRestingHR('')
      setMaxHR('')
      setRecoveryHR('')
      setFatigue('')
      setConcentration('')
      setStress('')
      setSleepQuality('')
      setNotes('')
      setSelectedId('')
      setPreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">測定入力</h2>

      {/* Result screen */}
      {success && savedResult && (
        <div className="max-w-lg">
          <ScoreResultView
            score={savedResult.score}
            feedback={savedResult.feedback}
            hrData={savedResult.hrData}
            participantName={savedResult.participantName}
            onNext={() => { setSuccess(false); setSavedResult(null) }}
            nextLabel="次の測定を入力する"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!success && <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          {/* Participant + date */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">基本情報</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">参加者</label>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                >
                  <option value="">選択してください</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.company_name ? ` (${p.company_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">測定日</label>
                <input
                  type="date"
                  value={measurementDate}
                  onChange={e => setMeasurementDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
            </div>
          </div>

          {/* HR inputs */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">心拍データ</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">安静時HR (bpm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={restingHR}
                  onChange={e => setRestingHR(e.target.value)}
                  placeholder="68"
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground text-lg text-center focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">最大HR (bpm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={maxHR}
                  onChange={e => setMaxHR(e.target.value)}
                  placeholder="152"
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground text-lg text-center focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">回復時HR (bpm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={recoveryHR}
                  onChange={e => setRecoveryHR(e.target.value)}
                  placeholder="118"
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground text-lg text-center focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
            </div>
          </div>

          {/* Subjective inputs */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              主観評価
              <span className="text-xs font-normal text-muted ml-2">（任意）</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: '疲労度', value: fatigue, set: setFatigue },
                { label: '集中力', value: concentration, set: setConcentration },
                { label: 'ストレス', value: stress, set: setStress },
                { label: '睡眠の質', value: sleepQuality, set: setSleepQuality },
              ].map(item => (
                <div key={item.label}>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {item.label}（1-5）
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => item.set(item.value === String(n) ? '' : String(n))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          item.value === String(n)
                            ? 'bg-clover text-white border-clover'
                            : 'bg-card text-muted border-border hover:border-clover/50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="block text-xs font-medium text-muted mb-1">メモ（任意）</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="測定時の様子など..."
              rows={2}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !selectedId || !preview}
            className="w-full rounded-lg bg-clover text-white font-bold py-3 hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:hidden"
          >
            {saving ? '保存中...' : '測定データを保存'}
          </button>
        </div>

        {/* Live preview sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-xs text-muted mb-2">スコアプレビュー</p>
              {preview ? (
                <>
                  <div className="text-5xl font-bold text-clover mb-1">{preview.totalScore}</div>
                  <CloverIcon leaves={preview.level.leaves} size={24} className="text-clover" />
                  <div className="text-sm font-medium text-foreground">{preview.level.label}</div>
                  <div className="mt-3 text-xs text-muted">
                    リカバリー量: {preview.recoveryAmount} bpm
                  </div>
                  {preview.subjectiveScore !== null && (
                    <div className="text-xs text-muted">
                      主観スコア: {preview.subjectiveScore.toFixed(1)} / 5.0
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted text-sm py-4">
                  心拍データを入力すると
                  <br />
                  スコアが表示されます
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !selectedId || !preview}
              className="w-full rounded-lg bg-clover text-white font-bold py-3 hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '測定データを保存'}
            </button>
          </div>
        </div>
      </form>}
    </div>
  )
}
