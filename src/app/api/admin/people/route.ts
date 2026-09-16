import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Get all participants
  const { data: participants, error: pError } = await supabase
    .from('participants')
    .select('*')
    .order('name', { ascending: true })

  if (pError) {
    return Response.json({ error: pError.message }, { status: 500 })
  }

  // Get all measurements with feedback
  const { data: measurements, error: mError } = await supabase
    .from('measurements')
    .select('*, feedback(*)')
    .order('measurement_date', { ascending: false })

  if (mError) {
    return Response.json({ error: mError.message }, { status: 500 })
  }

  // Build per-participant summaries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measByParticipant = new Map<string, any[]>()
  for (const m of measurements || []) {
    const pid = m.participant_id
    if (!measByParticipant.has(pid)) {
      measByParticipant.set(pid, [])
    }
    measByParticipant.get(pid)!.push(m)
  }

  const people = (participants || []).map(p => {
    const pMeas = measByParticipant.get(p.id) || []
    const latest = pMeas[0] || null
    const scores = pMeas.map(m => m.total_score).filter(Boolean)
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length * 10) / 10
      : null

    // Score trend: compare latest 3 vs previous 3
    let trend: 'up' | 'down' | 'stable' | null = null
    if (scores.length >= 4) {
      const recent3 = scores.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3
      const prev3 = scores.slice(3, 6).reduce((a: number, b: number) => a + b, 0) / Math.min(scores.length - 3, 3)
      if (recent3 - prev3 >= 3) trend = 'up'
      else if (prev3 - recent3 >= 3) trend = 'down'
      else trend = 'stable'
    }

    return {
      ...p,
      measurementCount: pMeas.length,
      latestScore: latest?.total_score ?? null,
      latestDate: latest?.measurement_date ?? null,
      avgScore,
      trend,
    }
  })

  return Response.json({ people })
}
