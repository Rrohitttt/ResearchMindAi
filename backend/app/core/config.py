"""
Centralized application configuration.

All environment-driven settings live here so the rest of the codebase
never touches os.environ directly. Import `settings` anywhere it's needed.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "ResearchMind AI"
    ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # --- Database ---
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/database/researchmind.db"

    # --- Storage ---
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    VECTORSTORE_DIR: str = str(BASE_DIR / "vectorstore")
    REPORTS_DIR: str = str(BASE_DIR / "generated_reports")

    # --- Embeddings ---
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # --- LLM ---
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Ensure runtime directories exist
for _dir in (settings.UPLOAD_DIR, settings.VECTORSTORE_DIR, settings.REPORTS_DIR):
    Path(_dir).mkdir(parents=True, exist_ok=True)
Path(BASE_DIR / "database").mkdir(parents=True, exist_ok=True)
