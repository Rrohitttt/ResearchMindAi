from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Paper
from app.schemas.analysis import SearchRequest, SearchResponse, SearchResult
from app.services import vectorstore_service

router = APIRouter(prefix="/search", tags=["Semantic Search"])


@router.post("", response_model=SearchResponse)
def semantic_search(
    payload: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    papers = db.query(Paper).filter(Paper.owner_id == current_user.id, Paper.status == "ready").all()
    if not papers:
        raise HTTPException(status_code=404, detail="No processed papers to search yet.")

    paper_titles = {p.id: p.title for p in papers}
    results_by_paper = vectorstore_service.search_multiple(
        [p.id for p in papers], payload.query, payload.top_k_per_paper
    )

    flat_results = []
    for paper_id, chunks in results_by_paper.items():
        for chunk in chunks:
            flat_results.append(
                SearchResult(
                    paper_id=paper_id,
                    paper_title=paper_titles[paper_id],
                    page=chunk["page"],
                    text=chunk["text"],
                    score=chunk["score"],
                )
            )

    flat_results.sort(key=lambda r: r.score, reverse=True)
    return SearchResponse(results=flat_results[:30])
