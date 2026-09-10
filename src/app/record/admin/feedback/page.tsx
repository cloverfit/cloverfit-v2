'use client'

import { useEffect, useState } from 'react'
import type { MeasurementWithFeedback } from '@/types/database'
import { getLevel } from '@/lib/scoring'

export default function FeedbackPage() {
  const [measurements, setMeasurements] = useState<MeasurementWithFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Feedback form
  const [goodPoints, setGoodPoints] = useState('')
  const [improvements, setImprovements] = useState('')
  const [nextSuggestion, setNextSuggestion] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/measurements?with_feedback=true&limit=20')
      .then(res => res.json())
      .then(data => setMeasurements(data.measurements || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(m: MeasurementWithFeedback) {
    setEditingId(m.id)
    setGoodPoints(m.feedback?.instructor_good_points || '')
    setImprovements(m.feedback?.instructor_improvements || '')
    setNextSuggestion(m.feedback?.next_suggestion || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setGoodPoints('')
    setImprovements('')
    setNextSuggestion('')
  }

  async function saveFeedback(measurementId: string) {
    setSaving(true)
    const instructor = JSON.parse(sessionStorage.getItem('instructor') || '{}')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurement_id: measurementId,
          instructor_good_points: goodPoints || null,
          instructor_improvements: improvements || null,
          next_suggestion: nextSuggestion || null,
          created_by: instructor.id,
        }),
      })

      if (!res.ok) throw new Error('保存に失敗しました')

      // Update local state
      const updated = await res.json()
      setMeasurements(prev =>
        prev.map(m =>
          m.id === measurementId
            ? { ...m, feedback: { ...m.feedback, ...updated.feedback } }
            : m
        )
      )
      setEditingId(null)
    } catch (err) {
      console.error(err)
      alert('フィードバックの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">フィードバック</h2>
      <p className="text-sm text-muted">
        各測定に対してインストラクターのコメントを追加できます。
      </p>

      {measurements.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted text-sm">
          測定データがまだありません
        </div>
      ) : (
        <div className="space-y-4">
          {measurements.map(m => {
            const level = getLevel(m.total_score)
            const isEditing = editingId === m.id
            const hasFeedback = m.feedback?.instructor_good_points || m.feedback?.instructor_improvements

            return (
              <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Measurement header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{level.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.participant?.name || '不明'}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(m.measurement_date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{m.total_score}</p>
                      <p className="text-xs text-muted">{level.label}</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs text-clover hover:underline"
                      >
                        {hasFeedback ? '編集' : 'コメント追加'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Auto feedback */}
                {m.feedback?.auto_score_feedback && (
                  <div className="px-4 py-3 space-y-2 border-b border-border">
                    <p className="text-xs font-medium text-muted">自動フィードバック</p>
                    <p className="text-sm text-foreground">{m.feedback.auto_score_feedback}</p>
                    {m.feedback.auto_recovery_feedback && (
                      <p className="text-sm text-foreground">{m.feedback.auto_recovery_feedback}</p>
                    )}
                  </div>
                )}

                {/* Instructor feedback display */}
                {!isEditing && hasFeedback && (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-xs font-medium text-accent">インストラクターコメント</p>
                    {m.feedback?.instructor_good_points && (
                      <div>
                        <p className="text-xs text-muted">👍 良い点</p>
                        <p className="text-sm text-foreground">{m.feedback.instructor_good_points}</p>
                      </div>
                    )}
                    {m.feedback?.instructor_improvements && (
                      <div>
                        <p className="text-xs text-muted">📝 改善点</p>
                        <p className="text-sm text-foreground">{m.feedback.instructor_improvements}</p>
                      </div>
                    )}
                    {m.feedback?.next_suggestion && (
                      <div>
                        <p className="text-xs text-muted">🎯 次回の提案</p>
                        <p className="text-sm text-foreground">{m.feedback.next_suggestion}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit form */}
                {isEditing && (
                  <div className="px-4 py-4 space-y-3 bg-clover-light/20">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">👍 良い点</label>
                      <textarea
                        value={goodPoints}
                        onChange={e => setGoodPoints(e.target.value)}
                        rows={2}
                        placeholder="良かったポイントを記入..."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">📝 改善点</label>
                      <textarea
                        value={improvements}
                        onChange={e => setImprovements(e.target.value)}
                        rows={2}
                        placeholder="改善すべきポイントを記入..."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">🎯 次回の提案</label>
                      <textarea
                        value={nextSuggestion}
                        onChange={e => setNextSuggestion(e.target.value)}
                        rows={2}
                        placeholder="次回に向けたアドバイス..."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-clover/40"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveFeedback(m.id)}
                        disabled={saving}
                        className="rounded-lg bg-clover text-white text-sm font-medium px-4 py-2 hover:bg-clover-dark transition-colors disabled:opacity-50"
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border border-border text-muted text-sm px-4 py-2 hover:text-foreground transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
