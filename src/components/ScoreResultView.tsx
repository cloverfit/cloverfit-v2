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

function getRingColor(s: number): string {
  if (s >= 100) return '#f59e0b' // amber-500
  if (s >= 80) return '#10b981'  // emerald-500
  if (s >= 60) return '#14b8a6'  // teal-500
  if (s >= 40) return '#3b82f6'  // blue-500
  return '#94a3b8'               // slate-400
}

function getRingBg(s: number): string {
  if (s >= 100) return '#fef3c7' // amber-100
  if (s >= 80) return '#d1fae5'  // emerald-100
  if (s >= 60) return '#ccfbf1'  // teal-100
  if (s >= 40) return '#dbeafe'  // blue-100
  return '#f1f5f9'               // slate-100
}

function getAccentColor(s: number): string {
  if (s >= 100) return 'text-amber-500'
  if (s >= 80) return 'text-emerald-600'
  if (s >= 60) return 'text-teal-600'
  if (s >= 40) return 'text-blue-600'
  return 'text-slate-500'
}

function getRecommendedAction(score: number): string {
  if (score >= 100) {
    return '素晴らしいコンディションです。今の生活習慣を維持しつつ、新しい運動チャレンジに取り組んでみましょう。高強度インターバルトレーニング（HIIT）なども効果的です。'
  } else if (score >= 80) {
    return '良好なコンディションです。週3-4回の有酸素運動を継続し、運動後のクールダウンを丁寧に行いましょう。呼吸法（吸気4秒・呼気6秒）も取り入れてみてください。'
  } else if (score >= 60) {
    return '安定したベースがあります。中強度の有酸素運動（ウォーキング、軽いジョギング）を週3回以上取り入れ、睡眠の質を意識してみましょう。'
  } else if (score >= 40) {
    return 'まずは毎日20分のウォーキングから始めてみましょう。深呼吸（吸気4秒・呼気8秒）を1日3回実践し、就寝時間を一定にすることが効果的です。'
  }
  return '休養を最優先にしてください。軽いストレッチや散歩から始め、睡眠時間を7-9時間確保しましょう。カフェインの摂取を控え、水分補給を心がけてください。'
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
  const radius = 88
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(score.totalScore / 120, 1)
  const strokeDashoffset = circumference * (1 - progress)
  const ringColor = getRingColor(score.totalScore)
  const ringBg = getRingBg(score.totalScore)

  return (
    <div className="space-y-5">
      {/* Score Circle */}
      <div className="rounded-2xl border border-border bg-card p-8">
        {participantName && (
          <p className="text-center text-sm font-bold text-foreground mb-4">{participantName} さんの結果</p>
        )}
        <div className="flex justify-center">
          <div className="relative w-[200px] h-[200px]">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={ringBg}
                strokeWidth={strokeWidth}
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-muted tracking-widest uppercase">SCORE</span>
              <span className={`text-5xl font-extrabold ${getAccentColor(score.totalScore)}`}>{score.totalScore}</span>
              <span className="mt-1 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-background border border-border text-foreground">
                {score.level.emoji} {score.level.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 客観データからのフィードバック */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">客観データからのフィードバック</h3>
        </div>

        {/* Recovery amount highlight */}
        <div className="px-5 pb-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">心拍リカバリー量（1分後）</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{score.recoveryAmount}</span>
              <span className="text-sm text-emerald-600/70 dark:text-emerald-400/70 font-medium">bpm</span>
            </div>
          </div>
        </div>

        {/* 4 HR data cards */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-4">
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-[10px] text-muted font-medium mb-1">安静時心拍数</p>
            <p className="text-xl font-bold text-foreground">{hrData.restingHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-[10px] text-muted font-medium mb-1">運動後最大心拍数</p>
            <p className="text-xl font-bold text-foreground">{hrData.maxHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-[10px] text-muted font-medium mb-1">1分後心拍数</p>
            <p className="text-xl font-bold text-foreground">{hrData.recoveryHR}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
          <div className="rounded-xl bg-background border border-border p-3 text-center">
            <p className="text-[10px] text-muted font-medium mb-1">心拍リカバリー量</p>
            <p className={`text-xl font-bold ${getAccentColor(score.totalScore)}`}>{score.recoveryAmount}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
        </div>

        {/* HRR explanation */}
        <div className="px-5 pb-5">
          <p className="text-xs text-muted leading-relaxed">
            HRR（Heart Rate Recovery）は運動後の心拍数の回復量を示す指標です。
            運動後1分間で12bpm以上の回復が正常の目安とされています。
            値が大きいほど副交感神経の再活性化が速く、心肺機能が優れていることを示します。
          </p>
        </div>
      </div>

      {/* スコアの内訳 */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">スコアの内訳</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted">安静時心拍数</span>
            <span className="text-sm font-bold text-foreground">{hrData.restingHR} bpm</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted">心拍リカバリー量</span>
            <span className="text-sm font-bold text-foreground">{score.recoveryAmount} bpm</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted">CloverFitスコア</span>
            <span className={`text-sm font-bold ${getAccentColor(score.totalScore)}`}>{score.totalScore}</span>
          </div>
          <div className="rounded-lg bg-background p-3 mt-2">
            <p className="text-xs text-muted leading-relaxed">
              計算式: 100 − 安静時心拍数({hrData.restingHR}) + リカバリー量({score.recoveryAmount}) = {score.totalScore}
            </p>
          </div>
        </div>
      </div>

      {/* 心拍データから分かる現在の状態 */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">心拍データから分かる現在の状態</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{score.level.emoji}</span>
          <span className={`font-bold ${getAccentColor(score.totalScore)}`}>{score.level.label}</span>
        </div>
        <div className="rounded-lg bg-background p-3">
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
        {feedback.trendFeedback && (
          <div className="rounded-lg bg-background p-3">
            <p className="text-[10px] font-semibold text-clover mb-1">前回との比較</p>
            <p className="text-sm text-foreground leading-relaxed">{feedback.trendFeedback}</p>
          </div>
        )}
      </div>

      {/* おすすめアクション */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">おすすめアクション</h3>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
          <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
            {getRecommendedAction(score.totalScore)}
          </p>
        </div>
      </div>

      {/* 主観データからのフィードバック */}
      {score.subjectiveScore !== null && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-foreground">主観データからのフィードバック</h3>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">主観スコア</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{score.subjectiveScore.toFixed(1)}</span>
              <span className="text-xs text-amber-600/70 dark:text-amber-400/70">/ 5.0</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              {score.subjectiveScore >= 4
                ? '主観的なコンディションも良好です。心身ともに充実した状態と言えます。'
                : score.subjectiveScore >= 3
                  ? '主観的なコンディションは平均的です。客観データと合わせて総合的に判断しましょう。'
                  : '主観的には疲労を感じている状態です。十分な休養と睡眠を心がけてください。'}
            </p>
          </div>
        </div>
      )}

      {/* Philosophy */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-5">
        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium text-center">
          Clover Fitでは、1回の点数よりも変化を大切にします。
        </p>
        <p className="text-xs text-amber-700/70 dark:text-amber-400/50 mt-2 text-center leading-relaxed">
          定期的に測定を続けることで、あなたの自律神経の変化やトレーニング効果を可視化できます。
          スコアの推移に注目して、長期的な健康管理に役立ててください。
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted leading-relaxed px-1">
        ※ CloverFitスコアは心拍回復（HRR）に基づく独自の指標であり、医学的診断を目的としたものではありません。
        健康上の懸念がある場合は、医療専門家にご相談ください。
      </p>

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
