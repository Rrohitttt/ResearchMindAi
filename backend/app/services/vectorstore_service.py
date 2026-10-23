"""
Per-paper FAISS index management. Each paper gets its own on-disk index
folder: {VECTORSTORE_DIR}/{paper_id}/index.faiss + chunks.json
This keeps papers isolated (easy delete, easy per-paper or multi-paper
search) without needing a heavier vector DB server for this project size.
"""
import json
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np

from app.core.config import settings
from app.services.embedding_service import embed_texts, embed_query


def _paper_dir(paper_id: str) -> Path:
    d = Path(settings.VECTORSTORE_DIR) / paper_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def build_index(paper_id: str, chunks: List[dict]) -> int:
    """
    chunks: [{"text": str, "page": int}]
    Builds and persists a FAISS flat index (cosine sim via normalized
    inner product) plus the raw chunk text/metadata alongside it.
    Returns number of chunks indexed.
    """
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)
    dim = embeddings.shape[1]

    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    paper_dir = _paper_dir(paper_id)
    faiss.write_index(index, str(paper_dir / "index.faiss"))
    with open(paper_dir / "chunks.json", "w") as f:
        json.dump(chunks, f)

    return len(chunks)


def _load_index(paper_id: str):
    paper_dir = _paper_dir(paper_id)
    index_path = paper_dir / "index.faiss"
    chunks_path = paper_dir / "chunks.json"
    if not index_path.exists() or not chunks_path.exists():
        return None, None
    index = faiss.read_index(str(index_path))
    with open(chunks_path) as f:
        chunks = json.load(f)
    return index, chunks


def search(paper_id: str, query: str, top_k: int = 5) -> List[dict]:
    """Search a single paper's index. Returns [{"text", "page", "score"}]."""
    index, chunks = _load_index(paper_id)
    if index is None:
        return []

    q_embedding = embed_query(query).reshape(1, -1)
    scores, indices = index.search(q_embedding, min(top_k, index.ntotal))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        chunk = chunks[idx]
        results.append({"text": chunk["text"], "page": chunk["page"], "score": float(score)})
    return results


def search_multiple(paper_ids: List[str], query: str, top_k_per_paper: int = 3) -> dict:
    """Search across several papers, returns {paper_id: [results]}."""
    return {pid: search(pid, query, top_k_per_paper) for pid in paper_ids}


def delete_index(paper_id: str) -> None:
    import shutil
    paper_dir = Path(settings.VECTORSTORE_DIR) / paper_id
    if paper_dir.exists():
        shutil.rmtree(paper_dir)
