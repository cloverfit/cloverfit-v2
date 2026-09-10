import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CloverFit',
  description: '心拍リカバリーで「見える化」する、あなたのコンディション',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
