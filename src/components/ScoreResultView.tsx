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
  if (s >= 100) return 'from-amber-300 via-yellow-400 to-amber-500'
  if (s >= 80) return 'from-emerald-400 via-green-500 to-emerald-600'
  if (s >= 60) return 'from-teal-300 via-teal-400 to-emerald-500'
  if (s >= 40) return 'from-sky-300 via-sky-400 to-blue-500'
  return 'from-slate-300 via-slate-400 to-slate-500'
}

function getScoreAccent(s: number): string {
  if (s >= 100) return 'text-amber-500'
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (s >= 60) return 'text-teal-600 dark:text-teal-400'
  if (s >= 40) return 'text-sky-600 dark:text-sky-400'
  return 'text-slate-500'
}

function getRankGlow(s: number): string {
  if (s >= 100) return 'shadow-[0_0_30px_rgba(251,191,36,0.5)] border-amber-300/60'
  if (s >= 80) return 'shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-300/60'
  if (s >= 60) return 'shadow-[0_0_25px_rgba(20,184,166,0.35)] border-teal-300/60'
  if (s >= 40) return 'shadow-[0_0_20px_rgba(56,189,248,0.3)] border-sky-300/60'
  return 'shadow-[0_0_15px_rgba(148,163,184,0.25)] border-slate-300/60'
}

function getWellnessMessage(s: number): string {
  if (s >= 100) return '素晴らしいコンディションです！自律神経が最高の状態で働いています。'
  if (s >= 80) return '良好なリカバリー力です。日々の積み重ねが身体に表れています。'
  if (s >= 60) return '安定したコンディションです。この調子で続けていきましょう。'
  if (s >= 40) return '回復の兆しが見えています。休息と軽い運動を心がけましょう。'
  return 'まずは身体を休めることが大切です。深呼吸から始めてみましょう。'
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
      <style>{`
        @keyframes scoreReveal {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rankPulse {
          0%, 100% { box-shadow: inherit; }
          50% { filter: brightness(1.1); }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        @keyframes fadeUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .score-reveal { animation: scoreReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .rank-pulse { animation: rankPulse 2.5s ease-in-out infinite; }
        .bar-grow { animation: barGrow 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }
        .fade-up-1 { animation-delay: 0.15s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.3s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.45s; opacity: 0; }
      `}</style>

      {/* Score card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className={`bg-gradient-to-br ${getScoreGradient(score.totalScore)} px-6 pt-8 pb-6 text-white relative overflow-hidden`}>
          {/* Subtle radial glow behind the rank */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          </div>

          {participantName && (
            <p className="text-white/90 text-sm font-bold mb-3 relative">{participantName}</p>
          )}

          <div className="flex flex-col items-center relative">
            {/* Rank circle */}
            <div className={`score-reveal w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 ${getRankGlow(score.totalScore)} flex items-center justify-center rank-pulse`}>
              <span className="text-3xl font-black text-white drop-shadow-sm tracking-tight">
                {score.level.label}
              </span>
            </div>

            {/* Score number */}
            <div className="score-reveal mt-3 flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold tracking-tighter drop-shadow-sm">{score.totalScore}</span>
              <span className="text-white/60 text-sm font-medium">/ 120</span>
            </div>

            {/* Wellness message */}
            <p className="fade-up fade-up-1 mt-3 text-sm text-white/90 text-center leading-relaxed max-w-xs font-medium">
              {getWellnessMessage(score.totalScore)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-5 relative">
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/50 rounded-full bar-grow"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* HR breakdown */}
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="p-4 text-center fade-up fade-up-1">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">安静時HR</p>
            <p className="text-xl font-bold text-foreground">{hrData.restingHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center fade-up fade-up-2">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">最大HR</p>
            <p className="text-xl font-bold text-foreground">{hrData.maxHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="p-4 text-center fade-up fade-up-3">
            <p className="text-[10px] text-muted font-medium tracking-wider uppercase mb-1">リカバリー</p>
            <p className={`text-xl font-bold ${getScoreAccent(score.totalScore)}`}>{score.recoveryAmount}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 fade-up fade-up-2">
        <h3 className="text-sm font-bold text-foreground">フィードバック</h3>

        <div className="rounded-xl bg-gradient-to-r from-clover-light/40 to-background p-3.5 border border-clover/10">
          <p className="text-[10px] font-semibold text-clover mb-1 tracking-wider uppercase">スコア評価</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.scoreFeedback}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-clover-light/30 to-background p-3.5 border border-clover/10">
          <p className="text-[10px] font-semibold text-clover mb-1 tracking-wider uppercase">リカバリー力</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.recoveryFeedback}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-clover-light/20 to-background p-3.5 border border-clover/10">
          <p className="text-[10px] font-semibold text-clover mb-1 tracking-wider uppercase">安静時心拍</p>
          <p className="text-sm text-foreground leading-relaxed">{feedback.restingHRFeedback}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-1 fade-up fade-up-3">
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
