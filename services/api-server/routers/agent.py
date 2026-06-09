"""AI Agent 设计审查 API 路由"""
import os
import tempfile
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from services.agent_service import review_design, quick_analyze

router = APIRouter()


class ReviewResponse(BaseModel):
    status: str
    image: dict | None = None
    report: str | None = None
    error: str | None = None
    message: str | None = None


@router.post("/review", response_model=ReviewResponse)
async def review_image(file: UploadFile = File(...)):
    """
    上传设计稿，AI Agent 自动审查并返回报告。

    支持格式：PNG / JPEG / WebP / BMP
    审查维度：配色、对比度、尺寸比例、设计建议
    """
    # 校验格式
    ext = os.path.splitext(file.filename or "image.png")[1].lower()
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"}
    if ext not in allowed:
        return {
            "status": "error",
            "message": f"不支持的图片格式 {ext}，请上传 PNG / JPEG / WebP / BMP / GIF",
        }

    # 保存上传文件
    suffix = f"_{file.filename}" if file.filename else "_design.png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # 执行审查
    result = review_design(tmp_path)

    # 清理临时文件
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    return result


@router.post("/quick", response_model=ReviewResponse)
async def quick_review(file: UploadFile = File(...)):
    """
    快速审查模式：直接提取数据 + LLM 一步生成报告（比 Agent 更快）。
    """
    # 校验格式
    ext = os.path.splitext(file.filename or "image.png")[1].lower()
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"}
    if ext not in allowed:
        return {
            "status": "error",
            "message": f"不支持的图片格式 {ext}",
        }

    # 保存上传文件
    suffix = f"_{file.filename}" if file.filename else "_design.png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # 快速分析
    result = quick_analyze(tmp_path)

    # 清理临时文件
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    return result
