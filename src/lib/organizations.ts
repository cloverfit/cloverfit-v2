// 所属組織・グループの定義
// 新しい組織を追加する場合はここに追加してください

export interface Organization {
  id: string
  name: string
}

export const ORGANIZATIONS: Organization[] = [
  { id: 'cloverfit', name: 'CloverFit' },
  { id: 'ntt-docomo-wellbeing', name: 'NTTdocomo ウェルビーイング推進室' },
]
