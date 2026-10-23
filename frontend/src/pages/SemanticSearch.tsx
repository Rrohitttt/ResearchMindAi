import { useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Card } from "@/components/ui/primitives";
import { searchApi, SearchResult } from "@/lib/api";

function highlight(text: string, query: string) {
  const terms = query.split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className="bg-brand-100 text-ink-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchApi.run(query);
      setResults(res.results);
      setLastQuery(query);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Semantic search"
        description="Find the passages that actually answer your question, ranked by meaning across your whole library."
      />
      <div className="flex items-center gap-2 max-w-2xl mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. how do they handle class imbalance?"
          className="flex-1 border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 bg-surface"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl p-2.5 transition-colors"
          aria-label="Search"
        >
          <Search size={17} />
        </button>
      </div>

      {loading && <p className="text-sm text-ink-500">Searching…</p>}

      {results && !loading && (
        <div className="flex flex-col gap-3 max-w-3xl">
          {results.length === 0 ? (
            <p className="text-sm text-ink-500">No matching passages found.</p>
          ) : (
            results.map((r, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-ink-900">{r.paper_title}</p>
                  <span className="text-xs text-ink-400">
                    p.{r.page} · score {r.score.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-ink-700 leading-relaxed">{highlight(r.text, lastQuery)}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
