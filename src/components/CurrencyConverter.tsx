import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { fetchRates, convert, type CurrencyCode, type RateResult } from "@/lib/exchangeRate";

const CURRENCIES: CurrencyCode[] = ["EUR", "USD", "KRW"];

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  USD: "$",
  KRW: "₩",
};

function readURL(): Partial<{ from: CurrencyCode; to: CurrencyCode; value: string }> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const from = p.get("from") as CurrencyCode | null;
  const to = p.get("to") as CurrencyCode | null;
  return {
    from: CURRENCIES.includes(from as CurrencyCode) ? (from as CurrencyCode) : undefined,
    to: CURRENCIES.includes(to as CurrencyCode) ? (to as CurrencyCode) : undefined,
    value: p.get("value") ?? undefined,
  };
}

function fmt(n: number, currency: CurrencyCode) {
  if (currency === "KRW") {
    return n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
  }
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CurrencyConverter() {
  const { t } = useLanguage();
  const init = readURL();

  const [from, setFrom] = useState<CurrencyCode>(init.from ?? "EUR");
  const [to, setTo] = useState<CurrencyCode>(init.to ?? "KRW");
  const [amount, setAmount] = useState(init.value ?? "100");
  const [rateResult, setRateResult] = useState<RateResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRates = useCallback(async () => {
    setLoading(true);
    const res = await fetchRates();
    setRateResult(res);
    setLoading(false);
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  useEffect(() => {
    const params = new URLSearchParams({ from, to, value: amount });
    window.history.replaceState(null, "", `?${params}`);
  }, [from, to, amount]);

  const converted = (() => {
    if (!rateResult) return null;
    const n = parseFloat(amount.replace(",", ".").replace(/\s/g, ""));
    if (isNaN(n) || n < 0) return null;
    return convert(n, from, to, rateResult.rates);
  })();

  const appliedRate = (() => {
    if (!rateResult) return null;
    return convert(1, from, to, rateResult.rates);
  })();

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("currency.heading")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("currency.subheading")}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("currency.loading")}</p>
      ) : (
        <>
          {rateResult?.isFallback && (
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
              {t("currency.fallback")}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("currency.amount")}</label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* From / Swap / To */}
          <div className="flex items-center gap-2">
            <CurrencySelect value={from} onChange={setFrom} exclude={to} label={t("currency.from")} />
            <button
              type="button"
              onClick={swap}
              aria-label={t("currency.swap")}
              className="mt-5 p-2 rounded-full border border-border bg-card hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary"
            >
              ⇄
            </button>
            <CurrencySelect value={to} onChange={setTo} exclude={from} label={t("currency.to")} />
          </div>

          {/* Result */}
          {converted !== null && (
            <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 text-center">
              <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                {t("currency.result")}
              </div>
              <div className="text-4xl font-bold text-foreground tabular-nums">
                {SYMBOLS[to]}{fmt(converted, to)}
              </div>
              {appliedRate !== null && (
                <div className="text-xs text-muted-foreground mt-2">
                  {t("currency.rate")}: 1 {from} = {fmt(appliedRate, to)} {to}
                </div>
              )}
              {rateResult && !rateResult.isFallback && (
                <div className="text-xs text-muted-foreground mt-1">
                  {t("currency.updated")}: {rateResult.updatedAt}
                </div>
              )}
            </div>
          )}

          {/* Quick pairs */}
          <div className="grid grid-cols-3 gap-2">
            {([["EUR", "KRW"], ["EUR", "USD"], ["USD", "KRW"]] as [CurrencyCode, CurrencyCode][]).map(([f, t2]) => (
              <button
                key={`${f}-${t2}`}
                type="button"
                onClick={() => { setFrom(f); setTo(t2); }}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  from === f && to === t2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {f} → {t2}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">{t("currency.note")}</p>
    </div>
  );
}

function CurrencySelect({
  value, onChange, exclude, label,
}: {
  value: CurrencyCode;
  onChange: (v: CurrencyCode) => void;
  exclude: CurrencyCode;
  label: string;
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {CURRENCIES.filter((c) => c !== exclude).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
