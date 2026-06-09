import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        灵思AI设计工作台
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        AI驱动的智能设计协作平台
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        {['工作区', '知识库', 'Agent', 'AIGC', '训练师'].map((name) => (
          <a
            key={name}
            href="#"
            className="px-5 py-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 inline mr-2 text-purple-500" />
            {name}
          </a>
        ))}
      </div>
    </main>
  )
}
