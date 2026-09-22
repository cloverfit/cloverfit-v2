// CloverFitロゴ — 実際のロゴ画像を使用
import Image from 'next/image'

interface CloverFitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  className?: string
  showText?: boolean
}

const sizes = {
  sm: { img: 28, text: 'text-lg' },
  md: { img: 36, text: 'text-xl' },
  lg: { img: 48, text: 'text-2xl' },
  hero: { img: 80, text: 'text-3xl' },
}

export default function CloverFitLogo({ size = 'md', className = '', showText = true }: CloverFitLogoProps) {
  const s = sizes[size]

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.jpg"
        alt="CloverFit"
        width={s.img}
        height={s.img}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight text-clover-dark`}>
          Clover Fit
        </span>
      )}
    </span>
  )
}
