import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

type Tool = {
  to: string;
  emoji: string;
  titleKey: "header.salary.title" | "header.life.title" | "header.converter.title";
  descKey: "header.salary.desc" | "header.life.desc" | "header.converter.desc";
};

const TOOLS: Tool[] = [
  { to: "/salary", emoji: "💼", titleKey: "header.salary.title", descKey: "header.salary.desc" },
  { to: "/life", emoji: "🧮", titleKey: "header.life.title", descKey: "header.life.desc" },
  { to: "/converter", emoji: "📐", titleKey: "header.converter.title", descKey: "header.converter.desc" },
];

export default function HomePage() {
  const { t } = useLanguage();
  useSeo({
    title: "Lifetool — 연봉·실생활·단위 계산기",
    description: "연봉 실수령액, 실생활 계산, 단위 환산을 한 곳에서.",
    canonical: `${SITE_URL}/`,
  });
  return (
    <Layout>
      <div className="grid gap-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
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
        <div className="mt-2 text-center text-xs text-muted-foreground">
          더 많은 기능이 곧 추가됩니다 ✨
        </div>
      </div>
    </Layout>
  );
}
