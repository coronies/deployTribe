
import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(override=True)

class AppConfig(BaseModel):
    # General App Settings
    app_name: str = Field("Tribe University OS API", description="The name of the application.")
    app_version: str = Field("1.0.0", description="The version of the application.")
    
    # Pinecone Settings
    pinecone_api_key: str = Field(..., description="The API key for Pinecone.")
    pinecone_index_name: str = Field("ut-austin-knowledge-base", description="The name of the Pinecone index.")
    
    # Gemini Settings
    gemini_api_key: str = Field(..., description="The API key for Google Gemini.")
    
    # Vector Store Settings
    vector_dimension: int = Field(768, description="The dimension of the vectors.")
    
    # Data Sources
    pdf_source_dir: str = Field("./data", description="The local directory for PDF files.")
    url_sources_file: str = Field("url_sources.txt", description="The file containing a list of URLs.")
    
    # RAG Settings
    similarity_top_k: int = Field(5, description="The number of similar documents to retrieve.")
    
    # Rate Limiting
    rate_limit_per_minute: int = Field(5, description="The number of requests per minute allowed.")

    class Config:
        # This allows the model to be created from environment variables
        env_file = ".env"
        env_file_encoding = 'utf-8'

def get_config() -> AppConfig:
    # This function will create and return an instance of the AppConfig class.
    # It will automatically load environment variables from the .env file.
    return AppConfig(
        pinecone_api_key=os.environ.get("PINECONE_API_KEY"),
        gemini_api_key=os.environ.get("GEMINI_API_KEY"),
    )

