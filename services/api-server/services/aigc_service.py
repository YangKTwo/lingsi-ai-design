"""
AIGC 服务 — 通义万相 (wanx-v1) 文生图 & 图生图

DashScope ImageSynthesis API：
  - 文生图: wanx-v1，输入 prompt → 输出 1-4 张图片 URL
  - 图生图/风格迁移: 输入参考图 + prompt → 风格化输出
"""
import os
import time
import base64
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# API Key：优先用 DASHSCOPE_API_KEY，回退到 LLM_API_KEY
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY") or os.getenv("LLM_API_KEY", "")

import dashscope
from dashscope import ImageSynthesis
from http import HTTPStatus


# ============================================================
# 文生图
# ============================================================

# 支持的尺寸
VALID_SIZES = {
    "square": "1024*1024",       # 正方形，头像/图标
    "landscape": "1152*864",     # 横版，Banner/封面
    "portrait": "864*1152",      # 竖版，海报
    "wide": "1664*928",          # 超宽，信息图
}

# 风格预设
STYLE_PROMPTS = {
    "极简": "minimalist style, clean composition, simple geometric shapes, plenty of negative space, elegant",
    "赛博朋克": "cyberpunk style, neon lights, dark atmosphere, futuristic city, high tech, low life, vibrant colors",
    "新中式": "new Chinese style, traditional elements with modern design, ink wash texture, elegant gold accents, zen atmosphere",
    "孟菲斯": "Memphis design style, bold geometric patterns, bright contrasting colors, 80s aesthetic, playful and energetic",
    "包豪斯": "Bauhaus style, form follows function, primary colors, geometric shapes, clean typography, modernist",
    "玻璃拟态": "glassmorphism design, frosted glass effect, soft gradients, floating elements, light and airy, modern UI",
    "3D 等距": "3D isometric illustration, clean lighting, pastel colors, cute and professional, clay render style",
    "扁平插画": "flat vector illustration style, bold colors, simple shapes, no gradients, modern corporate illustration",
}


def text_to_image(
    prompt: str,
    n: int = 2,
    size: str = "square",
    negative_prompt: str | None = None,
    style: str | None = None,
) -> dict:
    """
    文本生成设计灵感图

    Args:
        prompt: 画面描述
        n: 生成数量 (1-4)
        size: 尺寸 key (square/landscape/portrait/wide) 或如 "1024*1024"
        negative_prompt: 负面提示词（不想要的内容）
        style: 风格预设名称

    Returns:
        {
            "status": "ok" | "error",
            "images": ["url1", "url2", ...],
            "prompt": "最终使用的 prompt",
            "task_id": "..."
        }
    """
    if not DASHSCOPE_API_KEY:
        return {"status": "error", "message": "未配置 DASHSCOPE_API_KEY 或 LLM_API_KEY"}

    if not prompt.strip():
        return {"status": "error", "message": "prompt 不能为空"}

    # 拼接风格
    full_prompt = prompt.strip()
    if style and style in STYLE_PROMPTS:
        full_prompt = f"{full_prompt}, {STYLE_PROMPTS[style]}"

    # 解析尺寸
    actual_size = VALID_SIZES.get(size, size)

    try:
        result = ImageSynthesis.call(
            model="wanx-v1",
            prompt=full_prompt,
            negative_prompt=negative_prompt or "",
            n=n,
            size=actual_size,
            api_key=DASHSCOPE_API_KEY,
        )

        if result.status_code == HTTPStatus.OK:
            # 检查输出 — 兼容 ImageSynthesisResult 对象和 dict 两种格式
            images = []
            if hasattr(result.output, "results"):
                for r in result.output.results:
                    url = getattr(r, "url", "") or (r.get("url", "") if isinstance(r, dict) else "")
                    if url:
                        images.append(url)

            return {
                "status": "ok",
                "images": images,
                "prompt": full_prompt,
                "task_id": getattr(result.output, "task_id", ""),
            }
        else:
            return {
                "status": "error",
                "message": f"生成失败: {result.message} (code: {result.status_code})",
            }
    except Exception as e:
        return {"status": "error", "message": f"调用异常: {str(e)}"}


# ============================================================
# 图生图 / 风格迁移
# ============================================================

def style_transfer(
    image_path: str,
    prompt: str = "",
    style: str | None = None,
    strength: float = 0.7,
) -> dict:
    """
    以参考图为底版进行风格迁移。

    通义万相支持的方式：
      - 将图片转为 base64 data URL 或上传到可访问的 URL
      - 使用 ref_img 参数传入参考图

    Args:
        image_path: 参考图本地路径
        prompt: 风格描述
        style: 风格预设名称
        strength: 风格强度 (0-1)，越大越偏离原图

    Returns:
        {"status": "ok", "images": [...], "prompt": "..."}
    """
    if not DASHSCOPE_API_KEY:
        return {"status": "error", "message": "未配置 API Key"}

    if not os.path.exists(image_path):
        return {"status": "error", "message": f"图片不存在: {image_path}"}

    # 读取图片并转为 base64 data URL（通义万相支持）
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    # 判断图片类型
    ext = os.path.splitext(image_path)[1].lower()
    mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/png")
    data_url = f"data:{mime_type};base64,{image_data}"

    # 拼接 prompt
    full_prompt = prompt.strip() or "style transfer, artistic"
    if style and style in STYLE_PROMPTS:
        full_prompt = f"{full_prompt}, {STYLE_PROMPTS[style]}"

    try:
        # 使用 ref_img 参数传入参考图
        result = ImageSynthesis.call(
            model="wanx-v1",
            prompt=full_prompt,
            ref_img=data_url,
            n=2,
            size="1024*1024",
            api_key=DASHSCOPE_API_KEY,
        )

        if result.status_code == HTTPStatus.OK:
            images = []
            if hasattr(result.output, "results"):
                for r in result.output.results:
                    url = getattr(r, "url", "") or (r.get("url", "") if isinstance(r, dict) else "")
                    if url:
                        images.append(url)

            return {
                "status": "ok",
                "images": images,
                "prompt": full_prompt,
                "task_id": getattr(result.output, "task_id", ""),
            }
        else:
            return {
                "status": "error",
                "message": f"风格迁移失败: {result.message} (code: {result.status_code})",
            }
    except Exception as e:
        return {"status": "error", "message": f"调用异常: {str(e)}"}


# ============================================================
# 工具函数
# ============================================================

def get_styles() -> list[dict]:
    """返回可用风格列表"""
    return [
        {"key": k, "label": k, "prompt": v[:80] + "..."}
        for k, v in STYLE_PROMPTS.items()
    ]


def get_sizes() -> dict:
    """返回可用尺寸"""
    return {
        "square": {"label": "正方形 1024x1024", "desc": "适合头像/图标"},
        "landscape": {"label": "横版 1152x864", "desc": "适合 Banner/封面"},
        "portrait": {"label": "竖版 864x1152", "desc": "适合手机海报"},
        "wide": {"label": "超宽 1664x928", "desc": "适合信息图"},
    }
