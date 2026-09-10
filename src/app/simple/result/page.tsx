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

  const scoreColor =
    result.totalScore >= 80
      ? 'text-clover'
      : result.totalScore >= 60
        ? 'text-green-600 dark:text-green-400'
        : result.totalScore >= 40
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-orange-600 dark:text-orange-400'

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-muted text-sm mb-2">あなたのスコア</p>
        <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
          {result.totalScore}
        </div>
        <div className="text-2xl mb-1">{result.level.emoji}</div>
        <div className="text-lg font-medium text-foreground">{result.level.label}</div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">測定データ</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted">安静時HR</p>
            <p className="text-xl font-bold text-foreground">{restingHR}</p>
            <p className="text-xs text-muted">bpm</p>
          </div>
          <div>
            <p className="text-xs text-muted">最大HR</p>
            <p className="text-xl font-bold text-foreground">{maxHR}</p>
            <p className="text-xs text-muted">bpm</p>
          </div>
          <div>
            <p className="text-xs text-muted">回復時HR</p>
            <p className="text-xl font-bold text-foreground">{recoveryHR}</p>
            <p className="text-xs text-muted">bpm</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">リカバリー量</span>
            <span className="font-bold text-foreground">{result.recoveryAmount} bpm</span>
          </div>
          <p className="text-xs text-muted mt-1">
            計算式: 100 - 安静時HR({restingHR}) + リカバリー量({result.recoveryAmount}) = {result.totalScore}
          </p>
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">フィードバック</h3>

        <div>
          <p className="text-xs font-medium text-clover mb-1">スコア評価</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.scoreFeedback}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-clover mb-1">リカバリー力</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.recoveryFeedback}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-clover mb-1">安静時心拍</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.restingHRFeedback}</p>
        </div>
      </div>

      {/* Score guide */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">スコアレベル一覧</h3>
        <div className="space-y-2">
          {[
            { emoji: '🍀👑', label: 'Master', range: '100+', desc: 'トップアスリート級' },
            { emoji: '☘️', label: '三葉 Excellent', range: '80-99', desc: '非常に良好' },
            { emoji: '🌿', label: '二葉 Good', range: '60-79', desc: '良好' },
            { emoji: '🌱', label: '一葉 Average', range: '40-59', desc: '標準的' },
            { emoji: '🌰', label: 'Seed', range: '0-39', desc: '改善の余地あり' },
          ].map(level => (
            <div
              key={level.label}
              className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 ${
                result.level.label === level.label
                  ? 'bg-clover-light border border-clover/30'
                  : ''
              }`}
            >
              <span className="text-lg w-8">{level.emoji}</span>
              <span className="font-medium text-foreground flex-1">{level.label}</span>
              <span className="text-muted text-xs">{level.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/simple"
          className="block w-full rounded-lg bg-clover text-white text-center font-bold py-3 hover:bg-clover-dark transition-colors"
        >
          もう一度測定する
        </Link>
        <Link
          href="/record/login"
          className="block w-full rounded-lg border border-clover text-clover text-center font-medium py-3 hover:bg-clover-light transition-colors"
        >
          記録モードで管理する
        </Link>
        <Link
          href="/"
          className="block text-center text-sm text-muted hover:text-foreground transition-colors"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  )
}

export default function SimpleResultPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍀</span>
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
