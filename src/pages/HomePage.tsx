import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Star } from "lucide-react";
import Layout from "@/components/Layout";
import GoogleAd from "@/components/GoogleAd";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";
import { loadHotdeals, type Hotdeal } from "@/lib/hotdeals";
import { supabase } from "@/lib/supabase";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentTools } from "@/hooks/useRecentTools";
import { TOOLS, type Tool } from "@/lib/tools";
import type { Lang } from "@/i18n/translations";

// ---- Shared types -----------------------------------------------------------

type CommunityPost = {
  id: string;
  title: string;
  author_name: string | null;
  created_at: string;
  comment_count: number | null;
};

// ---- Helpers ----------------------------------------------------------------

function timeAgo(iso: string, ko: boolean) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (ko) {
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---- UI components ----------------------------------------------------------

function SectionHeader({
  title,
  to,
  moreLabel,
}: {
  title: string;
  to: string;
  moreLabel: string;
}) {
  return (
    <div className="flex items-end justify-between mb-3 border-b border-border pb-2">
      <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h2>
      <Link to={to} className="text-xs text-muted-foreground hover:text-primary">
        {moreLabel} →
      </Link>
    </div>
  );
}

function PlainSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 border-b border-border pb-2">
      <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h2>
    </div>
  );
}

function ToolCardItem({
  tool,
  isFav,
  onToggleFav,
}: {
  tool: Tool;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const { t } = useLanguage();
  const title = t(tool.titleKey as Parameters<typeof t>[0]);
  const desc = t(tool.descKey as Parameters<typeof t>[0]);

  return (
    <div className="relative group">
      <Link
        to={tool.path}
        className="block rounded-2xl overflow-hidden border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className={`${tool.gradient} flex items-center justify-center h-28 sm:h-32`}>
          <span className="text-5xl sm:text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
            {tool.emoji}
          </span>
        </div>
        <div className="px-3 py-2.5 bg-card">
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-foreground text-sm leading-tight truncate">
              {title}
            </div>
            {tool.badge && (
              <span
                className={`shrink-0 px-1 py-0.5 text-[10px] font-bold rounded uppercase leading-none ${
                  tool.badge === "hot"
                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                    : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                }`}
              >
                {tool.badge}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
            {desc}
          </div>
        </div>
      </Link>

      {/* Favorite toggle — always visible on mobile, hover-only on desktop */}
      <button
        onClick={onToggleFav}
        aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150
          ${
            isFav
              ? "opacity-100 bg-black/30"
              : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 bg-black/20 active:bg-black/40 sm:hover:bg-black/40"
          }`}
      >
        <Star
          className={`w-4 h-4 transition-all duration-150 ${
            isFav ? "fill-yellow-400 text-yellow-400" : "text-white/80"
          }`}
        />
      </button>
    </div>
  );
}

function RecentChip({ tool }: { tool: Tool }) {
  const { t } = useLanguage();
  return (
    <Link
      to={tool.path}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm hover:border-primary/50 hover:bg-accent transition-colors"
    >
      <span className="text-base">{tool.emoji}</span>
      <span className="text-foreground font-medium text-xs whitespace-nowrap">
        {t(tool.titleKey as Parameters<typeof t>[0])}
      </span>
    </Link>
  );
}

// ---- Page -------------------------------------------------------------------

const AI_TOOLS = TOOLS.filter((t) => t.category === "ai");
const FR_TOOLS = TOOLS.filter((t) => t.category === "fr");
const CALC_TOOLS = TOOLS.filter((t) => ["finance", "life", "unit", "etc"].includes(t.category));

export default function HomePage() {
  const { t, lang } = useLanguage();
  const ko = lang === "ko";
  const { toggle, isFav, favorites } = useFavorites();
  const { recents } = useRecentTools();

  useSeo({
    title: ko
      ? "Lifetool — 연봉·실생활·단위 계산기"
      : "Lifetool — Salary, Life & Unit Calculators",
    description: ko
      ? "연봉 실수령액, 실생활 계산, 단위 환산을 한 곳에서."
      : "Salary, life, and unit calculators all in one place.",
    canonical: `${SITE_URL}/`,
  });

  const [deals, setDeals] = useState<Hotdeal[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    loadHotdeals()
      .then(({ deals }) => setDeals(deals.slice(0, 2)))
      .catch(() => setDeals([]));

    supabase
      .from("posts")
      .select("id, title, author_name, created_at, comment_count")
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2)
      .then(({ data }) => setPosts((data as CommunityPost[]) || []));
  }, []);

  const moreLabel = ko ? "더보기" : lang === "fr" ? "Plus" : "More";
  const favTools = TOOLS.filter((tool) => favorites.includes(tool.path));
  const recentTools = recents
    .map((path) => TOOLS.find((t) => t.path === path))
    .filter((t): t is Tool => t !== undefined);

  const recentLabel = (l: Lang) =>
    l === "ko" ? "최근 사용" : l === "fr" ? "Récents" : "Recently Used";
  const favLabel = (l: Lang) =>
    l === "ko" ? "⭐ 즐겨찾기" : l === "fr" ? "⭐ Favoris" : "⭐ Favorites";

  const renderCard = (tool: Tool) => (
    <ToolCardItem
      key={tool.id}
      tool={tool}
      isFav={isFav(tool.path)}
      onToggleFav={() => toggle(tool.path)}
    />
  );

  return (
    <Layout>
      <div className="space-y-8">

        {/* 최근 사용 */}
        {recentTools.length > 0 && (
          <section>
            <PlainSectionHeader title={recentLabel(lang)} />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {recentTools.map((tool) => (
                <RecentChip key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* 즐겨찾기 */}
        {favTools.length > 0 && (
          <section>
            <PlainSectionHeader title={favLabel(lang)} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {favTools.map(renderCard)}
            </div>
          </section>
        )}

        {/* 핫딜 */}
        <section>
          <SectionHeader title={ko ? "핫딜" : "Hot Deals"} to="/hotdeals" moreLabel={moreLabel} />
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {ko ? "표시할 핫딜이 없습니다." : "No deals available."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deals.map((d) => (
                <div key={d.id} className="p-3 rounded-xl border border-border bg-card">
                  <Link to={`/hotdeals/${d.id}`} className="block">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                      {d.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span className="capitalize font-medium">{d.source}</span>
                    <span>·</span>
                    <span>{timeAgo(d.posted_at, ko)}</span>
                  </div>
                  <div className="mt-2">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {ko ? "원본 보기" : "View original"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <GoogleAd slot="REPLACE_WITH_SLOT_ID" className="w-full" />

        {/* 커뮤니티 */}
        <section>
          <SectionHeader
            title={ko ? "커뮤니티" : "Community"}
            to="/community"
            moreLabel={moreLabel}
          />
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {ko ? "게시글이 없습니다." : "No posts yet."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to={`/community/${p.id}`}
                  className="block p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                    {p.title}
                    {p.comment_count ? (
                      <span className="ml-1.5 text-xs text-primary font-bold">
                        [{p.comment_count}]
                      </span>
                    ) : null}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{p.author_name || (ko ? "익명" : "Anonymous")}</span>
                    <span>·</span>
                    <span>{timeAgo(p.created_at, ko)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <GoogleAd slot="REPLACE_WITH_SLOT_ID" className="w-full" />

        {/* AI 도구 */}
        <section>
          <PlainSectionHeader title="AI" />
          <div className="grid grid-cols-2 gap-3">{AI_TOOLS.map(renderCard)}</div>
        </section>

        {/* France */}
        <section>
          <PlainSectionHeader title="🇫🇷 France" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{FR_TOOLS.map(renderCard)}</div>
        </section>

        {/* 계산기 */}
        <section>
          <PlainSectionHeader
            title={ko ? "계산기" : lang === "fr" ? "Calculateurs" : "Calculators"}
          />
          <div className="grid grid-cols-2 gap-3">{CALC_TOOLS.map(renderCard)}</div>
        </section>

      </div>
    </Layout>
  );
}
