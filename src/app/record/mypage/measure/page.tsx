'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Participant } from '@/types/database'
import { calculateScore, generateAutoFeedback, type ScoreResult, type AutoFeedback } from '@/lib/scoring'
import ScoreResultView from '@/components/ScoreResultView'

const STEPS = [
  { n: 1, label: '運動前' },
  { n: 2, label: '運動後' },
  { n: 3, label: 'ふりかえり' },
]

// 目標が思いつかない人向けの下敷き。タップでそのまま入る。
const GOAL_EXAMPLES = [
  '心拍数120を目指す！',
  '5kmランニングする！',
  'スクワットの回数を更新する！',
]

const SUBJECTIVE_SCALE = [
  { n: 1, label: '低い' },
  { n: 2, label: '' },
  { n: 3, label: '普通' },
  { n: 4, label: '' },
  { n: 5, label: '高い' },
]

export default function SelfMeasurePage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().split('T')[0])

  const [step, setStep] = useState(1)

  // 運動前
  const [restingHR, setRestingHR] = useState('')
  const [dailyGoal, setDailyGoal] = useState('')

  // 運動後
  const [maxHR, setMaxHR] = useState('')
  const [recoveryHR, setRecoveryHR] = useState('')

  // ふりかえり
  const [fatigue, setFatigue] = useState('')
  const [concentration, setConcentration] = useState('')
  const [stress, setStress] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')
  const [trainingLog, setTrainingLog] = useState('')
  const [notes, setNotes] = useState('')

  const [preview, setPreview] = useState<ScoreResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [savedResult, setSavedResult] = useState<{
    score: ScoreResult
    feedback: AutoFeedback
    hrData: { restingHR: number; maxHR: number; recoveryHR: number }
  } | null>(null)

  // 結果が表示されたらページ最上部へ
  useEffect(() => {
    if (savedResult) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [savedResult])

  // ステップが変わったら上から読めるようにする
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

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
      setPreview(
        calculateScore(
          { restingHR: r, maxHR: m, recoveryHR: rec },
          {
            fatigue: fatigue ? Number(fatigue) : undefined,
            concentration: concentration ? Number(concentration) : undefined,
            stress: stress ? Number(stress) : undefined,
            sleepQuality: sleepQuality ? Number(sleepQuality) : undefined,
          }
        )
      )
    } else {
      setPreview(null)
    }
  }, [restingHR, maxHR, recoveryHR, fatigue, concentration, stress, sleepQuality])

  const step1Ready = Number(restingHR) > 0
  const step2Ready =
    Number(maxHR) > 0 && Number(recoveryHR) > 0 && Number(recoveryHR) < Number(maxHR)

  function resetForm() {
    setStep(1)
    setRestingHR('')
    setDailyGoal('')
    setMaxHR('')
    setRecoveryHR('')
    setFatigue('')
    setConcentration('')
    setStress('')
    setSleepQuality('')
    setTrainingLog('')
    setNotes('')
    setPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // 入力欄でEnterを押しても途中で送信されないようにする
    if (step !== 3) return
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
          daily_goal: dailyGoal || null,
          training_log: trainingLog || null,
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

      setSavedResult({ score: preview, feedback: autoFeedback, hrData })
      setSuccess(true)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!participant) return null

  const hrInputClass =
    'w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-clover/40'
  const textInputClass =
    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40'

  return (
    <div className="flex flex-col min-h-screen bg-background">
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

          {/* 結果画面 */}
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

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!success && (
            <>
              {/* ステップ表示 */}
              <div>
                <div className="flex gap-1.5">
                  {STEPS.map(s => (
                    <div key={s.n} className="flex-1">
                      <div
                        className={`h-1 rounded-full transition-colors ${
                          s.n <= step ? 'bg-clover' : 'bg-border'
                        }`}
                      />
                      <p
                        className={`mt-1.5 text-[11px] text-center transition-colors ${
                          s.n === step ? 'text-clover font-bold' : 'text-muted'
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* ── ステップ1：運動前 ── */}
                {step === 1 && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">運動を始める前に</h2>
                      <p className="text-sm text-muted mt-1">
                        落ち着いた状態で脈を測って、今日やりたいことを決めておきましょう。
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                      <label className="block text-xs font-semibold text-muted mb-2 tracking-wider uppercase">測定日</label>
                      <input
                        type="date"
                        value={measurementDate}
                        onChange={e => setMeasurementDate(e.target.value)}
                        className={textInputClass}
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        安静時の心拍数
                        <span className="text-xs text-muted ml-1.5 font-normal">リラックスできる姿勢で</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={restingHR}
                          onChange={e => setRestingHR(e.target.value)}
                          placeholder="68"
                          className={hrInputClass}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        今日の目標
                        <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                      </label>
                      <input
                        type="text"
                        value={dailyGoal}
                        onChange={e => setDailyGoal(e.target.value)}
                        placeholder="今日これをやる、と決めたこと"
                        className={textInputClass}
                      />
                      <p className="text-xs text-muted mt-3 mb-2">こんな感じで大丈夫です。タップでそのまま入ります。</p>
                      <div className="flex flex-wrap gap-2">
                        {GOAL_EXAMPLES.map(ex => (
                          <button
                            key={ex}
                            type="button"
                            onClick={() => setDailyGoal(ex)}
                            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted hover:border-clover/50 hover:text-foreground transition-colors"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!step1Ready}
                      className="w-full rounded-xl bg-clover text-white font-bold py-4 text-base hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      運動へ
                    </button>
                    {!step1Ready && (
                      <p className="text-xs text-muted text-center -mt-2">安静時の心拍数を入れると次へ進めます</p>
                    )}
                  </>
                )}

                {/* ── ステップ2：運動後 ── */}
                {step === 2 && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">運動が終わったら</h2>
                      <p className="text-sm text-muted mt-1">
                        終わった直後の脈と、その1分後の脈を測ります。
                      </p>
                    </div>

                    <div className="rounded-xl border border-clover/20 bg-clover-light/20 p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        運動をやめたら、リラックスできる姿勢で1分待ちます。
                        1分たったら、そのままの姿勢で測ってください。
                        待っている間に歩き回ると数値が変わります。
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          運動直後の心拍数
                          <span className="text-xs text-muted ml-1.5 font-normal">いちばん高かった値</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={maxHR}
                            onChange={e => setMaxHR(e.target.value)}
                            placeholder="152"
                            className={hrInputClass}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          1分後の心拍数
                          <span className="text-xs text-muted ml-1.5 font-normal">リラックスした姿勢で1分待って</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={recoveryHR}
                            onChange={e => setRecoveryHR(e.target.value)}
                            placeholder="118"
                            className={hrInputClass}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">bpm</span>
                        </div>
                      </div>
                    </div>

                    {Number(maxHR) > 0 && Number(recoveryHR) >= Number(maxHR) && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                        1分後の心拍数は、運動直後より低くなるはずです。入力を確認してください。
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border border-border text-muted font-medium py-4 px-6 hover:text-foreground hover:border-foreground/20 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!step2Ready}
                        className="flex-1 rounded-xl bg-clover text-white font-bold py-4 text-base hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        ふりかえりへ
                      </button>
                    </div>
                  </>
                )}

                {/* ── ステップ3：ふりかえり ── */}
                {step === 3 && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-foreground tracking-tight">ふりかえり</h2>
                      <p className="text-sm text-muted mt-1">
                        今日の調子と、やったことを残しておきましょう。
                      </p>
                    </div>

                    {dailyGoal && (
                      <div className="rounded-xl border border-clover/20 bg-clover-light/20 p-4">
                        <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">今日の目標</p>
                        <p className="text-sm text-foreground">{dailyGoal}</p>
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                      <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">
                        今日の調子
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
                              {SUBJECTIVE_SCALE.map(({ n, label }) => (
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

                    <div className="rounded-xl border border-border bg-card p-5">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        今日やったこと
                        <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                      </label>
                      <textarea
                        value={trainingLog}
                        onChange={e => setTrainingLog(e.target.value)}
                        placeholder={'スクワット 10回×3セット\nウォーキング 30分'}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        メモ
                        <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="気づいたことがあれば"
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl border border-border text-muted font-medium py-4 px-6 hover:text-foreground hover:border-foreground/20 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !preview}
                        className="flex-1 rounded-xl bg-clover text-white font-bold py-4 text-base hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {saving ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            保存中...
                          </span>
                        ) : (
                          'スコアを見る'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="pt-2 pb-4">
                <Link
                  href="/record/mypage"
                  className="block text-center text-sm text-muted hover:text-foreground transition-colors"
                >
                  ← マイページに戻る
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
