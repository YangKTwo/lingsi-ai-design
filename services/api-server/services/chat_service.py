"""
AI 设计对话服务

双模式：
  1. Coze 模式 — 如果配置了 COZE_BOT_ID，走 Coze Bot API
  2. LLM 直连模式 — 用通义千问直接对话，带设计专家人设

两种模式自动切换，无需改代码。
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Coze 配置
COZE_API_KEY = os.getenv("COZE_API_KEY", "")
COZE_BOT_ID = os.getenv("COZE_BOT_ID", "")
COZE_API_URL = "https://api.coze.cn/v3/chat"

# LLM 配置（回退用）
LLM_MODEL = os.getenv("LLM_MODEL", "qwen-turbo")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# 当前模式
ACTIVE_MODE = "coze" if (COZE_API_KEY and COZE_BOT_ID) else "llm"
print(f"[ChatService] 模式: {ACTIVE_MODE.upper()}")


# ============================================================
# 设计顾问人设（LLM 模式使用）
# ============================================================

DESIGN_CONSULTANT_PROMPT = """你叫灵思，是一位资深设计顾问，拥有 10 年品牌设计和 UI/UX 设计经验。

你的能力：
- 分析设计需求，给出专业的建议和方案
- 推荐配色方案、字体搭配、排版布局
- 解答设计规范问题（Material Design / Human Interface / WCAG 等）
- 帮助用户完善设计想法

回答要求：
1. 先理解用户需求，必要时追问细节
2. 给出结构化建议（分点/对比/示例）
3. 风格亲切但不啰嗦，像一位经验丰富的前辈
4. 中文回答，设计术语保留英文（如 padding、contrast ratio）
5. 控制在 500 字以内，除非用户要求详细说明

你是灵思AI设计工作台的常驻设计助手，帮用户完成从需求分析到方案输出的全流程。"""


# ============================================================
# Memory Store（简易会话记忆）
# ============================================================

# 内存存储，重启清空（生产环境可用 Redis）
_conversations: dict[str, list[dict]] = {}

MAX_HISTORY = 20  # 每个会话最多保留 20 轮


def _get_history(conversation_id: str) -> list[dict]:
    if conversation_id not in _conversations:
        _conversations[conversation_id] = []
    return _conversations[conversation_id]


def _add_to_history(conversation_id: str, role: str, content: str):
    history = _get_history(conversation_id)
    history.append({"role": role, "content": content})
    # 保持长度限制
    if len(history) > MAX_HISTORY * 2:
        _conversations[conversation_id] = history[-(MAX_HISTORY * 2):]


# ============================================================
# Coze 模式
# ============================================================

async def _chat_coze(message: str, conversation_id: str | None = None) -> dict:
    """调用 Coze Bot API"""
    headers = {
        "Authorization": f"Bearer {COZE_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "bot_id": COZE_BOT_ID,
        "user_id": "lingsi_user",
        "stream": False,
        "auto_save_history": True,
        "additional_messages": [
            {
                "role": "user",
                "content": message,
                "content_type": "text",
            }
        ],
    }

    if conversation_id:
        payload["conversation_id"] = conversation_id

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(COZE_API_URL, headers=headers, json=payload)
        data = response.json()

    if response.status_code != 200:
        return {
            "reply": f"Coze 接口返回错误: {data.get('msg', '未知错误')}",
            "conversation_id": conversation_id or "",
            "sources": [],
        }

    reply = ""
    messages = data.get("data", {}).get("messages", []) or data.get("messages", [])
    for msg in messages:
        if msg.get("role") == "assistant" or msg.get("type") == "answer":
            reply = msg.get("content", "")
            break

    # Coze 返回新 conversation_id
    new_conv_id = data.get("data", {}).get("conversation_id", "") or data.get("conversation_id", "")

    return {
        "reply": reply or "抱歉，我暂时无法回答。",
        "conversation_id": new_conv_id or conversation_id or "",
        "mode": "coze",
        "sources": [],
    }


# ============================================================
# LLM 直连模式
# ============================================================

def _build_llm_chain():
    """构建 LLM 对话链"""
    llm = ChatOpenAI(
        model=LLM_MODEL,
        temperature=0.7,
        openai_api_key=LLM_API_KEY,
        openai_api_base=LLM_BASE_URL,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", DESIGN_CONSULTANT_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ])

    return prompt | llm


_llm_chain = None


def _get_chain():
    global _llm_chain
    if _llm_chain is None:
        _llm_chain = _build_llm_chain()
    return _llm_chain


async def _chat_llm(message: str, conversation_id: str | None = None) -> dict:
    """使用 LLM 直接对话"""
    conv_id = conversation_id or "default"

    # 获取历史消息
    history = _get_history(conv_id)
    langchain_history = []
    for h in history[-MAX_HISTORY:]:
        if h["role"] == "user":
            langchain_history.append(HumanMessage(content=h["content"]))
        else:
            langchain_history.append(AIMessage(content=h["content"]))

    chain = _get_chain()
    result = await chain.ainvoke({
        "history": langchain_history,
        "input": message,
    })

    reply = result.content

    # 存入历史
    _add_to_history(conv_id, "user", message)
    _add_to_history(conv_id, "assistant", reply)

    return {
        "reply": reply,
        "conversation_id": conv_id,
        "mode": "llm",
        "sources": [],
        "model": LLM_MODEL,
    }


# ============================================================
# 统一接口
# ============================================================

async def chat(message: str, conversation_id: str | None = None) -> dict:
    """
    统一对话接口，自动选择 Coze 或 LLM 模式。

    Returns:
        {
            "reply": "AI 回复内容",
            "conversation_id": "会话 ID",
            "mode": "coze" | "llm",
            "model": "模型名（仅 llm 模式）",
        }
    """
    if ACTIVE_MODE == "coze":
        return await _chat_coze(message, conversation_id)
    else:
        return await _chat_llm(message, conversation_id)


def reset_conversation(conversation_id: str) -> dict:
    """重置会话（清空历史）"""
    if conversation_id in _conversations:
        del _conversations[conversation_id]
    return {"status": "ok", "message": "会话已重置"}


def get_mode() -> dict:
    """当前运行模式"""
    return {
        "mode": ACTIVE_MODE,
        "coze_available": bool(COZE_API_KEY and COZE_BOT_ID),
        "llm_model": LLM_MODEL,
    }
