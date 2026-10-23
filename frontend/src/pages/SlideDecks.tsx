import { useState } from "react";
import SelectPapersPage from "@/components/ui/SelectPapersPage";
import { Presentation } from "lucide-react";
import { presentationApi } from "@/lib/api";

export default function SlideDecks() {
  const [slides, setSlides] = useState(10);
  return (
    <SelectPapersPage
      title="Slide deck generator"
      description="Generate a defence-ready deck outline: title, problem, objectives, method, architecture, results, conclusion — with speaker notes."
      actionLabel="Build deck outline"
      actionIcon={Presentation}
      minPapers={1}
      maxPapers={6}
      extraControls={
        <div className="mb-1">
          <label className="text-sm font-semibold text-ink-900 block mb-1.5">Slides: {slides}</label>
          <input
            type="range"
            min={5}
            max={20}
            value={slides}
            onChange={(e) => setSlides(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>
      }
      onGenerate={async (paperIds) => {
        const res = await presentationApi.run(paperIds, slides);
        return { id: res.id, content: res.content };
      }}
    />
  );
}
