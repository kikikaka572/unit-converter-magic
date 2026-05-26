import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import GoogleAd from "@/components/GoogleAd";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";
import { loadHotdeals, type Hotdeal } from "@/lib/hotdeals";
import { supabase } from "@/lib/supabase";

type Tool = {
  to: string;
  emoji: string;
  titleKey: "header.salary.title" | "header.life.title" | "header.converter.title";
  descKey: "header.salary.desc" | "header.life.desc" | "header.converter.desc";
};

type AiTool = {
  to: string;
  emoji: string;
  titleKey: "header.prompt.title" | "header.videoprompt.title";
  descKey: "header.prompt.desc" | "header.videoprompt.desc";
};

const AI_TOOLS: AiTool[] = [
  { to: "/prompt-generator", emoji: "✨", titleKey: "header.prompt.title",      descKey: "header.prompt.desc" },
  { to: "/video-prompt",     emoji: "🎬", titleKey: "header.videoprompt.title", descKey: "header.videoprompt.desc" },
];

const TOOLS: Tool[] = [
  { to: "/salary",    emoji: "💼", titleKey: "header.salary.title",    descKey: "header.salary.desc" },
  { to: "/life",      emoji: "🧮", titleKey: "header.life.title",      descKey: "header.life.desc" },
  { to: "/converter", emoji: "📐", titleKey: "header.converter.title", descKey: "header.converter.desc" },
];

type CommunityPost = {
  id: string;
  title: string;
  author_name: string | null;
  created_at: string;
  comment_count: number | null;
};

function timeAgo(iso: string, ko: boolean) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (ko) {
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  } else {
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}

function SectionHeader({ title, to, moreLabel }: { title: string; to: string; moreLabel: string }) {
  return (
    <div className="flex items-end justify-between mb-3 border-b border-border pb-2">
      <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{title}</h2>
      <Link to={to} className="text-xs text-muted-foreground hover:text-primary">{moreLabel} →</Link>
    </div>
  );
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  const ko = lang === "ko";

  useSeo({
    title: ko ? "Lifetool — 연봉·실생활·단위 계산기" : "Lifetool — Salary, Life & Unit Calculators",
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* 핫딜 */}
        <section>
          <SectionHeader
            title={ko ? "핫딜" : "Hot Deals"}
            to="/hotdeals"
            moreLabel={ko ? "더보기" : "More"}
          />
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

        {/* 광고 */}
        <GoogleAd slot="REPLACE_WITH_SLOT_ID" className="w-full" />

        {/* 커뮤니티 */}
        <section>
          <SectionHeader
            title={ko ? "커뮤니티" : "Community"}
            to="/community"
            moreLabel={ko ? "더보기" : "More"}
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
                      <span className="ml-1.5 text-xs text-primary font-bold">[{p.comment_count}]</span>
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

        {/* 광고 */}
        <GoogleAd slot="REPLACE_WITH_SLOT_ID" className="w-full" />

        {/* AI */}
        <section>
          <div className="flex items-end justify-between mb-3 border-b border-border pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">AI</h2>
          </div>
          <div className="grid gap-3">
            {AI_TOOLS.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="text-3xl">{tool.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground text-base sm:text-lg truncate">
                    {t(tool.titleKey)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {t(tool.descKey)}
                  </div>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 계산기 */}
        <section>
          <div className="flex items-end justify-between mb-3 border-b border-border pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {ko ? "계산기" : "Calculators"}
            </h2>
          </div>
          <div className="grid gap-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="text-3xl">{tool.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground text-base sm:text-lg truncate">
                    {t(tool.titleKey)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {t(tool.descKey)}
                  </div>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
