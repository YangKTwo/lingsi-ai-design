"""AI 设计对话 API 路由"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.chat_service import chat, reset_conversation, get_mode

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="用户消息")
    conversation_id: str | None = Field(default=None, description="会话 ID（多轮对话用）")


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    mode: str
    model: str | None = None


class ResetRequest(BaseModel):
    conversation_id: str = Field(..., description="要重置的会话 ID")


@router.get("/mode")
async def chat_mode():
    """查看当前对话模式（Coze / LLM）"""
    return get_mode()


@router.post("/send", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    """
    发送消息给 AI 设计顾问。

    - 首次对话不传 conversation_id，服务端自动创建
    - 后续对话传入上次返回的 conversation_id 实现多轮对话
    """
    result = await chat(message=req.message, conversation_id=req.conversation_id)
    return ChatResponse(**result)


@router.post("/reset")
async def reset_chat(req: ResetRequest):
    """重置指定会话，清空对话历史"""
    return reset_conversation(req.conversation_id)
