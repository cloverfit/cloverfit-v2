'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { calculateScore, generateAutoFeedback } from '@/lib/scoring'
import ScoreResultView from '@/components/ScoreResultView'

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

  return (
    <ScoreResultView
      score={result}
      feedback={feedback}
      hrData={hrData}
      onNext={() => window.location.href = '/simple'}
      nextLabel="もう一度測定する"
      secondaryAction={
        <>
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
        </>
      }
    />
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
