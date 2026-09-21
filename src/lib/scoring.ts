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
  // Cole (1999): HRR1は自律神経機能の信頼できる指標
  // Jouven (2005): 心拍プロファイル全体（安静時HR + 運動時上昇 + 回復速度）が予後を左右
  let scoreFeedback: string
  if (score >= 100) {
    scoreFeedback = '自律神経のバランスが非常に優れた状態です。運動後の副交感神経（迷走神経）の再活性化が速く、心血管系の健康が良好に維持されています（Hughes, 2008）。このコンディションは、日常の運動習慣と良質な睡眠の積み重ねによるものです。'
  } else if (score >= 80) {
    scoreFeedback = '運動後の心拍回復が良好で、交感神経から副交感神経への切り替えがスムーズです。Gerber（2013）の研究では、定期的な有酸素運動がこの自律神経の切り替え能力を高めることが示されています。今の運動習慣を維持しましょう。'
  } else if (score >= 60) {
    scoreFeedback = '自律神経の切り替え機能は標準的な水準です。Cole（1999）の研究によると、この水準の心拍回復力は有酸素トレーニングで改善可能です。週3回以上・30分の中強度運動（ウォーキング、ジョギング等）の継続が効果的です。'
  } else if (score >= 40) {
    scoreFeedback = '心拍の回復にやや時間がかかっている状態です。Zhang（2016）の研究では、軽い有酸素運動と呼吸法の組み合わせが迷走神経の活動を効果的に高めることが報告されています。毎日20分のウォーキングと深呼吸（吸気4秒・呼気8秒）から始めてみましょう。'
  } else {
    scoreFeedback = '心拍回復が遅めで、自律神経の疲労が蓄積している可能性があります。Cole（1999）の研究では、HRR1が12bpm未満の場合に注意が必要とされています。まずは睡眠（7〜9時間）の確保、カフェインの制限、軽いストレッチから始め、体調が安定してから運動量を増やしていきましょう。'
  }

  // ── リカバリー量フィードバック ──
  // Cole (1999): HRR1 ≤12bpmが異常値のカットオフ（死亡リスク2倍）
  // Jouven (2005): HRR低下は心臓突然死の独立したリスク因子
  // Hughes (2008): 迷走神経トーンの高さ＝回復速度の速さ
  let recoveryFeedback: string
  if (recoveryAmount >= 50) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは非常に優秀な値です。Hughes（2008）の研究で示された「迷走神経トーンが高い人」の特徴と一致しており、副交感神経の再活性化が極めて速い状態です。アスリートレベルの心肺機能が維持されています。`
  } else if (recoveryAmount >= 30) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは良好な値です。Cole（1999）のNEJM論文で示された正常基準（12bpm以上）を大きく上回っています。運動後の副交感神経の働きが安定しており、Gerber（2013）が報告した「運動習慣者に見られる高い自律神経回復力」と一致しています。`
  } else if (recoveryAmount >= 12) {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは正常範囲内です。Cole（1999）の大規模研究では、12bpm以上の回復が良好な自律神経機能の指標とされています。有酸素運動の頻度を上げることで、回復速度のさらなる改善が期待できます。`
  } else {
    recoveryFeedback = `心拍回復量${recoveryAmount}bpmは、Cole（1999）のNEJM論文で示された注意ライン（12bpm）を下回っています。Jouven（2005）の研究でも、回復量の低下は心血管リスクの独立した指標とされています。慢性的なストレス・睡眠不足・オーバートレーニングの可能性を確認し、まずは十分な休養を取りましょう。`
  }

  // ── 安静時HR フィードバック ──
  // Woodward (2014): 安静時HR上昇に伴う心血管リスクは用量反応的（HR10bpm上昇ごとにリスク増）
  // Quer (2020): 安静時HRは個人差が大きく（最大70bpmの差）、個人内の変化追跡が重要
  // Jouven (2005): 安静時HR >75bpmが心臓突然死リスク上昇と関連
  let restingHRFeedback: string
  if (hr.restingHR < 55) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは、持久系アスリートに見られる水準です。心臓の1回拍出量が多く、少ない拍動で十分な血液を送れる効率的な状態です。Quer（2020）の92,000人規模の研究でも、継続的な運動習慣者に低い安静時HRが確認されています。`
  } else if (hr.restingHR < 70) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは良好な範囲です。Woodward（2014）のメタ分析では、安静時HRが低いほど心血管リスクが低い傾向が報告されています。規則的な有酸素運動を続けることで、さらなる低下も期待できます。`
  } else if (hr.restingHR < 80) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは標準的な範囲です。Jouven（2005）の研究では75bpmを超えるとリスクが上昇し始めるとされています。Quer（2020）の研究では安静時HRの個人内変動は小さいため、定期的に測定して自分のベースラインを把握することが大切です。`
  } else if (hr.restingHR < 90) {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmはやや高めです。Woodward（2014）の研究では、安静時HRが10bpm上昇するごとに心血管リスクが段階的に上がることが示されています。ストレス管理・十分な睡眠・定期的な有酸素運動で改善が期待できます。`
  } else {
    restingHRFeedback = `安静時心拍数${hr.restingHR}bpmは高い水準です。疲労の蓄積、ストレス、脱水、カフェインの過剰摂取などが考えられます。Quer（2020）の研究では、安静時HRの急な上昇は体調変化のサインとされています。持続する場合は医療専門家への相談をおすすめします。`
  }

  // ── 前回比較 ──
  // Quer (2020): 個人内のHR変動追跡が健康管理に有効
  let trendFeedback: string | undefined
  if (previousScore !== undefined) {
    const diff = score - previousScore
    if (diff >= 10) {
      trendFeedback = `前回より+${diff}点の大幅改善です。Gerber（2013）の研究によると、生活習慣の改善や適切な休養は自律神経機能の回復に直結します。良い変化が数値に表れています。`
    } else if (diff >= 5) {
      trendFeedback = `前回より+${diff}点。回復力が向上傾向にあります。Zhang（2016）の研究では、継続的な運動が自律神経の回復メカニズムを強化することが示されています。`
    } else if (diff <= -10) {
      trendFeedback = `前回より${diff}点の低下です。Quer（2020）の研究では、安静時HRの急な変動は体調変化のサインとされています。睡眠・ストレス・運動量を振り返り、オーバートレーニングになっていないか確認してみてください。`
    } else if (diff <= -5) {
      trendFeedback = `前回より${diff}点。疲労の蓄積やコンディションの変化が考えられます。一時的な変動は正常ですが、低下が続く場合は休養を優先しましょう。`
    } else {
      trendFeedback = `前回とほぼ同水準（${diff >= 0 ? '+' : ''}${diff}点）。Quer（2020）の92,000人規模の研究でも、安定した数値は良好な健康状態の指標です。安定したコンディションを維持できています。`
    }
  }

  return { scoreFeedback, recoveryFeedback, restingHRFeedback, trendFeedback }
}
