import Link from 'next/link'
import CloverFitLogo from '@/components/CloverFitLogo'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <CloverFitLogo size="sm" />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center space-y-5">
          <CloverFitLogo size="hero" className="justify-center" />
          <h2 className="text-2xl font-bold text-foreground leading-snug">
            心拍の回復力から、
            <br />
            今日の調子がわかる。
          </h2>
          <p className="text-muted text-sm">
            3つの心拍数を入れるだけ。
          </p>
        </div>

        {/* Two mode cards */}
        <div className="max-w-lg w-full mt-10 grid gap-4 sm:grid-cols-2">
          {/* Measure mode */}
          <Link
            href="/measure"
            className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-clover hover:shadow-md"
          >
            <CloverFitLogo size="sm" showText={false} className="mb-3" />
            <h3 className="font-bold text-lg text-foreground mb-2">
              測定する
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              心拍データを入力して、今のコンディションスコアを確認できます。
            </p>
            <div className="mt-4 text-clover text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              はじめる
              <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>

          {/* Record mode */}
          <Link
            href="/record/login"
            className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-clover hover:shadow-md"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg text-foreground mb-2">
              記録・管理する
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              測定データを記録して、スコアの推移やフィードバックを確認できます。
            </p>
            <div className="mt-4 text-clover text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              ログイン
              <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-muted text-xs">
          インストラクターの方は
          <Link href="/record/login" className="text-clover underline underline-offset-2 ml-1">
            こちら
          </Link>
          からログインしてください
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted">
          &copy; 2024-2026 CloverFit
        </div>
      </footer>
    </div>
  )
}
