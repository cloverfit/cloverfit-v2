import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🍀</span>
          <h1 className="text-xl font-bold text-clover">CloverFit</h1>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="text-5xl mb-2">🍀</div>
          <h2 className="text-2xl font-bold text-foreground">
            心拍リカバリーで見える化する
            <br />
            あなたのコンディション
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            CloverFitは心拍データから自律神経の回復力をスコア化し、
            <br className="hidden sm:inline" />
            あなたのウェルビーイングを数値で「見える化」します。
          </p>
        </div>

        {/* Two mode cards */}
        <div className="max-w-lg w-full mt-10 grid gap-4 sm:grid-cols-2">
          {/* Simple mode */}
          <Link
            href="/simple"
            className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-clover hover:shadow-md"
          >
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="font-bold text-lg text-foreground mb-2">
              スコアを見てみる
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              ログイン不要。心拍データを入力するだけで、あなたのコンディションスコアをすぐに確認できます。
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
              記録して管理する
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              測定データを記録・管理。スコア推移やフィードバック、PDFレポートで成長を実感できます。
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
          &copy; 2024-2026 CloverFit &mdash; Wellbeing Management
        </div>
      </footer>
    </div>
  )
}
