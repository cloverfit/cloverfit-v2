import { supabase } from '@/lib/supabase'
import { normalizeCode } from '@/lib/text'

export async function POST(request: Request) {
  const body = await request.json()
  const instructor_code = normalizeCode(String(body.instructor_code ?? ''))

  if (!instructor_code) {
    return Response.json({ error: 'インストラクターコードを入力してください' }, { status: 400 })
  }

  // Look up instructor by code
  const { data: instructor, error: instrError } = await supabase
    .from('instructors')
    .select('*')
    .eq('instructor_code', instructor_code)
    .single()

  if (instrError || !instructor) {
    return Response.json({ error: 'インストラクターコードが正しくありません' }, { status: 401 })
  }

  return Response.json({ instructor })
}
