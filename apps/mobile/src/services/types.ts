/**
 * 共享类型（从 @lingsi/shared 同步）
 *
 * 小程序端直接内联定义，避免跨包 TS 转译配置。
 * 后续若 shared 包提供了编译产物，可切换为 import。
 */

export const APP_NAME = '灵思AI设计'
export const API_BASE = 'http://localhost:8000/api'

// ============ 设计作品 ============

export interface DesignProject {
  id: string
  title: string
  description?: string
  imageUrl: string
  author?: string
  tags: string[]
  createdAt: string
  likes: number
}

// ============ API 响应 ============

export interface ReviewReport {
  status: string
  image?: { format: string; size: number[]; aspect: number }
  report?: string
  error?: string
}
