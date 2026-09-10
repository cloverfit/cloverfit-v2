import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ participants: data })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { name, pin_code, email, birth_date, company_name, gender, created_by } = body

  if (!name || !pin_code || pin_code.length !== 4) {
    return Response.json({ error: '名前と4桁のPINコードは必須です' }, { status: 400 })
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

  const { data, error } = await supabase
    .from('participants')
    .insert({
      name,
      pin_code,
      email: email || null,
      birth_date: birth_date || null,
      company_name: company_name || null,
      gender: gender || null,
      created_by: created_by || null,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ participant: data }, { status: 201 })
}
