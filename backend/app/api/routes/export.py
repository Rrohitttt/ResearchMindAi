import re

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Summary, GeneratedOutput, Paper
from app.services import export_service

router = APIRouter(prefix="/export", tags=["Export"])

OUTPUT_TYPE_LABELS = {
    "compare": "Paper Comparison",
    "literature": "Literature Survey",
    "gaps": "Research Gap Analysis",
    "presentation": "Presentation Outline",
    "viva": "Viva Questions",
}


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return slug[:60] or "export"


def _pdf_response(pdf_bytes: bytes, filename: str) -> Response:
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}.pdf"'},
    )


@router.get("/summary/{summary_id}")
def export_summary(summary_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    summary = db.query(Summary).filter(Summary.id == summary_id, Summary.user_id == current_user.id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found.")

    paper = db.query(Paper).filter(Paper.id == summary.paper_id).first()
    paper_title = paper.title if paper else "Unknown paper"

    pdf_bytes = export_service.markdown_to_pdf(
        title=f"{paper_title} — Summary",
        subtitle=f"{summary.summary_type.capitalize()} summary",
        markdown_content=summary.content,
    )
    return _pdf_response(pdf_bytes, f"summary-{_slugify(paper_title)}")


@router.get("/output/{output_id}")
def export_generated_output(output_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    output = (
        db.query(GeneratedOutput)
        .filter(GeneratedOutput.id == output_id, GeneratedOutput.user_id == current_user.id)
        .first()
    )
    if not output:
        raise HTTPException(status_code=404, detail="Generated output not found.")

    subtitle = OUTPUT_TYPE_LABELS.get(output.output_type, output.output_type.capitalize())
    pdf_bytes = export_service.markdown_to_pdf(
        title=output.title,
        subtitle=subtitle,
        markdown_content=output.content,
    )
    return _pdf_response(pdf_bytes, f"{output.output_type}-{_slugify(output.title)}")
