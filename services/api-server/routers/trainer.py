"""AI 训练师 API 路由"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.trainer_service import (
    list_templates, get_template, create_template,
    update_template, delete_template, test_prompt, ab_test,
)

router = APIRouter()


# ============ 请求/响应模型 ============

class CreateTemplateRequest(BaseModel):
    name: str = Field(..., min_length=1, description="模板名称")
    system_prompt: str = Field(default="", description="系统提示词")
    content: str = Field(..., min_length=1, description="Prompt 模板（用 {变量} 占位）")


class UpdateTemplateRequest(BaseModel):
    name: str | None = Field(default=None)
    system_prompt: str | None = Field(default=None)
    content: str | None = Field(default=None)


class TestPromptRequest(BaseModel):
    variables: dict[str, str] = Field(default={}, description="变量名 → 值")


class ABTestRequest(BaseModel):
    template_b_id: str = Field(..., description="B 组模板 ID")
    variables: dict[str, str] = Field(default={}, description="变量值")


# ============ 模板 CRUD ============

@router.get("/templates")
async def get_templates():
    """获取所有 Prompt 模板"""
    return {"templates": list_templates()}


@router.get("/templates/{template_id}")
async def get_one_template(template_id: str):
    """获取单个模板详情"""
    t = get_template(template_id)
    if not t:
        raise HTTPException(404, "模板不存在")
    return t


@router.post("/templates")
async def create_new_template(req: CreateTemplateRequest):
    """新建 Prompt 模板"""
    return create_template(req.name, req.system_prompt, req.content)


@router.put("/templates/{template_id}")
async def edit_template(template_id: str, req: UpdateTemplateRequest):
    """更新模板（自动版本号 +1）"""
    t = update_template(template_id, **req.model_dump(exclude_none=True))
    if not t:
        raise HTTPException(404, "模板不存在")
    return t


@router.delete("/templates/{template_id}")
async def remove_template(template_id: str):
    """删除模板"""
    ok = delete_template(template_id)
    if not ok:
        raise HTTPException(404, "模板不存在")
    return {"status": "ok", "message": "模板已删除"}


# ============ Prompt 测试 & A/B ============

@router.post("/templates/{template_id}/test")
async def run_test(template_id: str, req: TestPromptRequest):
    """测试 Prompt：填变量 → 调用 LLM → 返回结果"""
    result = test_prompt(template_id, req.variables)
    if result.get("status") == "error":
        raise HTTPException(400, result.get("message", "测试失败"))
    return result


@router.post("/templates/{template_id}/ab-test")
async def run_ab_test(template_id: str, req: ABTestRequest):
    """
    A/B 对比测试：
    - A 组：当前模板 (template_id)
    - B 组：req.template_b_id
    - 相同变量分别跑两个模板，返回对比结果
    """
    return ab_test(template_id, req.template_b_id, req.variables)
