import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import TopBanner from "@/components/TopBanner";
import KakaoAdFit from "@/components/KakaoAdFit";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
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

export default function Layout({ children, title, description }: Props) {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-28">
        <div className="w-full max-w-2xl">
          {/* Top thin utility row — Language / Share */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <LanguageSwitcher />
            <ShareButton />
          </div>
          {/* Logo / brand area */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt="Lifetool 로고"
                className="h-12 sm:h-14 w-auto object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Lifetool
              </span>
            </Link>
          </div>
          {/* Back to home (sub-pages only) */}
          {!isHome && (
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"
            >
              ← 홈으로
            </Link>
          )}
          {/* Per-page header */}
          {(title || description) && (
            <div className="mb-6 sm:mb-8">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              )}
            </div>
          )}
          {/* 상단 띠배너 광고 */}
          <TopBanner slot="top" />
          {children}
          {lang === "en" && (
            <p className="mt-10 text-center text-xs text-muted-foreground">
              {t("footer.foreignNotice")}
            </p>
          )}
        </div>
      </main>

      {/* Side ad slot - PC only (xl 이상) */}
      <aside
        className="hidden xl:block fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(1rem, calc((100vw - 42rem) / 2 - 180px))" }}
        aria-label="ad"
      >
        <KakaoAdFit adUnit="DAN-T9XQ5UbtP5nbv77q" adWidth={160} adHeight={600} />
      </aside>

      {/* Bottom sticky ad slot */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <BottomAdSlot />
      </div>
    </div>
  );
}
