from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from pinecone import Pinecone
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.core import VectorStoreIndex, PromptTemplate, Settings
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
import os

from config import get_config  # type: ignore  # linter: ignore[import]
from utils.logger import get_logger

# --- 0. Logging Setup ---
logger = get_logger(__name__)

# Log and print the loaded Gemini API key for debugging
print('GEMINI_API_KEY from os.environ:', os.environ.get('GEMINI_API_KEY'))
logger.info(f"GEMINI_API_KEY from os.environ: {os.environ.get('GEMINI_API_KEY')}")

# --- 1. Configuration ---
config = get_config()
print('GEMINI_API_KEY from config:', config.gemini_api_key)
logger.info(f"GEMINI_API_KEY from config: {config.gemini_api_key}")

# --- 2. Lifespan Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application's lifespan. This function is executed when the
    application starts and cleans up when it stops.
    """
    logger.info("--- Application Starting Up ---")
    
    app.state.config = config

    try:
        pc = Pinecone(api_key=config.pinecone_api_key)
        pinecone_index = pc.Index(config.pinecone_index_name)
        logger.info(f"Successfully connected to Pinecone index: '{config.pinecone_index_name}'")
    except Exception as e:
        logger.critical(f"Failed to connect to Pinecone: {e}", exc_info=True)
        raise RuntimeError("Could not connect to Pinecone. Application cannot start.") from e

    Settings.llm = GoogleGenAI(model="models/gemini-1.5-flash-latest", api_key=config.gemini_api_key)
    Settings.embed_model = GoogleGenAIEmbedding(model_name="models/embedding-001", api_key=config.gemini_api_key)

    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

    app.state.query_engine = index.as_query_engine(
        similarity_top_k=config.similarity_top_k,
        text_qa_template=qa_prompt_tmpl,
    )
    logger.info("Query engine created successfully.")

    yield

    logger.info("--- Application Shutting Down ---")

# --- 3. Rate Limiting Setup ---
def get_user_id_from_request(request: Request) -> str:
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_from_request)

# --- 4. Prompt Engineering ---
qa_prompt_tmpl_str = (
    "Context information is below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "You are a helpful assistant for students at The University of Texas at Austin.\n"
    "Answer the query in a clean, simple, and concise way. Keep your answer short and avoid unnecessary filler.\n"
    "Do NOT include any citations, source URLs, or references in your answer.\n"
    "If the context does not contain a direct answer, provide the closest related information in a brief manner, and suggest verifying with the official UT Austin source if needed.\n"
    "Query: {query_str}\n"
    "Answer: "
)
qa_prompt_tmpl = PromptTemplate(qa_prompt_tmpl_str)

# --- 5. Pydantic Models ---
class Source(BaseModel):
    source_url: Optional[str] = Field(None, description="The original URL or path of the source document.")

class AssistantQueryRequest(BaseModel):
    query_text: str = Field(..., min_length=3, max_length=500, description="The user's question.")
    user_id: Optional[str] = Field(None, description="A unique identifier for the user making the request.")

class AssistantQueryResponse(BaseModel):
    answer_text: str = Field(..., description="The AI-generated answer.")
    sources: List[Source] = Field(..., description="A list of source documents that grounded the answer.")

# --- 6. FastAPI Application ---
app = FastAPI(
    title=config.app_name,
    description="API for the Tribe Personal Assistant and other student services.",
    version=config.app_version,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore  # linter: ignore[arg-type]

@app.get("/", summary="Health Check", include_in_schema=False)
async def root():
    return {"status": "ok", "message": "Tribe API is running."}

@app.post("/api/v1/assistant/query", response_model=AssistantQueryResponse, summary="Query the Personal Assistant")
@limiter.limit(f"{config.rate_limit_per_minute}/minute")
async def handle_assistant_query(request: Request, query_request: AssistantQueryRequest):
    if not request.app.state.query_engine:
        raise HTTPException(status_code=503, detail="Query engine is not available.")

    try:
        user_id = query_request.user_id or "anonymous"
        logger.info(f"Received query for user '{user_id}': {query_request.query_text}")
        response = await request.app.state.query_engine.aquery(query_request.query_text)

        answer = str(response)
        source_nodes = response.source_nodes
        
        sources = []
        seen_urls = set()
        if source_nodes:
            for node in source_nodes:
                source_url = node.metadata.get('source_url')
                if (
                    source_url
                    and source_url not in seen_urls
                    and isinstance(source_url, str)
                    and source_url.startswith("http")
                ):
                    sources.append(Source(source_url=source_url))
                    seen_urls.add(source_url)

        return AssistantQueryResponse(answer_text=answer, sources=sources)

    except Exception as e:
        logger.error(f"An error occurred while processing the query: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while processing the query.")
