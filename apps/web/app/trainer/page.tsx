import { UserCheck } from 'lucide-react'

export default function TrainerPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-pink-500/25">
        <UserCheck className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-3">AI 训练师工作台</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        Prompt 工程管理 · LoRA 微调 · 模型评估 · A/B 测试
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">即将上线</p>
    </div>
  )
}
