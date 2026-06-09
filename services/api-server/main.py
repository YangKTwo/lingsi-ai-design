"""灵思AI设计工作台 — FastAPI 后端入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import rag

app = FastAPI(
    title="灵思AI设计 API",
    version="0.1.0",
)

# CORS 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(rag.router, prefix="/api/rag", tags=["RAG 知识库"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}