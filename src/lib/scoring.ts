// CloverFitスコア算出ロジック

export interface HRData {
  restingHR: number
  maxHR: number
  recoveryHR: number
}

export interface SubjectiveData {
  fatigue?: number      // 1-5
  concentration?: number // 1-5
  stress?: number       // 1-5
  sleepQuality?: number // 1-5
}

export interface ScoreResult {
  recoveryAmount: number
  totalScore: number
  subjectiveScore: number | null
  level: ScoreLevel
}

export interface ScoreLevel {
  name: string
  emoji: string
  label: string
  min: number
}

// スコア = 100 - 安静時HR + リカバリー量
export function calculateScore(hr: HRData, subjective?: SubjectiveData): ScoreResult {
  const recoveryAmount = hr.maxHR - hr.recoveryHR

  const totalScore = 100 - hr.restingHR + recoveryAmount

  let subjectiveScore: number | null = null
  if (subjective && Object.values(subjective).some(v => v !== undefined)) {
    const values = [subjective.fatigue, subjective.concentration, subjective.stress, subjective.sleepQuality].filter((v): v is number => v !== undefined)
    if (values.length > 0) {
      subjectiveScore = values.reduce((a, b) => a + b, 0) / values.length
    }
  }

  return {
    recoveryAmount,
    totalScore,
    subjectiveScore,
    level: getLevel(totalScore),
  }
}

// レベル判定
const LEVELS: ScoreLevel[] = [
  { name: 'master', emoji: '🍀👑', label: 'Master', min: 100 },
  { name: 'excellent', emoji: '☘️', label: '三葉 Excellent', min: 80 },
  { name: 'good', emoji: '🌿', label: '二葉 Good', min: 60 },
  { name: 'average', emoji: '🌱', label: '一葉 Average', min: 40 },
  { name: 'seed', emoji: '🌰', label: 'Seed', min: 0 },
]

export function getLevel(score: number): ScoreLevel {
  for (const level of LEVELS) {
    if (score >= level.min) return level
  }
  return LEVELS[LEVELS.length - 1]
}

// 自動フィードバック生成
export interface AutoFeedback {
  scoreFeedback: string
  recoveryFeedback: string
  restingHRFeedback: string
  trendFeedback?: string
}

export function generateAutoFeedback(
  hr: HRData,
  score: number,
  previousScore?: number
): AutoFeedback {
  const recoveryAmount = hr.maxHR - hr.recoveryHR

  // スコア帯フィードバック
  let scoreFeedback: string
  if (score >= 100) {
    scoreFeedback = '最高レベルのコンディション！トップアスリート並みのリカバリー力です。'
  } else if (score >= 80) {
    scoreFeedback = '素晴らしいコンディションです。心身のバランスが非常に良い状態。周りにも良い影響を与えているはずです。'
  } else if (score >= 60) {
    scoreFeedback = '良好なコンディションです！自律神経の切り替えがスムーズです。この調子を維持しましょう。'
  } else if (score >= 40) {
    scoreFeedback = '基礎的なコンディションは整っています。リカバリー力をさらに高めるために、有酸素運動を続けましょう。'
  } else {
    scoreFeedback = 'お疲れ気味のようです。まずは深い呼吸と軽い運動から始めましょう。睡眠の質を意識するだけでもスコアが上がります。'
  }

  // リカバリー量フィードバック
  let recoveryFeedback: string
  if (recoveryAmount >= 40) {
    recoveryFeedback = '回復力が非常に高い状態です（上位20%）。自律神経の切り替えが優秀です。'
  } else if (recoveryAmount >= 25) {
    recoveryFeedback = '良好な回復力です。運動後の心拍がしっかり下がっています。'
  } else if (recoveryAmount >= 15) {
    recoveryFeedback = '標準的な回復力です。継続的な有酸素運動でさらに向上が期待できます。'
  } else {
    recoveryFeedback = '回復力が低めです。疲労が蓄積している可能性があります。十分な休養と呼吸法を取り入れましょう。'
  }

  // 安静時HR フィードバック
  let restingHRFeedback: string
  if (hr.restingHR < 60) {
    restingHRFeedback = '安静時心拍が低く、基礎体力が高い状態です。'
  } else if (hr.restingHR < 80) {
    restingHRFeedback = '安静時心拍は標準的な範囲です。'
  } else {
    restingHRFeedback = '安静時心拍がやや高めです。疲労蓄積やストレスの可能性があります。'
  }

  // 前回比較
  let trendFeedback: string | undefined
  if (previousScore !== undefined) {
    const diff = score - previousScore
    if (diff >= 5) {
      trendFeedback = `前回より+${diff}点！着実に改善しています。`
    } else if (diff <= -5) {
      trendFeedback = `前回より${diff}点。疲労やストレスの蓄積がないか振り返ってみましょう。`
    } else {
      trendFeedback = `前回と同水準をキープ。安定したコンディションです。`
    }
  }

  return { scoreFeedback, recoveryFeedback, restingHRFeedback, trendFeedback }
}
