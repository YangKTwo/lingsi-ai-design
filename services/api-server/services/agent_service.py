"""
AI Agent 设计审查服务
使用 LangChain Agent 框架：LLM 自主决定调用哪些工具，循环推理直到生成完整审查报告

工具列表：
  - extract_colors:  从设计稿提取主色调
  - check_contrast:   计算 WCAG 对比度
  - get_image_info:   读取图片尺寸 / 比例 / 格式
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

LLM_MODEL = os.getenv("LLM_MODEL", "qwen-turbo")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from PIL import Image


# ============================================================
# 工具定义
# ============================================================

@tool
def extract_colors(image_path: str, n_colors: int = 6) -> str:
    """
    从设计稿图片中提取主色调。
    返回前 N 个主色的十六进制值及其占比。

    Args:
        image_path: 图片文件的完整路径
        n_colors: 提取的颜色数量，默认 6
    """
    try:
        img = Image.open(image_path).convert("RGB")
        # 缩小以加速量化
        img_small = img.resize((150, 150))

        # 颜色量化：将颜色空间缩减到 n_colors 种
        quantized = img_small.quantize(colors=n_colors, method=Image.Quantize.MEDIANCUT)
        # 获取调色板
        palette = quantized.getpalette()
        # 统计每种颜色像素数
        color_counts = quantized.getcolors()

        if not color_counts:
            return "无法提取颜色信息"

        # 按像素数降序排列
        color_counts.sort(reverse=True, key=lambda x: x[0])
        total_pixels = sum(c[0] for c in color_counts)

        result_lines = ["设计稿主色分析结果：\n"]
        for i, (count, idx) in enumerate(color_counts[:n_colors]):
            r, g, b = palette[idx*3: idx*3+3]
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            pct = (count / total_pixels) * 100
            result_lines.append(
                f"  {i+1}. {hex_color} — 占比 {pct:.1f}%  "
                f"(RGB: {r}, {g}, {b})"
            )

        return "\n".join(result_lines)
    except Exception as e:
        return f"颜色提取失败: {str(e)}"


@tool
def check_contrast(fg_hex: str, bg_hex: str) -> str:
    """
    计算两个颜色的 WCAG 对比度，判断是否符合 AA / AAA 标准。

    WCAG 标准：
      - AA 普通文本: >= 4.5:1
      - AA 大文本(>=18px): >= 3:1
      - AAA 普通文本: >= 7:1
      - AAA 大文本: >= 4.5:1

    Args:
        fg_hex: 前景色十六进制值，如 "#333333"
        bg_hex: 背景色十六进制值，如 "#ffffff"
    """
    def relative_luminance(hex_color: str) -> float:
        hex_color = hex_color.lstrip('#')
        r, g, b = [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]

        # sRGB -> 线性 RGB
        def linearize(c: float) -> float:
            return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

        return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

    try:
        l1 = relative_luminance(fg_hex)
        l2 = relative_luminance(bg_hex)

        lighter = max(l1, l2)
        darker = min(l1, l2)
        ratio = (lighter + 0.05) / (darker + 0.05)

        # 评级判断
        if ratio >= 7:
            level = "通过 AAA 标准 (>=7:1)"
        elif ratio >= 4.5:
            level = "通过 AA 标准 (>=4.5:1)，未达 AAA (需 >=7:1)"
        elif ratio >= 3:
            level = "仅通过 AA 大文本标准 (>=3:1)，普通文本不达标"
        else:
            level = "未达到任何 WCAG 标准，对比度严重不足"

        return (
            f"对比度分析：\n"
            f"  前景色: {fg_hex}\n"
            f"  背景色: {bg_hex}\n"
            f"  对比度: {ratio:.2f}:1\n"
            f"  评级: {level}"
        )
    except Exception as e:
        return f"对比度计算失败: {str(e)}"


@tool
def get_image_info(image_path: str) -> str:
    """
    获取设计稿的基本信息：尺寸、宽高比、格式、DPI（如果有）。

    Args:
        image_path: 图片文件的完整路径
    """
    try:
        img = Image.open(image_path)
        w, h = img.size
        aspect = w / h

        # 判断常见设计尺寸
        size_note = ""
        if abs(aspect - 1.0) < 0.05:
            size_note = "（正方形，适合头像/图标）"
        elif abs(aspect - 16/9) < 0.05:
            size_note = "（16:9 宽屏，适合 Banner/封面）"
        elif abs(aspect - 4/3) < 0.05:
            size_note = "（4:3，传统屏幕比例）"
        elif abs(aspect - 9/16) < 0.05:
            size_note = "（9:16 竖屏，适合手机海报/故事）"
        elif aspect > 2:
            size_note = "（超宽设计，适合长图/信息图）"
        elif aspect < 0.5:
            size_note = "（超长竖版，适合手机长图）"

        dpi_info = ""
        try:
            dpi = img.info.get("dpi")
            if dpi:
                dpi_info = f"\n  DPI: {dpi[0]:.0f} x {dpi[1]:.0f}"
        except Exception:
            pass

        return (
            f"图片基本信息：\n"
            f"  格式: {img.format}\n"
            f"  尺寸: {w} x {h} px\n"
            f"  宽高比: {aspect:.2f}:1 {size_note}\n"
            f"  色彩模式: {img.mode}"
            f"{dpi_info}"
        )
    except Exception as e:
        return f"图片信息读取失败: {str(e)}"


# ============================================================
# Agent 构建
# ============================================================

DESIGN_REVIEW_SYSTEM_PROMPT = """你是一位资深设计审查专家，拥有 10 年 UI/UX 设计经验。

