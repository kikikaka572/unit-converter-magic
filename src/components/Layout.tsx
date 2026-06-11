import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import ThemeToggle from "./ThemeToggle";
import TopBanner from "@/components/TopBanner";
import KakaoAdFit from "@/components/KakaoAdFit";
import SearchDialog from "@/components/SearchDialog";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumb?: ReactNode;
}

function BottomAdSlot() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile === null) return null;

  return (
    <div
      id="ad-slot-bottom"
      className="mx-auto max-w-3xl flex items-center justify-center pointer-events-auto"
      aria-label="ad"
    >
      {isMobile ? (
        <KakaoAdFit adUnit="DAN-6tTcPC6UlHze0Mjr" adWidth={320} adHeight={50} />
      ) : (
        <KakaoAdFit adUnit="DAN-rZBdEeZIqgjpI6x9" adWidth={728} adHeight={90} />
      )}
    </div>
  );
}

export default function Layout({ children, title, description, breadcrumb }: Props) {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const searchLabel =
    lang === "ko" ? "도구 검색..." : lang === "fr" ? "Rechercher..." : "Search tools...";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-28">
        <div className="w-full max-w-2xl">
          {/* Top utility row — Language / Theme / Search */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Search — desktop text pill */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={searchLabel}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-input rounded-lg bg-background hover:bg-accent hover:text-foreground transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searchLabel}</span>
              <kbd className="ml-1 pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {/* Search — mobile icon */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label={searchLabel}
                className="sm:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Logo / brand */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt="Lifetool 로고"
                className="h-12 sm:h-14 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Lifetool
              </span>
            </Link>
          </div>

          {/* Breadcrumb OR back link (sub-pages only) */}
          {!isHome && (
            breadcrumb ?? (
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
              >
                ← 홈으로
              </Link>
            )
          )}

          {/* Per-page header */}
          {(title || description) && (
            <div className="mb-6 sm:mb-8">
              {title && (
                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {title}
                  </h1>
                  <ShareButton title={title} variant="label" />
                </div>
              )}
              {description && (
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              )}
            </div>
          )}

          {/* Top banner (sub-pages only) */}
          {!isHome && <TopBanner slot="top" />}

          {children}

          {lang === "en" && (
            <p className="mt-10 text-center text-xs text-muted-foreground">
              {t("footer.foreignNotice")}
            </p>
          )}
        </div>
      </main>

      {/* Side ad slot - PC only (xl+) */}
      <aside
        className="hidden xl:block fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(1rem, calc((100vw - 42rem) / 2 - 180px))" }}
        aria-label="ad"
      >
        <KakaoAdFit adUnit="DAN-T9XQ5UbtP5nbv77q" adWidth={160} adHeight={600} />
      </aside>

      {/* Bottom sticky ad */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <BottomAdSlot />
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
