import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
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
import CommunityHotPage from "./pages/CommunityHotPage";
import HomePage from "./pages/HomePage";
import PromptGeneratorPage from "./pages/PromptGeneratorPage";
import VideoPromptGeneratorPage from "./pages/VideoPromptGeneratorPage";
import TVAPage from "./pages/TVAPage";
import FrSalaryPage from "./pages/FrSalaryPage";
import CurrencyPage from "./pages/CurrencyPage";
import SizePage from "./pages/SizePage";
import RulerPage from "./pages/RulerPage";
import LifeHourlyWagePage from "./pages/LifeHourlyWagePage";
import LifeFuelPage from "./pages/LifeFuelPage";
import LifeParcelPage from "./pages/LifeParcelPage";
import LifeInteriorPage from "./pages/LifeInteriorPage";
import LifeCaloriePage from "./pages/LifeCaloriePage";
import LifeElectricityPage from "./pages/LifeElectricityPage";
import LifeWaterPage from "./pages/LifeWaterPage";
import LifeGasPage from "./pages/LifeGasPage";
import LifeMovingPage from "./pages/LifeMovingPage";
import LifeDdayPage from "./pages/LifeDdayPage";
import SpinPage from "./pages/SpinPage";

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
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
            <Route path="/life/hourly-wage" element={<LifeHourlyWagePage />} />
            <Route path="/life/fuel" element={<LifeFuelPage />} />
            <Route path="/life/parcel" element={<LifeParcelPage />} />
            <Route path="/life/interior" element={<LifeInteriorPage />} />
            <Route path="/life/calorie" element={<LifeCaloriePage />} />
            <Route path="/life/electricity" element={<LifeElectricityPage />} />
            <Route path="/life/water" element={<LifeWaterPage />} />
            <Route path="/life/gas" element={<LifeGasPage />} />
            <Route path="/life/moving" element={<LifeMovingPage />} />
            <Route path="/life/dday" element={<LifeDdayPage />} />
            <Route path="/converter" element={<ConverterPage />} />
            <Route path="/hotdeals" element={<HotdealsPage />} />
            <Route path="/hotdeals/:id" element={<HotdealDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:id" element={<CommunityPostPage />} />
            <Route path="/community-hot" element={<CommunityHotPage />} />
            <Route path="/prompt-generator" element={<PromptGeneratorPage />} />
            <Route path="/video-prompt" element={<VideoPromptGeneratorPage />} />
            <Route path="/tva" element={<TVAPage />} />
            <Route path="/fr-salary" element={<FrSalaryPage />} />
            <Route path="/currency" element={<CurrencyPage />} />
            <Route path="/size" element={<SizePage />} />
            <Route path="/ruler" element={<RulerPage />} />
            <Route path="/spin" element={<SpinPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
