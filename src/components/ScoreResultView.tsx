'use client'

import { useEffect, useState, useRef } from 'react'
import type { ScoreResult, AutoFeedback, AlignmentFeedback } from '@/lib/scoring'
import CloverIcon from '@/components/CloverIcon'

interface ScoreResultViewProps {
  score: ScoreResult
  feedback: AutoFeedback
  hrData: { restingHR: number; maxHR: number; recoveryHR: number }
  participantName?: string
  onNext: () => void
  nextLabel: string
  secondaryAction?: React.ReactNode
}

function getRingColors(s: number): { start: string; end: string } {
  if (s >= 100) return { start: '#2d8a56', end: '#1a6b3f' }
  if (s >= 80) return { start: '#3a9d6a', end: '#2d8a56' }
  if (s >= 60) return { start: '#5bb585', end: '#3a9d6a' }
  if (s >= 40) return { start: '#8ecfaa', end: '#5bb585' }
  return { start: '#b8dfc9', end: '#8ecfaa' }
}

function getRingBg(s: number): string {
  if (s >= 80) return '#e8f5ed'
  if (s >= 60) return '#edf7f1'
  if (s >= 40) return '#f0f9f4'
  return '#f5fbf7'
}

function getAccentClass(s: number): string {
  if (s >= 100) return 'text-clover-dark'
  if (s >= 80) return 'text-clover'
  if (s >= 60) return 'text-emerald-600'
  if (s >= 40) return 'text-emerald-500/80'
  return 'text-muted'
}

