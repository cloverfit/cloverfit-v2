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
  leaves: number  // 1-4: クローバーの葉の数でレベル表現
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
  { name: 'master', leaves: 4, label: '最高', min: 100 },
  { name: 'expert', leaves: 3, label: '優秀', min: 80 },
  { name: 'standard', leaves: 2, label: '良好', min: 60 },
  { name: 'beginner', leaves: 1, label: '基礎', min: 40 },
  { name: 'starter', leaves: 1, label: '入門', min: 0 },
]

export function getLevel(score: number): ScoreLevel {
  for (const level of LEVELS) {
    if (score >= level.min) return level
  }
  return LEVELS[LEVELS.length - 1]
}

// 自動フィードバック生成
// 出典:
//   Cole et al., NEJM (1999) — HRR1 ≤12bpmが死亡リスク2倍
//   Jouven et al., NEJM (2005) — 安静時HR・HRR低下と心臓突然死リスク
//   Hughes et al., Psychosomatic Medicine (2008) — 迷走神経トーンと心拍回復
//   Gerber et al. (2013) — 運動習慣と自律神経のストレス耐性
//   Quer et al. (2020) — ウェアラブルデータによる安静時HR個人差の大規模研究
//   Zhang et al. (2016) — 運動による自律神経回復メカニズム
//   Woodward et al. (2014) — 安静時HRと心血管リスクの用量反応関係

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

  // ── スコア帯フィードバック ──
  let scoreFeedback: string
  if (score >= 100) {
    scoreFeedback = '自律神経のバランスが非常に優れた状態です！運動後の心拍回復が速く、心肺機能がしっかり鍛えられています。日々の運動習慣と良質な睡眠の積み重ねが、数値にしっかり表れていますね。この調子を維持していきましょう。'
  } else if (score >= 80) {
    scoreFeedback = '心拍回復が良好で、交感神経から副交感神経への切り替えがスムーズです。定期的な有酸素運動がしっかり効いている証拠です。今の運動習慣を続けることで、さらに上のレベルも目指せます。'
  } else if (score >= 60) {
    scoreFeedback = '自律神経の切り替え機能は安定した水準です。ここからさらに伸ばすには、週3回以上・30分の中強度運動（ウォーキング、ジョギング等）の継続が効果的です。少しずつ運動の習慣を増やしていきましょう。'
  } else if (score >= 40) {
    scoreFeedback = '心拍の回復にやや時間がかかっている状態です。軽い有酸素運動と深呼吸を組み合わせることで、自律神経の回復力を効果的に高められます。毎日20分のウォーキングと深呼吸（吸気4秒・呼気8秒）から始めてみましょう。'
  } else {
    scoreFeedback = '心拍回復がゆっくりめで、自律神経に疲れが溜まっている可能性があります。まずは睡眠（7〜9時間）の確保とカフェインの制限、軽いストレッチから始めてみてください。体調が整ってきたら、少しずつ運動量を増やしていきましょう。焦らず、一歩ずつで大丈夫です。'
  }

  // ── リカバリー量フィードバック ──
  let recoveryFeedback: string
  if (recoveryAmount >= 50) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは非常に優秀な値です！副交感神経の切り替えが極めて速く、アスリートレベルの心肺機能が維持されています。日頃のトレーニングの成果がしっかり数値に表れていますね。`
  } else if (recoveryAmount >= 30) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは良好な値です。正常基準の12bpmを大きく上回っており、運動後の自律神経の切り替えがとてもスムーズです。運動習慣がしっかり身についている証拠です。`
  } else if (recoveryAmount >= 12) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは正常範囲内です。12bpm以上の回復は、自律神経が健康的に機能しているサインです。有酸素運動の頻度を少し上げるだけで、さらに回復力を高められますよ。`
  } else {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは、目安となる12bpmをやや下回っています。慢性的なストレスや睡眠不足、オーバートレーニングが影響しているかもしれません。まずはしっかり休養を取ることが、回復力アップへの近道です。`
  }

  // ── 安静時HR フィードバック ──
  let restingHRFeedback: string
  if (hr.restingHR < 55) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは、持久系アスリートに見られる水準です！心臓が1回の拍動で十分な血液を送れる、とても効率的な状態です。継続的な運動習慣がしっかり心臓を鍛えています。`
  } else if (hr.restingHR < 70) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは良好な範囲です。安静時の心拍数が低いほど、心臓が効率よく働いているサインです。規則的な有酸素運動を続けることで、さらなる低下も期待できます。`
  } else if (hr.restingHR < 80) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは標準的な範囲です。定期的に測定して自分のベースラインを把握しておくと、体調の変化にいち早く気づけます。軽い運動を習慣にすることで、少しずつ改善が見込めます。`
  } else if (hr.restingHR < 90) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmはやや高めです。ストレス管理・十分な睡眠・定期的な有酸素運動で改善が期待できます。心拍数が10bpm下がるだけでも、心臓への負担はぐっと軽くなりますよ。`
  } else {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは高い水準です。疲労の蓄積、ストレス、脱水、カフェインの過剰摂取などが影響しているかもしれません。安静時心拍数の急な上昇は体調変化のサインなので、持続する場合は医療専門家への相談をおすすめします。`
  }

  // ── 前回比較 ──
  let trendFeedback: string | undefined
  if (previousScore !== undefined) {
    const diff = score - previousScore
    if (diff >= 10) {
      trendFeedback = `前回より+${diff}点の大幅改善です！生活習慣の改善や適切な休養が、しっかり数値に表れています。この調子で続けていきましょう。`
    } else if (diff >= 5) {
      trendFeedback = `前回より+${diff}点、着実に向上しています。継続的な運動が自律神経の回復力を高めている証拠です。いい流れですね。`
    } else if (diff <= -10) {
      trendFeedback = `前回より${diff}点の低下です。睡眠・ストレス・運動量を振り返って、オーバートレーニングになっていないか確認してみてください。体調のサインを見逃さないことが大切です。`
    } else if (diff <= -5) {
      trendFeedback = `前回より${diff}点。疲労の蓄積やコンディションの変化が考えられます。一時的な変動は自然なことなので、低下が続く場合は休養を優先しましょう。`
    } else {
      trendFeedback = `前回とほぼ同水準（${diff >= 0 ? '+' : ''}${diff}点）。安定した数値は、良好なコンディションが維持できている証拠です。この安定感を大事にしていきましょう。`
    }
  }

  return { scoreFeedback, recoveryFeedback, restingHRFeedback, trendFeedback }
}
