from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.db.models import User, Paper

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_error

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if user is None:
        raise credentials_error
    return user


def get_owned_ready_papers(db: Session, paper_ids: list[str], user_id: str) -> list[Paper]:
    """Fetch papers by id, ensuring they belong to the user and are ready
    for retrieval. Raises 404/409 with a clear message otherwise. Used by
    every multi-paper generation route (compare, literature, gaps, etc.)."""
    papers = db.query(Paper).filter(Paper.id.in_(paper_ids), Paper.owner_id == user_id).all()

    found_ids = {p.id for p in papers}
    missing = set(paper_ids) - found_ids
    if missing:
        raise HTTPException(status_code=404, detail=f"Paper(s) not found: {', '.join(missing)}")

    not_ready = [p.title for p in papers if p.status != "ready"]
    if not_ready:
        raise HTTPException(status_code=409, detail=f"Not yet processed: {', '.join(not_ready)}")

    # preserve the order the caller requested
    by_id = {p.id: p for p in papers}
    return [by_id[pid] for pid in paper_ids]
