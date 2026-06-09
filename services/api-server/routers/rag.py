"""RAG 知识库 API 路由"""
import os
import tempfile
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel, Field
from services.rag_service import ingest_file, query_knowledge, get_status

router = APIRouter()


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, description="设计相关问题")


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]
    docs_count: int


@router.get("/status")
async def knowledge_status():
    """查看知识库状态"""
    return get_status()


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传设计规范文档（PDF / TXT / Markdown）"""
    # 校验格式
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".txt", ".md"]:
        return {"status": "error", "message": "仅支持 PDF / TXT / Markdown 格式"}

    # 保存临时文件
    suffix = f"_{file.filename}"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # 入库
    result = ingest_file(tmp_path)

    # 清理临时文件
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    return result


@router.post("/query", response_model=QueryResponse)
async def ask_question(req: QueryRequest):
    """向设计知识库提问"""
    return query_knowledge(req.question)


@router.post("/upload-text")
async def upload_text(data: dict):
    """上传文本内容作为知识（用于快速测试）"""
    title = data.get("title", "未命名文档")
    content = data.get("content", "")

    if not content.strip():
        return {"status": "error", "message": "内容不能为空"}

    # 写入临时文件
    with tempfile.NamedTemporaryFile(
        mode="w", delete=False, suffix=f"_{title}.txt", encoding="utf-8"
    ) as tmp:
        tmp.write(f"# {title}\n\n{content}")
        tmp_path = tmp.name

    result = ingest_file(tmp_path)
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    return result
