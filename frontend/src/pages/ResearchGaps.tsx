import SelectPapersPage from "@/components/ui/SelectPapersPage";
import { Sparkles } from "lucide-react";
import { gapsApi } from "@/lib/api";

export default function ResearchGaps() {
  return (
    <SelectPapersPage
      title="Research gap analysis"
      description="Act like a reviewer: surface limitations with evidence, concrete improvements and researchable next steps."
      actionLabel="Find research gaps"
      actionIcon={Sparkles}
      minPapers={1}
      maxPapers={6}
      onGenerate={async (paperIds) => {
        const res = await gapsApi.run(paperIds);
        return { id: res.id, content: res.content };
      }}
    />
  );
}