你的任务是审查用户上传的设计稿，按以下流程使用工具逐步分析：

1. 首先调用 get_image_info 获取设计稿基本信息
2. 然后调用 extract_colors 提取主色调
3. 对于主要配色组合（如主色与背景色），调用 check_contrast 检查 WCAG 对比度
4. 综合以上数据，生成完整的设计审查报告

审查报告必须包含以下结构（使用 Markdown）：

## 基本信息
- 尺寸、格式、宽高比评估（是否适合其使用场景）

## 配色分析
- 主色列表及情感联想
- 配色是否协调
- 色盲友好度评估

## 对比度检查
- 关键文字-背景组合的 WCAG 等级
- 不达标的元素及改进建议

## 改进建议
- 按优先级排列的具体建议
- 每条建议标注严重程度（高/中/低）

## 综合评分
- 配色 (X/10)
- 对比度 (X/10)
- 布局空间 (X/10)
- 总体 (X/10)

请确保分析基于工具实际返回的数据，不要凭感觉猜测。"""


# 全局懒加载
_agent = None


def _get_agent():
    """构建并缓存 Agent 实例"""
    global _agent
    if _agent is None:
        llm = ChatOpenAI(
            model=LLM_MODEL,
            temperature=0.3,
            openai_api_key=LLM_API_KEY,
            openai_api_base=LLM_BASE_URL,
        )

        tools = [extract_colors, check_contrast, get_image_info]

        _agent = create_agent(
            model=llm,
            tools=tools,
            system_prompt=DESIGN_REVIEW_SYSTEM_PROMPT,
        )
    return _agent


# ============================================================
# 对外接口
# ============================================================

def review_design(image_path: str) -> dict:
    """
    对上传的设计稿执行完整的 AI 审查（Agent 模式）。

    Args:
        image_path: 设计稿图片路径

    Returns:
        {
            "status": "ok" | "error" | "partial",
            "image": {"format": "...", "size": [...], "aspect": ...},
            "report": "Markdown 格式的审查报告",
        }
    """
    if not os.path.exists(image_path):
        return {"status": "error", "message": f"文件不存在: {image_path}"}

    # 先提取基本信息（不依赖 LLM）
    try:
        img = Image.open(image_path)
        w, h = img.size
        image_info = {
            "format": img.format or "未知",
            "size": [w, h],
            "aspect": round(w / h, 3),
            "mode": img.mode,
        }
    except Exception as e:
        return {"status": "error", "message": f"图片读取失败: {str(e)}"}

    # 启动 Agent 审查
    try:
        agent = _get_agent()

        task = (
            f"请审查以下设计稿：{image_path}\n\n"
            f"这是一张 {image_info['format']} 格式的图片，"
            f"尺寸 {w}x{h}px，宽高比 {image_info['aspect']}:1。\n"
            f"请按照流程逐步分析，最后给出完整的审查报告。"
        )

        result = agent.invoke(
            {"messages": [{"role": "user", "content": task}]}
        )

        # 提取最后一条 AI 消息作为报告
        messages = result.get("messages", [])
        report = ""
        for msg in reversed(messages):
            if hasattr(msg, "content") and msg.type == "ai" and msg.content:
                report = msg.content
                break

        if not report:
            report = "审查未能生成有效报告，请重试。"

        return {
            "status": "ok",
            "image": image_info,
            "report": report,
        }
    except Exception as e:
        # Agent 执行失败时，回退到快速分析
        return {
            "status": "partial",
            "image": image_info,
            "report": f"AI 审查过程中出现错误: {str(e)}\n\n请重试或联系管理员。",
            "error": str(e),
        }


def quick_analyze(image_path: str) -> dict:
    """
    快速分析（不经过 Agent 循环，直接提取数据 + LLM 一步生成报告）。
    速度更快，适合预览场景。
    """
    if not os.path.exists(image_path):
        return {"status": "error", "message": f"文件不存在: {image_path}"}

    # 先用工具提取数据
    colors_result = extract_colors.invoke({"image_path": image_path})
    info_result = get_image_info.invoke({"image_path": image_path})

    # 让 LLM 根据工具结果直接生成报告
    llm = ChatOpenAI(
        model=LLM_MODEL,
        temperature=0.3,
        openai_api_key=LLM_API_KEY,
        openai_api_base=LLM_BASE_URL,
    )

    prompt = f"""你是一位资深设计审查专家。根据以下自动分析数据，为设计稿生成审查报告。

=== 图片信息 ===
{info_result}

=== 配色分析 ===
{colors_result}

请按以下结构输出 Markdown 报告：

## 基本信息
（评估尺寸和比例是否合适）

## 配色分析
（主色情感联想、协调性、色盲友好度）

## 对比度建议
（基于提取的配色给出对比度优化建议）

## 改进建议
（按优先级排列，标注严重程度 高/中/低）

## 综合评分
- 配色 (X/10)
- 对比度 (X/10)
- 布局空间 (X/10)
- 总体 (X/10)

只输出报告，不要额外解释。"""

    response = llm.invoke(prompt)

    try:
        img = Image.open(image_path)
        w, h = img.size
        image_info = {
            "format": img.format or "未知",
            "size": [w, h],
            "aspect": round(w / h, 3),
            "mode": img.mode,
        }
    except Exception:
        image_info = {}

    return {
        "status": "ok",
        "image": image_info,
        "report": response.content,
    }
