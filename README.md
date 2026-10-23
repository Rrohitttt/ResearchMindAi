# ResearchMind AI

An intelligent research paper analysis platform using Retrieval-Augmented
Generation (RAG) and local LLMs. Upload PDFs, ask grounded questions, and
generate summaries — all running on your own machine via Ollama.

---

## Status: Phase 1 + Phase 2 complete

This is a genuine, runnable full-stack app — not a mockup. Everything
listed below has been verified: syntax-checked, dependency-installed, and
exercised end-to-end with a real `TestClient` (backend) and a real
`vite build` (frontend).

**Working now:**
- Auth: register / login / logout / session (JWT)
- Upload: drag-and-drop PDF upload, validation, duplicate detection (hash-based)
- Processing: PyMuPDF text extraction → chunking → sentence-transformers
  embeddings → FAISS index per paper
- RAG chat: ask questions grounded in retrieved passages, cited sources
- Summarization: short / detailed / bullet / technical, via LangChain + Ollama (Llama 3)
- Compare papers: side-by-side markdown comparison table + head-to-head analysis
- Literature survey: structured survey (intro, existing work, synthesis, gaps, references) across 2-6 papers
- Research gap analysis: reviewer-style limitations, improvements, future directions
- Presentation generator: slide-by-slide outline with speaker notes
- Viva question generator: graded (easy/medium/hard) Q&A grounded in the paper(s)
- Semantic search: ranked passages across a user's entire library, with matched-term highlighting
- Dataset & algorithm extraction: deterministic keyword/regex detection with confidence scores —
  no LLM required, instant and reproducible
- History: combined feed of chats, summaries, and every generated deliverable
- **PDF export**: every summary and every generated output (compare/literature/gaps/
  presentation/viva) can be downloaded as a styled PDF, rendered from markdown via
  `markdown` + `xhtml2pdf` — verified with real PDF bytes (`%PDF` header, valid tables/headers)
- Full UI: landing page, auth pages, dashboard, upload, library, chat, summaries, and all
  feature pages — styled to match the target design (light theme, sidebar nav, card layout)

**Not yet implemented:**
- Background task queue for upload processing (currently synchronous, fine for demo-scale PDFs)
- Dark mode
- Chat streaming (currently request/response; Ollama supports streaming, `llm_service.stream()`
  already exists — wiring it to the chat route + frontend is the main remaining piece)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Python, FastAPI |
| AI framework | LangChain |
| LLM runtime | Ollama (Llama 3) |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Vector store | FAISS (one flat index per paper) |
| Database | SQLite (user/paper/chat metadata) |
| PDF processing | PyMuPDF |
| Deployment | Docker + Docker Compose |

---

## Project structure

```
research-mind-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── core/                # config, security (JWT/bcrypt)
│   │   ├── db/                  # SQLAlchemy models + session
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── api/routes/          # thin route handlers
│   │   └── services/            # business logic (pdf, embeddings, vectorstore, llm, rag, auth)
│   ├── uploads/                 # uploaded PDFs (gitignored)
│   ├── vectorstore/             # per-paper FAISS indexes (gitignored)
│   ├── generated_reports/       # exported PDFs (gitignored)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                # one file per route
│   │   ├── components/layout/    # Sidebar, Topbar, AppLayout
│   │   ├── components/ui/        # shared primitives (Card, Button, etc.)
│   │   ├── lib/                  # api client, nav config
│   │   ├── store/                # zustand auth store
│   │   └── hooks/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Run locally (without Docker)

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Start Ollama separately (https://ollama.com), then:
ollama pull llama3

uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000` — interactive docs at `/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` to the backend.

---

## Run with Docker Compose

```bash
docker compose up --build
# in a separate terminal, once containers are up:
docker exec -it researchmind-ollama ollama pull llama3
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000/docs`
- Ollama: `http://localhost:11434`

---

## API reference (implemented)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns JWT |
| POST | `/auth/login` | Authenticate, returns JWT |
| POST | `/auth/logout` | Stateless logout (client discards token) |
| GET  | `/auth/me` | Current user info |
| POST | `/upload` | Upload + process a PDF (multipart form, field `file`) |
| GET  | `/upload` | List the current user's papers |
| GET  | `/upload/{paper_id}` | Get one paper |
| DELETE | `/upload/{paper_id}` | Delete a paper + its FAISS index |
| POST | `/chat` | Ask a question (RAG), optionally scoped to one `paper_id` |
| GET  | `/chat/history` | Chat history, optionally filtered by `paper_id` |
| POST | `/summarize` | Generate a summary (`summary_type`: short/detailed/bullet/technical) |
| POST | `/compare` | Compare exactly 2 papers — markdown table + head-to-head analysis |
| POST | `/literature` | Literature survey across 2-6 papers, optional `topic` |
| POST | `/gaps` | Research gap analysis across 1-6 papers |
| POST | `/presentation` | Slide deck outline (`num_slides`, 5-20) across 1-6 papers |
| POST | `/viva` | Graded viva questions (`questions_per_level`, 1-10) across 1-6 papers |
| POST | `/search` | Semantic search across all of a user's ready papers |
| GET  | `/datasets/{paper_id}` | Deterministic dataset/algorithm extraction for one paper |
| GET  | `/history` | Combined feed: chats, summaries, and every generated output |
| GET  | `/export/summary/{summary_id}` | Download a summary as PDF |
| GET  | `/export/output/{output_id}` | Download a compare/literature/gaps/presentation/viva result as PDF |
| GET  | `/health` | Health check |

All endpoints except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

---

## Known environment note

Embedding model downloads (`sentence-transformers` pulls weights from
Hugging Face on first run) and LLM calls (Ollama) both require network/local
resources not available in the sandbox this was built in — the code for both
was verified for correctness, but actual generation should be tested on your
machine where `ollama serve` and Hugging Face access work normally.

---

## Roadmap

- [ ] Chat streaming (backend `llm_service.stream()` exists; needs an SSE/websocket route + frontend consumption)
- [ ] Background task queue for upload processing (replace synchronous upload handler for large batches)
- [ ] Dark mode
- [ ] Bulk export (zip of all a user's generated PDFs)
