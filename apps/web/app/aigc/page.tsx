'use client'

import { useState, useRef } from 'react'
import {
  Sparkles, Zap, Download, Heart, ImageIcon, Upload,
  Loader2, Grid3X3, Square, RectangleHorizontal,
  RectangleVertical, Monitor, X, Maximize2, Check, Copy, AlertCircle
} from 'lucide-react'

const API = 'http://localhost:8000/api/aigc'

// ============ 常量 ============

const STYLES = [
  { key: '极简', emoji: '◻️' },
  { key: '赛博朋克', emoji: '🌆' },
  { key: '新中式', emoji: '🏮' },
  { key: '孟菲斯', emoji: '🎨' },
  { key: '包豪斯', emoji: '🔺' },
  { key: '玻璃拟态', emoji: '🫧' },
  { key: '3D 等距', emoji: '📐' },
  { key: '扁平插画', emoji: '✏️' },
]

const SIZES = [
  { key: 'square', label: '正方形', icon: Square, dim: '1024×1024' },
  { key: 'landscape', label: '横版', icon: RectangleHorizontal, dim: '1152×864' },
  { key: 'portrait', label: '竖版', icon: RectangleVertical, dim: '864×1152' },
  { key: 'wide', label: '超宽', icon: Monitor, dim: '1664×928' },
]

// ============ 主组件 ============

