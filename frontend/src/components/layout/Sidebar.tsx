import { NavLink } from "react-router-dom";
import { Brain } from "lucide-react";
import clsx from "clsx";
import { NAV_SECTIONS } from "@/lib/nav";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <aside className="w-[272px] shrink-0 border-r border-border bg-surface flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
          <Brain size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-ink-900 text-[15px]">ResearchMind AI</p>
          <p className="text-xs text-ink-400">Research copilot</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/app"}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-activeNav text-ink-900 font-medium"
                        : "text-ink-700 hover:bg-page"
                    )
                  }
                >
                  <item.icon size={17} strokeWidth={2} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
