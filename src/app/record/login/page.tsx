'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type LoginMode = 'participant' | 'instructor'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('participant')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Participant fields
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  // Instructor fields
  const [instructorCode, setInstructorCode] = useState('')

  async function handleParticipantLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin_code: pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'ログインに失敗しました')
        return
      }

      sessionStorage.setItem('participant', JSON.stringify(data.participant))
      router.push('/record/mypage')
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleInstructorLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructor_code: instructorCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'ログインに失敗しました')
        return
      }

      sessionStorage.setItem('instructor', JSON.stringify(data.instructor))
      router.push('/record/admin')
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍀</span>
            <span className="text-xl font-bold text-clover">CloverFit</span>
          </Link>
          <span className="text-muted text-sm ml-2">ログイン</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-sm w-full">
          {/* Mode switcher */}
          <div className="flex rounded-lg border border-border overflow-hidden mb-6">
            <button
              onClick={() => { setMode('participant'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'participant'
                  ? 'bg-clover text-white'
                  : 'bg-card text-muted hover:text-foreground'
              }`}
            >
              参加者
            </button>
            <button
              onClick={() => { setMode('instructor'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === 'instructor'
                  ? 'bg-clover text-white'
                  : 'bg-card text-muted hover:text-foreground'
              }`}
            >
              インストラクター
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {mode === 'participant' ? (
            <form onSubmit={handleParticipantLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">お名前</label>
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
                <label className="block text-sm font-medium text-foreground mb-1">PINコード（4桁）</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  required
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg tracking-[0.5em] text-center placeholder:text-muted/50 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !name || pin.length !== 4}
                className="w-full rounded-lg bg-clover text-white font-bold py-3 hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ログイン中...' : 'マイページへ'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleInstructorLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">インストラクターコード</label>
                <input
                  type="text"
                  value={instructorCode}
                  onChange={e => setInstructorCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="CLV001"
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground text-lg tracking-[0.3em] text-center uppercase placeholder:text-muted/50 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-clover/40 focus:border-clover transition-colors"
                />
                <p className="text-xs text-muted mt-1.5">管理者から共有されたコードを入力してください</p>
              </div>
              <button
                type="submit"
                disabled={loading || !instructorCode}
                className="w-full rounded-lg bg-clover text-white font-bold py-3 hover:bg-clover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ログイン中...' : '管理画面へ'}
              </button>
            </form>
          )}

          {mode === 'participant' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted">はじめての方は</p>
              <Link href="/record/register" className="text-sm font-medium text-clover hover:text-clover-dark transition-colors">
                新規登録はこちら
              </Link>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
              &larr; トップに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
