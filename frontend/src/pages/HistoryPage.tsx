import { useEffect, useState } from "react";
import { MessageSquare, FileText, GitCompare, BookOpen, Sparkles, Presentation, BrainCircuit, History as HistoryIcon } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Card } from "@/components/ui/primitives";
import { historyApi, HistoryItem } from "@/lib/api";

const TYPE_ICONS: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  summary: FileText,
  compare: GitCompare,
  literature: BookOpen,
  gaps: Sparkles,
  presentation: Presentation,
  viva: BrainCircuit,
};

const TYPE_LABELS: Record<string, string> = {
  chat: "Chat",
  summary: "Summary",
  compare: "Comparison",
  literature: "Literature survey",
  gaps: "Research gaps",
  presentation: "Slide deck",
  viva: "Viva questions",
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    historyApi
      .list()
      .then(setItems)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load history"));
  }, []);

  return (
    <div>
      <PageHeader title="History" description="Previous chats, summaries, comparisons, and generated deliverables." />

      {items === null ? (
        <p className="text-sm text-ink-500">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <HistoryIcon size={22} className="text-brand-500 mb-3" />
          <p className="text-sm text-ink-500">Nothing here yet — your activity will show up as you use ResearchMind AI.</p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {items.map((item) => {
              const Icon = TYPE_ICONS[item.type] || Sparkles;
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                  <Icon size={17} className="text-brand-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{item.title}</p>
                    <p className="text-xs text-ink-400">{TYPE_LABELS[item.type] || item.type}</p>
                  </div>
                  <span className="text-xs text-ink-400 shrink-0">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
