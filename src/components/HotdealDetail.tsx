import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Copy, Check } from "lucide-react";
import { getHotdealById, type Hotdeal } from "@/lib/hotdeals";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function HotdealDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Hotdeal | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setDeal(null);
        return;
      }
      try {
        const found = await getHotdealById(id);
        if (!cancelled) setDeal(found);
      } catch {
        if (!cancelled) setDeal(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `${SITE_URL}/hotdeals/${id}`;

  useSeo({
    title: deal ? `${deal.title} — Lifetool 핫딜` : "Hot Deal — Lifetool",
    description: deal?.description?.slice(0, 155) || deal?.title || "Lifetool 핫딜 상세",
    canonical: `${SITE_URL}/hotdeals/${id}`,
    jsonLd: deal
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: deal.title,
          description: deal.description || deal.title,
          image: deal.thumbnail_url || undefined,
          offers: {
            "@type": "Offer",
            url: deal.url,
            priceCurrency: "KRW",
            price: deal.price || undefined,
            availability: "https://schema.org/InStock",
          },
        }
      : undefined,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t("hotdeals.linkCopied") });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t("share.copyFail"), variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && deal) {
      try {
        await navigator.share({ title: deal.title, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  if (deal === undefined) {
    return <p className="text-center text-muted-foreground py-12">{t("hotdeals.loading")}</p>;
  }

  if (deal === null) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{t("hotdeals.notFound")}</p>
        <Link to="/hotdeals" className="inline-block text-primary font-semibold">
          {t("hotdeals.back")}
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-5">
      <Link to="/hotdeals" className="inline-block text-sm text-muted-foreground hover:text-foreground">
        {t("hotdeals.back")}
      </Link>

      {deal.thumbnail_url && (
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
          <img
            src={deal.thumbnail_url}
            alt={deal.title}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
          {deal.title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize font-medium">{t("hotdeals.source")}: {deal.source}</span>
          <span>·</span>
          <span>{new Date(deal.posted_at).toLocaleString()}</span>
          {deal.price && (
            <>
              <span>·</span>
              <span className="text-primary font-semibold">{deal.price}</span>
            </>
          )}
        </div>
      </header>

      {deal.description && (
        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
          {deal.description}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <ExternalLink className="w-4 h-4" />
          {t("hotdeals.viewOriginal")}
        </a>
        <button
          onClick={handleNativeShare}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-secondary text-foreground font-semibold hover:bg-muted"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {t("hotdeals.share")}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground mb-1">{t("share.linkLabel")}</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 px-3 py-2 border border-input rounded-lg text-xs bg-secondary text-foreground truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
          >
            {copied ? t("share.copied") : t("share.copy")}
          </button>
        </div>
      </div>
    </article>
  );
}