export default function AIGCPage() {
  // 文生图 state
  const [prompt, setPrompt] = useState('')
  const [activeStyle, setActiveStyle] = useState<string | null>(null)
  const [activeSize, setActiveSize] = useState('square')
  const [numImages, setNumImages] = useState(2)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  // 图生图 state
  const [tab, setTab] = useState<'text2img' | 'img2img'>('text2img')
  const [refFile, setRefFile] = useState<File | null>(null)
  const [refPreview, setRefPreview] = useState<string | null>(null)
  const [refPrompt, setRefPrompt] = useState('')
  const [refStyle, setRefStyle] = useState<string | null>(null)
  const [refGenerating, setRefGenerating] = useState(false)
  const [refResults, setRefResults] = useState<string[]>([])
  const [refError, setRefError] = useState('')

  // 收藏
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  // 放大查看
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  // ============ 文生图 ============

  const generateImages = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setErrorMsg('')
    setResults([])

    try {
      const res = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          n: numImages,
          size: activeSize,
          style: activeStyle,
        }),
      })
      const data = await res.json()

      if (data.status === 'ok') {
        setResults(data.images)
      } else {
        setErrorMsg(data.message || '生成失败')
      }
    } catch {
      setErrorMsg('无法连接到后端，请确认 API 已启动 (localhost:8000)')
    }
    setGenerating(false)
  }

  // ============ 图生图 ============

  const handleRefFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setRefFile(file)
    setRefResults([])
    setRefError('')
    const url = URL.createObjectURL(file)
    setRefPreview(url)
  }

  const styleTransfer = async () => {
    if (!refFile) return
    setRefGenerating(true)
    setRefError('')
    setRefResults([])

    try {
      const form = new FormData()
      form.append('file', refFile)
      form.append('prompt', refPrompt.trim())
      if (refStyle) form.append('style', refStyle)

      const res = await fetch(`${API}/style-transfer`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json()

      if (data.status === 'ok') {
        setRefResults(data.images)
      } else {
        setRefError(data.message || '风格迁移失败')
      }
    } catch {
      setRefError('无法连接到后端')
    }
    setRefGenerating(false)
  }

  // ============ 收藏 ============

  const toggleFavorite = (url: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  // ============ 下载 ============

  const downloadImage = async (url: string, index: number) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `lingsi-aigc-${Date.now()}-${index}.png`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  // ============ 渲染 ============

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* ========== 顶部状态栏 ========== */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold">AIGC 引擎</h2>
          <span className="text-xs text-[var(--text-secondary)]">
            通义万相 · wanx-v1
          </span>
        </div>

        {/* Tab 切换 */}
        <div className="flex rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-0.5">
          <button
            onClick={() => setTab('text2img')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              tab === 'text2img'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            文生图
          </button>
          <button
            onClick={() => setTab('img2img')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              tab === 'img2img'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            图生图
          </button>
        </div>
      </div>

      {/* ========== 主体 ========== */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* ===== 文生图 ===== */}
          {tab === 'text2img' && (
            <>
              {/* Prompt 输入区 */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <textarea
                    className="input-field flex-1 !h-24 resize-none"
                    placeholder="描述你想要的画面，例如：一张极简风格的海报，蓝色渐变背景，白色文字，干净的几何构图..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) generateImages()
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {prompt.length} / 500 &nbsp;|&nbsp; Ctrl+Enter 生成
                  </span>
                </div>
              </div>

              {/* 风格标签 */}
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                  风格预设
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STYLES.map(({ key, emoji }) => (
                    <button
                      key={key}
                      onClick={() => setActiveStyle(activeStyle === key ? null : key)}
                      className={`tag text-xs cursor-pointer transition-all ${
                        activeStyle === key
                          ? '!bg-orange-100 !text-orange-700 dark:!bg-orange-900/30 dark:!text-orange-400 !border !border-orange-300'
                          : ''
                      }`}
                    >
                      {emoji} {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* 尺寸 & 数量 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                    图片尺寸
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES.map(({ key, label, icon: Icon, dim }) => (
                      <button
                        key={key}
                        onClick={() => setActiveSize(key)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                          activeSize === key
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-300'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        <span className="text-[10px] opacity-60">{dim}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                    生成数量: {numImages}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumImages(n)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                          numImages === n
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-300'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={generateImages}
                disabled={generating || !prompt.trim()}
                className="btn-primary w-full justify-center !py-3.5 !text-base"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 正在创作中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始生成
                  </>
                )}
              </button>

              {/* 错误信息 */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* 结果网格 */}
              {results.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-orange-500" />
                    生成结果
                    <span className="text-xs text-[var(--text-secondary)] font-normal">
                      ({results.length} 张)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((url, i) => (
                      <ResultCard
                        key={i}
                        url={url}
                        index={i}
                        isFavorite={favorites.has(url)}
                        onFavorite={() => toggleFavorite(url)}
                        onDownload={() => downloadImage(url, i)}
                        onEnlarge={() => setLightbox(url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== 图生图 ===== */}
          {tab === 'img2img' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：上传区 */}
                <div className="space-y-4">
                  {!refPreview ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center cursor-pointer hover:border-orange-300 hover:bg-[var(--bg-secondary)] transition-all"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">上传参考图</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                            PNG / JPEG / WebP
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
                          if (f) handleRefFile(f)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
                        <img
                          src={refPreview}
                          alt="参考图"
                          className="w-full max-h-72 object-contain bg-[var(--bg-secondary)]"
                        />
                        <button
                          onClick={() => {
                            setRefFile(null)
                            setRefPreview(null)
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 风格预设 */}
                      <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                          目标风格
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {STYLES.map(({ key, emoji }) => (
                            <button
                              key={key}
                              onClick={() => setRefStyle(refStyle === key ? null : key)}
                              className={`tag text-xs cursor-pointer transition-all ${
                                refStyle === key
                                  ? '!bg-orange-100 !text-orange-700 dark:!bg-orange-900/30 dark:!text-orange-400'
                                  : ''
                              }`}
                            >
                              {emoji} {key}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 补充描述 */}
                      <textarea
                        className="input-field !h-20 resize-none"
                        placeholder="补充描述（可选）：你希望生成什么样的风格变体？"
                        value={refPrompt}
                        onChange={(e) => setRefPrompt(e.target.value)}
                      />

                      <button
                        onClick={styleTransfer}
                        disabled={refGenerating}
                        className="btn-primary w-full justify-center !py-3"
                      >
                        {refGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            风格迁移中...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            开始风格迁移
                          </>
                        )}
                      </button>

                      {refError && (
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 text-sm text-red-600">
                          {refError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 右侧：结果 */}
                <div>
                  {refResults.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-500" />
                        风格迁移结果
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {refResults.map((url, i) => (
                          <ResultCard
                            key={i}
                            url={url}
                            index={i}
                            isFavorite={favorites.has(url)}
                            onFavorite={() => toggleFavorite(url)}
                            onDownload={() => downloadImage(url, i)}
                            onEnlarge={() => setLightbox(url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 空白引导 */}
                  {refResults.length === 0 && !refGenerating && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8 min-h-[300px]">
                      <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">风格迁移</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          上传参考图 + 选择目标风格
                          <br />
                          AI 将在保留原图结构的基础上进行风格化重绘
                        </p>
                      </div>
                    </div>
                  )}

                  {refGenerating && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[300px]">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-sm text-[var(--text-secondary)]">正在风格迁移...</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== 收藏栏 ========== */}
      {favorites.size > 0 && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 p-3 shrink-0">
          <details>
            <summary className="text-xs font-medium text-[var(--text-secondary)] cursor-pointer flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              收藏夹 ({favorites.size})
            </summary>
            <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
              {Array.from(favorites).map((url, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={url}
                    alt={`收藏 ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border border-[var(--border)] cursor-pointer hover:ring-2 ring-orange-400 transition-all"
                    onClick={() => setLightbox(url)}
                  />
                  <button
                    onClick={() => toggleFavorite(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* ========== Lightbox 弹窗 ========== */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt="放大查看"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={() => downloadImage(lightbox, 0)}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              下载原图
            </button>
            <button
              onClick={() => toggleFavorite(lightbox)}
              className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm ${
                favorites.has(lightbox)
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.has(lightbox) ? 'fill-white' : ''}`} />
              {favorites.has(lightbox) ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 结果卡片子组件 ============

function ResultCard({
  url,
  index,
  isFavorite,
  onFavorite,
  onDownload,
  onEnlarge,
}: {
  url: string
  index: number
  isFavorite: boolean
  onFavorite: () => void
  onDownload: () => void
  onEnlarge: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="glass-card overflow-hidden group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* 图片 */}
      <div className="relative aspect-square bg-[var(--bg-secondary)] overflow-hidden">
        {!loaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[var(--text-secondary)] animate-spin" />
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">图片加载失败</span>
          </div>
        )}
        {!imgError && (
          <img
            src={url}
            alt={`生成结果 ${index + 1}`}
            className={`w-full h-full object-cover transition-all duration-500 cursor-pointer ${
              loaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105`}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            onClick={onEnlarge}
          />
        )}
        {/* Hover 操作栏 */}
        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent pt-8">
          <button
            onClick={onEnlarge}
            className="p-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors"
            title="放大查看"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors"
            title="下载"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-gray-800 hover:bg-white'
            }`}
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>结果 #{index + 1}</span>
        <button
          onClick={copyUrl}
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              复制链接
            </>
          )}
        </button>
      </div>
    </div>
  )
}
