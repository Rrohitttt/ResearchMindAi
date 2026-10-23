from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PaperOut(BaseModel):
    id: str
    title: str
    filename: str
    num_pages: int
    num_chunks: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SummaryRequest(BaseModel):
    paper_id: str
    summary_type: str = "short"  # short | detailed | bullet | technical


class SummaryOut(BaseModel):
    id: str
    paper_id: str
    summary_type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class CompareRequest(BaseModel):
    paper_id_a: str
    paper_id_b: str


class CompareOut(BaseModel):
    objectives: str
    methodology: str
    algorithms: str
    datasets: str
    results: str
    advantages: str
    limitations: str
    future_scope: str
