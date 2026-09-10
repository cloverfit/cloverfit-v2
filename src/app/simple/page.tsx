'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SimpleModePage() {
  const router = useRouter()
  const [restingHR, setRestingHR] = useState('')
  const [maxHR, setMaxHR] = useState('')
  const [recoveryHR, setRecoveryHR] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const resting = Number(restingHR)
    const max = Number(maxHR)
    const recovery = Number(recoveryHR)

    if (!restingHR || isNaN(resting) || resting < 30 || resting > 200) {
      newErrors.restingHR = '30〜200の範囲で入力してください'
    }
    if (!maxHR || isNaN(max) || max < 60 || max > 250) {
      newErrors.maxHR = '60〜250の範囲で入力してください'
    }
    if (!recoveryHR || isNaN(recovery) || recovery < 30 || recovery > 250) {
      newErrors.recoveryHR = '30〜250の範囲で入力してください'
    }
    if (!newErrors.maxHR && !newErrors.recoveryHR && recovery >= max) {
      newErrors.recoveryHR = '回復時心拍数は最大心拍数より低い値を入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const params = new URLSearchParams({
      resting: restingHR,
      max: maxHR,
      recovery: recoveryHR,
    })
    router.push(`/simple/result?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍀</span>
            <span className="text-xl font-bold text-clover">CloverFit</span>
          </Link>
          <span className="text-muted text-sm ml-2">シンプルモード</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-md w-full">
          <h2 className="text-xl font-bold text-foreground mb-1">心拍データを入力</h2>
          <p className="text-muted text-sm mb-6">
            3つの心拍数を入力すると、あなたのコンディションスコアを算出します。
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resting HR */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                安静時心拍数（bpm）
              </label>
              <p className="text-xs text-muted mb-2">
                測定前に安静にした状態の心拍数
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={restingHR}
                onChange={e => setRestingHR(e.target.value)}
                placeholder="例: 68"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
              {errors.restingHR && (
                <p className="mt-1 text-sm text-red-500">{errors.restingHR}</p>
              )}
            </div>

            {/* Max HR */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                最大心拍数（bpm）
              </label>
              <p className="text-xs text-muted mb-2">
                運動中の最も高い心拍数
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={maxHR}
                onChange={e => setMaxHR(e.target.value)}
                placeholder="例: 152"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
              {errors.maxHR && (
                <p className="mt-1 text-sm text-red-500">{errors.maxHR}</p>
              )}
            </div>

            {/* Recovery HR */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                回復時心拍数（bpm）
              </label>
              <p className="text-xs text-muted mb-2">
                運動後1分間安静にした後の心拍数
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={recoveryHR}
                onChange={e => setRecoveryHR(e.target.value)}
                placeholder="例: 118"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
              {errors.recoveryHR && (
                <p className="mt-1 text-sm text-red-500">{errors.recoveryHR}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-clover text-white font-bold py-3.5 text-lg hover:bg-clover-dark transition-colors"
            >
              スコアを計算する
            </button>
          </form>

          {/* Guide */}
          <div className="mt-8 rounded-lg bg-clover-light/50 border border-clover/20 p-4">
            <h3 className="text-sm font-bold text-clover mb-2">💡 測定の流れ</h3>
            <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
              <li>安静にして心拍数を測定（安静時HR）</li>
              <li>3分間のステップ運動を行う</li>
              <li>運動中の最高心拍数を記録（最大HR）</li>
              <li>運動終了後、1分間安静にして心拍数を測定（回復時HR）</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