function getRecommendedAction(score: number): string {
  if (score >= 100) {
    return '素晴らしいコンディションです。今の生活習慣を維持しつつ、新しい運動チャレンジに取り組んでみましょう。'
  } else if (score >= 80) {
    return '良好なコンディションです。週3〜4回の有酸素運動を継続し、運動後のクールダウンを丁寧に行いましょう。'
  } else if (score >= 60) {
    return '安定したベースがあります。中強度の有酸素運動（ウォーキング、軽いジョギング）を週3回以上取り入れてみましょう。'
  } else if (score >= 40) {
    return 'まずは毎日20分のウォーキングから始めてみましょう。深呼吸を1日3回実践し、就寝時間を一定にすることが効果的です。'
  }
  return '休養を最優先にしてください。軽いストレッチや散歩から始め、睡眠時間を7〜9時間確保しましょう。'
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
  // カウントアップアニメーション
  const [displayScore, setDisplayScore] = useState(0)
  const [animationDone, setAnimationDone] = useState(false)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const target = score.totalScore
    const duration = 1200 // ms
    const startTime = performance.now()

    // easeOutExpo: 最初は速く、最後はゆっくり（期待感を煽る）
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = Math.round(eased * target)
      setDisplayScore(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setAnimationDone(true)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [score.totalScore])

  const radius = 82
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius
  const animatedProgress = Math.min(displayScore / 120, 1)
  const strokeDashoffset = circumference * (1 - animatedProgress)
  const ringColors = getRingColors(score.totalScore)
  const ringBg = getRingBg(score.totalScore)
  const gradientId = 'scoreGradient'
  const glowId = 'scoreGlow'

  // 目盛り線の生成（120点満点を12分割）
  const tickCount = 24
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360 - 90
    const isMajor = i % 2 === 0
    const outerR = 98
    const innerR = isMajor ? 93 : 95
    const rad = (angle * Math.PI) / 180
    return {
      x1: 100 + outerR * Math.cos(rad),
      y1: 100 + outerR * Math.sin(rad),
      x2: 100 + innerR * Math.cos(rad),
      y2: 100 + innerR * Math.sin(rad),
      isMajor,
    }
  })

  return (
    <div className="space-y-5">
      {/* スコア表示 */}
      <div className="rounded-2xl border border-border bg-card px-6 pt-8 pb-6">
        {participantName && (
          <p className="text-center text-sm font-bold text-foreground mb-5">{participantName} さんの結果</p>
        )}
        <div className="flex justify-center">
          <div className="relative w-[220px] h-[220px]">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ringColors.start} />
                  <stop offset="100%" stopColor={ringColors.end} />
                </linearGradient>
                <filter id={glowId}>
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 目盛り */}
              {ticks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                  stroke={ringBg}
                  strokeWidth={t.isMajor ? 1.5 : 0.8}
                  opacity={t.isMajor ? 0.6 : 0.3}
                />
              ))}

              {/* 背景リング（溝） */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke={ringBg}
                strokeWidth={strokeWidth}
                opacity={0.8}
              />

              {/* メインプログレスリング */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                filter={`url(#${glowId})`}
                className=""
              />

              {/* 内側の細いアクセントリング */}
              <circle
                cx="100" cy="100" r={radius - strokeWidth / 2 - 4}
                fill="none"
                stroke={ringColors.start}
                strokeWidth={0.5}
                opacity={0.2}
              />
            </svg>

            {/* 中央のスコア表示 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-6xl font-extrabold tracking-tight leading-none transition-colors duration-500 ${getAccentClass(displayScore)}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {displayScore}
              </span>
              <span className="text-[10px] font-bold text-muted tracking-[0.2em] mt-1">SCORE</span>
            </div>
          </div>
        </div>

        {/* レベルバッジ */}
        <div className="flex justify-center mt-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-clover-light/40 border border-clover/20 text-clover-dark">
            <CloverIcon leaves={score.level.leaves} size={16} className="text-clover" />
            {score.level.label}
          </span>
        </div>

        {/* スコア / 120 表記 */}
        <p className="text-center text-xs text-muted mt-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {displayScore} / 120
        </p>
      </div>

      {/* 客観データからのフィードバック */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-1 h-5 rounded-full bg-clover" />
          <h3 className="text-sm font-bold text-foreground">客観データからのフィードバック</h3>
        </div>

        {/* リカバリー量ハイライト */}
        <div className="px-5 pb-4">
          <div className="rounded-xl bg-clover-light/30 border border-clover/20 p-4">
            <p className="text-xs text-clover-dark font-medium mb-1">心拍リカバリー量（1分後）</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-clover-dark">{score.recoveryAmount}</span>
              <span className="text-sm text-clover-dark/60 font-medium">bpm</span>
            </div>
          </div>
        </div>

        {/* 4つのHRデータカード */}
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
            <p className={`text-xl font-bold ${getAccentClass(score.totalScore)}`}>{score.recoveryAmount}</p>
            <p className="text-[10px] text-muted">bpm</p>
          </div>
        </div>

        {/* HRR説明 */}
        <div className="px-5 pb-5">
          <p className="text-xs text-muted leading-relaxed">
            心拍リカバリー量（HRR）は運動後の心拍数の回復量を示す指標です。
            運動後1分間で12bpm以上の回復が正常の目安とされています。
            値が大きいほど自律神経の切り替えがスムーズで、心肺機能が優れていることを示します。
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
            <span className={`text-sm font-bold ${getAccentClass(score.totalScore)}`}>{score.totalScore} 点</span>
          </div>
          <div className="rounded-lg bg-background p-3 mt-2">
            <p className="text-xs text-muted leading-relaxed">
              計算式：100 − 安静時心拍数({hrData.restingHR}) + リカバリー量({score.recoveryAmount}) = {score.totalScore}
            </p>
          </div>
        </div>
      </div>

      {/* 心拍データから分かる現在の状態 */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">心拍データから分かる現在の状態</h3>
        <div className="flex items-center gap-2 mb-2">
          <CloverIcon leaves={score.level.leaves} size={22} className="text-clover" />
          <span className={`font-bold ${getAccentClass(score.totalScore)}`}>{score.level.label}</span>
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
          <div className="w-1 h-5 rounded-full bg-clover" />
          <h3 className="text-sm font-bold text-foreground">おすすめアクション</h3>
        </div>
        <div className="rounded-lg bg-clover-light/30 border border-clover/20 p-4">
          <p className="text-sm text-clover-dark leading-relaxed">
            {getRecommendedAction(score.totalScore)}
          </p>
        </div>
      </div>

      {/* 主観×客観 クロス分析 */}
      {feedback.alignmentFeedback && score.subjectiveScore !== null && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <div className="w-1 h-5 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-foreground">心と体のバランス</h3>
          </div>

          {/* スコア比較バー */}
          <div className="px-5 pb-4">
            <div className="rounded-xl bg-background border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">客観（心拍データ）</span>
                <span className="text-sm font-bold text-clover-dark">{score.totalScore} 点</span>
              </div>
              <div className="w-full h-2 rounded-full bg-clover-light/30">
                <div
                  className="h-2 rounded-full bg-clover transition-all duration-700"
                  style={{ width: `${Math.min(score.totalScore / 120 * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-muted">主観（体感コンディション）</span>
                <span className="text-sm font-bold text-amber-600">{score.subjectiveScore.toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${(score.subjectiveScore / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 乖離タイプ表示 */}
          <div className="px-5 pb-4">
            <div className={`rounded-xl p-4 border ${
              feedback.alignmentFeedback.type === 'aligned-high'
                ? 'bg-clover-light/30 border-clover/20'
                : feedback.alignmentFeedback.type === 'aligned-low'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : feedback.alignmentFeedback.type === 'body-ahead'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : feedback.alignmentFeedback.type === 'mind-ahead'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-background border-border'
            }`}>
              <p className={`text-sm font-bold mb-1 ${
                feedback.alignmentFeedback.type === 'aligned-high'
                  ? 'text-clover-dark'
                  : feedback.alignmentFeedback.type === 'aligned-low'
                    ? 'text-red-700 dark:text-red-300'
                    : feedback.alignmentFeedback.type === 'body-ahead'
                      ? 'text-blue-700 dark:text-blue-300'
                      : feedback.alignmentFeedback.type === 'mind-ahead'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-foreground'
              }`}>
                {feedback.alignmentFeedback.title}
              </p>
              <p className="text-xs text-muted font-medium mb-2">{feedback.alignmentFeedback.summary}</p>
              <p className="text-sm text-foreground leading-relaxed">{feedback.alignmentFeedback.detail}</p>
            </div>
          </div>

          {/* アドバイス */}
          <div className="px-5 pb-5">
            <div className="rounded-lg bg-background p-3">
              <p className="text-[10px] font-semibold text-amber-600 mb-1">おすすめ</p>
              <p className="text-sm text-foreground leading-relaxed">{feedback.alignmentFeedback.advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* CloverFitの想い */}
      <div className="rounded-2xl border border-clover/20 bg-clover-light/20 p-5">
        <p className="text-sm text-clover-dark leading-relaxed font-medium text-center">
          CloverFitでは、1回の点数よりも変化を大切にします。
        </p>
        <p className="text-xs text-clover-dark/50 mt-2 text-center leading-relaxed">
          定期的に測定を続けることで、あなたの自律神経の変化やトレーニング効果を可視化できます。
          スコアの推移に注目して、長期的な健康管理に役立ててください。
        </p>
      </div>

      {/* 注意事項 */}
      <p className="text-[10px] text-muted leading-relaxed px-1">
        ※ CloverFitスコアは心拍回復（HRR）に基づく独自の指標であり、医学的診断を目的としたものではありません。
        健康上の懸念がある場合は、医療専門家にご相談ください。
      </p>

      {/* アクション */}
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
