import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_owned_ready_papers
from app.db.database import get_db
from app.db.models import User, GeneratedOutput
from app.schemas.analysis import CompareRequest, GeneratedOutputResponse
from app.services import rag_service, llm_service

router = APIRouter(prefix="/compare", tags=["Compare Papers"])


@router.post("", response_model=GeneratedOutputResponse)
def compare(payload: CompareRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if len(payload.paper_ids) != 2:
        raise HTTPException(status_code=400, detail="Comparison currently supports exactly 2 papers.")

    papers = get_owned_ready_papers(db, payload.paper_ids, current_user.id)
    paper_a, paper_b = papers[0], papers[1]

    try:
        content = rag_service.compare_papers(paper_a.id, paper_a.title, paper_b.id, paper_b.title)
    except llm_service.LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    record = GeneratedOutput(
        user_id=current_user.id,
        output_type="compare",
        title=f"{paper_a.title} vs {paper_b.title}",
        paper_ids=json.dumps(payload.paper_ids),
        content=content,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
