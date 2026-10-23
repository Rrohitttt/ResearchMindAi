import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import UploadPapers from "@/pages/UploadPapers";
import Library from "@/pages/Library";
import SemanticSearch from "@/pages/SemanticSearch";
import ResearchChat from "@/pages/ResearchChat";
import Summaries from "@/pages/Summaries";
import ComparePapers from "@/pages/ComparePapers";
import LiteratureSurvey from "@/pages/LiteratureSurvey";
import ResearchGaps from "@/pages/ResearchGaps";
import DatasetsMethods from "@/pages/DatasetsMethods";
import SlideDecks from "@/pages/SlideDecks";
import VivaQuestions from "@/pages/VivaQuestions";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<UploadPapers />} />
        <Route path="library" element={<Library />} />
        <Route path="search" element={<SemanticSearch />} />
        <Route path="chat" element={<ResearchChat />} />
        <Route path="summaries" element={<Summaries />} />
        <Route path="compare" element={<ComparePapers />} />
        <Route path="literature" element={<LiteratureSurvey />} />
        <Route path="gaps" element={<ResearchGaps />} />
        <Route path="datasets" element={<DatasetsMethods />} />
        <Route path="slides" element={<SlideDecks />} />
        <Route path="viva" element={<VivaQuestions />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
