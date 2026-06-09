/**
 * 灵思AI设计工作台 — 预加载脚本
 *
 * 通过 contextBridge 安全地向渲染进程暴露有限的 Node.js 能力。
 * 渲染进程通过 window.electronAPI 调用。
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ========== 文件对话框 ==========

  /** 打开文件选择对话框，返回 { name, path, data(base64), size } 或 null */
  openFile: (options) => ipcRenderer.invoke("dialog:openFile", options),

  /** 保存文件对话框，data 为 base64 */
  saveFile: (options) => ipcRenderer.invoke("dialog:saveFile", options),

  // ========== 文件系统 ==========

  /** 读取本地文本文件 */
  readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),

  /** 写入本地文本文件 */
  writeFile: (filePath, data) =>
    ipcRenderer.invoke("fs:writeFile", { filePath, data }),

  // ========== 应用信息 ==========

  /** 获取应用版本 */
  getVersion: () => ipcRenderer.invoke("app:getVersion"),

  /** 获取平台信息 */
  getPlatform: () => ipcRenderer.invoke("app:getPlatform"),

  // ========== 判断是否在 Electron 环境 ==========

  /** 是否为 Electron 桌面环境 */
  isElectron: true,
});
