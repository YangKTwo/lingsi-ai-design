'use client'

import { useState, useEffect } from 'react'
import { Scene3D, type ProductType } from '@/components/three/Scene3D'
import { Coffee, Shirt, Frame, Smartphone, Palette, Layers, RotateCcw } from 'lucide-react'

interface ModelOption {
  key: ProductType
  label: string
  emoji: string
  icon: typeof Coffee
}

const models: ModelOption[] = [
  { key: 'mug', label: '杯子', emoji: '☕', icon: Coffee },
  { key: 'tshirt', label: 'T恤', emoji: '👕', icon: Shirt },
  { key: 'poster', label: '海报', emoji: '🖼️', icon: Frame },
  { key: 'phonecase', label: '手机壳', emoji: '📱', icon: Smartphone },
]

const presetColors = [
  '#ffffff', '#1a1a2e', '#e74c3c', '#3498db',
  '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c',
]

const presetMaterials = [
  { label: '哑光', value: 'matte' },
  { label: '亮面', value: 'glossy' },
  { label: '金属', value: 'metal' },
]

export default function WorkspacePage() {
  const [activeModel, setActiveModel] = useState<ProductType>('mug')
  const [modelColor, setModelColor] = useState('#ffffff')
  const [customColor, setCustomColor] = useState('#7c3aed')
  const [material, setMaterial] = useState('matte')
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [designUrl, setDesignUrl] = useState<string | undefined>()

  // 将 File 对象转为 blob URL 供纹理加载
  useEffect(() => {
    if (designFile) {
      const url = URL.createObjectURL(designFile)
      setDesignUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setDesignUrl(undefined)
    }
  }, [designFile])

  const resetAll = () => {
    setActiveModel('mug')
    setModelColor('#ffffff')
    setMaterial('matte')
    setDesignFile(null)
    setDesignUrl(undefined)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* ========== 左侧工具栏 ========== */}
      <aside className="w-16 sm:w-20 border-r border-[var(--border)] bg-[var(--bg-secondary)]/50 flex flex-col items-center py-4 gap-2 shrink-0">
        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          模型
        </span>
        {models.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveModel(key)}
            title={label}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-200 ${
              activeModel === key
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 shadow-sm ring-1 ring-violet-300 dark:ring-violet-700'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}

        <div className="w-8 h-px bg-[var(--border)] my-2" />

        <button
          onClick={resetAll}
          title="重置"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </aside>

      {/* ========== 中间 3D 画布 ========== */}
      <div className="flex-1 relative bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        {/* 顶部提示 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)]/80 backdrop-blur px-3 py-1.5 rounded-full border border-[var(--border)]">
            🖱 拖拽旋转 &nbsp;|&nbsp; 滚轮缩放 &nbsp;|&nbsp; 右键平移
          </span>
        </div>

        {/* 3D 场景 */}
        <Scene3D activeModel={activeModel} modelColor={modelColor} designUrl={designUrl} />

        {/* 底部缩略图导航 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {models.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveModel(key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all backdrop-blur ${
                activeModel === key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-[var(--bg-card)]/80 text-[var(--text-secondary)] border border-[var(--border)] hover:border-violet-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== 右侧属性面板 ========== */}
      <aside className="w-64 lg:w-72 border-l border-[var(--border)] bg-[var(--bg-secondary)]/50 overflow-y-auto shrink-0">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-sm">属性设置</h3>
          </div>

          {/* 颜色预设 */}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
              颜色
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setModelColor(c)}
                  className={`w-full aspect-square rounded-xl border-2 transition-all ${
                    modelColor === c
                      ? 'border-violet-500 scale-110 shadow-md'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {/* 自定义颜色 */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  setModelColor(e.target.value)
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs text-[var(--text-secondary)]">自定义</span>
            </div>
          </div>

          {/* 材质 */}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
              材质
            </label>
            <div className="flex gap-1.5">
              {presetMaterials.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setMaterial(value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    material === value
                      ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 上传设计稿 */}
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
              设计贴图
            </label>
            <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
              <Layers className="w-6 h-6 text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)]">
                {designFile ? designFile.name : '点击上传设计稿'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setDesignFile(file)
                }}
              />
            </label>
          </div>

          {/* 当前状态 */}
          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-500" />
              当前配置
            </h4>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1">
              <li>模型：{models.find((m) => m.key === activeModel)?.label}</li>
              <li>颜色：{modelColor}</li>
              <li>材质：{material === 'matte' ? '哑光' : material === 'glossy' ? '亮面' : '金属'}</li>
              <li>贴图：{designFile ? '✅ 已上传' : '❌ 未上传'}</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
