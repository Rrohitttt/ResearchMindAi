from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Paper, Summary
from app.schemas.paper import SummaryRequest, SummaryOut
from app.services import rag_service, llm_service

router = APIRouter(prefix="/summarize", tags=["Summarization"])

VALID_TYPES = {"short", "detailed", "bullet", "technical"}


@router.post("", response_model=SummaryOut)
def summarize(payload: SummaryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.summary_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"summary_type must be one of {sorted(VALID_TYPES)}")

    paper = db.query(Paper).filter(Paper.id == payload.paper_id, Paper.owner_id == current_user.id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if paper.status != "ready":
        raise HTTPException(status_code=409, detail=f"Paper is not ready yet (status={paper.status}).")

    try:
        content = rag_service.summarize_paper(paper.id, paper.title, payload.summary_type)
    except llm_service.LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    summary = Summary(
        user_id=current_user.id,
        paper_id=paper.id,
        summary_type=payload.summary_type,
        content=content,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary
