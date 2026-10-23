from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Paper, ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryItem, SourceChunk
from app.services import rag_service, llm_service

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Resolve which paper(s) to search within
    query = db.query(Paper).filter(Paper.owner_id == current_user.id, Paper.status == "ready")
    if payload.paper_id:
        query = query.filter(Paper.id == payload.paper_id)
    papers = query.all()

    if not papers:
        raise HTTPException(status_code=404, detail="No processed papers available to chat with.")

    paper_ids = [p.id for p in papers]
    paper_titles = {p.id: p.title for p in papers}

    # Save the user message
    db.add(ChatMessage(user_id=current_user.id, paper_id=payload.paper_id, role="user", content=payload.message))
    db.commit()

    try:
        result = rag_service.answer_question(payload.message, paper_ids, paper_titles)
    except llm_service.LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Save the assistant reply
    db.add(ChatMessage(user_id=current_user.id, paper_id=payload.paper_id, role="assistant", content=result["answer"]))
    db.commit()

    return ChatResponse(
        answer=result["answer"],
        sources=[SourceChunk(**s) for s in result["sources"]],
    )


@router.get("/history", response_model=List[ChatHistoryItem])
def chat_history(
    paper_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id)
    if paper_id:
        q = q.filter(ChatMessage.paper_id == paper_id)
    return q.order_by(ChatMessage.created_at.asc()).all()
