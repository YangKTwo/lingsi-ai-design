"""
AIGC 服务 — 通义万相 文生图 & 图生图

模型：
  - wan2.7-image-pro (默认): 最新旗舰模型，HTTP 异步 API + messages 格式
  - wanx-v1 (回退): 旧版模型，SDK ImageSynthesis.call() 同步 API

DashScope 无 SDK 原生支持 wan2.7，用 requests 直调 HTTP API。
"""
import os
import time
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY") or os.getenv("LLM_API_KEY", "")

# 默认模型
DEFAULT_MODEL = os.getenv("IMAGE_MODEL", "wan2.7-image-pro")

# API 地址
GENERATION_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation"
TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"

import dashscope
from dashscope import ImageSynthesis
from http import HTTPStatus


# ============================================================
# 配置
# ============================================================

VALID_SIZES = {
    "square": "1024*1024",
    "landscape": "1152*864",
    "portrait": "864*1152",
    "wide": "1664*928",
}

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


# ============================================================
# wan2.7-image-pro（HTTP 异步 API）
# ============================================================

def _generate_wan27(prompt: str, n: int, size: str) -> dict:
    """
    wan2.7-image-pro: HTTP 异步提交 + 轮询结果

    新版 API 使用 messages 格式而非纯文本 prompt。
    """
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
    }

    body = {
        "model": "wan2.7-image-pro",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ]
        },
        "parameters": {"n": n, "size": size},
    }

    # 1. 提交任务
    resp = requests.post(GENERATION_URL, headers=headers, json=body, timeout=30)
    if resp.status_code != 200:
        return {
            "status": "error",
            "message": f"提交失败 [{resp.status_code}]: {resp.text[:300]}",
        }

    data = resp.json()
    task_id = data.get("output", {}).get("task_id", "")
    if not task_id:
        return {"status": "error", "message": f"未获取到 task_id: {resp.text[:300]}"}

    # 2. 轮询结果（最多等 2 分钟）
    task_url = TASK_URL.format(task_id=task_id)
    for _ in range(40):
        time.sleep(3)
        r = requests.get(task_url, headers=headers, timeout=30)
        d = r.json()
        status = d.get("output", {}).get("task_status", "UNKNOWN")

        if status == "SUCCEEDED":
            # wan2.7 返回结构: output.choices[].message.content[].image
            choices = d.get("output", {}).get("choices", [])
            images = []
            for choice in choices:
                content_list = choice.get("message", {}).get("content", [])
                for item in content_list:
                    img_url = item.get("image", "")
                    if img_url:
                        images.append(img_url)
            return {
                "status": "ok",
                "images": images,
                "prompt": prompt,
                "model": "wan2.7-image-pro",
                "task_id": task_id,
            }
        elif status == "FAILED":
            return {
                "status": "error",
                "message": f"生成失败: {d.get('output', {}).get('message', '未知错误')}",
            }
        # RUNNING / PENDING → 继续等

    return {"status": "error", "message": "生成超时（2分钟），请重试"}


def _style_transfer_wan27(image_data_url: str, prompt: str) -> dict:
    """
    wan2.7 图生图：messages 中同时传入 image 和 text
    """
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
    }

    body = {
        "model": "wan2.7-image-pro",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"image": image_data_url},
                        {"text": prompt},
                    ],
                }
            ]
        },
        "parameters": {"n": 2, "size": "1024*1024"},
    }

    resp = requests.post(GENERATION_URL, headers=headers, json=body, timeout=30)
    if resp.status_code != 200:
        return {"status": "error", "message": f"提交失败: {resp.text[:300]}"}

    data = resp.json()
    task_id = data.get("output", {}).get("task_id", "")
    if not task_id:
        return {"status": "error", "message": f"未获取到 task_id"}

    task_url = TASK_URL.format(task_id=task_id)
    for _ in range(40):
        time.sleep(3)
        r = requests.get(task_url, headers=headers, timeout=30)
        d = r.json()
        status = d.get("output", {}).get("task_status", "UNKNOWN")

        if status == "SUCCEEDED":
            # wan2.7 返回结构: output.choices[].message.content[].image
            choices = d.get("output", {}).get("choices", [])
            images = []
            for choice in choices:
                content_list = choice.get("message", {}).get("content", [])
                for item in content_list:
                    img_url = item.get("image", "")
                    if img_url:
                        images.append(img_url)
            return {
                "status": "ok",
                "images": images,
                "prompt": prompt,
                "model": "wan2.7-image-pro",
                "task_id": task_id,
            }
        elif status == "FAILED":
            return {"status": "error", "message": "风格迁移失败"}

    return {"status": "error", "message": "风格迁移超时，请重试"}


