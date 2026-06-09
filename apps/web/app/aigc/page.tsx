import { Zap } from 'lucide-react'

export default function AIGCPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-orange-500/25">
        <Zap className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">AIGC 引擎</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        文生图 · 图生图 · 风格迁移 · 设计灵感生成
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">即将上线</p>
    </div>
  )
}
