'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Play, Save, GitBranch, X, Check, Copy, Trash2,
  Loader2, Beaker, Variable, ArrowRight, Zap, AlertCircle,
  ChevronDown, Code2, FileText, Settings, GripHorizontal
} from 'lucide-react'

const API = 'http://localhost:8000/api/trainer'

// ============ 类型 ============

interface Template {
  id: string
  name: string
  system_prompt: string
  content: string
  version: number
  variables: string[]
  created_at: string
}

interface TestResult {
  status: string
  template_id: string
  template_name?: string
  system_prompt: string
  filled_prompt: string
  variables_used: Record<string, string>
  output: string
  model: string
}

interface ABResult {
  status: string
  variables: Record<string, string>
  a: { template_id: string; name: string; output: string; model: string }
  b: { template_id: string; name: string; output: string; model: string }
}

// ============ 预设变量值（方便快速测试） ============

const SAMPLE_VALUES: Record<string, string> = {
  text: '「极简生活」App 首页 Banner，主标题：简单即自由，副标题：开启你的极简之旅',
  brand_type: '新锐茶饮品牌',
  industry: '茶饮 / 新消费',
  tone: '年轻、清新、国潮',
  theme: '夏日清凉',
  audience: '18-30 岁都市白领',
  style: '扁平插画 + 玻璃拟态',
}

