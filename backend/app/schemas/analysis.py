from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# --- Shared: multi-paper selection requests ---
class MultiPaperRequest(BaseModel):
    paper_ids: List[str] = Field(min_length=1)


class CompareRequest(BaseModel):
    paper_ids: List[str] = Field(min_length=2, max_length=6)


class LiteratureRequest(MultiPaperRequest):
    topic: Optional[str] = None


class PresentationRequest(MultiPaperRequest):
    num_slides: int = Field(default=10, ge=5, le=20)


class VivaRequest(MultiPaperRequest):
    questions_per_level: int = Field(default=5, ge=1, le=10)


# --- Generic markdown output response (compare/literature/gaps/presentation/viva) ---
class GeneratedOutputResponse(BaseModel):
    id: str
    output_type: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Semantic search ---
class SearchRequest(BaseModel):
    query: str = Field(min_length=1)
    top_k_per_paper: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    paper_id: str
    paper_title: str
    page: int
    text: str
    score: float


class SearchResponse(BaseModel):
    results: List[SearchResult]


# --- Dataset / algorithm extraction ---
class ExtractedItemOut(BaseModel):
    name: str
    category: str
    mentions: int
    confidence: float


class ExtractionResponse(BaseModel):
    paper_id: str
    paper_title: str
    datasets: List[ExtractedItemOut]
    algorithms: List[ExtractedItemOut]


# --- History ---
class HistoryItem(BaseModel):
    id: str
    type: str  # summary | compare | literature | gaps | presentation | viva | chat
    title: str
    created_at: datetime
