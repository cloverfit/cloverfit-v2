import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    measurement_id,
    instructor_good_points,
    instructor_improvements,
    next_suggestion,
    created_by,
  } = body

  if (!measurement_id) {
    return Response.json({ error: 'measurement_idは必須です' }, { status: 400 })
  }

  // Check if feedback already exists for this measurement
  const { data: existing } = await supabase
    .from('feedback')
    .select('id')
    .eq('measurement_id', measurement_id)
    .single()

  if (existing) {
    // Update existing feedback
    const { data, error } = await supabase
      .from('feedback')
      .update({
        instructor_good_points: instructor_good_points || null,
        instructor_improvements: instructor_improvements || null,
        next_suggestion: next_suggestion || null,
        created_by: created_by || null,
        updated_at: new Date().toISOString(),
      })
      .eq('measurement_id', measurement_id)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ feedback: data })
  } else {
    // Create new feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        measurement_id,
        instructor_good_points: instructor_good_points || null,
        instructor_improvements: instructor_improvements || null,
        next_suggestion: next_suggestion || null,
        created_by: created_by || null,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ feedback: data }, { status: 201 })
  }
}
