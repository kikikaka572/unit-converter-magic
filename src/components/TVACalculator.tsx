import { useMemo, useEffect } from "react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

type Rate = 20 | 10 | 5.5;
type Direction = "excl" | "incl";

function readURL(): Partial<{ rate: Rate; value: string; dir: Direction }> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const rateRaw = p.get("rate");
  const rate = rateRaw === "10" ? 10 : rateRaw === "5.5" ? 5.5 : 20;
  const dir = p.get("dir") === "incl" ? "incl" : "excl";
  const value = p.get("value") ?? undefined;
  return { rate: rate as Rate, dir, value };
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TVACalculator() {
  const { t } = useLanguage();
  const init = readURL();

  const [amount, setAmount] = useState(init.value ?? "100");
  const [rate, setRate] = useState<Rate>(init.rate ?? 20);
  const [dir, setDir] = useState<Direction>(init.dir ?? "excl");

  useEffect(() => {
    const params = new URLSearchParams({ cat: "tva", rate: String(rate), value: amount, dir });
    window.history.replaceState(null, "", `?${params}`);
  }, [amount, rate, dir]);

  const result = useMemo(() => {
    const n = parseFloat(amount.replace(",", "."));
    if (isNaN(n) || n < 0) return null;
    if (dir === "excl") {
      const ht = n;
      const tva = ht * (rate / 100);
      return { ht, tva, ttc: ht + tva };
    } else {
      const ttc = n;
      const ht = ttc / (1 + rate / 100);
      return { ht, tva: ttc - ht, ttc };
    }
  }, [amount, rate, dir]);

  const RATES: { value: Rate; key: "tva.rate.standard" | "tva.rate.intermediate" | "tva.rate.reduced" }[] = [
    { value: 20, key: "tva.rate.standard" },
    { value: 10, key: "tva.rate.intermediate" },
    { value: 5.5, key: "tva.rate.reduced" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("tva.heading")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("tva.subheading")}</p>
      </div>

      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["excl", "incl"] as Direction[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDir(d)}
            className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
              dir === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {t(d === "excl" ? "tva.excl" : "tva.incl")}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t("tva.amount")}</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="100"
        />
      </div>

      {/* Rate selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t("tva.rate")}</label>
        <div className="grid grid-cols-3 gap-2">
          {RATES.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRate(value)}
              className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                rate === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-border bg-secondary/40 divide-y divide-border">
          <ResultRow label={t("tva.result.ht")} value={`€ ${fmt(result.ht)}`} />
          <ResultRow label={`${t("tva.result.tva")} (${rate}%)`} value={`€ ${fmt(result.tva)}`} highlight />
          <ResultRow label={t("tva.result.ttc")} value={`€ ${fmt(result.ttc)}`} bold />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("tva.note")}</p>
    </div>
  );
}

function ResultRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className={`text-sm ${highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "text-foreground font-bold text-base" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
