'use client'

import type { ScoreResult, AutoFeedback } from '@/lib/scoring'

interface ScoreResultViewProps {
  score: ScoreResult
  feedback: AutoFeedback
  hrData: { restingHR: number; maxHR: number; recoveryHR: number }
  participantName?: string
  onNext: () => void
  nextLabel: string
  secondaryAction?: React.ReactNode
}

function getScoreGradient(s: number): string {
  if (s >= 100) return 'from-amber-400 to-yellow-500'
  if (s >= 80) return 'from-emerald-500 to-green-600'
  if (s >= 60) return 'from-teal-400 to-emerald-500'
  if (s >= 40) return 'from-sky-400 to-blue-500'
  return 'from-slate-400 to-slate-500'
}

function getScoreAccent(s: number): string {
  if (s >= 100) return 'text-amber-500'
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 60) return 'text-teal-600 dark:text-teal-400'
  if (s >= 40) return 'text-sky-600 dark:text-sky-400'
  return 'text-slate-500'
}

export default function ScoreResultView({
  score,
  feedback,
  hrData,
  participantName,
  onNext,
  nextLabel,
  secondaryAction,
}: ScoreResultViewProps) {
  const barWidth = Math.min((score.totalScore / 120) * 100, 100)

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className={`bg-gradient-to-r ${getScoreGradient(score.totalScore)} p-6 text-white`}>
          {participantName && (
            <p className="text-white/90 text-sm font-bold mb-1">{participantName}</p>
          )}
          <p className="text-white/80 text-xs font-medium tracking-wider uppercase">Your Score</p>
          <div className="flex items-start justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-extrabold tracking-tighter">{score.totalScore}</span>
              <span className="text-white/70 text-sm font-medium">/ 120</span>
            </div>
            <span className="inline-block px-3 py-1.5 rounded-lg text-xl font-extrabold bg-white/20 backdrop-blur-sm">
              {score.level.label}
            </span>
          </div>
          <div className="mt-4">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* HR breakdown */}
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">安静時HR</p>
            <p className="text-xl font-bold text-foreground">{hrData.restingHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最大HR</p>
            <p className="text-xl font-bold text-foreground">{hrData.maxHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">リカバリー</p>
            <p className={`text-xl font-bold ${getScoreAccent(score.totalScore)}`}>{score.recoveryAmount}</p>
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
        <button
          onClick={onNext}
          className="w-full rounded-xl bg-clover text-white text-center font-bold py-3.5 hover:bg-clover-dark transition-colors"
        >
          {nextLabel}
        </button>
        {secondaryAction}
      </div>
    </div>
  )
}
