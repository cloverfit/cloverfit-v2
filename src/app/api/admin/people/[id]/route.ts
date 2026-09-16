import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Get participant
  const { data: participant, error: pError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .single()

  if (pError || !participant) {
    return Response.json({ error: '参加者が見つかりません' }, { status: 404 })
  }

  // Get all measurements with feedback, ordered by date desc
  const { data: measurements, error: mError } = await supabase
    .from('measurements')
    .select('*, feedback(*)')
    .eq('participant_id', id)
    .order('measurement_date', { ascending: false })

  if (mError) {
    return Response.json({ error: mError.message }, { status: 500 })
  }

  // Flatten feedback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatMeasurements = (measurements || []).map((m: any) => ({
    ...m,
    feedback: Array.isArray(m.feedback) ? m.feedback[0] || null : m.feedback,
  }))

  // Compute stats
  const scores = flatMeasurements.map(m => m.total_score).filter(Boolean)
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length * 10) / 10
    : null
  const bestScore = scores.length > 0 ? Math.max(...scores) : null
  const worstScore = scores.length > 0 ? Math.min(...scores) : null

  return Response.json({
    participant,
    measurements: flatMeasurements,
    stats: {
      measurementCount: flatMeasurements.length,
      avgScore,
      bestScore,
      worstScore,
    },
  })
}
