'use client'

import { useEffect, useState } from 'react'
import type { Participant } from '@/types/database'
import { ORGANIZATIONS } from '@/lib/organizations'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // New participant form
  const [name, setName] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [gender, setGender] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function loadParticipants() {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => setParticipants(data.participants || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadParticipants() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const instructor = JSON.parse(sessionStorage.getItem('instructor') || '{}')

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          pin_code: pinCode,
          birth_date: birthDate || null,
          company_name: companyName || null,
          gender: gender || null,
          created_by: instructor.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '作成に失敗しました')
      }

      // Reset and reload
      setName('')
      setPinCode('')
      setBirthDate('')
      setCompanyName('')
      setGender('')
      setShowForm(false)
      loadParticipants()
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">参加者管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-clover text-white text-sm font-medium px-4 py-2 hover:bg-clover-dark transition-colors"
        >
          {showForm ? 'キャンセル' : '+ 新規追加'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-clover/30 bg-clover-light/30 p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">参加者を追加</h3>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">名前 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="山田 太郎"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">PINコード（4桁） *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  placeholder="1234"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">所属</label>
                <select
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                >
                  <option value="">選択してください</option>
                  {ORGANIZATIONS.map(org => (
                    <option key={org.id} value={org.name}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">生年月日</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">性別</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-clover/40"
                >
                  <option value="">選択しない</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || !name || pinCode.length !== 4}
              className="rounded-lg bg-clover text-white text-sm font-bold px-6 py-2.5 hover:bg-clover-dark transition-colors disabled:opacity-50"
            >
              {saving ? '追加中...' : '参加者を追加'}
            </button>
          </form>
        </div>
      )}

      {/* Participant list */}
      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-6 text-center text-muted text-sm">読み込み中...</div>
        ) : participants.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm">
            参加者がまだいません。「新規追加」から参加者を登録してください。
          </div>
        ) : (
          <div className="divide-y divide-border">
            {participants.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.company_name && (
                      <span className="text-xs text-muted">{p.company_name}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {new Date(p.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
