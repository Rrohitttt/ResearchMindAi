import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Button, Card, EmptyState } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";
import { paperApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-brand-50 text-brand-700 border-brand-100",
  processing: "bg-amber-50 text-amber-700 border-amber-100",
  failed: "bg-red-50 text-red-700 border-red-100",
};

export default function Library() {
  const navigate = useNavigate();
  const { papers, loading, refresh } = usePapers();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => papers.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase())),
    [papers, filter]
  );

  const handleDelete = async (id: string) => {
    try {
      await paperApi.remove(id);
      toast.success("Paper removed");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove paper");
    }
  };

  return (
    <div>
      <PageHeader
        title="Library"
        description={`${papers.length} paper${papers.length === 1 ? "" : "s"} indexed for retrieval.`}
        action={
          <Button icon={UploadIcon} onClick={() => navigate("/app/upload")}>
            Upload
          </Button>
        }
      />

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by title, author or keyword…"
        className="w-full max-w-md border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 mb-4 bg-surface"
      />

      <Card>
        {loading ? (
          <p className="text-sm text-ink-500 text-center py-10">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            text={papers.length === 0 ? "No papers yet." : "No papers match your filter."}
            linkText={papers.length === 0 ? "Upload your first PDF." : undefined}
            onLinkClick={() => navigate("/app/upload")}
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-brand-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{p.title}</p>
                    <p className="text-xs text-ink-400">
                      {p.num_pages} pages · {p.num_chunks} chunks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                      STATUS_STYLES[p.status] || "bg-page text-ink-500 border-border"
                    }`}
                  >
                    {p.status}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-ink-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    aria-label="Delete paper"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
