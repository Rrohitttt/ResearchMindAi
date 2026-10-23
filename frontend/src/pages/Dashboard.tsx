import { useNavigate } from "react-router-dom";
import { Library as LibraryIcon, MessageSquare, FileText, GitCompare, Globe, Sparkles } from "lucide-react";
import { PageHeader, StatCard, ActionCard, Card } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";

export default function Dashboard() {
  const navigate = useNavigate();
  const { papers, readyPapers, loading } = usePapers();
  const totalChunks = papers.reduce((sum, p) => sum + (p.num_chunks || 0), 0);

  return (
    <div>
      <PageHeader
        title="Research workspace"
        description="Everything you've indexed and generated, in one place."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard value={loading ? "…" : readyPapers.length} label="Papers indexed" />
        <StatCard value={loading ? "…" : 0} label="Outputs generated" />
        <StatCard value={loading ? "…" : totalChunks} label="Chunks searchable" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <ActionCard
          icon={LibraryIcon}
          title="Upload a paper"
          description="Index a new PDF for retrieval."
          onClick={() => navigate("/app/upload")}
        />
        <ActionCard
          icon={MessageSquare}
          title="Ask your papers"
          description="Cited answers from your library."
          onClick={() => navigate("/app/chat")}
        />
        <ActionCard
          icon={FileText}
          title="Summarize"
          description="Four summary styles."
          onClick={() => navigate("/app/summaries")}
        />
        <ActionCard
          icon={GitCompare}
          title="Compare"
          description="Side-by-side comparison tables."
          onClick={() => navigate("/app/compare")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={17} className="text-brand-500" />
            <p className="font-semibold text-ink-900 text-[15px]">Recent papers</p>
          </div>
          {papers.length === 0 ? (
            <p className="text-sm text-ink-500">
              Nothing yet —{" "}
              <button onClick={() => navigate("/app/upload")} className="text-brand-600 underline">
                upload a PDF
              </button>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {papers.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700 truncate">{p.title}</span>
                  <span className="text-xs text-ink-400 capitalize shrink-0 ml-3">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={17} className="text-brand-500" />
            <p className="font-semibold text-ink-900 text-[15px]">Recent outputs</p>
          </div>
          <p className="text-sm text-ink-500">No generated reports yet.</p>
        </Card>
      </div>
    </div>
  );
}
