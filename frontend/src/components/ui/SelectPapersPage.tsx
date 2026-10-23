import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, LucideIcon, Copy, Check, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import clsx from "clsx";
import { PageHeader, Card, EmptyState, Button } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";
import { exportApi } from "@/lib/api";

interface SelectPapersPageProps {
  title: string;
  description: string;
  actionLabel: string;
  actionIcon?: LucideIcon;
  minPapers?: number;
  maxPapers?: number;
  extraControls?: ReactNode;
  /** Called with the selected paper ids. Returns the generated output's id + markdown content. */
  onGenerate: (paperIds: string[]) => Promise<{ id: string; content: string }>;
}

export default function SelectPapersPage({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon = Sparkles,
  minPapers = 2,
  maxPapers = 6,
  extraControls,
  onGenerate,
}: SelectPapersPageProps) {
  const navigate = useNavigate();
  const { readyPapers, loading } = usePapers();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState<string | null>(null);
  const [outputId, setOutputId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= maxPapers) {
          toast.error(`Select at most ${maxPapers} papers`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selected.size < minPapers) {
      toast.error(`Select at least ${minPapers} paper${minPapers > 1 ? "s" : ""}`);
      return;
    }
    setGenerating(true);
    setOutput(null);
    setOutputId(null);
    try {
      const res = await onGenerate(Array.from(selected));
      setOutput(res.content);
      setOutputId(res.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!outputId) return;
    setExporting(true);
    try {
      await exportApi.output(outputId, title.toLowerCase().replace(/\s+/g, "-"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <Card className="p-5 h-fit">
          <p className="text-sm font-semibold text-ink-900">Select papers ({selected.size})</p>
          <p className="text-xs text-ink-400 mb-3">
            Choose {minPapers}–{maxPapers} processed papers.
          </p>

          {loading ? (
            <p className="text-sm text-ink-500">Loading…</p>
          ) : readyPapers.length === 0 ? (
            <EmptyState
              text="No processed papers yet."
              linkText="Upload a PDF first."
              onLinkClick={() => navigate("/app/upload")}
            />
          ) : (
            <div className="flex flex-col gap-1 mb-4 max-h-48 overflow-y-auto">
              {readyPapers.map((p) => (
                <label
                  key={p.id}
                  className={clsx(
                    "flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    selected.has(p.id) ? "bg-activeNav" : "hover:bg-page"
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-brand-500"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span className="truncate">{p.title}</span>
                </label>
              ))}
            </div>
          )}

          {extraControls}

          <Button
            icon={ActionIcon}
            className="w-full mt-4"
            disabled={generating || readyPapers.length === 0}
            onClick={handleGenerate}
          >
            {generating ? "Generating…" : actionLabel}
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
              <div className="prose prose-sm max-w-none prose-table:text-sm prose-th:text-left">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Sparkles size={22} className="text-brand-500 mb-3" />
              <p className="text-sm text-ink-500">
                {generating ? "Generating…" : "Your generated output will appear here."}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
