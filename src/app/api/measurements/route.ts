import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const participantId = searchParams.get('participant_id')
  const withFeedback = searchParams.get('with_feedback')
  const limit = Number(searchParams.get('limit') || '50')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any[] | null = null
  let error: { message: string } | null = null

  if (withFeedback) {
    let query = supabase
      .from('measurements')
      .select('*, feedback(*), participant:participants(name, company_name)')
      .order('measurement_date', { ascending: false })
      .limit(limit)

    if (participantId) {
      query = query.eq('participant_id', participantId)
    }

    const result = await query
    data = result.data
    error = result.error
  } else {
    let query = supabase
      .from('measurements')
      .select('*')
      .order('measurement_date', { ascending: false })
      .limit(limit)

    if (participantId) {
      query = query.eq('participant_id', participantId)
    }

    const result = await query
    data = result.data
    error = result.error
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Flatten feedback array (Supabase returns 1:many as array)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measurements = (data || []).map((m: any) => ({
    ...m,
    feedback: Array.isArray(m.feedback) ? m.feedback[0] || null : m.feedback,
    participant: Array.isArray(m.participant) ? m.participant[0] || null : m.participant,
  }))

  return Response.json({ measurements })
}

export async function POST(request: Request) {
  const body = await request.json()

  const {
    participant_id,
    instructor_id,
    measurement_date,
    resting_hr,
    max_hr,
    recovery_hr,
    recovery_amount,
    total_score,
    fatigue,
    concentration,
    stress,
    sleep_quality,
    subjective_score,
    notes,
    auto_feedback,
  } = body

  if (!participant_id || !resting_hr || !max_hr || !recovery_hr) {
    return Response.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  // Insert measurement
  const { data: measurement, error: measError } = await supabase
    .from('measurements')
    .insert({
      participant_id,
      instructor_id: instructor_id || null,
      measurement_date: measurement_date || new Date().toISOString().split('T')[0],
      resting_hr,
      max_hr,
      recovery_hr,
      recovery_amount,
      total_score,
      fatigue: fatigue || null,
      concentration: concentration || null,
      stress: stress || null,
      sleep_quality: sleep_quality || null,
      subjective_score: subjective_score || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (measError) {
    return Response.json({ error: measError.message }, { status: 500 })
  }

  // Insert auto feedback
  if (auto_feedback && measurement) {
    await supabase.from('feedback').insert({
      measurement_id: measurement.id,
      auto_score_feedback: auto_feedback.score_feedback || null,
      auto_recovery_feedback: auto_feedback.recovery_feedback || null,
      auto_trend_feedback: auto_feedback.trend_feedback || null,
      created_by: instructor_id || null,
    })
  }

  return Response.json({ measurement }, { status: 201 })
}
