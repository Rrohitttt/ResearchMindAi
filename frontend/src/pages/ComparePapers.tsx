import SelectPapersPage from "@/components/ui/SelectPapersPage";
import { GitCompare } from "lucide-react";
import { compareApi } from "@/lib/api";

export default function ComparePapers() {
  return (
    <SelectPapersPage
      title="Compare papers"
      description="Select exactly two papers to get a dimension-by-dimension comparison table plus a head-to-head analysis."
      actionLabel="Compare papers"
      actionIcon={GitCompare}
      minPapers={2}
      maxPapers={2}
      onGenerate={async (paperIds) => {
        const res = await compareApi.run(paperIds);
        return { id: res.id, content: res.content };
      }}
    />
  );
}
