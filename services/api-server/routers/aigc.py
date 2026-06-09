"""AIGC API 路由 — 文生图 & 风格迁移"""
import os
import tempfile
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel, Field
from services.aigc_service import text_to_image, style_transfer, get_styles, get_sizes

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="画面描述")
    n: int = Field(default=2, ge=1, le=4, description="生成数量")
    size: str = Field(default="square", description="图片尺寸")
    negative_prompt: str | None = Field(default=None, description="负面提示词")
    style: str | None = Field(default=None, description="风格预设")


@router.get("/styles")
async def list_styles():
    """获取可用风格预设列表"""
    return {"styles": get_styles(), "sizes": get_sizes()}


@router.post("/generate")
async def generate_image(req: GenerateRequest):
    """文生图 — 根据文字描述生成设计灵感图"""
    result = text_to_image(
        prompt=req.prompt,
        n=req.n,
        size=req.size,
        negative_prompt=req.negative_prompt,
        style=req.style,
    )
    return result


@router.post("/style-transfer")
async def transfer_style(
    file: UploadFile = File(...),
    prompt: str = Form(default="", description="风格描述"),
    style: str = Form(default=None, description="风格预设"),
):
    """
    图生图/风格迁移 — 上传参考图 + 风格描述，生成风格化变体
    """
    # 校验格式
    ext = os.path.splitext(file.filename or "image.png")[1].lower()
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
    if ext not in allowed:
        return {"status": "error", "message": f"不支持的格式 {ext}"}

    # 保存临时文件
    suffix = f"_{file.filename}" if file.filename else "_ref.png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # 执行风格迁移
    result = style_transfer(
        image_path=tmp_path,
        prompt=prompt,
        style=style,
    )

    # 清理
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    return result
