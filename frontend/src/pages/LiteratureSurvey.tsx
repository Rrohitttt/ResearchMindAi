import { useState } from "react";
import SelectPapersPage from "@/components/ui/SelectPapersPage";
import { BookOpen } from "lucide-react";
import { literatureApi } from "@/lib/api";

export default function LiteratureSurvey() {
  const [topic, setTopic] = useState("");
  return (
    <SelectPapersPage
      title="Literature survey"
      description="Turn a group of papers into a structured survey: introduction, thematic synthesis, gaps and references."
      actionLabel="Draft survey"
      actionIcon={BookOpen}
      minPapers={2}
      maxPapers={6}
      extraControls={
        <div className="mb-1">
          <label className="text-sm font-semibold text-ink-900 block mb-1.5">Survey topic (optional)</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Vision transformers for medical imaging"
            className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>
      }
      onGenerate={async (paperIds) => {
        const res = await literatureApi.run(paperIds, topic || undefined);
        return { id: res.id, content: res.content };
      }}
    />
  );
}
