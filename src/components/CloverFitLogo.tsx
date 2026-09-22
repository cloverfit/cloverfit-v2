// CloverFitロゴ — クローバーアイコン + テキスト

interface CloverFitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  className?: string
  showText?: boolean
}

export default function CloverFitLogo({ size = 'md', className = '', showText = true }: CloverFitLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 32, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 40, text: 'text-2xl', gap: 'gap-2.5' },
    hero: { icon: 56, text: 'text-3xl', gap: 'gap-3' },
  }

  const s = sizes[size]

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width={s.icon}
        height={s.icon}
        aria-label="CloverFit"
      >
        {/* 四つ葉クローバー */}
        <defs>
          <linearGradient id="cfLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d8a56" />
            <stop offset="100%" stopColor="#3a9d6a" />
          </linearGradient>
          <linearGradient id="cfLeaf2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a9d6a" />
            <stop offset="100%" stopColor="#5bb585" />
          </linearGradient>
        </defs>
        {/* 上の葉 */}
        <ellipse cx="20" cy="10" rx="7" ry="9" fill="url(#cfLeaf1)" transform="rotate(0 20 10)" />
        {/* 右の葉 */}
        <ellipse cx="30" cy="20" rx="7" ry="9" fill="url(#cfLeaf2)" transform="rotate(90 30 20)" />
        {/* 下の葉 */}
        <ellipse cx="20" cy="30" rx="7" ry="9" fill="url(#cfLeaf1)" transform="rotate(180 20 30)" />
        {/* 左の葉 */}
        <ellipse cx="10" cy="20" rx="7" ry="9" fill="url(#cfLeaf2)" transform="rotate(270 10 20)" />
        {/* 中心のハイライト */}
        <circle cx="20" cy="20" r="3" fill="#1a6b3f" opacity={0.4} />
        <circle cx="20" cy="20" r="1.5" fill="#fff" opacity={0.3} />
      </svg>
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight`}>
          <span className="text-clover-dark">Clover</span>
          <span className="text-clover">Fit</span>
        </span>
      )}
    </span>
  )
}
