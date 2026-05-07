import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { LanguageProvider } from "./i18n/LanguageContext";
import SalaryPage from "./pages/SalaryPage";
import LifePage from "./pages/LifePage";
import ConverterPage from "./pages/ConverterPage";
import HotdealsPage from "./pages/HotdealsPage";
import HotdealDetailPage from "./pages/HotdealDetailPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityPostPage from "./pages/CommunityPostPage";
import HomePage from "./pages/HomePage";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

// Legacy ?tab=xxx redirect for old shared links
const LegacyRedirect = () => {
  if (typeof window !== "undefined") {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "life") return <Navigate to="/life" replace />;
    if (tab === "converter") return <Navigate to={`/converter${window.location.search}`} replace />;
    if (tab === "salary") return <Navigate to="/salary" replace />;
  }
  return <HomePage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<LegacyRedirect />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/life" element={<LifePage />} />
            <Route path="/converter" element={<ConverterPage />} />
            <Route path="/hotdeals" element={<HotdealsPage />} />
            <Route path="/hotdeals/:id" element={<HotdealDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:id" element={<CommunityPostPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
