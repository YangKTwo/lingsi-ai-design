"""
AI 训练师服务 — Prompt 模板管理 & A/B 测试

功能：
  - 模板 CRUD（内存存储，带版本号）
  - 变量解析：模板中的 {变量名} 自动替换
  - Prompt 测试：传入变量值 → 调用 LLM → 返回输出
  - A/B 对比：同时测试两个模板，返回对比结果
"""
import os
import re
import time
import uuid
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

LLM_MODEL = os.getenv("LLM_MODEL", "qwen-turbo")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


# ============================================================
# 模板存储（内存 + JSON 文件持久化）
# ============================================================

TEMPLATES_FILE = Path(__file__).parent.parent / "data" / "prompt_templates.json"

# 默认预设模板
DEFAULT_TEMPLATES = [
    {
        "id": "tpl-001",
        "name": "设计审查 v1",
        "system_prompt": "你是一位资深设计审查专家。",
        "content": "请审查以下设计稿文案：\n\n{text}\n\n从以下维度分析：\n1. 可读性\n2. 版式规范\n3. 品牌一致性\n\n输出格式：每项打分 (1-10) + 一句话建议。",
        "version": 1,
        "variables": ["text"],
        "created_at": "",
    },
    {
        "id": "tpl-002",
        "name": "配色推荐 v2",
        "system_prompt": "你是一位专业的配色专家，精通色彩理论和品牌设计。",
        "content": "请为 {brand_type} 推荐一套配色方案。\n\n行业：{industry}\n品牌调性：{tone}\n\n输出：\n1. 主色（含十六进制值）\n2. 辅色（2-3 个）\n3. 搭配建议\n4. 色盲友好度评估",
        "version": 2,
        "variables": ["brand_type", "industry", "tone"],
        "created_at": "",
    },
    {
        "id": "tpl-003",
        "name": "灵感生成器 v1",
        "system_prompt": "你是一位创意总监，擅长发散设计灵感。",
        "content": "根据以下信息生成 5 个设计灵感方向：\n\n主题：{theme}\n目标用户：{audience}\n风格偏好：{style}\n\n每个方向包含：标题 + 一句话描述 + 关键词标签",
        "version": 1,
        "variables": ["theme", "audience", "style"],
        "created_at": "",
    },
]

_templates: dict[str, dict] = {}
_loaded = False


def _load_templates():
    """从 JSON 文件或默认预设加载模板"""
    global _templates, _loaded
    if _loaded:
        return

    # 先尝试从文件加载
    try:
        if TEMPLATES_FILE.exists():
            with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            _templates = {t["id"]: t for t in data}
            if _templates:
                _loaded = True
                return
    except Exception:
        pass

    # 回退到默认预设
    _templates = {}
    for t in DEFAULT_TEMPLATES:
        t["created_at"] = t["created_at"] or time.strftime("%Y-%m-%d %H:%M")
        _templates[t["id"]] = dict(t)
    _loaded = True
    _save_to_file()


def _save_to_file():
    """持久化到 JSON 文件"""
    try:
        TEMPLATES_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
            json.dump(list(_templates.values()), f, ensure_ascii=False, indent=2)
    except Exception:
        pass


_load_templates()


# ============================================================
# 变量提取
# ============================================================

VARIABLE_PATTERN = re.compile(r"\{(\w+)\}")

def extract_variables(template: str) -> list[str]:
    """从模板字符串中提取变量名 {var}"""
    return sorted(set(VARIABLE_PATTERN.findall(template)))

def fill_template(template: str, variables: dict[str, str]) -> str:
    """将变量值填入模板"""
    def replacer(match):
        key = match.group(1)
        # 如果没提供值，保留占位符
        return variables.get(key, f"{{{key}}}")
    return VARIABLE_PATTERN.sub(replacer, template)


# ============================================================
# LLM 调用
# ============================================================

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model=LLM_MODEL,
            temperature=0.7,
            openai_api_key=LLM_API_KEY,
            openai_api_base=LLM_BASE_URL,
        )
    return _llm


def _call_llm(system_prompt: str, user_content: str) -> str:
    """调用 LLM 并返回输出"""
    llm = _get_llm()
    messages = []
    if system_prompt.strip():
        messages.append(SystemMessage(content=system_prompt))
    messages.append(HumanMessage(content=user_content))
    result = llm.invoke(messages)
    return result.content


# ============================================================
# 模板 CRUD
# ============================================================

def list_templates() -> list[dict]:
    """获取所有模板列表"""
    return sorted(_templates.values(), key=lambda t: t["name"])


def get_template(template_id: str) -> dict | None:
    """获取单个模板"""
    return _templates.get(template_id)


def create_template(name: str, system_prompt: str, content: str) -> dict:
    """创建新模板"""
    tid = f"tpl-{uuid.uuid4().hex[:8]}"
    variables = extract_variables(content)
    template = {
        "id": tid,
        "name": name,
        "system_prompt": system_prompt,
        "content": content,
        "version": 1,
        "variables": variables,
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
    }
    _templates[tid] = template
    _save_to_file()
    return template


def update_template(template_id: str, **kwargs) -> dict | None:
    """更新模板（自动递增版本号）"""
    if template_id not in _templates:
        return None
    t = _templates[template_id]
    for k in ["name", "system_prompt", "content"]:
        if k in kwargs and kwargs[k] is not None:
            t[k] = kwargs[k]
    t["version"] += 1
    t["variables"] = extract_variables(t["content"])
    _templates[template_id] = t
    _save_to_file()
    return t


def delete_template(template_id: str) -> bool:
    """删除模板"""
    if template_id not in _templates:
        return False
    del _templates[template_id]
    _save_to_file()
    return True


# ============================================================
# Prompt 测试 & A/B
# ============================================================

def test_prompt(template_id: str, variables: dict[str, str]) -> dict:
    """
    测试单个 Prompt：填变量 → 调 LLM → 返回结果
    """
    template = _templates.get(template_id)
    if not template:
        return {"status": "error", "message": f"模板不存在: {template_id}"}

    filled = fill_template(template["content"], variables)

    try:
        output = _call_llm(template["system_prompt"], filled)
        return {
            "status": "ok",
            "template_id": template_id,
            "template_name": template["name"],
            "system_prompt": template["system_prompt"],
            "filled_prompt": filled,
            "variables_used": variables,
            "output": output,
            "model": LLM_MODEL,
        }
    except Exception as e:
        return {"status": "error", "message": f"LLM 调用失败: {str(e)}"}


def ab_test(template_a_id: str, template_b_id: str, variables: dict[str, str]) -> dict:
    """
    A/B 对比测试：同时跑两个模板，返回对比结果
    """
    result_a = test_prompt(template_a_id, variables)
    result_b = test_prompt(template_b_id, variables)

    return {
        "status": "ok",
        "variables": variables,
        "a": {
            "template_id": template_a_id,
            "name": result_a.get("template_name", ""),
            "output": result_a.get("output", ""),
            "model": result_a.get("model", ""),
        },
        "b": {
            "template_id": template_b_id,
            "name": result_b.get("template_name", ""),
            "output": result_b.get("output", ""),
            "model": result_b.get("model", ""),
        },
    }
