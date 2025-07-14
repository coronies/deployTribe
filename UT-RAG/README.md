# Tribe RAG Personal Assistant

This project is a Retrieval-Augmented Generation (RAG) personal assistant that answers questions about The University of Texas at Austin. It uses a FastAPI backend, LlamaIndex for orchestration, Pinecone for the vector store, and Google's Gemini for the LLM.

## Setup

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Create a `.env` file** in the root of the project and add your API keys:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    PINECONE_API_KEY="YOUR_PINECONE_API_KEY"
    ```

## Ingestion

To populate the Pinecone vector store with the knowledge base, run the ingestion script:

```bash
python ingest.py
```

## Testing

To run the tests, first install the development dependencies:

```bash
pip install -r requirements-dev.txt
```

Then, run pytest:

```bash
pytest
```

## Running the Application

To start the FastAPI server, run:

```bash
uvicorn main:app --reload
```

The API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Deployment

To deploy this application, you can use Docker. Make sure you have Docker installed and running.

1.  **Build the Docker image:**
    ```bash
    docker build -t tribe-rag-assistant .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -d --name tribe-rag-container -p 8000:8000 tribe-rag-assistant
    ```

    This will start the FastAPI server inside a Docker container, accessible at `http://localhost:8000`.

3.  **Stop the Docker container:**
    ```bash
    docker stop tribe-rag-container
    ```

4.  **Remove the Docker container:**
    ```bash
    docker rm tribe-rag-container
    ```

5.  **Remove the Docker image:**
    ```bash
    docker rmi tribe-rag-assistant
    ```
