// CloverFit独自のクローバーアイコン
// ロゴと同じハート型の葉。leavesの数（1〜4）に応じて葉を表示

interface CloverIconProps {
  leaves: number
  size?: number
  className?: string
}

// 中心(12,12)を先端とし、外側に膨らんで先端に切れ込みが入るハート型の葉。
// 上向きの葉を定義し、90度ずつ回転させて四つ葉にする。
const LEAF_PATH =
  'M12 12 C8.5 11 2.6 9.6 2.6 6.4 C2.6 3 6.1 1.4 8.7 3 ' +
  'C10.3 4 11.3 5.2 12 6.3 C12.7 5.2 13.7 4 15.3 3 ' +
  'C17.9 1.4 21.4 3 21.4 6.4 C21.4 9.6 15.5 11 12 12 Z'

// 枚数ごとの葉の配置（葉の向き＝中心から外向き）。
// 4枚は上下左右に置くと、膨らみが斜めに来てロゴと同じ形になる。
// 1〜3枚のときも左右対称に見える角度を選ぶ。
const LEAF_ROTATIONS: Record<number, number[]> = {
  1: [0],
  2: [-45, 45],
  3: [0, 120, 240],
  4: [0, 90, 180, 270],
}

export default function CloverIcon({ leaves, size = 20, className = '' }: CloverIconProps) {
  const clampedLeaves = Math.max(1, Math.min(4, leaves))

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label={`クローバー ${clampedLeaves}枚葉`}
    >
      {/* 茎 */}
      <path
        d="M12 12 C12.7 15.8 12.5 19.4 11.5 22.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* 葉 */}
      {LEAF_ROTATIONS[clampedLeaves].map((rotate, i) => (
        <path
          key={i}
          d={LEAF_PATH}
          fill="currentColor"
          transform={`rotate(${rotate} 12 12)`}
        />
      ))}
    </svg>
  )
}

// インラインで使える小さなクローバーバッジ
interface CloverBadgeProps {
  leaves: number
  label: string
  className?: string
}

export function CloverBadge({ leaves, label, className = '' }: CloverBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <CloverIcon leaves={leaves} size={16} className="text-clover" />
      <span>{label}</span>
    </span>
  )
}
