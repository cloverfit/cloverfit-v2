'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { calculateScore, generateAutoFeedback, type ScoreResult, type AutoFeedback } from '@/lib/scoring'
import ScoreResultView from '@/components/ScoreResultView'

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function MeasurePage() {
  // 基本情報
  const [participantName, setParticipantName] = useState('')
  const [measurementDate, setMeasurementDate] = useState(() => new Date().toISOString().split('T')[0])
  const [birthDate, setBirthDate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gender, setGender] = useState('')
  const [instructorName, setInstructorName] = useState('')

  // HR inputs
  const [restingHR, setRestingHR] = useState('')
  const [maxHR, setMaxHR] = useState('')
  const [recoveryHR, setRecoveryHR] = useState('')

  // Subjective inputs
  const [fatigue, setFatigue] = useState('')
  const [concentration, setConcentration] = useState('')
  const [stress, setStress] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')

  // Notes
  const [notes, setNotes] = useState('')
  const [nextSuggestion, setNextSuggestion] = useState('')

  // State
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Result
  const [result, setResult] = useState<{
    score: ScoreResult
    feedback: AutoFeedback
    hrData: { restingHR: number; maxHR: number; recoveryHR: number }
  } | null>(null)

  const age = calcAge(birthDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const r = Number(restingHR)
    const m = Number(maxHR)
    const rec = Number(recoveryHR)

    if (r <= 0 || m <= 0 || rec <= 0) {
      setError('心拍数を正しく入力してください')
      setSaving(false)
      return
    }
    if (rec >= m) {
      setError('回復時心拍数は最大心拍数より低い値を入力してください')
      setSaving(false)
      return
    }

    const hrData = { restingHR: r, maxHR: m, recoveryHR: rec }
    const subjectiveData = {
      fatigue: fatigue ? Number(fatigue) : undefined,
      concentration: concentration ? Number(concentration) : undefined,
      stress: stress ? Number(stress) : undefined,
      sleepQuality: sleepQuality ? Number(sleepQuality) : undefined,
    }

    const scoreResult = calculateScore(hrData, subjectiveData)
    const autoFeedback = generateAutoFeedback(hrData, scoreResult.totalScore, undefined, scoreResult.subjectiveScore)

    // DBに保存を試みる（参加者作成→測定保存）
    try {
      // 1. 参加者を作成（簡易PIN自動生成）
      const pin = String(Math.floor(1000 + Math.random() * 9000))
      const partRes = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: participantName,
          pin_code: pin,
          birth_date: birthDate || null,
          company_name: companyName || null,
          gender: gender || null,
        }),
      })

      let participantId: string | null = null
      if (partRes.ok) {
        const partData = await partRes.json()
        participantId = partData.participant?.id
      } else if (partRes.status === 409) {
        // 既存の参加者 → 名前で取得
        const listRes = await fetch('/api/participants')
        if (listRes.ok) {
          const listData = await listRes.json()
          const found = (listData.participants || []).find((p: { name: string; id: string }) => p.name === participantName)
          if (found) participantId = found.id
        }
      }

      // 2. 測定データ保存
      if (participantId) {
        await fetch('/api/measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participant_id: participantId,
            instructor_id: null,
            measurement_date: measurementDate,
            resting_hr: r,
            max_hr: m,
            recovery_hr: rec,
            recovery_amount: scoreResult.recoveryAmount,
            total_score: scoreResult.totalScore,
            fatigue: fatigue ? Number(fatigue) : null,
            concentration: concentration ? Number(concentration) : null,
            stress: stress ? Number(stress) : null,
            sleep_quality: sleepQuality ? Number(sleepQuality) : null,
            subjective_score: scoreResult.subjectiveScore,
            notes: [
              notes,
              nextSuggestion ? `【次回提案】${nextSuggestion}` : '',
              instructorName ? `【担当】${instructorName}` : '',
            ].filter(Boolean).join('\n') || null,
            auto_feedback: {
              score_feedback: autoFeedback.scoreFeedback,
              recovery_feedback: autoFeedback.recoveryFeedback,
              trend_feedback: autoFeedback.trendFeedback || null,
              alignment_feedback: autoFeedback.alignmentFeedback || null,
            },
          }),
        })
      }
    } catch {
      // DB保存失敗してもスコア表示は行う
    }

    setResult({ score: scoreResult, feedback: autoFeedback, hrData })
    setSaving(false)
  }

  function handleReset() {
    setResult(null)
    setParticipantName('')
    setRestingHR('')
    setMaxHR('')
    setRecoveryHR('')
    setFatigue('')
    setConcentration('')
    setStress('')
    setSleepQuality('')
    setNotes('')
    setNextSuggestion('')
    setMeasurementDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-clover tracking-tight">CloverFit</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <span className="font-bold text-clover">測定</span>
            <Link href="/record/login" className="text-muted hover:text-foreground transition-colors">過去データ</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Page title */}
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">測定入力</h2>
            <p className="text-sm text-muted mt-1">心拍データを入力して、コンディションスコアを算出します</p>
          </div>

          {/* Result screen */}
          {result && (
            <>
              <ScoreResultView
                score={result.score}
                feedback={result.feedback}
                hrData={result.hrData}
                participantName={participantName || undefined}
                onNext={handleReset}
                nextLabel="もう一度測定する"
                secondaryAction={
                  <Link
                    href="/"
                    className="block text-center text-sm text-muted hover:text-foreground transition-colors"
                  >
                    トップに戻る
                  </Link>
                }
              />
            </>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 基本情報 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">基本情報</h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    参加者名
                    <span className="text-red-500 ml-0.5">*</span>
                    <span className="text-xs text-muted ml-1.5 font-normal">イニシャル可</span>
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={e => setParticipantName(e.target.value)}
                    placeholder="山田 太郎"
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    測定日
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    value={measurementDate}
                    onChange={e => setMeasurementDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    生年月日
                    <span className="text-xs text-muted ml-1.5 font-normal">任意 ・ 年齢自動計算</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                    />
                    {age !== null && (
                      <span className="text-sm font-bold text-clover whitespace-nowrap">{age}歳</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    企業名 / チーム名
                    <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="株式会社〇〇"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    性別
                    <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: '', label: '選択しない' },
                      { value: 'male', label: '男性' },
                      { value: 'female', label: '女性' },
                      { value: 'other', label: 'その他' },
                      { value: 'no_answer', label: '回答しない' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setGender(gender === opt.value ? '' : opt.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          gender === opt.value
                            ? 'bg-clover text-white border-clover shadow-sm'
                            : 'bg-background text-muted border-border hover:border-clover/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    セッション担当者
                    <span className="text-xs text-muted ml-1.5 font-normal">任意</span>
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={e => setInstructorName(e.target.value)}
                    placeholder="担当者名"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>
              </div>

              {/* 測定手順 */}
              <div className="rounded-xl border border-clover/20 bg-clover-light/20 p-5">
                <h3 className="text-sm font-bold text-clover mb-3">心拍リカバリー量の測定手順</h3>
                <ol className="text-sm text-foreground space-y-2 list-decimal list-inside">
                  <li>運動終了直後の最大心拍数を記録</li>
                  <li>運動終了後、その場で直立姿勢を維持</li>
                  <li>正確に1分間のタイマーを設定</li>
                  <li>1分経過後の心拍数を記録</li>
                  <li>最大心拍数から1分後の心拍数を引いた値がリカバリー量</li>
                </ol>
              </div>

              {/* HR inputs */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">
                  心拍数入力
                  <span className="text-red-500 ml-0.5">*</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      安静時心拍数
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
                      運動後最大心拍数
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
                      1分後リカバリー心拍数
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

              {/* 主観コンディション */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">
                  主観コンディション
                  <span className="text-xs font-normal ml-2 normal-case tracking-normal">（任意・1〜5段階）</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { label: '疲労感', desc: '今日の疲れ具合', value: fatigue, set: setFatigue },
                    { label: '集中力', desc: '運動中の集中', value: concentration, set: setConcentration },
                    { label: 'ストレス感', desc: '日頃のストレス', value: stress, set: setStress },
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

              {/* メモ・次回提案 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-xs font-semibold text-muted tracking-wider uppercase">メモ・コメント（任意）</h3>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">メモ</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="今日の体調や気づきなど..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">次回提案コメント</label>
                  <textarea
                    value={nextSuggestion}
                    onChange={e => setNextSuggestion(e.target.value)}
                    placeholder="次回の測定に向けてのアドバイスなど..."
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-clover text-white font-bold py-4 text-base hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    算出中...
                  </span>
                ) : (
                  'スコアを算出する'
                )}
              </button>

              {/* 免責事項 */}
              <p className="text-[10px] text-muted leading-relaxed px-1">
                ※ CloverFitスコアは心拍回復（HRR）に基づく独自の指標であり、医学的診断を目的としたものではありません。
                コンディション把握の目安としてご利用ください。
                健康上の懸念がある場合は、医療専門家にご相談ください。
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
