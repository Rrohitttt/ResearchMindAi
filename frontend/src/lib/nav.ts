import {
  LayoutGrid,
  Upload,
  Library,
  Search,
  MessageSquare,
  FileText,
  GitCompare,
  BookOpen,
  Sparkles,
  LayoutPanelLeft,
  Presentation,
  BrainCircuit,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", path: "/app", icon: LayoutGrid },
      { label: "Upload papers", path: "/app/upload", icon: Upload },
      { label: "Library", path: "/app/library", icon: Library },
      { label: "Semantic search", path: "/app/search", icon: Search },
    ],
  },
  {
    title: "AI analysis",
    items: [
      { label: "Research chat", path: "/app/chat", icon: MessageSquare },
      { label: "Summaries", path: "/app/summaries", icon: FileText },
      { label: "Compare papers", path: "/app/compare", icon: GitCompare },
      { label: "Literature survey", path: "/app/literature", icon: BookOpen },
      { label: "Research gaps", path: "/app/gaps", icon: Sparkles },
      { label: "Datasets & methods", path: "/app/datasets", icon: LayoutPanelLeft },
    ],
  },
  {
    title: "Deliverables",
    items: [
      { label: "Slide decks", path: "/app/slides", icon: Presentation },
      { label: "Viva questions", path: "/app/viva", icon: BrainCircuit },
      { label: "History", path: "/app/history", icon: History },
      { label: "Settings", path: "/app/settings", icon: Settings },
    ],
  },
];
