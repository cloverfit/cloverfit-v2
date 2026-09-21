// CloverFit独自のクローバーアイコン
// leavesの数（1〜4）に応じて葉を表示

interface CloverIconProps {
  leaves: number
  size?: number
  className?: string
}

export default function CloverIcon({ leaves, size = 20, className = '' }: CloverIconProps) {
  const clampedLeaves = Math.max(1, Math.min(4, leaves))

  // 四つ葉クローバーの各葉の位置（上・右・下・左）
  // leaves数に応じて表示する葉を制御
  const leafPositions = [
    { cx: 10, cy: 4, rotate: 0 },     // 上
    { cx: 16, cy: 10, rotate: 90 },    // 右
    { cx: 10, cy: 16, rotate: 180 },   // 下
    { cx: 4, cy: 10, rotate: 270 },    // 左
  ]

  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-label={`クローバー ${clampedLeaves}枚葉`}
    >
      {/* 茎 */}
      <line x1="10" y1="12" x2="10" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      {/* 葉 */}
      {leafPositions.slice(0, clampedLeaves).map((pos, i) => (
        <ellipse
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          rx="3.5"
          ry="4.5"
          fill="currentColor"
          transform={`rotate(${pos.rotate} ${pos.cx} ${pos.cy})`}
          opacity={0.85}
        />
      ))}
      {/* 中心 */}
      <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity={0.6} />
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
