from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Summary, GeneratedOutput, ChatMessage, Paper
from app.schemas.analysis import HistoryItem

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=List[HistoryItem])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items: List[HistoryItem] = []

    # --- Summaries ---
    summaries = db.query(Summary).filter(Summary.user_id == current_user.id).all()
    paper_titles = {p.id: p.title for p in db.query(Paper).filter(Paper.owner_id == current_user.id).all()}
    for s in summaries:
        title = paper_titles.get(s.paper_id, "Unknown paper")
        items.append(HistoryItem(
            id=s.id, type="summary",
            title=f"{title} — {s.summary_type} summary",
            created_at=s.created_at,
        ))

    # --- Generated outputs (compare / literature / gaps / presentation / viva) ---
    outputs = db.query(GeneratedOutput).filter(GeneratedOutput.user_id == current_user.id).all()
    for o in outputs:
        items.append(HistoryItem(id=o.id, type=o.output_type, title=o.title, created_at=o.created_at))

    # --- Chats, grouped by paper scope (one row per distinct scope, latest timestamp) ---
    chat_groups = (
        db.query(
            ChatMessage.paper_id,
            func.max(ChatMessage.created_at).label("last_at"),
            func.count(ChatMessage.id).label("msg_count"),
        )
        .filter(ChatMessage.user_id == current_user.id)
        .group_by(ChatMessage.paper_id)
        .all()
    )
    for paper_id, last_at, msg_count in chat_groups:
        scope_title = paper_titles.get(paper_id, "All papers") if paper_id else "All papers"
        items.append(HistoryItem(
            id=f"chat-{paper_id or 'all'}",
            type="chat",
            title=f"Chat — {scope_title} ({msg_count} messages)",
            created_at=last_at,
        ))

    items.sort(key=lambda i: i.created_at, reverse=True)
    return items
