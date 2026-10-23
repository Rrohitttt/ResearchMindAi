"""
Core RAG orchestration: given a user question (or a summarization
request), retrieve relevant chunks from FAISS and build a grounded
prompt for the LLM. This is the layer FEATURE 3 (chat) and
FEATURE 4 (summarization) both sit on top of.
"""
from typing import List, Optional

from app.services import vectorstore_service, llm_service

SUMMARY_PROMPTS = {
    "short": "Write a concise 3-4 sentence summary of this research paper.",
    "detailed": "Write a detailed, multi-paragraph summary covering the "
                "paper's motivation, methodology, and findings.",
    "bullet": "Summarize this research paper as a bulleted list of its "
              "key points (problem, method, results, contribution).",
    "technical": "Write a technical summary aimed at a graduate researcher, "
                 "covering the model/algorithm architecture, datasets, "
                 "evaluation metrics, and quantitative results.",
}


def answer_question(
    query: str,
    paper_ids: List[str],
    paper_titles: dict,
    top_k_per_paper: int = 4,
) -> dict:
    """
    Retrieves top chunks across the given papers and asks the LLM to
    answer using only that retrieved context (classic RAG pattern).
    Returns {"answer": str, "sources": [{"paper_title", "text", "score"}]}
    """
    results_by_paper = vectorstore_service.search_multiple(paper_ids, query, top_k_per_paper)

    context_blocks = []
    sources = []
    for paper_id, chunks in results_by_paper.items():
        title = paper_titles.get(paper_id, paper_id)
        for chunk in chunks:
            context_blocks.append(f"[Source: {title}, page {chunk['page']}]\n{chunk['text']}")
            sources.append({"paper_title": title, "text": chunk["text"], "score": chunk["score"]})

    context = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant context found."

    prompt = f"""You are ResearchMind AI, an assistant that answers questions about \
uploaded research papers strictly using the provided context.

Context from the paper(s):
{context}

Question: {query}

Instructions:
- Answer using only the context above.
- If the context doesn't contain the answer, say so clearly instead of guessing.
- Cite which paper/page you drew from when relevant.

Answer:"""

    answer = llm_service.generate(prompt)
    return {"answer": answer, "sources": sources}


def summarize_paper(paper_id: str, paper_title: str, summary_type: str = "short") -> str:
    instruction = SUMMARY_PROMPTS.get(summary_type, SUMMARY_PROMPTS["short"])

    # Pull a broad sample of chunks to represent the whole paper
    results = vectorstore_service.search(paper_id, query=paper_title, top_k=12)
    context = "\n\n".join(r["text"] for r in results)

    prompt = f"""You are summarizing the research paper "{paper_title}".

Paper content excerpts:
{context}

Task: {instruction}

Summary:"""

    return llm_service.generate(prompt)


def compare_papers(
    paper_a_id: str, paper_a_title: str,
    paper_b_id: str, paper_b_title: str,
) -> str:
    """FEATURE 5: structured side-by-side comparison. Returns markdown
    (a table plus short prose) rather than JSON — far more robust to
    LLM output variance and renders directly in the UI / exported PDF."""
    dims = ["Objectives", "Methodology", "Algorithms", "Datasets",
            "Results", "Advantages", "Limitations", "Future Scope"]

    context_a = "\n\n".join(r["text"] for r in vectorstore_service.search(paper_a_id, paper_a_title, top_k=10))
    context_b = "\n\n".join(r["text"] for r in vectorstore_service.search(paper_b_id, paper_b_title, top_k=10))

    prompt = f"""Compare these two research papers across these dimensions: {', '.join(dims)}.

Paper A: "{paper_a_title}"
{context_a}

Paper B: "{paper_b_title}"
{context_b}

Respond in Markdown with:
1. A table with columns: Dimension | {paper_a_title} | {paper_b_title}, one row per dimension above.
2. A short "## Head-to-head summary" section (3-5 sentences) on which paper is stronger where, and why.

Only use information present in the excerpts above. If something isn't mentioned, write "Not stated" in that cell."""

    return llm_service.generate(prompt)


