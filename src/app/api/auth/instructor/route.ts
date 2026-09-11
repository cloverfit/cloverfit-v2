import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { instructor_code } = await request.json()

  if (!instructor_code) {
    return Response.json({ error: 'インストラクターコードを入力してください' }, { status: 400 })
  }

  // Look up instructor by code
  const { data: instructor, error: instrError } = await supabase
    .from('instructors')
    .select('*')
    .eq('instructor_code', instructor_code.trim().toUpperCase())
    .single()

  if (instrError || !instructor) {
    return Response.json({ error: 'インストラクターコードが正しくありません' }, { status: 401 })
  }

  return Response.json({ instructor })
}
