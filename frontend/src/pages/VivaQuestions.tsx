import { useState } from "react";
import SelectPapersPage from "@/components/ui/SelectPapersPage";
import { BrainCircuit } from "lucide-react";
import { vivaApi } from "@/lib/api";

export default function VivaQuestions() {
  const [count, setCount] = useState(5);
  return (
    <SelectPapersPage
      title="Viva & defence prep"
      description="Generate graded questions with model answers, drawn strictly from the selected papers."
      actionLabel="Generate questions"
      actionIcon={BrainCircuit}
      minPapers={1}
      maxPapers={6}
      extraControls={
        <div className="mb-1">
          <label className="text-sm font-semibold text-ink-900 block mb-1.5">Questions per level: {count}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
      }
      onGenerate={async (paperIds) => {
        const res = await vivaApi.run(paperIds, count);
        return { id: res.id, content: res.content };
      }}
    />
  );
}
