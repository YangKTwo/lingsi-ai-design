# 灵思AI · 电商产品视觉设计平台

> 为 POD 卖家 / 电商运营 / 独立品牌提供的 AI 设计 + 3D 预览 + 智能审查一站式工具。覆盖 Web / 桌面 / 小程序三端。

---

## 产品定位

帮电商卖家解决一个核心问题：**从设计创意到产品上架，中间要反复打样、沟通、修改——能不能让 AI + 3D 把这条路缩短到几分钟？**

```
AI 生成设计 → 3D 产品预览 → 规范审查 → 批量出图 → 多端上架
    ↑ AIGC      ↑ 实时贴图    ↑ Agent     ↑ 训练师    ↑ Electron / 小程序
```

**跟竞品的区别：**

| | Midjourney | Canva | Placeit | **灵思AI** |
|---|:---:|:---:|:---:|:---:|
| AI 文生图 | ✅ | ✅ | ❌ | ✅ |
| 3D 产品贴图预览 | ❌ | ❌ | ✅ 固定模板 | ✅ 自由旋转/换色/换材质 |
| AI 设计审查 | ❌ | ❌ | ❌ | ✅ |
| 风格迁移 | ❌ | ❌ | ❌ | ✅ |
| Prompt 模板管理 | ❌ | ❌ | ❌ | ✅ |
| 设计规范知识库 | ❌ | ❌ | ❌ | ✅ |
| 小程序展示 | ❌ | ❌ | ❌ | ✅ |

**三端覆盖：**

| 端 | 技术 | 入口 |
|---|------|------|
| Web | Next.js 15 | `apps/web` → `localhost:3000` |
| 桌面 | Electron 33 | `apps/desktop` → `npm run dev` |
| 小程序 | Taro 4.x | `apps/mobile` → 微信开发者工具 |

**一个后端：** FastAPI + LangChain + DashScope（通义千问/通义万相）

---

## 功能模块

### 1. 3D 产品预览工作区 🏪 核心

**做什么：** 将设计图实时贴到产品模型上，360° 旋转预览最终效果——不需要实拍打样。

**场景：** POD 卖家做一款 T 恤/杯子，设计师做好图，上传到 3D 工作区即时看效果，截图就能当商品主图。

**有什么：**
- 4 种产品模型：杯子 / T恤 / 海报 / 手机壳
- 鼠标拖拽旋转、滚轮缩放、右键平移
- 8 种预设颜色 + 自定义取色器
- 3 种材质切换：哑光 / 亮面 / 金属
- **上传设计贴图 → 实时映射到模型表面**

**怎么实现：**
- `@react-three/fiber` + `@react-three/drei` — Three.js React 封装
- `THREE.TextureLoader` 加载用户上传的贴图 → 写入材质的 `map` 属性
- 贴图只贴主体表面（杯身/画布/T恤正面/手机壳背面），附属部件保持纯色

---

### 2. RAG 设计规范知识库 📋

**做什么：** 上传品牌 VI 手册、平台素材规范（PDF/Markdown/TXT），AI 基于文档回答设计合规问题。

**场景：** 天猫要求主图白底无文字、抖音要求竖屏 9:16——把规范文档丢进知识库，做图时随时问"这个尺寸符合要求吗？"

### 3. AI Agent 设计审查 🔍

**做什么：** 上传设计稿 → AI 自动分析配色/对比度/尺寸/比例 → 生成结构化审查报告。

**场景：** 上架前的最后检查——主图对比度够不够？文字可读性达标吗？WCAG AA/AAA 过没过？AI 替代人工逐张检查。

### 4. AIGC 文生图 + 风格迁移 🎨

**做什么：** 文字描述 → AI 生成设计图；上传参考图 + 选风格 → 风格化变体。

**场景：** 一个设计主题"夏日清凉"，AI 生成 4 张不同风格的 T 恤图案 → 贴到 3D 工作区预览 → 挑最好的一张定稿。8 种风格覆盖主流设计流派。

### 5. AI 设计对话 💬

**做什么：** 内置设计顾问 ChatBot，可问设计规范、配色建议、排版技巧。

**场景：** 新手卖家不懂设计——"暖色系和冷色系怎么搭配？""Banner 文案放左边还是右边？"随问随答。

### 6. AI 训练师工作台 🧪

**做什么：** Prompt 模板管理 + A/B 测试——沉淀爆款设计 Prompt，批量出图。

**场景：** 发现某个 Prompt 生成的图案特别受欢迎 → 存为模板 → 换产品/换关键词批量跑 → A/B 对比找出最优版本。相当于给 AI 设计师的调参后台。

---

### 7. 多端交付 📱

| 端 | 技术 | 定位 |
|---|------|------|
| Web | Next.js 15 | 主站，完整功能 |
| 桌面 | Electron 33 | 快捷键唤起，沉浸式工作 |
| 小程序 | Taro 4.x | 灵感广场 → 买家端产品定制预览 |

---

## 典型工作流（POD 卖家视角）

```
1. AIGC 输入「夏日清凉 T 恤图案」→ 生成 4 张设计稿
2. 在 3D 工作区选 T 恤模型 → 上传设计图 → 看效果、换颜色、调材质
3. Agent 审查 → 检查对比度、尺寸是否达标
4. 不满意 → 风格迁移换成「赛博朋克」风格再试
5. 满意 → 训练师保存 Prompt 模板，下次直接批量出图
6. 截图 → 上架到淘宝/抖音小店 → 小程序展示给客户
```

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

> AI 电商产品视觉设计平台 — 从设计生成到 3D 预览再到上架素材，一站式搞定。
