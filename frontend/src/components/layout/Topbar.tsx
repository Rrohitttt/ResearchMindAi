import { PanelLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

export default function Topbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <header className="h-[60px] shrink-0 border-b border-border bg-surface flex items-center justify-between px-5 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="text-ink-500 hover:text-ink-900 hover:bg-page rounded-md p-1.5 transition-colors"
        >
          <PanelLeft size={19} />
        </button>
        <span className="text-[15px] font-medium text-ink-700">ResearchMind AI</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 px-2.5 py-1.5 rounded-md hover:bg-page transition-colors"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </header>
  );
}
