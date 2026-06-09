import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className = '', hover = false, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg-card)]/70 backdrop-blur-lg border border-[var(--border)] rounded-2xl shadow-sm ${
        hover ? 'hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.01] cursor-pointer' : ''
      } transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  )
}