export default function TrainerPage() {
  // 模板列表
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  // 编辑器
  const [editName, setEditName] = useState('')
  const [editSystem, setEditSystem] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editVersion, setEditVersion] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // 新建/删除
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSystem, setNewSystem] = useState('')
  const [newContent, setNewContent] = useState('')

  // 测试
  const [testVars, setTestVars] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [showFilled, setShowFilled] = useState(false)

  // A/B
  const [abBId, setAbBId] = useState<string>('')
  const [abTesting, setAbTesting] = useState(false)
  const [abResult, setAbResult] = useState<ABResult | null>(null)

  // ============ 加载模板 ============

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/templates`)
      const data = await res.json()
      setTemplates(data.templates)
      // 自动选中第一个
      if (data.templates.length > 0 && !activeId) {
        selectTemplate(data.templates[0])
      }
    } catch {
      setTemplates([])
    }
    setLoadingTemplates(false)
  }, [activeId])

  useEffect(() => {
    loadTemplates()
  }, [])

  // ============ 选中模板 ============

  const selectTemplate = (t: Template) => {
    setActiveId(t.id)
    setEditName(t.name)
    setEditSystem(t.system_prompt)
    setEditContent(t.content)
    setEditVersion(t.version)
    setSaveMsg('')
    // 重置测试
    setTestResult(null)
    setAbResult(null)
    // 初始化变量
    const vars: Record<string, string> = {}
    t.variables.forEach(v => {
      vars[v] = testVars[v] || SAMPLE_VALUES[v] || ''
    })
    setTestVars(vars)
  }

  const active = templates.find(t => t.id === activeId)

  // ============ 保存模板 ============

  const saveTemplate = async () => {
    if (!activeId) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`${API}/templates/${activeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          system_prompt: editSystem,
          content: editContent,
        }),
      })
      const data = await res.json()
      setEditVersion(data.version)
      setSaveMsg('已保存 (v' + data.version + ')')
      loadTemplates()
    } catch {
      setSaveMsg('保存失败')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // ============ 新建模板 ============

  const createNew = async () => {
    if (!newName.trim() || !newContent.trim()) return
    try {
      const res = await fetch(`${API}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          system_prompt: newSystem,
          content: newContent,
        }),
      })
      const data = await res.json()
      setShowNew(false)
      setNewName('')
      setNewSystem('')
      setNewContent('')
      await loadTemplates()
      selectTemplate(data)
    } catch {}
  }

  // ============ 删除模板 ============

  const deleteTpl = async (id: string) => {
    if (!confirm('确定删除此模板？')) return
    try {
      await fetch(`${API}/templates/${id}`, { method: 'DELETE' })
      if (activeId === id) {
        setActiveId(null)
        setTestResult(null)
        setAbResult(null)
      }
      loadTemplates()
    } catch {}
  }

  // ============ 测试 Prompt ============

  const runTest = async () => {
    if (!activeId) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(`${API}/templates/${activeId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: testVars }),
      })
      const data = await res.json()
      setTestResult(data)
    } catch {
      setTestResult({ status: 'error', template_id: '', system_prompt: '', filled_prompt: '', variables_used: {}, output: '测试失败，请确认后端已启动', model: '' })
    }
    setTesting(false)
  }

  // ============ A/B 测试 ============

  const runABTest = async () => {
    if (!activeId || !abBId) return
    setAbTesting(true)
    setAbResult(null)
    try {
      const res = await fetch(`${API}/templates/${activeId}/ab-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_b_id: abBId, variables: testVars }),
      })
      const data = await res.json()
      setAbResult(data)
    } catch {}
    setAbTesting(false)
  }

  // ============ 渲染 ============

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* ===== 左侧：模板列表 ===== */}
      <aside className="w-56 lg:w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)]/30 flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-xs font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-fuchsia-500" />
            Prompt 模板
          </h3>
          <button
            onClick={() => setShowNew(!showNew)}
            className="p-1 rounded-md hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-fuchsia-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 新建面板 */}
        {showNew && (
          <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-card)]/50 space-y-2">
            <input className="input-field !py-1.5 !text-xs" placeholder="模板名称" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="input-field !py-1.5 !text-xs" placeholder="System Prompt（可选）" value={newSystem} onChange={e => setNewSystem(e.target.value)} />
            <textarea className="input-field !py-1.5 !text-xs !h-16 resize-none" placeholder="模板内容，用 {变量} 占位" value={newContent} onChange={e => setNewContent(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={createNew} className="btn-primary !py-1.5 !text-xs !px-3 flex-1 justify-center">创建</button>
              <button onClick={() => setShowNew(false)} className="btn-ghost !text-xs">取消</button>
            </div>
          </div>
        )}

        {/* 模板列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingTemplates ? (
            <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--text-secondary)]" /></div>
          ) : templates.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center p-4">暂无模板</p>
          ) : (
            templates.map(t => (
              <div
                key={t.id}
                className={`group rounded-xl transition-all ${
                  activeId === t.id
                    ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800'
                    : 'hover:bg-[var(--bg-secondary)] border border-transparent'
                }`}
              >
                <button
                  onClick={() => selectTemplate(t)}
                  className="w-full text-left p-2.5"
                >
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <GitBranch className="w-3 h-3 text-[var(--text-secondary)]" />
                    <span className="text-[10px] text-[var(--text-secondary)]">v{t.version}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{t.variables.length} 个变量</span>
                  </div>
                </button>
                <div className="hidden group-hover:flex items-center justify-end px-2 pb-2">
                  <button onClick={() => deleteTpl(t.id)} className="p-1 rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部信息 */}
        <div className="p-3 border-t border-[var(--border)] text-[10px] text-[var(--text-secondary)]">
          {templates.length} 个模板 &nbsp;|&nbsp; LLM: 通义千问
        </div>
      </aside>

      {/* ===== 中间：编辑器 ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!active ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/25">
              <Code2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">AI 训练师工作台</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              管理 Prompt 模板、绑定变量、A/B 测试，快速迭代最佳 Prompt。
            </p>
            <p className="text-xs text-[var(--text-secondary)]">从左侧选择一个模板，或创建新模板开始。</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {/* 模板名称 & 操作 */}
            <div className="flex items-center gap-3">
              <input
                className="text-lg font-bold bg-transparent border-b-2 border-transparent hover:border-[var(--border)] focus:border-fuchsia-400 outline-none flex-1"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 shrink-0">
                <GitBranch className="w-3 h-3" />
                v{editVersion}
              </span>
              <button onClick={saveTemplate} disabled={saving} className="btn-primary !py-1.5 !px-3 !text-xs shrink-0">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                保存
              </button>
              {saveMsg && <span className="text-xs text-green-600 shrink-0">{saveMsg}</span>}
            </div>

            {/* System Prompt（可折叠） */}
            <details className="group/sys">
              <summary className="text-xs font-medium text-[var(--text-secondary)] cursor-pointer flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                System Prompt
                <ChevronDown className="w-3 h-3 group-open/sys:rotate-180 transition-transform" />
              </summary>
              <textarea
                className="input-field !text-sm !h-20 resize-none mt-2 font-mono"
                placeholder="系统级提示词（可选），设定 AI 的角色和行为..."
                value={editSystem}
                onChange={e => setEditSystem(e.target.value)}
              />
            </details>

            {/* Prompt 主体 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Prompt 模板
                </label>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  用 {'{变量名}'} 定义占位符
                </span>
              </div>
              <textarea
                className="input-field !text-sm !h-40 resize-none font-mono leading-relaxed"
                placeholder="输入 Prompt 模板，例如：请为 {brand} 设计一套 {style} 风格的..."
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
            </div>

            {/* 变量标签 */}
            {active?.variables && active.variables.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Variable className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                {active.variables.map(v => (
                  <span key={v} className="tag text-[11px] !bg-fuchsia-100 !text-fuchsia-700 dark:!bg-fuchsia-900/20 dark:!text-fuchsia-400">
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            )}

            {/* ===== 测试区 ===== */}
            <div className="border-t border-[var(--border)] pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-fuchsia-500" />
                <h3 className="text-sm font-semibold">Prompt 测试</h3>
              </div>

              {/* 变量输入 */}
              {active?.variables && active.variables.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {active.variables.map(v => (
                    <div key={v}>
                      <label className="text-[10px] font-medium text-[var(--text-secondary)] block mb-1">
                        {`{${v}}`}
                      </label>
                      <input
                        className="input-field !py-2 !text-sm"
                        placeholder={`输入 ${v} 的值...`}
                        value={testVars[v] || ''}
                        onChange={e => setTestVars(prev => ({ ...prev, [v]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 测试按钮 */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={runTest} disabled={testing} className="btn-primary !py-2 !text-sm">
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  运行测试
                </button>
                <button
                  onClick={() => {
                    const vars: Record<string, string> = {}
                    active?.variables.forEach(v => {
                      vars[v] = SAMPLE_VALUES[v] || `示例_${v}`
                    })
                    setTestVars(vars)
                  }}
                  className="btn-ghost !text-xs"
                >
                  填充示例值
                </button>
              </div>

              {/* 测试结果 */}
              {testResult && (
                <div className="space-y-3 animate-slide-up">
                  {/* 填值后的 Prompt */}
                  <details open={showFilled} onToggle={e => setShowFilled((e.target as HTMLDetailsElement).open)}>
                    <summary className="text-xs text-[var(--text-secondary)] cursor-pointer flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3" />
                      实际发送的 Prompt
                    </summary>
                    <pre className="mt-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-32 overflow-y-auto">
                      {testResult.filled_prompt}
                    </pre>
                  </details>

                  {/* 输出 */}
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                      LLM 输出 ({testResult.model})
                    </label>
                    <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {testResult.output}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== A/B 测试区 ===== */}
            <div className="border-t border-[var(--border)] pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-fuchsia-500" />
                <h3 className="text-sm font-semibold">A/B 对比测试</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-fuchsia-600 shrink-0">A: {active?.name}</span>
                <span className="text-[var(--text-secondary)] text-xs">vs</span>
                <select
                  value={abBId}
                  onChange={e => setAbBId(e.target.value)}
                  className="input-field !py-1.5 !text-sm !w-auto flex-1"
                >
                  <option value="">选择 B 模板...</option>
                  {templates.filter(t => t.id !== activeId).map(t => (
                    <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                  ))}
                </select>
                <button onClick={runABTest} disabled={abTesting || !abBId} className="btn-primary !py-1.5 !px-3 !text-xs shrink-0">
                  {abTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  对比
                </button>
              </div>

              {/* A/B 结果对比 */}
              {abResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
                  {/* A 组 */}
                  <div className="rounded-2xl border border-fuchsia-200 dark:border-fuchsia-800 overflow-hidden">
                    <div className="px-4 py-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 border-b border-fuchsia-100 dark:border-fuchsia-800">
                      <span className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-400">
                        A: {abResult.a.name}
                      </span>
                    </div>
                    <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto bg-[var(--bg-card)]">
                      {abResult.a.output}
                    </div>
                  </div>

                  {/* B 组 */}
                  <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                      <span className="text-xs font-semibold">
                        B: {abResult.b.name}
                      </span>
                    </div>
                    <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto bg-[var(--bg-card)]">
                      {abResult.b.output}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
