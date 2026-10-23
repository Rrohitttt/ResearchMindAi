"""
ResearchMind AI - FastAPI application entrypoint.

Route modules stay thin (validation + calling services); business logic
lives in app/services/*, DB access in app/db/*.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.routes import (
    auth, upload, chat, summarize,
    compare, literature, gaps, presentation, viva, search, datasets, history, export,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Research Paper Analysis Platform using RAG + LLMs",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


# --- Feature routers ---
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(summarize.router)
app.include_router(compare.router)
app.include_router(literature.router)
app.include_router(gaps.router)
app.include_router(presentation.router)
app.include_router(viva.router)
app.include_router(search.router)
app.include_router(datasets.router)
app.include_router(history.router)
app.include_router(export.router)