def literature_survey(paper_titles: dict, topic: str | None = None) -> str:
    """FEATURE 10: turns a set of papers into a structured literature survey."""
    context_blocks = []
    for paper_id, title in paper_titles.items():
        chunks = vectorstore_service.search(paper_id, topic or title, top_k=8)
        excerpt = "\n".join(c["text"] for c in chunks)
        context_blocks.append(f"### {title}\n{excerpt}")
    context = "\n\n".join(context_blocks)

    topic_line = f'The survey should be framed around the topic: "{topic}".' if topic else ""

    prompt = f"""You are drafting a literature survey from the following papers.
{topic_line}

Papers and excerpts:
{context}

Write the survey in Markdown with these sections:
## Introduction
## Existing Work
(summarize each paper's contribution, one paragraph each, using the paper's own title as a subheading)
## Thematic Synthesis
(group papers by shared themes/approaches, note agreements and disagreements)
## Research Gaps
## Future Scope
## References
(list the paper titles provided above)

Base every claim only on the excerpts given. Do not invent papers or citations."""

    return llm_service.generate(prompt)


def research_gaps(paper_titles: dict) -> str:
    """FEATURE 11: reviewer-style gap analysis across one or more papers."""
    context_blocks = []
    for paper_id, title in paper_titles.items():
        chunks = vectorstore_service.search(paper_id, "limitations future work conclusion", top_k=8)
        excerpt = "\n".join(c["text"] for c in chunks)
        context_blocks.append(f"### {title}\n{excerpt}")
    context = "\n\n".join(context_blocks)

    prompt = f"""Act as a critical peer reviewer for the following paper(s).

{context}

Write your analysis in Markdown with these sections:
## Current Limitations
(evidence-based, cite which paper each limitation comes from)
## Possible Improvements
(concrete, actionable suggestions tied to the limitations above)
## Future Research Directions
(specific, researchable next steps — not vague generalities)

Ground every point in the excerpts provided; do not fabricate limitations the text doesn't support."""

    return llm_service.generate(prompt)


def generate_presentation(paper_titles: dict, num_slides: int = 10) -> str:
    """FEATURE 8: defence-ready slide deck outline with speaker notes."""
    context_blocks = []
    for paper_id, title in paper_titles.items():
        chunks = vectorstore_service.search(paper_id, title, top_k=10)
        excerpt = "\n".join(c["text"] for c in chunks)
        context_blocks.append(f"### {title}\n{excerpt}")
    context = "\n\n".join(context_blocks)

    prompt = f"""Create a {num_slides}-slide presentation outline covering the following paper(s):

{context}

Respond in Markdown. For each slide, use this exact format:

## Slide N: <Slide Title>
- <bullet point>
- <bullet point>
- <bullet point>

**Speaker notes:** <2-3 sentences a presenter would say>

Cover, in order: Title, Problem Statement, Objectives, Methodology, Architecture,
Results, Conclusion, Future Work — expanding or merging sections as needed to hit
{num_slides} slides total. Base content only on the excerpts above."""

    return llm_service.generate(prompt)


def generate_viva_questions(paper_titles: dict, questions_per_level: int = 5) -> str:
    """FEATURE 9: graded viva/defence questions with model answers."""
    context_blocks = []
    for paper_id, title in paper_titles.items():
        chunks = vectorstore_service.search(paper_id, title, top_k=10)
        excerpt = "\n".join(c["text"] for c in chunks)
        context_blocks.append(f"### {title}\n{excerpt}")
    context = "\n\n".join(context_blocks)

    prompt = f"""Generate viva/defence questions for the following paper(s):

{context}

Produce exactly {questions_per_level} Easy, {questions_per_level} Medium, and
{questions_per_level} Hard questions. Respond in Markdown with this structure:

## Easy
1. **Q:** <question>
   **A:** <model answer, 1-3 sentences, grounded in the excerpts>

## Medium
(same format)

## Hard
(same format)

Base every question and answer only on the excerpts above."""

    return llm_service.generate(prompt)
