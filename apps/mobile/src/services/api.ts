/**
 * API 服务层 — 复用后端接口
 * 小程序 & H5 共用
 */
import Taro from '@tarojs/taro'
import type { DesignProject, ReviewReport } from './types'
import { API_BASE } from './types'

// ============ 灵感广场 ============

/** 模拟数据（后端还没设计作品 CRUD 时使用） */
const MOCK_PROJECTS: DesignProject[] = [
  {
    id: '1',
    title: '极简生活 App 界面',
    description: '一套极简风格的健康管理 App UI 设计，包含首页、记录、个人中心三个主页面。',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    author: '设计师小王',
    tags: ['极简', 'UI设计', '健康'],
    createdAt: '2026-06-01',
    likes: 234,
  },
  {
    id: '2',
    title: '夏日清凉品牌 VI',
    description: '新式茶饮品牌的完整视觉识别系统，包含 Logo、配色、字体、应用示例。',
    imageUrl: 'https://picsum.photos/400/500?random=2',
    author: '灵思团队',
    tags: ['品牌设计', 'VI', '茶饮'],
    createdAt: '2026-05-28',
    likes: 189,
  },
  {
    id: '3',
    title: '赛博朋克海报系列',
    description: '一组赛博朋克风格的科幻主题海报，运用霓虹灯光效和暗色调。',
    imageUrl: 'https://picsum.photos/400/550?random=3',
    author: 'AI创作者',
    tags: ['赛博朋克', '海报', 'AIGC'],
    createdAt: '2026-06-05',
    likes: 567,
  },
  {
    id: '4',
    title: '新中式茶具包装',
    description: '融合传统水墨与现代设计的茶具礼盒包装方案。',
    imageUrl: 'https://picsum.photos/400/480?random=4',
    author: '设计达人',
    tags: ['新中式', '包装', '文创'],
    createdAt: '2026-06-03',
    likes: 321,
  },
]

/** 获取灵感作品列表 */
export async function getInspirations(): Promise<DesignProject[]> {
  try {
    const res = await Taro.request({
      url: `${API_BASE}/projects`,
      method: 'GET',
      timeout: 5000,
    })
    if (res.statusCode === 200) {
      return (res.data as any)?.projects ?? []
    }
  } catch {
    console.log('后端未连接，使用模拟数据')
  }
  return MOCK_PROJECTS
}

/** 获取单个作品详情 */
export async function getProjectDetail(id: string): Promise<DesignProject | null> {
  // 先从 mock 中查找（后端还没实现 projects API）
  const found = MOCK_PROJECTS.find(p => p.id === id)
  if (found) return found

  try {
    const res = await Taro.request({
      url: `${API_BASE}/projects/${id}`,
      method: 'GET',
      timeout: 5000,
    })
    if (res.statusCode === 200) {
      return (res.data as any) ?? null
    }
  } catch {}
  return null
}

/** 上传设计稿并获取审查报告 */
export async function reviewDesign(filePath: string): Promise<ReviewReport> {
  try {
    const res = await Taro.uploadFile({
      url: `${API_BASE}/agent/review`,
      filePath: filePath,
      name: 'file',
      timeout: 60000,
    })
    return JSON.parse(res.data) as ReviewReport
  } catch {
    return { status: 'error', error: '连接失败' }
  }
}

/** 调用 AI 对话 */
export async function chatWithAI(message: string): Promise<string> {
  try {
    const res = await Taro.request({
      url: `${API_BASE}/chat/send`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { message },
      timeout: 30000,
    })
    return (res.data as any)?.reply ?? '抱歉，我暂时无法回答。'
  } catch {
    return '网络连接失败，请检查后端服务。'
  }
}

/** 检查后端健康状态 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await Taro.request({
      url: `${API_BASE}/health`,
      method: 'GET',
      timeout: 3000,
    })
    return res.statusCode === 200
  } catch {
    return false
  }
}
