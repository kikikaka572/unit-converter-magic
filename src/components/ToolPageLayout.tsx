import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TOOLS, CATEGORY_LABELS, toolsByCategory, toolById, type Tool } from "@/lib/tools";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";
import { useRecentTools } from "@/hooks/useRecentTools";
import type { Lang } from "@/i18n/translations";

interface Props {
  toolId: string;
  children: ReactNode;
}

function RelatedCard({ tool, lang }: { tool: Tool; lang: Lang }) {
  const { t } = useLanguage();
  return (
    <Link
      to={tool.path}
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-150"
    >
      <div className={`${tool.gradient} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
        <span className="text-xl">{tool.emoji}</span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {t(tool.titleKey as Parameters<typeof t>[0])}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {t(tool.descKey as Parameters<typeof t>[0])}
        </div>
      </div>
    </Link>
  );
}

export default function ToolPageLayout({ toolId, children }: Props) {
  const tool = toolById(toolId);
  const { t, lang } = useLanguage();
  const { push } = useRecentTools();

  const title = tool ? t(tool.titleKey as Parameters<typeof t>[0]) : "";
  const desc = tool ? t(tool.descKey as Parameters<typeof t>[0]) : "";

  useSeo({
    title: title ? `${title} — Lifetool` : "Lifetool",
    description: desc,
    canonical: tool ? `${SITE_URL}${tool.path}` : undefined,
  });

  useEffect(() => {
    if (tool) push(tool.path);
  }, [tool?.path]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryLabel = tool ? CATEGORY_LABELS[tool.category][lang] : "";

  const related = tool
    ? toolsByCategory(tool.category)
        .filter((t) => t.id !== toolId)
        .slice(0, 4)
    : [];

  const breadcrumb = tool ? (
    <Breadcrumb className="mb-4 text-xs">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              {lang === "ko" ? "홈" : lang === "fr" ? "Accueil" : "Home"}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <span className="text-muted-foreground">{categoryLabel}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-foreground font-medium">{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ) : null;

  const relatedHeading =
    lang === "ko" ? "관련 도구" : lang === "fr" ? "Outils similaires" : "Related Tools";

  return (
    <Layout title={title} description={desc} breadcrumb={breadcrumb}>
      {children}

      {related.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {relatedHeading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {related.map((t) => (
              <RelatedCard key={t.id} tool={t} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
