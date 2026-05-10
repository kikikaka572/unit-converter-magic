import { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import { useLanguage } from "@/i18n/LanguageContext";

type SecondaryLink = {
  to: string;
  emoji: string;
  labelKey: "tab.hotdeals" | "tab.community";
};

const SECONDARY_LINKS: SecondaryLink[] = [
  { to: "/hotdeals", emoji: "🔥", labelKey: "tab.hotdeals" },
  { to: "/community", emoji: "💬", labelKey: "tab.community" },
];

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: Props) {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");
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

          {/* Logo / brand area (supports optional image at /logo.png) */}
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

          {children}

          {lang === "en" && (
            <p className="mt-10 text-center text-xs text-muted-foreground">
              {t("footer.foreignNotice")}
            </p>
          )}
        </div>
      </main>

      {/* Side ad slot - PC only */}
      <aside
        className="hidden xl:block fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(1rem, calc((100vw - 42rem) / 2 - 180px))" }}
        aria-label="ad"
      >
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit="DAN-T9XQ5UbtP5nbv77q"
          data-ad-width="160"
          data-ad-height="600"
        />
      </aside>

      {/* Bottom ad slot */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div
          id="ad-slot-bottom"
          className="mx-auto max-w-3xl h-[60px] sm:h-[100px] flex items-center justify-center pointer-events-none"
          aria-label="ad"
        >
          <ins
            className="kakao_ad_area sm:hidden pointer-events-auto"
            style={{ display: "none" }}
            data-ad-unit="DAN-6tTcPC6UlHze0Mjr"
            data-ad-width="320"
            data-ad-height="50"
          />
          <ins
            className="kakao_ad_area hidden sm:inline-block pointer-events-auto"
            style={{ display: "none" }}
            data-ad-unit="DAN-rZBdEeZIqgjpI6x9"
            data-ad-width="728"
            data-ad-height="90"
          />
        </div>
      </div>
    </div>
  );
}
