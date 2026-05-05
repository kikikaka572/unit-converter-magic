import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Share2, RefreshCw } from "lucide-react";
import { getSupabase, type Hotdeal } from "@/lib/hotdeals";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

// Sample fallback so UI works even without DB set up
const SAMPLE: Hotdeal[] = [
  {
    id: "sample-1",
    external_id: "sample-1",
    source: "ppomppu",
    title: "[샘플] 핫딜 게시판이 비어있어요 — 백엔드 설정을 완료해주세요",
    url: "https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu",
    thumbnail_url: null,
    description: "Supabase에 hotdeals 테이블을 만들고 RSS 수집 함수를 배포하면 자동으로 채워집니다.",
    price: null,
    category: "etc",
    posted_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
  },
];

function timeAgo(iso: string, lang: "ko" | "en") {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return lang === "ko" ? "방금 전" : "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}${lang === "ko" ? "분 전" : "m ago"}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${lang === "ko" ? "시간 전" : "h ago"}`;
  return `${Math.floor(diff / 86400)}${lang === "ko" ? "일 전" : "d ago"}`;
}

export default function HotdealsList() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Hotdeal[] | null>(null);
  const [source, setSource] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const supabase = getSupabase();
    if (!supabase) {
      setDeals(SAMPLE);
      setRefreshing(false);
      return;
    }
    const { data, error } = await supabase
      .from("hotdeals")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(100);
    if (error || !data || data.length === 0) {
      setDeals(SAMPLE);
    } else {
      setDeals(data as Hotdeal[]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sources = useMemo(() => {
    if (!deals) return [];
    return Array.from(new Set(deals.map((d) => d.source)));
  }, [deals]);

  const filtered = useMemo(() => {
    if (!deals) return [];
    return source === "all" ? deals : deals.filter((d) => d.source === source);
  }, [deals, source]);

  const handleQuickShare = async (deal: Hotdeal) => {
    const url = `${window.location.origin}/hotdeals/${deal.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.title, url });
        return;
      } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t("hotdeals.linkCopied") });
    } catch {
      toast({ title: t("share.copyFail"), variant: "destructive" });
    }
  };

  if (deals === null) {
    return <p className="text-center text-muted-foreground py-12">{t("hotdeals.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSource("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            source === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {t("hotdeals.allCategories")}
        </button>
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors capitalize ${
              source === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={load}
          disabled={refreshing}
          className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label={t("hotdeals.refresh")}
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          {t("hotdeals.refresh")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("hotdeals.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((deal) => (
            <li
              key={deal.id}
              className="flex gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <Link
                to={`/hotdeals/${deal.id}`}
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-secondary flex items-center justify-center"
              >
                {deal.thumbnail_url ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img
                    src={deal.thumbnail_url}
                    alt={deal.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🔥</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/hotdeals/${deal.id}`} className="block">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-snug">
                    {deal.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize font-medium">{deal.source}</span>
                  <span>·</span>
                  <span>{timeAgo(deal.posted_at, lang)}</span>
                  {deal.price && (
                    <>
                      <span>·</span>
                      <span className="text-primary font-semibold">{deal.price}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t("hotdeals.viewOriginal")}
                  </a>
                  <button
                    onClick={() => handleQuickShare(deal)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-muted"
                    aria-label={t("hotdeals.share")}
                  >
                    <Share2 className="w-3 h-3" />
                    {t("hotdeals.share")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
