'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Upload, FileText, Database, Loader2, Send, Bot, User, BookOpen, X } from 'lucide-react'

const API = 'http://localhost:8000/api/rag'

interface StatusInfo {
  docs_count: number
  collection: string
  llm_model: string
  embedding_model: string
}

interface Message {
  role: 'user' | 'bot'
  content: string
  sources?: string[]
}

export default function KnowledgePage() {
  const [status, setStatus] = useState<StatusInfo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // 加载知识库状态
  const loadStatus = async () => {
    try {
      const res = await fetch(`${API}/status`)
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus(null)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 上传文件
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      setUploadMsg(data.status === 'ok' ? `✅ ${data.message}` : `❌ ${data.message}`)
      loadStatus()
    } catch {
      setUploadMsg('❌ 上传失败，请确认后端已启动')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  // 上传文本
  const uploadText = async () => {
    if (!textContent.trim()) return
    setUploading(true)
    setUploadMsg('')
    try {
      const res = await fetch(`${API}/upload-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: textTitle || '设计知识', content: textContent }),
      })
      const data = await res.json()
      setUploadMsg(data.status === 'ok' ? `✅ ${data.message}` : `❌ ${data.message}`)
      if (data.status === 'ok') {
        setTextTitle('')
        setTextContent('')
      }
      loadStatus()
    } catch {
      setUploadMsg('❌ 上传失败，请确认后端已启动')
    }
    setUploading(false)
  }

  // 提问
  const askQuestion = async () => {
    if (!question.trim()) return
    const userMsg: Message = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setQuestion('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const botMsg: Message = {
        role: 'bot',
        content: data.answer,
        sources: data.sources,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '❌ 请求失败，请确认后端已启动并配置了 API Key' },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ========== 顶部状态栏 ========== */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold">设计知识库</h2>
          {status && (
            <span className="text-xs text-[var(--text-secondary)]">
              {status.docs_count} 个文本块 &nbsp;|&nbsp; 模型：{status.llm_model}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className={`btn-ghost text-sm ${showUpload ? 'text-blue-600' : ''}`}
          >
            <Upload className="w-4 h-4" />
            上传知识
          </button>
          <button onClick={loadStatus} className="btn-ghost text-sm">
            <Database className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* ========== 上传面板（可折叠） ========== */}
      {showUpload && (
        <div className="border-b border-[var(--border)] bg-[var(--bg-card)]/50 p-4 space-y-4 animate-slide-up">
          {/* 文件上传 */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FileText className="w-4 h-4" />
              选择 PDF / TXT / MD 文件
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={uploadFile} />
            </label>
            {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            {uploadMsg && <span className="text-sm">{uploadMsg}</span>}
          </div>

          {/* 文本快速录入 */}
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">或直接粘贴设计知识文本：</p>
            <input
              className="input-field text-sm"
              placeholder="文档标题（可选）"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
            />
            <textarea
              className="input-field text-sm h-24 resize-none"
              placeholder="粘贴设计规范内容，例如：Material Design 3 的主色规范要求..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <button onClick={uploadText} disabled={uploading || !textContent.trim()} className="btn-primary text-sm">
              {uploading ? '入库中...' : '提交入库'}
            </button>
          </div>
        </div>
      )}

      {/* ========== 对话区 ========== */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">RAG 检索增强生成</h3>
            <p className="text-[var(--text-secondary)] max-w-md text-sm">
              上传设计规范文档后，向知识库提问获取准确回答。
              <br />
              未上传文档时，我会尽力给出通用设计建议。
            </p>
            <div className="flex gap-2 mt-2">
              {['UI 设计中按钮的最小触控区域是多少？', 'Material Design 推荐的主色和辅色比例？', '海报设计的常见排版方式有哪些？'].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="tag text-xs whitespace-nowrap"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'bot' ? '' : 'flex-row-reverse'}`}>
            {/* 头像 */}
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === 'bot'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            {/* 消息体 */}
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'bot'
                    ? 'bg-[var(--bg-secondary)] border border-[var(--border)]'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.content}
              </div>

              {/* 来源 */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.sources.map((s, j) => (
                    <span key={j} className="tag text-[11px]">
                      📄 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 加载中 */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ========== 底部输入栏 ========== */}
      <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-card)]/50">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="提问设计相关问题，例如：海报的标准尺寸和出血位是多少？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && askQuestion()}
          />
          <button
            onClick={askQuestion}
            disabled={!question.trim() || loading}
            className="btn-primary shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
