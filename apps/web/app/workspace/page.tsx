import { Box } from 'lucide-react'

export default function WorkspacePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-violet-500/25">
        <Box className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">AI 设计工作区</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        Three.js 3D 预览 + 实时编辑面板
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">即将上线</p>
    </div>
  )
}
