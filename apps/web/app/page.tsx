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
    title: 'AI 设计工作区',
    desc: 'Three.js 3D 实时预览，将平面设计稿映射到产品模型，所见即所得',
    href: '/workspace',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Search,
    title: '设计知识库',
    desc: 'RAG 检索增强生成，基于设计规范文档智能问答，告别翻阅 PDF',
    href: '/knowledge',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Bot,
    title: 'AI Agent',
    desc: '多 Agent 协同工作，自动审查设计稿的对比度、间距、字体层级',
    href: '/agent',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'AIGC 引擎',
    desc: '文生图 / 风格迁移 / 灵感生成，接入业内主流生成模型',
    href: '/aigc',
    color: 'from-orange-500 to-rose-500',
  },
  {
    icon: UserCheck,
    title: 'AI 训练师',
    desc: 'Prompt 工程管理、LoRA 微调面板、模型效果 A/B 评估',
    href: '/trainer',
    color: 'from-pink-500 to-fuchsia-500',
  },
]

const steps = [
  { emoji: '📤', title: '上传设计', desc: '上传设计稿或描述需求' },
  { emoji: '🤖', title: 'AI 分析', desc: 'RAG 检索 + Agent 审查' },
  { emoji: '✨', title: '智能生成', desc: 'AIGC 生成灵感方案' },
  { emoji: '💾', title: '导出使用', desc: '多格式导出，所见即所得' },
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
            AI Design · 灵思工作台 v0.1
          </div>

          {/* 标题 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              灵思 AI 设计
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-[var(--text-primary)] mt-3">
              让设计更智能
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            融合{' '}
            <strong className="text-violet-600 dark:text-violet-400">3D 预览</strong>
            {' '}·{' '}
            <strong className="text-blue-600 dark:text-blue-400">RAG 知识检索</strong>
            {' '}·{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">AI Agent</strong>
            {' '}·{' '}
            <strong className="text-orange-600 dark:text-orange-400">AIGC 生成</strong>
            {' '}于一体的全栈智能设计协作平台
          </p>

          {/* AI 输入框 */}
          <div className="max-w-xl mx-auto relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-0 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-violet-500/5 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-500 transition-all">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你的设计需求，AI 将为你生成…"
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
                生成
              </a>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">
              试试：极简海报 · 产品包装 · 品牌配色 · UI 界面
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
              核心能力
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            每个模块独立运作，任意组合使用，覆盖设计工作全流程
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
            <span>灵思 AI 设计工作台 · LingSi AI Design Workstation</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Next.js 14 · Three.js · RAG · Agent · AIGC · Taro · Electron</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
