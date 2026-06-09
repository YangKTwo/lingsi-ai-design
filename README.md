# 灵思AI设计工作台

> AI 驱动的全栈设计工具平台 — 从灵感激发到方案输出，覆盖 Web / 桌面 / 小程序三端。

---

## 目录

- [项目总览](#项目总览)
- [功能模块](#功能模块)
  - [① 首页](#1-首页-ui-美化)
  - [② 3D 工作区](#2-3d-工作区)
  - [③ RAG 知识库](#3-rag-知识库)
  - [④ AI Agent 设计审查](#4-ai-agent-设计审查)
  - [⑤ AIGC 文生图](#5-aigc-文生图--风格迁移)
  - [⑥ AI 设计对话](#6-ai-设计对话)
  - [⑦ AI 训练师](#7-ai-训练师工作台)
  - [⑧ Taro 小程序](#8-taro-小程序)
  - [⑨ Electron 桌面端](#9-electron-桌面端)
- [技术架构](#技术架构)
- [快速启动](#快速启动)
- [API 文档](#api-文档)
- [项目结构](#项目结构)

---

## 项目总览

灵思AI设计工作台是一个 Monorepo 全栈项目，用 AI 赋能设计全流程：

```
灵感发散 → 规范约束 → AI审查 → 方案生成 → 多端交付
   ↑ 对话    ↑ RAG     ↑ Agent   ↑ AIGC    ↑ Electron/小程序
```

**三端覆盖：**

| 端 | 技术 | 入口 |
|---|------|------|
| Web | Next.js 15 | `apps/web` → `localhost:3000` |
| 桌面 | Electron 33 | `apps/desktop` → `npm run dev` |
| 小程序 | Taro 4.x | `apps/mobile` → 微信开发者工具 |

**一个后端：** FastAPI + LangChain + DashScope（通义千问/通义万相）

---

## 功能模块

### 1. 首页 UI 美化

**做什么：** 脚手架默认页替换为有设计感的首页。

**有什么：**
- 深色/浅色主题切换（`localStorage` 持久化，无闪烁）
- 顶部导航栏 + 移动端汉堡菜单
- Hero 区域（渐变标题 + AI 入口）
- 6 个模块入口导航卡片

**怎么实现：**
- `ThemeProvider.tsx` — 自定义 Context，`mounted` 状态避免 hydration mismatch
- CSS 变量体系 — `:root`（亮色）/ `.dark`（暗色）各一套，切换只改 `<html>` class
- Tailwind CSS v4 + `lucide-react` 图标
- 导航栏根据 `usePathname()` 高亮当前页面

---

### 2. 3D 工作区

**做什么：** 在页面上实时渲染和操作 3D 产品模型，模拟电商定制预览效果。

**有什么：**
- 4 种产品模型：杯子 / T恤 / 海报 / 手机壳
- 鼠标拖拽旋转、滚轮缩放、右键平移
- 8 种预设颜色 + 自定义取色器
- 3 种材质切换：哑光 / 亮面 / 金属
- 贴图上传区域（`useTexture` 实时贴到模型表面）

**怎么实现：**
- `@react-three/fiber` — 把 Three.js 封装为 React 声明式组件
- `@react-three/drei` — `OrbitControls` 旋转缩放、`ContactShadows` 地面阴影
- `Scene3D.tsx` — Canvas + 灯光 + 模型 + 控制器
- `Models.tsx` — 4 个模型的几何体定义（圆柱体/立方体/平面等）

---

### 3. RAG 知识库

**做什么：** 上传设计规范文档（PDF/Markdown/TXT），AI 结合文档内容回答设计问题。类似 ChatGPT 但只基于你上传的资料回答。

**有什么：**
- 文档上传 → 自动切片 → 向量化 → 存入 ChromaDB
- 对话式提问，回答附带来源引用
- 支持直接粘贴文本快速入库
- 知识库状态查看（入库块数、使用模型）

**怎么实现：**

```
文档上传 → PyPDFLoader/TextLoader → RecursiveCharacterTextSplitter
→ DashScopeEmbeddings 向量化 → ChromaDB 本地存储
→ 用户提问 → 相似度检索 Top-5 → 拼接 Prompt → LLM 生成回答
```

- **Embedding：** 自写 `DashScopeEmbeddings` 类，调 DashScope 原生 API（不走 OpenAI 兼容层，避免格式问题）
- **向量库：** ChromaDB 本地持久化到 `data/chromadb/`，无需额外服务
- **LLM：** 通义千问 `qwen-turbo`
- **框架：** LangChain（`create_stuff_documents_chain` + `create_retrieval_chain`）

---

### 4. AI Agent 设计审查

**做什么：** 上传一张设计稿截图，AI 自动审查配色、对比度、尺寸比例，生成结构化审查报告。

**有什么：**
- 拖拽上传设计稿，实时预览
- Agent 模式：AI 自主调用工具，一步一步分析（慢但详尽）
- 快速模式：自动提取数据 + LLM 一步生成报告（快）
- 报告包含：评分卡片 + 配色分析 + WCAG 对比度 + 改进建议（带优先级）
- 严重程度标签：高 / 中 / 低

**怎么实现：**

```
上传图片 → Agent 自主决策：
  → get_image_info(图片) → 尺寸/比例/格式
  → extract_colors(图片) → Pillow MedianCut 量化提取主色
  → check_contrast(色1, 色2) → sRGB→线性RGB → WCAG AA/AAA 判定
  → LLM 综合数据 → 结构化审查报告
```

- **3 个真实工具：** 都是 Python 本地执行，不调 API
  - `extract_colors` — PIL `Image.quantize()` + MedianCut 算法
  - `check_contrast` — 相对亮度公式 + WCAG 标准判定（4.5:1 / 7:1）
  - `get_image_info` — 尺寸/比例/DPI，自动识别 Banner/海报/图标
- **Agent 框架：** LangChain `create_agent`（`langchain.agents`），LLM 自主循环调用工具
- **回退机制：** Agent 报错时自动降级到快速模式

---

### 5. AIGC 文生图 + 风格迁移

**做什么：** 输入文字描述，AI 生成设计灵感图；上传参考图 + 选风格，AI 进行风格迁移。

**有什么：**
- 文生图：Prompt → 1~4 张图片
- 8 种风格预设：极简 / 赛博朋克 / 新中式 / 孟菲斯 / 包豪斯 / 玻璃拟态 / 3D 等距 / 扁平插画
- 4 种尺寸：正方形 / 横版 / 竖版 / 超宽
- 图生图：上传参考图 + 目标风格 → 风格化变体
- 收藏夹 + 下载 + 放大查看 + 复制链接

**怎么实现：**
- **模型：** 通义万相 `wanx-v1`（DashScope `ImageSynthesis` API）
- **后端：** `aigc_service.py` 封装 prompt 拼接（风格关键词自动追加）、base64 图片传入
- **前端：** 文生图 / 图生图双 Tab，Ctrl+Enter 快捷生成，Lightbox 弹窗

---

### 6. AI 设计对话

**做什么：** 一个内置的设计顾问 ChatBot，用户可以问任何设计相关问题。

**有什么：**
- 设计顾问人设「灵思」（System Prompt 固定角色）
- 多轮对话记忆（内存，最多 20 轮）
- 6 个快捷提问入口
- Markdown 渲染（标题/列表/加粗）
- 新对话按钮（清空上下文）
- 双模式自动切换：配了 Coze → 走 Coze Bot；没配 → 走千问直连

**怎么实现：**
- **Coze 模式：** `httpx.AsyncClient` → `api.coze.cn/v3/chat`，透传消息
- **LLM 模式：** `ChatPromptTemplate` + `MessagesPlaceholder` 维护对话历史
- **会话管理：** 内存字典 `{conversation_id: [messages]}`，重启清空
- **模式检测：** 启动时检查 `.env` 有无 `COZE_BOT_ID`，自动选择

---

### 7. AI 训练师工作台

**做什么：** 管理 Prompt 模板，快速迭代测试——类似给 AI 调参的后台。

**有什么：**
- 模板列表（左侧）：3 个预设模板开箱即用 + 新建/删除
- 编辑器（中间）：System Prompt + 模板内容，`{变量}` 占位符语法
- 版本控制：每次保存版本号自动 +1
- 变量绑定：自动识别模板中的 `{变量}`，生成输入框
- 单次测试：填变量 → 调 LLM → 展示输出
- A/B 对比：选 B 模板，同样变量同时跑两个，并排对比结果

**怎么实现：**
- **变量系统：** 正则 `\{(\w+)\}` 提取变量名 → 自动生成输入框
- **模板存储：** 内存 + JSON 文件持久化（`data/prompt_templates.json`）
- **LLM 调用：** 同一个 `ChatOpenAI` 实例，`SystemMessage` + `HumanMessage`
- **A/B：** 两个模板同时 `invoke`，返回并排结果

---

### 8. Taro 小程序

**做什么：** 把灵思AI设计的核心功能带到微信小程序里。

**有什么：**
- 灵感广场 — 瀑布流设计作品浏览 + 下拉刷新
- 作品详情 — 大图预览 + 作者/标签/分享
- 个人中心 — API 连接状态检测 + 菜单
- 3 个 Tab：灵感广场 / 作品详情 / 我的

**怎么实现：**
- **框架：** Taro 4.x + React 18 + TypeScript + SCSS
- **API 层：** `Taro.request` / `Taro.uploadFile`，后端离线时自动降级到本地模拟数据
- **瀑布流：** 奇偶分栏算法，`DesignCard` 组件复用
- **构建：** `taro build --type weapp` → `dist/` 目录直接导入微信开发者工具
- **H5 支持：** 同一套代码 `taro build --type h5` 可编译为网页版

---

### 9. Electron 桌面端

**做什么：** 把 Web 版包装为桌面应用，加上系统级能力。

**有什么：**
- 桌面窗口加载 `localhost:3000`（Next.js 页面零改动）
- 全局快捷键 `Ctrl+Shift+L` 任何软件里唤起/隐藏窗口
- 系统托盘 — 关窗口不退出，缩到右下角
- 原生文件对话框 — 打开/保存文件
- 单实例锁 — 防止多开
- 离线提示页 — Next.js 没启动时友好提示

**怎么实现：**

```
┌─ Chromium 渲染进程 ──────────────────┐
│  localhost:3000 (Next.js 页面)        │
│  window.electronAPI.openFile() 等     │
├─ preload.js (contextBridge) ──────────┤
│  安全暴露 IPC 通道                     │
├─ main.js (Node.js 主进程) ────────────┤
│  BrowserWindow + Tray + globalShortcut │
│  dialog + fs + shell                  │
└───────────────────────────────────────┘
```

- **main.js** — `BrowserWindow` 创建窗口、`globalShortcut.register` 快捷键、`Tray` 系统托盘
- **preload.js** — `contextBridge.exposeInMainWorld` 安全暴露 API
- **IPC** — `ipcMain.handle` / `ipcRenderer.invoke` 双向通信
- **打包：** `electron-builder` → `.exe` (Windows) / `.dmg` (macOS) / `.AppImage` (Linux)

---

## 技术架构

```
apps/web/                 Next.js 15 + Tailwind CSS v4 + React 18
  ├── 3D: @react-three/fiber + @react-three/drei + three
  └── 图标: lucide-react

services/api-server/      FastAPI + LangChain + ChromaDB
  ├── LLM: 通义千问 qwen-turbo (DashScope)
  ├── Embedding: 通义千问 text-embedding-v2 (DashScope 原生 API)
  └── AIGC: 通义万相 wanx-v1 (DashScope)

apps/mobile/              Taro 4.x + React 18 + SCSS
  └── 目标: 微信小程序 + H5

apps/desktop/             Electron 33
  └── 打包: electron-builder

packages/shared/          共享类型定义 (TypeScript)
```

**设计模式：**
- **Monorepo：** pnpm workspace，`apps/*` + `packages/*`
- **API 风格：** FastAPI RESTful，CORS 允许 `localhost:3000`
- **AI 编排：** LangChain（RAG Chain / Agent / ChatPromptTemplate）
- **向量存储：** ChromaDB 本地持久化，零配置
- **样式体系：** CSS 变量主题（`:root` / `.dark`），全局过渡动画

---

## 快速启动

### 1. 后端 API

```bash
cd services/api-server
cp .env.example .env          # 编辑 .env，填入 DashScope API Key
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Web 前端

```bash
cd apps/web
pnpm dev                      # http://localhost:3000
```

### 3. Electron 桌面端

```bash
# 先启动 Web 前端（终端2）
cd apps/desktop
npm install
npm run dev                    # 自动弹出桌面窗口
```

### 4. 微信小程序

```bash
cd apps/mobile
pnpm install
npm run dev:weapp              # 编译到 dist/
# 用微信开发者工具打开 apps/mobile/dist 目录
```

---

## API 文档

后端启动后访问 `http://localhost:8000/docs` 查看 Swagger 文档。

| 域 | 端点 | 方法 | 说明 |
|----|------|------|------|
| **RAG 知识库** | `/api/rag/status` | GET | 知识库状态 |
| | `/api/rag/upload` | POST | 上传文档（PDF/TXT/MD） |
| | `/api/rag/upload-text` | POST | 粘贴文本入库 |
| | `/api/rag/query` | POST | 向知识库提问 |
| **Agent 审查** | `/api/agent/review` | POST | Agent 模式审查 |
| | `/api/agent/quick` | POST | 快速模式审查 |
| **AIGC** | `/api/aigc/styles` | GET | 可用风格列表 |
| | `/api/aigc/generate` | POST | 文生图 |
| | `/api/aigc/style-transfer` | POST | 图生图/风格迁移 |
| **AI 对话** | `/api/chat/mode` | GET | 当前对话模式 |
| | `/api/chat/send` | POST | 发送消息 |
| | `/api/chat/reset` | POST | 重置会话 |
| **训练师** | `/api/trainer/templates` | GET/POST | 模板列表/新建 |
| | `/api/trainer/templates/{id}` | GET/PUT/DELETE | 模板 CRUD |
| | `/api/trainer/templates/{id}/test` | POST | 测试 Prompt |
| | `/api/trainer/templates/{id}/ab-test` | POST | A/B 对比 |
| **健康** | `/api/health` | GET | 服务状态 |

---

## 项目结构

```
lingsi-ai-design/
├── apps/
│   ├── web/                    # Next.js 前端（主站）
│   │   ├── app/                # 页面路由
│   │   │   ├── page.tsx        # 首页
│   │   │   ├── workspace/      # 3D 工作区
│   │   │   ├── knowledge/      # RAG 知识库
│   │   │   ├── agent/          # AI 设计审查
│   │   │   ├── aigc/           # AIGC 引擎
│   │   │   ├── chat/           # AI 对话
│   │   │   └── trainer/        # 训练师
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # 导航栏
│   │   │   ├── ThemeProvider.tsx # 主题切换
│   │   │   ├── three/          # 3D 组件
│   │   │   └── ui/             # 通用 UI
│   │   └── types/              # 类型声明
│   ├── mobile/                 # Taro 小程序
│   │   ├── src/pages/          # 3 个页面
│   │   ├── src/components/     # 作品卡片
│   │   ├── src/services/       # API + 类型
│   │   └── config/             # Taro 构建配置
│   └── desktop/                # Electron 桌面端
│       ├── main.js             # 主进程
│       └── preload.js          # 桥接层
├── services/
│   └── api-server/             # FastAPI 后端
│       ├── main.py             # 入口
│       ├── routers/            # 5 个路由模块
│       └── services/           # 5 个服务模块
├── packages/
│   └── shared/                 # 共享类型定义
└── pnpm-workspace.yaml         # Monorepo 配置
```

---

> 一个独立完成的全栈 AI 产品，覆盖设计工作流 + AI 能力 + 三端交付。
