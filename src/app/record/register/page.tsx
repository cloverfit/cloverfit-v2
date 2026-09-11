'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [instructorCode, setInstructorCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pinCode !== pinConfirm) {
      setError('PINコードが一致しません')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          pin_code: pinCode,
          instructor_code: instructorCode,
          company_name: companyName || null,
          birth_date: birthDate || null,
          gender: gender || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '登録に失敗しました')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🍀</span>
              <span className="text-xl font-bold text-clover">CloverFit</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-clover-light flex items-center justify-center mx-auto">
              <span className="text-3xl">🍀</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">登録完了</h2>
              <p className="text-sm text-muted mt-2">
                アカウントが作成されました。<br />
                ログインしてマイページをご確認ください。
              </p>
            </div>
            <Link
              href="/record/login"
              className="block w-full rounded-lg bg-clover text-white font-bold py-3 text-center hover:bg-clover-dark transition-colors"
            >
              ログインへ進む
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍀</span>
            <span className="text-xl font-bold text-clover">CloverFit</span>
          </Link>
          <span className="text-muted text-sm ml-2">新規登録</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-sm w-full">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">アカウント登録</h2>
            <p className="text-sm text-muted mt-1">インストラクターから共有された登録コードをご用意ください</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">登録コード *</label>
              <input
                type="text"
                value={instructorCode}
                onChange={e => setInstructorCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="CLV001"
                required
                maxLength={6}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg tracking-[0.3em] text-center uppercase placeholder:text-muted/50 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
              <p className="text-xs text-muted mt-1">インストラクターから共有されたコードを入力</p>
            </div>

            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-foreground mb-1">お名前 *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PINコード（4桁） *</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinCode}
                onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg tracking-[0.5em] text-center placeholder:text-muted/50 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
              <p className="text-xs text-muted mt-1">ログイン時に使用する4桁の数字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PINコード（確認） *</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg tracking-[0.5em] text-center placeholder:text-muted/50 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted mb-3">以下は任意項目です</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">会社・チーム名</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="株式会社〇〇"
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">生年月日</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">性別</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
                  >
                    <option value="">選択しない</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !name || pinCode.length !== 4 || pinConfirm.length !== 4 || !instructorCode}
              className="w-full rounded-lg bg-clover text-white font-bold py-3 hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {saving ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted">
              すでにアカウントをお持ちの方は
            </p>
            <Link href="/record/login" className="text-sm font-medium text-clover hover:text-clover-dark transition-colors">
              ログインはこちら
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
