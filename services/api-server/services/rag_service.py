"""
RAG 检索增强生成服务
流程：文档加载 → 文本切片 → 向量化存储 → 检索 → LLM 生成
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# 向量数据库持久化路径
CHROMA_PATH = Path(__file__).parent.parent / "data" / "chromadb"

# ============ 可通过 .env 覆盖的配置 ============

# LLM 模型（默认千问，换成 gpt-4o-mini / deepseek-chat 等都行）
LLM_MODEL = os.getenv("LLM_MODEL", "qwen-turbo")

# LLM API 地址
LLM_BASE_URL = os.getenv(
    "LLM_BASE_URL",
    "https://dashscope.aliyuncs.com/compatible-mode/v1",
)

# LLM API Key
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

# Embedding 向量化模型
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-v2")

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_classic.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate


# ============ 懒加载初始化 ============

_embedding = None
_llm = None


def _get_embedding():
    global _embedding
    if _embedding is None:
        _embedding = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            openai_api_key=LLM_API_KEY,
            openai_api_base=LLM_BASE_URL,
        )
    return _embedding


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model=LLM_MODEL,
            temperature=0.3,
            openai_api_key=LLM_API_KEY,
            openai_api_base=LLM_BASE_URL,
        )
    return _llm

# Prompt 模板
SYSTEM_PROMPT = """你是一位资深设计专家，精通 UI/UX、平面设计、品牌设计。
请严格根据以下设计知识库中的内容回答用户问题。

设计知识库上下文：
{context}

要求：
1. 优先引用知识库中的规范和建议
2. 如果知识库中没有相关信息，诚实说明并给出通用建议
3. 回答要结构化，善用分点、对比表格
4. 最后附上引用的来源文件"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{input}"),
])


# ============ 文档入库 ============

def ingest_file(file_path: str) -> dict:
    """加载文档 → 切片 → 向量化存入 ChromaDB"""
    if not os.path.exists(file_path):
        return {"status": "error", "message": f"文件不存在: {file_path}"}

    # 选择加载器
    if file_path.lower().endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif file_path.lower().endswith(".txt") or file_path.lower().endswith(".md"):
        loader = TextLoader(file_path, encoding="utf-8")
    else:
        return {"status": "error", "message": "仅支持 PDF / TXT / Markdown 格式"}

    documents = loader.load()
    if not documents:
        return {"status": "error", "message": "文档内容为空"}

    # 文本切片
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n\n", "\n", "。", ".", " ", ""],
    )
    chunks = splitter.split_documents(documents)

    # 存入 ChromaDB（自动持久化）
    Chroma.from_documents(
        documents=chunks,
        embedding=_get_embedding(),
        collection_name="design_knowledge",
        persist_directory=str(CHROMA_PATH),
    )

    return {
        "status": "ok",
        "filename": os.path.basename(file_path),
        "chunks": len(chunks),
        "message": f"✅ 成功入库 {len(chunks)} 个文本块",
    }


# ============ 知识问答 ============

def query_knowledge(question: str) -> dict:
    """检索 → LLM 生成回答"""
    # 加载已有向量库
    try:
        vector_store = Chroma(
            collection_name="design_knowledge",
            embedding_function=_get_embedding(),
            persist_directory=str(CHROMA_PATH),
        )
    except Exception:
        return {
            "answer": "知识库尚未初始化，请先上传设计规范文档。",
            "sources": [],
            "docs_count": 0,
        }

    # 检索 Top-5
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    relevant_docs = retriever.invoke(question)

    if not relevant_docs:
        return {
            "answer": "知识库中暂无与您问题相关的内容。请尝试换一种问法，或上传更多设计规范文档。",
            "sources": [],
            "docs_count": 0,
        }

    # 创建 RAG Chain
    combine_docs_chain = create_stuff_documents_chain(_get_llm(), prompt_template)
    rag_chain = create_retrieval_chain(retriever, combine_docs_chain)

    result = rag_chain.invoke({"input": question})

    # 提取来源
    sources = list(set(
        d.metadata.get("source", "未知来源")
        for d in result.get("context", [])
    ))

    return {
        "answer": result["answer"],
        "sources": sources,
        "docs_count": len(result.get("context", [])),
    }


# ============ 知识库状态 ============

def get_status() -> dict:
    """查看知识库状态"""
    try:
        vector_store = Chroma(
            collection_name="design_knowledge",
            embedding_function=_get_embedding(),
            persist_directory=str(CHROMA_PATH),
        )
        count = vector_store._collection.count()
    except Exception:
        count = 0

    return {
        "docs_count": count,
        "collection": "design_knowledge",
        "llm_model": LLM_MODEL,
        "embedding_model": EMBEDDING_MODEL,
    }
