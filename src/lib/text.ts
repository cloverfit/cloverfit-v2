// 入力値の正規化
//
// 日本語入力がオンのまま入力すると、英数字が全角（Ａ, １）になる。
// toUpperCase() も \d も全角を扱えないため、そのままでは
// 招待コードが一致せず、PINは一文字も入らない。
// NFKC正規化で全角英数を半角に畳んでから扱う。

/** 招待コード・インストラクターコード：全角を半角に、空白を除去、大文字に揃える */
export function normalizeCode(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, '').toUpperCase()
}

/** PINコード：全角を半角に畳んでから数字だけ残す */
export function normalizeDigits(value: string): string {
  return value.normalize('NFKC').replace(/\D/g, '')
}

/** 氏名：前後の空白（全角含む）だけ落とす。中の表記は本人の入力を尊重する */
export function normalizeName(value: string): string {
  return value.replace(/^[\s　]+|[\s　]+$/g, '')
}
