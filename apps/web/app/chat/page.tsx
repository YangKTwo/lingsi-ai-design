'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, Bot, User, Sparkles, Loader2,
  Trash2, MessageSquare, Lightbulb, Palette,
  Ruler, Type, Zap
} from 'lucide-react'

const API = 'http://localhost:8000/api/chat'

interface Message {
  role: 'user' | 'bot'
  content: string
}

const QUICK_PROMPTS = [
  { icon: Palette, text: '帮我推荐一套适合科技公司的配色方案' },
  { icon: Ruler, text: '移动端 App 的按钮最小触控尺寸是多少？' },
  { icon: Type, text: '设计一个电商 Banner 的排版布局方案' },
  { icon: Lightbulb, text: '设计一个品牌 Logo 的创意方向' },
  { icon: Zap, text: 'WCAG 2.1 AA 标准的关键要求有哪些？' },
  { icon: MessageSquare, text: '给我一些提升 UI 设计感的实用技巧' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 获取对话模式
  useEffect(() => {
    fetch(`${API}/mode`)
      .then(r => r.json())
      .then(d => setMode(d.mode))
      .catch(() => setMode('unknown'))
  }, [])

  // 自动滚到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 发送消息
  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          conversation_id: conversationId,
        }),
      })
      const data = await res.json()

      const botMsg: Message = { role: 'bot', content: data.reply }
      setMessages(prev => [...prev, botMsg])

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: '抱歉，连接失败。请确认后端 API 已启动 (localhost:8000)' },
      ])
    }
    setLoading(false)
  }

  // 重置会话
  const resetChat = async () => {
    if (conversationId) {
      try {
        await fetch(`${API}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId }),
        })
      } catch {}
    }
    setMessages([])
    setConversationId(null)
    inputRef.current?.focus()
  }

  // 简单 Markdown 渲染
  const renderContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        // 标题
        if (line.match(/^###\s/)) {
          return <h4 key={i} className="text-sm font-bold mt-3 mb-1">{line.replace(/^###\s/, '')}</h4>
        }
        if (line.match(/^##\s/)) {
          return <h3 key={i} className="text-base font-bold mt-4 mb-1">{line.replace(/^##\s/, '')}</h3>
        }
        // 列表
        if (line.match(/^\s*[-*]\s/) || line.match(/^\s*\d+[.)]\s/)) {
          return <li key={i} className="text-sm ml-3 py-0.5">{line.replace(/^\s*[-*\d]+[.)]\s*/, '')}</li>
        }
        // 加粗
        const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // 空行
        if (line.trim() === '') return <br key={i} />
        return <p key={i} className="text-sm py-0.5" dangerouslySetInnerHTML={{ __html: bolded }} />
      })
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ========== 顶部状态栏 ========== */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI 设计顾问</h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {mode === 'coze' ? 'Coze Bot 驱动' : mode === 'llm' ? `通义千问` : '加载中...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={resetChat} className="btn-ghost text-xs">
              <Trash2 className="w-3.5 h-3.5" />
              新对话
            </button>
          )}
          <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-1 rounded-full border border-[var(--border)]">
            {mode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ========== 对话区 ========== */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 空白引导 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-violet-500/25">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI 设计顾问 — 灵思</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-md">
                你的专属设计助手，帮你分析需求、推荐方案、解答设计规范问题。
                <br />
                试着问我一个问题吧！
              </p>
            </div>

            {/* 快捷提问 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-300 transition-all"
                >
                  <Icon className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="line-clamp-1">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'bot' ? '' : 'flex-row-reverse'}`}
          >
            {/* 头像 */}
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                msg.role === 'bot'
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            {/* 消息体 */}
            <div className="max-w-[80%] sm:max-w-[70%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'bot'
                    ? 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]'
                    : 'bg-violet-600 text-white'
                }`}
              >
                {msg.role === 'bot' ? renderContent(msg.content) : msg.content}
              </div>

              {/* 消息时间 */}
              <span className="text-[10px] text-[var(--text-secondary)] px-4 mt-1 block">
                {msg.role === 'bot' ? '灵思' : '我'}
              </span>
            </div>
          </div>
        ))}

        {/* 加载中 */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600" />
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              <span className="text-sm text-[var(--text-secondary)]">思考中...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ========== 底部输入栏 ========== */}
      <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-card)]/50 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input-field flex-1"
            placeholder="描述你的设计需求或问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary shrink-0 !px-4"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mt-2 text-center">
          Enter 发送 &nbsp;|&nbsp; 灵思 AI 设计顾问 · 随时为你提供专业建议
        </p>
      </div>
    </div>
  )
}
