import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_ready_papers
from app.db.database import get_db
from app.db.models import User, GeneratedOutput
from app.schemas.analysis import LiteratureRequest, GeneratedOutputResponse
from app.services import rag_service, llm_service

router = APIRouter(prefix="/literature", tags=["Literature Survey"])


@router.post("", response_model=GeneratedOutputResponse)
def generate_literature_survey(
    payload: LiteratureRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not (2 <= len(payload.paper_ids) <= 6):
        raise HTTPException(status_code=400, detail="Select between 2 and 6 papers.")

    papers = get_owned_ready_papers(db, payload.paper_ids, current_user.id)
    paper_titles = {p.id: p.title for p in papers}

    try:
        content = rag_service.literature_survey(paper_titles, payload.topic)
    except llm_service.LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    title = payload.topic or f"Survey of {len(papers)} papers"
    record = GeneratedOutput(
        user_id=current_user.id,
        output_type="literature",
        title=title,
        paper_ids=json.dumps(payload.paper_ids),
        content=content,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
