"""
PDF ingestion: text extraction + chunking. Isolated from routes so the
extraction strategy can change (e.g. swap in OCR) without touching the API.
"""
import hashlib
from pathlib import Path
from typing import List

import fitz  # PyMuPDF


def compute_file_hash(file_bytes: bytes) -> str:
    """Used for duplicate-file detection on upload."""
    return hashlib.sha256(file_bytes).hexdigest()


def extract_text_by_page(pdf_path: str) -> List[str]:
    """Returns a list of page texts."""
    doc = fitz.open(pdf_path)
    pages = [page.get_text("text") for page in doc]
    doc.close()
    return pages


def chunk_text(pages: List[str], chunk_size: int = 900, overlap: int = 150) -> List[dict]:
    """
    Splits full document text into overlapping chunks for embedding.
    Each chunk keeps track of the page it primarily came from.
    Returns: [{"text": str, "page": int}]
    """
    chunks = []
    for page_num, page_text in enumerate(pages, start=1):
        page_text = " ".join(page_text.split())  # normalize whitespace
        if not page_text:
            continue
        start = 0
        while start < len(page_text):
            end = start + chunk_size
            chunk = page_text[start:end]
            if chunk.strip():
                chunks.append({"text": chunk.strip(), "page": page_num})
            start += chunk_size - overlap
    return chunks


def extract_title(pdf_path: str, fallback: str) -> str:
    """Best-effort title extraction from PDF metadata, else first line of text."""
    doc = fitz.open(pdf_path)
    meta_title = (doc.metadata or {}).get("title", "").strip()
    if meta_title:
        doc.close()
        return meta_title
    first_page_text = doc[0].get_text("text") if doc.page_count else ""
    doc.close()
    first_line = first_page_text.strip().split("\n")[0][:150] if first_page_text.strip() else ""
    return first_line or fallback
