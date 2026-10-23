import { Link } from "react-router-dom";
import { Brain, Upload, MessageSquare, FileText, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Upload, title: "Upload & index", desc: "Drop in PDFs — text is extracted, chunked, and embedded automatically." },
  { icon: MessageSquare, title: "Ask your papers", desc: "RAG-grounded chat that cites the passages behind every answer." },
  { icon: FileText, title: "Summarize instantly", desc: "Short, detailed, bulleted, or technical summaries on demand." },
  { icon: Sparkles, title: "Built to grow", desc: "Comparison, literature surveys, viva prep, and slide decks — coming next." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-page">
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-semibold text-ink-900">ResearchMind AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-ink-700 hover:text-ink-900 px-3 py-2">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 tracking-tight">
          Your research papers, made conversational.
        </h1>
        <p className="text-ink-500 text-lg mt-5 max-w-xl mx-auto">
          Upload PDFs, ask grounded questions, and generate summaries — powered by
          retrieval-augmented generation running on your own local LLM.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            to="/register"
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-3 rounded-xl transition-colors"
          >
            Create free account
          </Link>
          <Link
            to="/login"
            className="bg-surface border border-border text-ink-700 font-medium px-5 py-3 rounded-xl hover:bg-page transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-surface border border-border rounded-2xl shadow-card p-5">
            <f.icon size={19} className="text-brand-500 mb-3" />
            <p className="font-semibold text-ink-900 text-[15px]">{f.title}</p>
            <p className="text-sm text-ink-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-ink-400">
        ResearchMind AI · RAG-powered research assistant
      </footer>
    </div>
  );
}
