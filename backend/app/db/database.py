"""
SQLAlchemy engine + session factory. SQLite is used for user/project
metadata (NOT for paper content or embeddings - those live in FAISS
and on disk, see services/vectorstore_service.py).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called once at startup."""
    from app.db import models  # noqa: F401 (ensures models are registered)
    Base.metadata.create_all(bind=engine)
