import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_ready_papers
from app.db.database import get_db
from app.db.models import User, GeneratedOutput
from app.schemas.analysis import MultiPaperRequest, GeneratedOutputResponse
from app.services import rag_service, llm_service

router = APIRouter(prefix="/gaps", tags=["Research Gaps"])


@router.post("", response_model=GeneratedOutputResponse)
def find_research_gaps(
    payload: MultiPaperRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(payload.paper_ids) > 6:
        raise HTTPException(status_code=400, detail="Select at most 6 papers.")

    papers = get_owned_ready_papers(db, payload.paper_ids, current_user.id)
    paper_titles = {p.id: p.title for p in papers}

    try:
        content = rag_service.research_gaps(paper_titles)
    except llm_service.LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    title = "Gap analysis: " + ", ".join(p.title for p in papers[:2]) + ("…" if len(papers) > 2 else "")
    record = GeneratedOutput(
        user_id=current_user.id,
        output_type="gaps",
        title=title,
        paper_ids=json.dumps(payload.paper_ids),
        content=content,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
