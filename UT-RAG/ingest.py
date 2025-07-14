import os
from pinecone import Pinecone, ServerlessSpec
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.readers.web import SimpleWebPageReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core.storage.storage_context import StorageContext
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding

from config import get_config
from core.extractors import CUSTOM_EXTRACTORS
from utils.logger import get_logger

# --- 0. Logging Setup ---
logger = get_logger(__name__)

# --- 1. Configuration ---
config = get_config()

# --- 2. Main Ingestion Pipeline ---
def main():
    """
    The main function to run the ingestion pipeline.
    """
    logger.info("--- Starting RAG Ingestion Pipeline ---")

    # Initialize Pinecone
    logger.info(f"Initializing connection to Pinecone index: '{config.pinecone_index_name}'...")
    try:
        pc = Pinecone(api_key=config.pinecone_api_key)
        if config.pinecone_index_name not in pc.list_indexes().names():
            logger.info(f"Creating index '{config.pinecone_index_name}' with dimension {config.vector_dimension}...")
            pc.create_index(
                name=config.pinecone_index_name,
                dimension=config.vector_dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            logger.info("Index created successfully.")
        else:
            logger.info("Index already exists.")
    except Exception as e:
        logger.critical(f"Failed to initialize Pinecone: {e}", exc_info=True)
        raise

    # Load documents
    all_documents = []
    if os.path.exists(config.pdf_source_dir):
        logger.info(f"Loading documents from local directory: '{config.pdf_source_dir}'...")
        pdf_loader = SimpleDirectoryReader(input_dir=config.pdf_source_dir)
        pdf_docs = pdf_loader.load_data()
        for doc in pdf_docs:
            doc.metadata = {"source_url": doc.id_}
        all_documents.extend(pdf_docs)

    if os.path.exists(config.url_sources_file):
        logger.info(f"Loading documents from URLs in '{config.url_sources_file}'...")
        with open(config.url_sources_file, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        for url in urls:
            extractor = next((CUSTOM_EXTRACTORS[key] for key in CUSTOM_EXTRACTORS if key in url), None)
            if extractor:
                logger.info(f"Using custom extractor for {url}")
                text = extractor(url)
            else:
                web_loader = SimpleWebPageReader(html_to_text=True)
                web_docs = web_loader.load_data(urls=[url])
                for doc in web_docs:
                    doc.metadata = {"source_url": url}
                all_documents.extend(web_docs)

    if not all_documents:
        logger.warning("No documents were loaded. Please check your data sources.")
        return

    logger.info(f"Loaded {len(all_documents)} documents in total.")

    embed_model = GoogleGenAIEmbedding(model_name="models/embedding-001", api_key=config.gemini_api_key)

    logger.info("Starting ingestion into Pinecone...")
    pinecone_index = pc.Index(config.pinecone_index_name)
    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    
    VectorStoreIndex.from_documents(
        all_documents,
        storage_context=storage_context,
        embed_model=embed_model,
        show_progress=True
    )
    logger.info("--- RAG Ingestion Pipeline Finished ---")

if __name__ == "__main__":
    main()