# ============================================================
# wanx-v1（旧 SDK，回退用）
# ============================================================

def _generate_wanx(prompt: str, n: int, size: str, negative_prompt: str = "") -> dict:
    """wanx-v1: SDK 同步调用"""
    result = ImageSynthesis.call(
        model="wanx-v1",
        prompt=prompt,
        negative_prompt=negative_prompt,
        n=n,
        size=size,
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
            "prompt": prompt,
            "model": "wanx-v1",
            "task_id": getattr(result.output, "task_id", ""),
        }
    else:
        return {"status": "error", "message": f"生成失败: {result.message}"}


def _style_transfer_wanx(image_data_url: str, prompt: str) -> dict:
    """wanx-v1 图生图"""
    result = ImageSynthesis.call(
        model="wanx-v1",
        prompt=prompt,
        ref_img=image_data_url,
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
            "prompt": prompt,
            "model": "wanx-v1",
            "task_id": getattr(result.output, "task_id", ""),
        }
    else:
        return {"status": "error", "message": f"风格迁移失败: {result.message}"}


# ============================================================
# 统一对外接口
# ============================================================

def text_to_image(
    prompt: str,
    n: int = 2,
    size: str = "square",
    negative_prompt: str | None = None,
    style: str | None = None,
    model: str | None = None,
) -> dict:
    """文本生成设计灵感图"""
    if not DASHSCOPE_API_KEY:
        return {"status": "error", "message": "未配置 API Key"}

    if not prompt.strip():
        return {"status": "error", "message": "prompt 不能为空"}

    # 拼接风格
    full_prompt = prompt.strip()
    if style and style in STYLE_PROMPTS:
        full_prompt = f"{full_prompt}, {STYLE_PROMPTS[style]}"

    actual_size = VALID_SIZES.get(size, size)
    use_model = model or DEFAULT_MODEL
    print(f"[AIGC] 调用模型: {use_model} | 尺寸: {actual_size} | 数量: {n}")

    # 根据模型选择调用方式
    if use_model == "wan2.7-image-pro":
        return _generate_wan27(full_prompt, n, actual_size)
    else:
        return _generate_wanx(full_prompt, n, actual_size, negative_prompt or "")


def style_transfer(
    image_path: str,
    prompt: str = "",
    style: str | None = None,
    strength: float = 0.7,
    model: str | None = None,
) -> dict:
    """以参考图为底版进行风格迁移"""
    if not DASHSCOPE_API_KEY:
        return {"status": "error", "message": "未配置 API Key"}

    if not os.path.exists(image_path):
        return {"status": "error", "message": f"图片不存在: {image_path}"}

    # 图片转 base64 data URL
    ext = os.path.splitext(image_path)[1].lower()
    mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
    mime_type = mime_map.get(ext, "image/png")

    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")
    data_url = f"data:{mime_type};base64,{image_data}"

    # 拼接 prompt
    full_prompt = prompt.strip() or "style transfer, artistic"
    if style and style in STYLE_PROMPTS:
        full_prompt = f"{full_prompt}, {STYLE_PROMPTS[style]}"

    use_model = model or DEFAULT_MODEL

    if use_model == "wan2.7-image-pro":
        return _style_transfer_wan27(data_url, full_prompt)
    else:
        return _style_transfer_wanx(data_url, full_prompt)


def get_styles() -> list[dict]:
    return [{"key": k, "label": k, "prompt": v[:80] + "..."} for k, v in STYLE_PROMPTS.items()]


def get_sizes() -> dict:
    return {
        "square": {"label": "正方形 1024x1024", "desc": "适合头像/图标"},
        "landscape": {"label": "横版 1152x864", "desc": "适合 Banner/封面"},
        "portrait": {"label": "竖版 864x1152", "desc": "适合手机海报"},
        "wide": {"label": "超宽 1664x928", "desc": "适合信息图"},
    }
