import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '灵思AI设计 | LingSi AI Design',
  description: 'AI驱动的智能设计协作平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
