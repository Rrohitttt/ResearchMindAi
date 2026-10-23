from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Paper
from app.schemas.analysis import ExtractionResponse, ExtractedItemOut
from app.services import extraction_service

router = APIRouter(prefix="/datasets", tags=["Dataset & Algorithm Extraction"])


@router.get("/{paper_id}", response_model=ExtractionResponse)
def extract_datasets_and_algorithms(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.owner_id == current_user.id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if paper.status != "ready":
        raise HTTPException(status_code=409, detail=f"Paper is not ready yet (status={paper.status}).")

    datasets = extraction_service.extract_datasets(paper_id)
    algorithms = extraction_service.extract_algorithms(paper_id)

    return ExtractionResponse(
        paper_id=paper.id,
        paper_title=paper.title,
        datasets=[ExtractedItemOut(**d) for d in datasets],
        algorithms=[ExtractedItemOut(**a) for a in algorithms],
    )
