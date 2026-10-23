import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";
import { datasetsApi, ExtractionResult } from "@/lib/api";

function ConfidenceBadge({ value }: { value: number }) {
  const label = value >= 0.75 ? "High" : value >= 0.5 ? "Medium" : "Low";
  const cls =
    value >= 0.75
      ? "bg-brand-50 text-brand-700 border-brand-100"
      : value >= 0.5
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-page text-ink-500 border-border";
  return <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full border", cls)}>{label} confidence</span>;
}

export default function DatasetsMethods() {
  const navigate = useNavigate();
  const { readyPapers, loading } = usePapers();
  const [paperId, setPaperId] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (readyPapers.length > 0 && !paperId) {
      setPaperId(readyPapers[0].id);
    }
  }, [readyPapers, paperId]);

  useEffect(() => {
    if (!paperId) return;
    setFetching(true);
    datasetsApi
      .extract(paperId)
      .then(setResult)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Extraction failed"))
      .finally(() => setFetching(false));
  }, [paperId]);

  return (
    <div>
      <PageHeader
        title="Datasets & methods"
        description="Deterministic extraction of datasets, algorithms and keywords, detected at indexing time."
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading…</p>
      ) : readyPapers.length === 0 ? (
        <Card className="p-10">
          <EmptyState text="Upload a paper first." linkText="Upload now." onLinkClick={() => navigate("/app/upload")} />
        </Card>
      ) : (
        <>
          <select
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            className="border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 bg-surface mb-6 max-w-md w-full"
          >
            {readyPapers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {fetching ? (
            <p className="text-sm text-ink-500">Scanning paper…</p>
          ) : result ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database size={17} className="text-brand-500" />
                  <p className="font-semibold text-ink-900">Datasets detected</p>
                </div>
                {result.datasets.length === 0 ? (
                  <p className="text-sm text-ink-500">No known datasets detected in this paper.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {result.datasets.map((d) => (
                      <Card key={d.name} className="p-4">
                        <p className="font-medium text-ink-900 text-sm">{d.name}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{d.mentions} mention{d.mentions > 1 ? "s" : ""}</p>
                        <div className="mt-2">
                          <ConfidenceBadge value={d.confidence} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={17} className="text-brand-500" />
                  <p className="font-semibold text-ink-900">Algorithms detected</p>
                </div>
                {result.algorithms.length === 0 ? (
                  <p className="text-sm text-ink-500">No known algorithms detected in this paper.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {result.algorithms.map((a) => (
                      <Card key={a.name} className="p-4">
                        <p className="font-medium text-ink-900 text-sm">{a.name}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{a.mentions} mention{a.mentions > 1 ? "s" : ""}</p>
                        <div className="mt-2">
                          <ConfidenceBadge value={a.confidence} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
