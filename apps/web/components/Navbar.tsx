'use client'

import { Sun, Moon, Menu, X, Palette } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const links = [
  { label: '工作区', href: '/workspace' },
  { label: '知识库', href: '/knowledge' },
  { label: 'Agent', href: '/agent' },
  { label: 'AIGC', href: '/aigc' },
  { label: '对话', href: '/chat' },
  { label: '训练师', href: '/trainer' },
]

export function Navbar() {
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 font-bold text-lg shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm shadow-lg shadow-violet-500/25">
            <Palette className="w-4 h-4" />
          </span>
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent hidden sm:inline">
            灵思AI设计
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <a
                key={href}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="切换主题"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            onClick={() => setOpen(!open)}
            aria-label="菜单"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 space-y-1 animate-slide-up">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>
      )}
    </nav>
  )
}
