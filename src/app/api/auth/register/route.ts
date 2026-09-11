import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { name, pin_code, instructor_code, company_name, birth_date, gender } = await request.json()

  // Validate required fields
  if (!name || !pin_code || pin_code.length !== 4) {
    return Response.json({ error: '名前と4桁のPINコードは必須です' }, { status: 400 })
  }

  if (!instructor_code) {
    return Response.json({ error: '登録コードを入力してください' }, { status: 400 })
  }

  // Verify instructor code exists
  const { data: instructor, error: instrError } = await supabase
    .from('instructors')
    .select('id')
    .eq('instructor_code', instructor_code.trim().toUpperCase())
    .single()

  if (instrError || !instructor) {
    return Response.json({ error: '登録コードが正しくありません' }, { status: 401 })
  }

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('name', name)
    .single()

  if (existing) {
    return Response.json({ error: 'この名前は既に登録されています' }, { status: 409 })
  }

  // Create participant
  const { data, error } = await supabase
    .from('participants')
    .insert({
      name,
      pin_code,
      company_name: company_name || null,
      birth_date: birth_date || null,
      gender: gender || null,
      created_by: instructor.id,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ participant: data }, { status: 201 })
}
