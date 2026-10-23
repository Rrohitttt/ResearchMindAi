import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Button, Card } from "@/components/ui/primitives";
import { paperApi } from "@/lib/api";
import { usePapers } from "@/hooks/usePapers";

export default function UploadPapers() {
  const navigate = useNavigate();
  const { refresh } = usePapers();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      let successCount = 0;
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          toast.error(`${file.name} is not a PDF`);
          continue;
        }
        try {
          await paperApi.upload(file);
          successCount++;
        } catch (err) {
          toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
        }
      }
      setUploading(false);
      if (successCount > 0) {
        toast.success(`Indexed ${successCount} paper${successCount > 1 ? "s" : ""}`);
        await refresh();
      }
    },
    [refresh]
  );

  return (
    <div>
      <PageHeader
        title="Upload papers"
        description="Drop research PDFs here. Text is extracted, then chunked and embedded for retrieval-augmented answers."
        action={
          <Button variant="secondary" onClick={() => navigate("/app/library")}>
            Go to library
          </Button>
        }
      />

      <Card
        className={`border-2 border-dashed p-14 flex flex-col items-center justify-center text-center transition-colors ${
          dragActive ? "border-brand-400 bg-brand-50" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
          <UploadCloud size={22} className="text-brand-500" />
        </div>
        <p className="font-medium text-ink-900">
          {uploading ? "Uploading & processing…" : "Drag & drop PDFs, or click to browse"}
        </p>
        <p className="text-xs text-ink-400 mt-1.5">
          Up to 50 MB per file · multiple files supported · text-based PDFs only (no OCR)
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-5"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Card>
    </div>
  );
}
