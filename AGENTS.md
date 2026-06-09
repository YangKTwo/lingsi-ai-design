<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 灵思AI设计工作台

> 全栈 AI 设计工具平台 — 详见 [README.md](./README.md)

## 技术栈速查

- **Web 前端:** Next.js 15 (App Router) + Tailwind CSS v4 + React 18
- **3D:** @react-three/fiber + three
- **后端:** FastAPI + LangChain + ChromaDB
- **AI:** 通义千问 + 通义万相 (DashScope)
- **小程序:** Taro 4.x
- **桌面:** Electron 33
- **包管理:** pnpm workspace (Monorepo)

## 关键约定

- 所有 AI 调用统一走 DashScope，API Key 在 `services/api-server/.env`
- 向量库 ChromaDB 数据在 `services/api-server/data/chromadb/`，已在 `.gitignore`
- 前端页面都是 `'use client'` 组件，直接调 `localhost:8000` API
