import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: '灵思AI设计 | LingSi AI Design',
  description: 'AI驱动的智能设计协作平台 — 3D预览、AIGC生成、RAG知识检索、AI Agent',
  keywords: ['AI设计', 'AIGC', '3D预览', 'RAG', 'AI Agent'],
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
