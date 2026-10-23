import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Copy, Check, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import clsx from "clsx";
import { PageHeader, Card, EmptyState, Button } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";
import { summaryApi, exportApi } from "@/lib/api";

const STYLES = [
  { value: "short", label: "Short — one paragraph" },
  { value: "detailed", label: "Detailed — sectioned" },
  { value: "bullet", label: "Bullet points" },
  { value: "technical", label: "Technical deep-dive" },
];

export default function Summaries() {
  const navigate = useNavigate();
  const { readyPapers, loading } = usePapers();
  const [paperId, setPaperId] = useState<string>("");
  const [style, setStyle] = useState("detailed");
  const [output, setOutput] = useState<string | null>(null);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    if (!paperId) {
      toast.error("Select a paper first");
      return;
    }
    setGenerating(true);
    setOutput(null);
    setSummaryId(null);
    try {
      const res = await summaryApi.generate(paperId, style);
      setOutput(res.content);
      setSummaryId(res.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!summaryId) return;
    setExporting(true);
    try {
      await exportApi.summary(summaryId, `summary-${style}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Paper summaries"
        description="Pick a paper and a summary style. Output is grounded in the paper's own text — no invented findings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <Card className="p-5">
          <p className="text-sm font-semibold text-ink-900">Select a paper</p>
          <p className="text-xs text-ink-400 mb-3">Choose one processed paper.</p>

          {loading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : readyPapers.length === 0 ? (
            <EmptyState
              text="No processed papers yet."
              linkText="Upload a PDF first."
              onLinkClick={() => navigate("/app/upload")}
            />
          ) : (
            <div className="flex flex-col gap-1 mb-4 max-h-56 overflow-y-auto">
              {readyPapers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaperId(p.id)}
                  className={clsx(
                    "text-left text-sm px-3 py-2 rounded-lg truncate transition-colors",
                    paperId === p.id ? "bg-activeNav font-medium text-ink-900" : "text-ink-700 hover:bg-page"
                  )}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          <label className="text-sm font-semibold text-ink-900 block mb-1.5">Summary style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 mb-4 bg-surface"
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <Button
            icon={Sparkles}
            className="w-full"
            disabled={!paperId || generating}
            onClick={handleGenerate}
          >
            {generating ? "Generating…" : "Generate summary"}
          </Button>
        </Card>

        <Card className="p-6 min-h-[400px]">
          {output ? (
            <div>
              <div className="flex justify-end gap-3 mb-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 disabled:opacity-50"
                >
                  <Download size={14} />
                  {exporting ? "Exporting…" : "Download PDF"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Sparkles size={22} className="text-brand-500 mb-3" />
              <p className="text-sm text-ink-500">
                {generating ? "Generating your summary…" : "Your generated output will appear here."}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
