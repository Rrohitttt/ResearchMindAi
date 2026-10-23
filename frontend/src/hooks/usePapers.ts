import { useCallback, useEffect, useState } from "react";
import { paperApi, Paper } from "@/lib/api";

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paperApi.list();
      setPapers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const readyPapers = papers.filter((p) => p.status === "ready");

  return { papers, readyPapers, loading, refresh };
}
