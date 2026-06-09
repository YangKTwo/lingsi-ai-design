/**
 * Electron API 类型声明
 *
 * 使用方式：
 *   const api = window.electronAPI
 *   if (api?.isElectron) {
 *     const file = await api.openFile()
 *     await api.saveFile({ fileName: 'design.png', data: base64Data })
 *   }
 */

interface FileResult {
  name: string
  path: string
  data: string // base64
  size: number
}

interface SaveFileOptions {
  fileName: string
  data: string // base64
  filters?: { name: string; extensions: string[] }[]
}

interface PlatformInfo {
  platform: string
  arch: string
  version: string
  isDev: boolean
}

interface ElectronAPI {
  /** 是否为 Electron 桌面环境 */
  isElectron: true

  /** 打开文件对话框 */
  openFile: (options?: {
    filters?: { name: string; extensions: string[] }[]
  }) => Promise<FileResult | null>

  /** 打开保存文件对话框 */
  saveFile: (options: SaveFileOptions) => Promise<boolean>

  /** 读取本地文件 */
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>

  /** 写入本地文件 */
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>

  /** 获取应用版本号 */
  getVersion: () => Promise<string>

  /** 获取平台信息 */
  getPlatform: () => Promise<PlatformInfo>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
