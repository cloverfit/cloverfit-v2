import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Get participant count
  const { count: totalParticipants } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })

  // Get measurement count and average score
  const { data: measurements, count: totalMeasurements } = await supabase
    .from('measurements')
    .select('total_score', { count: 'exact' })

  const avgScore = measurements && measurements.length > 0
    ? measurements.reduce((sum, m) => sum + (m.total_score || 0), 0) / measurements.length
    : 0

  // Get recent measurements with participant info and feedback
  const { data: recentMeasurements } = await supabase
    .from('measurements')
    .select('*, participant:participants(name, company_name), feedback(*)')
    .order('measurement_date', { ascending: false })
    .limit(10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recent = (recentMeasurements || []).map((m: any) => ({
    ...m,
    feedback: Array.isArray(m.feedback) ? m.feedback[0] || null : m.feedback,
    participant: Array.isArray(m.participant) ? m.participant[0] || null : m.participant,
  }))

  return Response.json({
    totalParticipants: totalParticipants || 0,
    totalMeasurements: totalMeasurements || 0,
    avgScore,
    recentMeasurements: recent,
  })
}
