from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    paper_id: Optional[str] = None  # None = search across all of the user's papers
    message: str


class SourceChunk(BaseModel):
    paper_title: str
    text: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk] = []


class ChatHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
