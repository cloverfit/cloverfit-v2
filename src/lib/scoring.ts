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
  { name: 'a_plus', emoji: '', label: 'A+', min: 100 },
  { name: 'a', emoji: '', label: 'A', min: 80 },
  { name: 'b', emoji: '', label: 'B', min: 60 },
  { name: 'c', emoji: '', label: 'C', min: 40 },
  { name: 'd', emoji: '', label: 'D', min: 0 },
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

  // スコア帯フィードバック（心拍回復と自律神経の研究に基づく）
  // 参考: Cole et al. (1999) NEJM, Jouven et al. (2005) NEJM - 心拍回復は自律神経機能の指標
  let scoreFeedback: string
  if (score >= 100) {
    scoreFeedback = 'ランクA+。副交感神経の再活性化が非常に速く、自律神経のバランスが優れた状態です。運動後の迷走神経トーンが高く、心血管系の健康状態が良好であることを示しています。'
  } else if (score >= 80) {
    scoreFeedback = 'ランクA。運動後の心拍回復が良好で、交感神経から副交感神経への切り替えがスムーズです。定期的な有酸素運動の効果が表れています。'
  } else if (score >= 60) {
    scoreFeedback = 'ランクB。自律神経の切り替え機能は平均的な水準です。週3回以上の中強度有酸素運動（最大心拍数の60-70%）を継続することで、回復力の向上が期待できます。'
  } else if (score >= 40) {
    scoreFeedback = 'ランクC。心拍の回復にやや時間がかかっている状態です。迷走神経の活動を高めるために、深呼吸（吸気4秒・呼気8秒）の習慣化と、ウォーキングなどの軽い有酸素運動が有効です。'
  } else {
    scoreFeedback = 'ランクD。心拍回復が遅めで、自律神経の疲労が蓄積している可能性があります。睡眠時間の確保（7-9時間）、カフェイン摂取の制限、呼吸法の実践から始めましょう。過度な運動は避け、まず休養を優先してください。'
  }

  // リカバリー量フィードバック
  // 参考: 運動後1分間の心拍回復量（HRR1）は12bpm以上が正常の目安
  let recoveryFeedback: string
  if (recoveryAmount >= 40) {
    recoveryFeedback = '心拍回復量が40bpm以上と非常に優れています。副交感神経の再活性化が速く、高い心肺機能を維持できています。'
  } else if (recoveryAmount >= 25) {
    recoveryFeedback = '心拍回復量は良好な水準です。運動後の副交感神経の働きが安定しており、日常的な運動習慣の効果が出ています。'
  } else if (recoveryAmount >= 12) {
    recoveryFeedback = '心拍回復量は正常範囲内です。有酸素運動の頻度を上げることで、回復速度の改善が見込めます。インターバルトレーニングも効果的です。'
  } else {
    recoveryFeedback = '心拍回復量が12bpm未満で、回復に時間がかかっています。慢性的なストレスや睡眠不足、オーバートレーニングの可能性があります。まずは十分な休養と軽めの運動から再開しましょう。'
  }

  // 安静時HR フィードバック
  // 参考: 成人の安静時心拍数の正常値は60-100bpm（AHA）
  let restingHRFeedback: string
  if (hr.restingHR < 60) {
    restingHRFeedback = '安静時心拍数が60bpm未満で、副交感神経が優位な状態です。持久系トレーニングの適応が見られ、心臓の1回拍出量が多い効率的な状態です。'
  } else if (hr.restingHR < 75) {
    restingHRFeedback = '安静時心拍数は標準的な範囲です。規則的な有酸素運動を続けることで、さらに低下する可能性があります。'
  } else if (hr.restingHR < 90) {
    restingHRFeedback = '安静時心拍数がやや高めです。交感神経が優位になっている可能性があり、ストレス管理や十分な睡眠で改善が期待できます。'
  } else {
    restingHRFeedback = '安静時心拍数が90bpm以上です。疲労やストレスの蓄積、脱水、カフェインの過剰摂取などが考えられます。持続する場合は医療機関への相談をおすすめします。'
  }

  // 前回比較
  let trendFeedback: string | undefined
  if (previousScore !== undefined) {
    const diff = score - previousScore
    if (diff >= 10) {
      trendFeedback = `前回より+${diff}点。大幅な改善が見られます。生活習慣の改善や休養の効果が出ています。`
    } else if (diff >= 5) {
      trendFeedback = `前回より+${diff}点。回復力が向上傾向にあります。`
    } else if (diff <= -10) {
      trendFeedback = `前回より${diff}点。大きく低下しています。睡眠・ストレス・運動量を振り返り、オーバートレーニングになっていないか確認してみてください。`
    } else if (diff <= -5) {
      trendFeedback = `前回より${diff}点。疲労の蓄積やコンディションの変化が考えられます。`
    } else {
      trendFeedback = `前回とほぼ同水準（${diff >= 0 ? '+' : ''}${diff}点）。安定したコンディションを維持できています。`
    }
  }

  return { scoreFeedback, recoveryFeedback, restingHRFeedback, trendFeedback }
}
