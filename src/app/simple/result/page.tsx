'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { calculateScore, generateAutoFeedback } from '@/lib/scoring'

function ScoreResult() {
  const searchParams = useSearchParams()
  const restingHR = Number(searchParams.get('resting') || '0')
  const maxHR = Number(searchParams.get('max') || '0')
  const recoveryHR = Number(searchParams.get('recovery') || '0')

  if (!restingHR || !maxHR || !recoveryHR) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">データが不正です。もう一度入力してください。</p>
        <Link href="/simple" className="text-clover underline">
          入力画面に戻る
        </Link>
      </div>
    )
  }

  const hrData = { restingHR, maxHR, recoveryHR }
  const result = calculateScore(hrData)
  const feedback = generateAutoFeedback(hrData, result.totalScore)

  function getScoreGradient(score: number): string {
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

  const scoreBarWidth = Math.min((result.totalScore / 120) * 100, 100)

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className={`bg-gradient-to-r ${getScoreGradient(result.totalScore)} p-6 text-white`}>
          <p className="text-white/80 text-xs font-medium tracking-wider uppercase">Your Score</p>
          <div className="flex items-start justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-extrabold tracking-tighter">{result.totalScore}</span>
              <span className="text-white/70 text-sm font-medium">/ 120</span>
            </div>
            <span className="inline-block px-3 py-1.5 rounded-lg text-xl font-extrabold bg-white/20 backdrop-blur-sm">
              {result.level.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-700"
                style={{ width: `${scoreBarWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* HR breakdown */}
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">安静時HR</p>
            <p className="text-xl font-bold text-foreground">{restingHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最大HR</p>
            <p className="text-xl font-bold text-foreground">{maxHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">リカバリー</p>
            <p className={`text-xl font-bold ${getScoreAccent(result.totalScore)}`}>{result.recoveryAmount}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">フィードバック</h3>

        <div className="rounded-lg bg-background p-3">
          <p className="text-[10px] font-semibold text-clover mb-1">スコア評価</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.scoreFeedback}</p>
        </div>

        <div className="rounded-lg bg-background p-3">
          <p className="text-[10px] font-semibold text-clover mb-1">リカバリー力</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.recoveryFeedback}</p>
        </div>

        <div className="rounded-lg bg-background p-3">
          <p className="text-[10px] font-semibold text-clover mb-1">安静時心拍</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.restingHRFeedback}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-1">
        <Link
          href="/simple"
          className="block w-full rounded-xl bg-clover text-white text-center font-bold py-3.5 hover:bg-clover-dark transition-colors"
        >
          もう一度測定する
        </Link>
        <Link
          href="/record/login"
          className="block w-full rounded-xl border border-clover text-clover text-center font-medium py-3 hover:bg-clover-light transition-colors"
        >
          記録モードで管理する
        </Link>
        <Link
          href="/"
          className="block text-center text-sm text-muted hover:text-foreground transition-colors"
        >
          ← トップに戻る
        </Link>
      </div>
    </div>
  )
}

export default function SimpleResultPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-clover">CloverFit</span>
          </Link>
          <span className="text-muted text-sm ml-2">結果</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-md w-full">
          <Suspense fallback={<div className="text-center py-12 text-muted">読み込み中...</div>}>
            <ScoreResult />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
