import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { name, pin_code } = await request.json()

  if (!name || !pin_code) {
    return Response.json({ error: '名前とPINコードを入力してください' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('name', name)
    .eq('pin_code', pin_code)
    .single()

  if (error || !data) {
    return Response.json({ error: '名前またはPINコードが正しくありません' }, { status: 401 })
  }

  return Response.json({ participant: data })
}
