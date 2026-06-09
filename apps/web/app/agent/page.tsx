'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Upload, Zap, ImageIcon, AlertCircle,
  CheckCircle2, Palette, Eye, Layout, Loader2,
  FileImage, X, ArrowRight, ScanEye, Sparkles, ChevronDown
} from 'lucide-react'

const API = 'http://localhost:8000/api/agent'

interface ImageInfo {
  format: string
  size: number[]
  aspect: number
  mode: string
}

interface ReviewResult {
  status: 'ok' | 'error' | 'partial'
  image?: ImageInfo
  report?: string
  error?: string
  message?: string
}

export default function AgentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mode, setMode] = useState<'agent' | 'quick'>('agent')
  const [reviewing, setReviewing] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showFullReport, setShowFullReport] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  // 拖拽事件
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  // 清除选择
  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // 开始审查
  const startReview = async () => {
    if (!file) return
    setReviewing(true)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const endpoint = mode === 'agent' ? `${API}/review` : `${API}/quick`
      const res = await fetch(endpoint, { method: 'POST', body: form })
      const data: ReviewResult = await res.json()

      setResult(data)
    } catch {
      setResult({
        status: 'error',
        message: '无法连接到后端服务，请确认 API 已启动 (localhost:8000)',
      })
    }
    setReviewing(false)
  }

  // ============ 报告解析辅助 ============

  const reportLines = result?.report?.split('\n') ?? []

  // 提取评分
  const extractScores = (report: string) => {
    const scores: { label: string; value: number }[] = []
    const lines = report.split('\n')
    for (const line of lines) {
      const match = line.match(/[-*]\s*(.+?)\s*\(?(\d+)\s*\/?\s*10\)?/)
      if (match) {
        scores.push({ label: match[1].trim(), value: parseInt(match[2]) })
      } else {
        // 匹配 "总体 (8/10)" 这种不带星号的格式
        const m2 = line.match(/(.+?)\s*\((\d+)\s*\/\s*10\)/)
        if (m2) {
          scores.push({ label: m2[1].trim(), value: parseInt(m2[2]) })
        }
      }
    }
    return scores
  }

  const scores = result?.report ? extractScores(result.report) : []

  // 提取严重程度标签
  const severityBadge = (line: string) => {
    if (line.includes('高') || line.includes('🔴')) {
      return <span className="tag text-[11px] !bg-red-100 !text-red-700 dark:!bg-red-900/30 dark:!text-red-400">高优</span>
    }
    if (line.includes('中') || line.includes('🟡')) {
      return <span className="tag text-[11px] !bg-yellow-100 !text-yellow-700 dark:!bg-yellow-900/30 dark:!text-yellow-400">中优</span>
    }
    if (line.includes('低') || line.includes('🟢')) {
      return <span className="tag text-[11px] !bg-green-100 !text-green-700 dark:!bg-green-900/30 dark:!text-green-400">低优</span>
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ========== 顶部状态栏 ========== */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <ScanEye className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold">AI Agent 设计审查</h2>
          {result?.status === 'ok' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              审查完成
            </span>
          )}
          {result?.status === 'partial' && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              部分完成
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 审查模式切换 */}
          <div className="flex rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-0.5">
            <button
              onClick={() => setMode('agent')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'agent'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Agent
            </button>
            <button
              onClick={() => setMode('quick')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'quick'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3 h-3" />
              快速
            </button>
          </div>
        </div>
      </div>

      {/* ========== 主体区域 ========== */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* ===== 左侧：上传区 ===== */}
        <div className="lg:w-[420px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-card)]/30 flex flex-col overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* 上传区域 */}
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-[var(--border)] hover:border-emerald-300 hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      拖拽或点击上传设计稿
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      支持 PNG / JPEG / WebP / BMP
                    </p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </div>
            ) : (
              /* 图片预览 + 信息 */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <img
                    src={preview}
                    alt="预览"
                    className="w-full max-h-64 object-contain"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 图片信息 */}
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <FileImage className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium truncate">{file?.name}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-xs">
                    {(file!.size / 1024).toFixed(1)} KB &nbsp;|&nbsp; {file?.type}
                  </p>
                </div>

                {/* 审查按钮 */}
                <button
                  onClick={startReview}
                  disabled={reviewing}
                  className="btn-primary w-full justify-center !py-3"
                >
                  {reviewing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === 'agent' ? 'Agent 正在分析中...' : '正在生成报告...'}
                    </>
                  ) : (
                    <>
                      <ScanEye className="w-5 h-5" />
                      {mode === 'agent' ? '开始 Agent 审查' : '快速分析'}
                    </>
                  )}
                </button>

                {/* 模式说明 */}
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {mode === 'agent'
                      ? 'Agent 模式：AI 自主调用工具（取色 → 对比度 → 尺寸分析），循环推理后生成结构化审查报告。耗时较长但更详尽。'
                      : '快速模式：自动提取颜色和尺寸数据，LLM 一步生成报告。速度更快，适合快速预览。'}
                  </p>
                </div>
              </div>
            )}

            {/* 审查维度说明 */}
            {!preview && (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  审查维度
                </p>
                {[
                  { icon: Palette, label: '配色分析', desc: '主色提取 · 情感联想 · 色盲友好度' },
                  { icon: Eye, label: '对比度检查', desc: 'WCAG AA/AAA 标准 · 文字可读性' },
                  { icon: Layout, label: '布局评估', desc: '尺寸比例 · 设计场景适配 · 间距建议' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 右侧：审查报告 ===== */}
        <div className="flex-1 overflow-y-auto">
          {result?.status === 'error' && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">审查失败</h3>
              <p className="text-[var(--text-secondary)] max-w-md">
                {result.message || '发生未知错误'}
              </p>
              <button onClick={clearFile} className="btn-primary">
                重新上传
              </button>
            </div>
          )}

          {result?.status === 'ok' && result.report && (
            <div className="p-6 space-y-6">
              {/* 图片信息卡片 */}
              {result.image && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] shrink-0">
                    <img src={preview!} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-[var(--text-secondary)]">尺寸</span>
                      <span className="ml-2 font-medium">{result.image.size[0]} x {result.image.size[1]}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">比例</span>
                      <span className="ml-2 font-medium">{result.image.aspect}:1</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">格式</span>
                      <span className="ml-2 font-medium">{result.image.format}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">模式</span>
                      <span className="ml-2 font-medium">{result.image.mode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 评分卡片 */}
              {scores.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {scores.map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center"
                    >
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {value}<span className="text-lg text-[var(--text-secondary)]">/10</span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 报告主体 */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <ScanEye className="w-4 h-4 text-emerald-500" />
                    审查报告
                  </h3>
                  <button
                    onClick={() => setShowFullReport(!showFullReport)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                  >
                    {showFullReport ? '收起' : '展开'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullReport ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFullReport && (
                  <div className="p-5 prose prose-sm dark:prose-invert max-w-none">
                    {reportLines.map((line, i) => {
                      // 章节标题
                      if (line.match(/^##\s/)) {
                        return (
                          <h3 key={i} className="text-lg font-bold mt-6 mb-3 text-[var(--text-primary)] flex items-center gap-2">
                            {line.replace(/^##\s/, '')}
                          </h3>
                        )
                      }
                      // 子标题
                      if (line.match(/^###\s/)) {
                        return (
                          <h4 key={i} className="text-base font-semibold mt-4 mb-2 text-[var(--text-primary)]">
                            {line.replace(/^###\s/, '')}
                          </h4>
                        )
                      }
                      // 评分行 — 已通过卡片展示，淡化处理
                      if (line.match(/[-*]\s*(.+?)\s*\(?\d+\s*\/?\s*10\)?/)) {
                        return null
                      }
                      // 带严重程度的建议行
                      if (line.startsWith('-') && severityBadge(line)) {
                        return (
                          <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)] py-1">
                            {severityBadge(line)}
                            <span>{line.replace(/^[-*]\s*/, '')}</span>
                          </div>
                        )
                      }
                      // 普通列表项
                      if (line.match(/^\s*[-*]\s/)) {
                        return (
                          <li key={i} className="text-sm text-[var(--text-primary)] ml-4 py-0.5">
                            {line.replace(/^\s*[-*]\s*/, '')}
                          </li>
                        )
                      }
                      // 空行
                      if (line.trim() === '') return <br key={i} />
                      // 普通段落
                      return (
                        <p key={i} className="text-sm text-[var(--text-primary)] leading-relaxed py-0.5">
                          {line}
                        </p>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 底部操作 */}
              <div className="flex gap-3">
                <button onClick={clearFile} className="btn-ghost">
                  <Upload className="w-4 h-4" />
                  审查另一张
                </button>
                <button onClick={startReview} className="btn-ghost">
                  <ArrowRight className="w-4 h-4" />
                  重新审查
                </button>
              </div>
            </div>
          )}

          {/* 空白状态 */}
          {!result && !reviewing && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
                <ScanEye className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">AI 设计审查 Agent</h3>
              <p className="text-[var(--text-secondary)] max-w-md text-sm">
                上传设计稿后，AI Agent 将自动调用取色、对比度检查等工具进行分析，生成结构化审查报告。
              </p>
              <div className="flex gap-2 mt-2">
                {['对比度是否符合 WCAG 标准？', '配色是否协调？', '尺寸比例是否合适？'].map((q) => (
                  <span key={q} className="tag text-xs">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 加载中状态 */}
          {reviewing && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold mt-2">
                {mode === 'agent' ? 'Agent 正在审查...' : '正在分析...'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                {mode === 'agent'
                  ? 'AI 正在逐步调用工具：提取颜色 → 计算对比度 → 分析比例 → 生成报告。请稍候...'
                  : '提取设计数据并生成审查报告，通常只需几秒。'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[var(--text-secondary)]">推理中...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
