import { Bot } from 'lucide-react'

export default function AgentPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/25">
        <Bot className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">AI Agent 调度中心</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        设计审查 · 批量处理 · 灵感推荐 · 多 Agent 协同
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">即将上线</p>
    </div>
  )
}
