const BASE_URL = "https://researchmindai-backend.onrender.com";
function getToken(): string | null {
  return localStorage.getItem("rm_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Types ---
export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Paper {
  id: string;
  title: string;
  filename: string;
  num_pages: number;
  num_chunks: number;
  status: "processing" | "ready" | "failed";
  created_at: string;
}

export interface SourceChunk {
  paper_title: string;
  text: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

export interface Summary {
  id: string;
  paper_id: string;
  summary_type: string;
  content: string;
  created_at: string;
}

export interface GeneratedOutput {
  id: string;
  output_type: string;
  title: string;
  content: string;
  created_at: string;
}

export interface SearchResult {
  paper_id: string;
  paper_title: string;
  page: number;
  text: string;
  score: number;
}

export interface ExtractedItem {
  name: string;
  category: string;
  mentions: number;
  confidence: number;
}

export interface ExtractionResult {
  paper_id: string;
  paper_title: string;
  datasets: ExtractedItem[];
  algorithms: ExtractedItem[];
}

export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  created_at: string;
}

// --- Auth ---
export const authApi = {
  register: (full_name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
};

// --- Papers ---
export const paperApi = {
  list: () => request<Paper[]>("/upload"),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Paper>("/upload", { method: "POST", body: form });
  },
  remove: (id: string) => request<void>(`/upload/${id}`, { method: "DELETE" }),
};

// --- Chat ---
export const chatApi = {
  ask: (message: string, paper_id?: string) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, paper_id: paper_id ?? null }),
    }),
};

// --- Summaries ---
export const summaryApi = {
  generate: (paper_id: string, summary_type: string) =>
    request<Summary>("/summarize", {
      method: "POST",
      body: JSON.stringify({ paper_id, summary_type }),
    }),
};

// --- Compare ---
export const compareApi = {
  run: (paper_ids: string[]) =>
    request<GeneratedOutput>("/compare", {
      method: "POST",
      body: JSON.stringify({ paper_ids }),
    }),
};

// --- Literature survey ---
export const literatureApi = {
  run: (paper_ids: string[], topic?: string) =>
    request<GeneratedOutput>("/literature", {
      method: "POST",
      body: JSON.stringify({ paper_ids, topic: topic || null }),
    }),
};

// --- Research gaps ---
export const gapsApi = {
  run: (paper_ids: string[]) =>
    request<GeneratedOutput>("/gaps", {
      method: "POST",
      body: JSON.stringify({ paper_ids }),
    }),
};

// --- Presentation ---
export const presentationApi = {
  run: (paper_ids: string[], num_slides: number) =>
    request<GeneratedOutput>("/presentation", {
      method: "POST",
      body: JSON.stringify({ paper_ids, num_slides }),
    }),
};

// --- Viva questions ---
export const vivaApi = {
  run: (paper_ids: string[], questions_per_level: number) =>
    request<GeneratedOutput>("/viva", {
      method: "POST",
      body: JSON.stringify({ paper_ids, questions_per_level }),
    }),
};

// --- Semantic search ---
export const searchApi = {
  run: (query: string, top_k_per_paper = 5) =>
    request<{ results: SearchResult[] }>("/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k_per_paper }),
    }),
};

// --- Dataset & algorithm extraction ---
export const datasetsApi = {
  extract: (paperId: string) => request<ExtractionResult>(`/datasets/${paperId}`),
};

// --- History ---
export const historyApi = {
  list: () => request<HistoryItem[]>("/history"),
};

// --- Export (PDF download) ---
async function downloadPdf(path: string, suggestedName: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let detail = `Export failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName.endsWith(".pdf") ? suggestedName : `${suggestedName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const exportApi = {
  summary: (summaryId: string, filename: string) => downloadPdf(`/export/summary/${summaryId}`, filename),
  output: (outputId: string, filename: string) => downloadPdf(`/export/output/${outputId}`, filename),
};

export { getToken };
