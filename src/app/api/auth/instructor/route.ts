import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return Response.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 })
  }

  // Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return Response.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
  }

  // Get instructor record
  const { data: instructor, error: instrError } = await supabase
    .from('instructors')
    .select('*')
    .eq('email', email)
    .single()

  if (instrError || !instructor) {
    return Response.json({ error: 'インストラクター情報が見つかりません' }, { status: 404 })
  }

  return Response.json({ instructor })
}
