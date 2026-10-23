from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User, Paper
from app.schemas.paper import PaperOut
from app.services import pdf_service, vectorstore_service

router = APIRouter(prefix="/upload", tags=["Upload & Processing"])


@router.post("", response_model=PaperOut, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --- Validation ---
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit.")

    file_hash = pdf_service.compute_file_hash(file_bytes)

    # --- Duplicate detection (per-user) ---
    existing = (
        db.query(Paper)
        .filter(Paper.owner_id == current_user.id, Paper.file_hash == file_hash)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This file was already uploaded as '{existing.title}'.",
        )

    # --- Save to disk ---
    user_dir = Path(settings.UPLOAD_DIR) / current_user.id
    user_dir.mkdir(parents=True, exist_ok=True)
    dest_path = user_dir / file.filename
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    # --- Create DB record (status=processing) ---
    paper = Paper(
        owner_id=current_user.id,
        title=file.filename,
        filename=file.filename,
        file_path=str(dest_path),
        file_hash=file_hash,
        status="processing",
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    # --- Process synchronously (extract -> chunk -> embed -> index) ---
    # For a production system this would be a background task/queue;
    # kept synchronous here for a simple, dependency-free reference impl.
    try:
        pages = pdf_service.extract_text_by_page(str(dest_path))
        title = pdf_service.extract_title(str(dest_path), fallback=file.filename)
        chunks = pdf_service.chunk_text(pages)

        if not chunks:
            raise ValueError("No extractable text found in this PDF (is it scanned/image-only?).")

        num_chunks = vectorstore_service.build_index(paper.id, chunks)

        paper.title = title
        paper.num_pages = len(pages)
        paper.num_chunks = num_chunks
        paper.status = "ready"
        paper.vectorstore_path = str(Path(settings.VECTORSTORE_DIR) / paper.id)
    except Exception as e:
        paper.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    db.commit()
    db.refresh(paper)
    return paper


@router.get("", response_model=List[PaperOut])
def list_papers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Paper)
        .filter(Paper.owner_id == current_user.id)
        .order_by(Paper.created_at.desc())
        .all()
    )


@router.get("/{paper_id}", response_model=PaperOut)
def get_paper(paper_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paper = _get_owned_paper(db, paper_id, current_user.id)
    return paper


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(paper_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paper = _get_owned_paper(db, paper_id, current_user.id)
    vectorstore_service.delete_index(paper_id)
    Path(paper.file_path).unlink(missing_ok=True)
    db.delete(paper)
    db.commit()


def _get_owned_paper(db: Session, paper_id: str, user_id: str) -> Paper:
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.owner_id == user_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return paper
