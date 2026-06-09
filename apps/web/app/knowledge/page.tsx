import { Search } from 'lucide-react'

export default function KnowledgePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/25">
        <Search className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">设计知识库</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        RAG 检索增强生成 · 上传设计规范 · 智能问答
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">即将上线</p>
    </div>
  )
}
