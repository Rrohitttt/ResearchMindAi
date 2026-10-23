import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MessageSquare, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import clsx from "clsx";
import { PageHeader, Card, EmptyState } from "@/components/ui/primitives";
import { usePapers } from "@/hooks/usePapers";
import { chatApi, SourceChunk } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
}

export default function ResearchChat() {
  const navigate = useNavigate();
  const { readyPapers, loading } = usePapers();
  const [scope, setScope] = useState<string>("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setSending(true);
    try {
      const res = await chatApi.ask(message, scope === "all" ? undefined : scope);
      setMessages((m) => [...m, { role: "assistant", content: res.answer, sources: res.sources }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get a response");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div>
      <PageHeader
        title="Research chat"
        description="Answers are grounded in the retrieved passages of your papers and cite them as [Source N]."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-190px)]">
        <Card className="p-4 h-fit">
          <p className="text-sm font-semibold text-ink-900 mb-3">
            Scope ({scope === "all" ? "all papers" : "1 paper"})
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
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setScope("all")}
                className={clsx(
                  "text-left text-sm px-3 py-2 rounded-lg transition-colors",
                  scope === "all" ? "bg-activeNav font-medium text-ink-900" : "text-ink-700 hover:bg-page"
                )}
              >
                All papers
              </button>
              {readyPapers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setScope(p.id)}
                  className={clsx(
                    "text-left text-sm px-3 py-2 rounded-lg truncate transition-colors",
                    scope === p.id ? "bg-activeNav font-medium text-ink-900" : "text-ink-700 hover:bg-page"
                  )}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-ink-500">Ask anything — "What datasets are used and why?"</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((m, i) => (
                  <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={clsx(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        m.role === "user" ? "bg-brand-500 text-white" : "bg-page text-ink-900"
                      )}
                    >
                      <div className="prose prose-sm max-w-none prose-p:my-1.5">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                      {m.role === "assistant" && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                          {m.sources && m.sources.length > 0 && (
                            <span className="text-xs text-ink-400">
                              {m.sources.length} source{m.sources.length > 1 ? "s" : ""}
                            </span>
                          )}
                          <button
                            onClick={() => copyMessage(m.content, i)}
                            className="text-ink-400 hover:text-ink-700 ml-auto"
                          >
                            {copiedIdx === i ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-page rounded-2xl px-4 py-3 text-sm text-ink-400">Thinking…</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border p-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={readyPapers.length === 0}
              placeholder={
                readyPapers.length === 0 ? "Upload a paper to start chatting…" : "Ask a question about your papers…"
              }
              className="flex-1 border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 disabled:bg-page"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || readyPapers.length === 0}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl p-2.5 transition-colors"
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
