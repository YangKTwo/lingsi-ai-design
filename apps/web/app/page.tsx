'use client'

import { useState } from 'react'
import {
  Sparkles,
  Palette,
  Search,
  Bot,
  Zap,
  UserCheck,
  ArrowRight,
  Box,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

const features = [
  {
    icon: Palette,
    title: '3D 产品预览',
    desc: '上传设计图，实时贴在杯子/T恤/海报/手机壳上，360° 旋转看效果，不用实拍打样',
    href: '/workspace',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'AI 生成设计',
    desc: '输入「夏日清凉 T 恤图案」，AI 出 4 版方案，8 种风格随心换',
    href: '/aigc',
    color: 'from-orange-500 to-rose-500',
  },
  {
    icon: Bot,
    title: '智能设计审查',
    desc: '上传设计稿 → AI 自动检查对比度/尺寸/配色合规，上架前最后一道关',
    href: '/agent',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Search,
    title: '品牌规范知识库',
    desc: '上传品牌 VI 手册 / 平台素材规范，AI 即时回答合规问题',
    href: '/knowledge',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: UserCheck,
    title: 'Prompt 工作台',
    desc: '沉淀爆款设计 Prompt，一键批量出图，A/B 测试找最优版本',
    href: '/trainer',
    color: 'from-pink-500 to-fuchsia-500',
  },
]

const steps = [
  { emoji: '🎨', title: 'AI 生成', desc: '描述需求，AI 出设计稿' },
  { emoji: '👀', title: '3D 预览', desc: '贴到产品模型看实景效果' },
  { emoji: '🔍', title: '智能审查', desc: '自动检查合规性' },
  { emoji: '🚀', title: '上架素材', desc: '截图/导出，多端上架' },
]

export default function HomePage() {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="min-h-screen">
      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* 背景光晕 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/60 via-transparent to-transparent dark:from-violet-900/20" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[120px] dark:bg-violet-600/15" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] dark:bg-fuchsia-600/10" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* 标签 */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/25 text-violet-600 dark:text-violet-400 text-xs font-medium mb-8 animate-fade-in border border-violet-200 dark:border-violet-800">
            <Sparkles className="w-3.5 h-3.5" />
            AI 电商产品视觉设计平台
          </div>

          {/* 标题 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              灵思 AI
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-[var(--text-primary)] mt-3">
              AI 生成设计 · 3D 预览效果 · 一键上架素材
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            为{' '}
            <strong className="text-violet-600 dark:text-violet-400">POD 卖家</strong>
            {' '}·{' '}
            <strong className="text-blue-600 dark:text-blue-400">电商运营</strong>
            {' '}·{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">独立品牌</strong>
            {' '}打造的一站式产品视觉设计工具。不用实拍打样，AI 出图 + 3D 预览 + 智能审查，几分钟搞定一套商品主图。
          </p>

          {/* AI 输入框 */}
          <div className="max-w-xl mx-auto relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-0 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-violet-500/5 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-500 transition-all">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="试试：夏日清凉 T 恤图案 · 国潮风手机壳 · 极简海报…"
                className="flex-1 px-5 py-4 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') window.location.href = '/workspace'
                }}
              />
              <a
                href="/workspace"
                className="shrink-0 mr-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                开始设计
              </a>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">
              AI 出图 → 3D 预览 → 审查合规 → 上架，完整闭环
            </p>
          </div>
        </div>
      </section>

      {/* ========== 工作流程 ========== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map(({ emoji, title, desc }, i) => (
            <div key={title} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-2xl mx-auto mb-3">
                {emoji}
              </div>
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 功能卡片 ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              从创意到上架
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            AI 设计 + 3D 预览 + 规范审查 + 批量出图，为电商卖家打造的全流程工具链
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, href, color }, i) => (
            <a
              key={title}
              href={href}
              className="group animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <GlassCard hover className="p-6 h-full flex flex-col gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg group-hover:animate-glow`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {desc}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  进入 <ArrowRight className="w-3 h-3" />
                </div>
              </GlassCard>
            </a>
          ))}
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-violet-500" />
            <span>灵思 AI · 电商产品视觉设计平台</span>
          </div>
          <div className="flex items-center gap-6">
            <span>AI 生成设计 · 3D 预览 · 智能审查 · 批量出图 · 多端交付</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
