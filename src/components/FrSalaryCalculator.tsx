import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

type InputMode = "annual" | "monthly";

// 2026 French income tax brackets (on revenu net imposable after abattement 10%)
const IR_BRACKETS = [
  { limit: 11497, rate: 0 },
  { limit: 29315, rate: 0.11 },
  { limit: 83823, rate: 0.30 },
  { limit: 180294, rate: 0.41 },
  { limit: Infinity, rate: 0.45 },
];

function calcIR(netImposable: number): number {
  let tax = 0;
  let prev = 0;
  for (const { limit, rate } of IR_BRACKETS) {
    if (netImposable <= prev) break;
    tax += (Math.min(netImposable, limit) - prev) * rate;
    prev = limit;
  }
  return Math.max(0, tax);
}

function calcNet(brutAnnual: number, showCsg: boolean) {
  const COTISATIONS_RATE = 0.22;
  const CSG_RATE = 0.0975;

  const cotisations = brutAnnual * COTISATIONS_RATE;
  const csg = brutAnnual * CSG_RATE;
  const brutAfterCotisations = brutAnnual - cotisations;

  // Revenu net imposable: after cotisations, apply 10% abattement (min 495, max 14171)
  const abattement = Math.min(14171, Math.max(495, brutAfterCotisations * 0.1));
  const netImposable = Math.max(0, brutAfterCotisations - abattement);
  const ir = calcIR(netImposable);

  const totalDeduction = cotisations + (showCsg ? csg : 0) + ir;
  const netAnnual = brutAnnual - cotisations - (showCsg ? csg : 0) - ir;

  return {
    brutMonthly: brutAnnual / 12,
    cotisations,
    csg,
    ir,
    totalDeduction,
    netAnnual,
    netMonthly: netAnnual / 12,
  };
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDec(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FrSalaryCalculator() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<InputMode>("annual");
  const [value, setValue] = useState("35000");
  const [showCsg, setShowCsg] = useState(true);

  const brutAnnual = useMemo(() => {
    const n = parseFloat(value.replace(",", ".").replace(/\s/g, ""));
    if (isNaN(n) || n <= 0) return 0;
    return mode === "annual" ? n : n * 12;
  }, [value, mode]);

  const res = useMemo(() => calcNet(brutAnnual, showCsg), [brutAnnual, showCsg]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("frsalary.heading")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("frsalary.subheading")}</p>
      </div>

      {/* Input mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["annual", "monthly"] as InputMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {t(m === "annual" ? "frsalary.annual" : "frsalary.monthly")}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t(mode === "annual" ? "frsalary.annual" : "frsalary.monthly")}
        </label>
        <input
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={mode === "annual" ? "35000" : "2917"}
        />
      </div>

      {/* CSG option */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showCsg}
          onChange={(e) => setShowCsg(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm text-foreground">{t("frsalary.csgOption")}</span>
      </label>

      {/* Result highlight */}
      {brutAnnual > 0 && (
        <>
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-5 text-center">
            <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
              {t("frsalary.net.monthly")}
            </div>
            <div className="text-4xl font-bold text-foreground tabular-nums">
              € {fmt(res.netMonthly)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {t("frsalary.net.annual")} € {fmt(res.netAnnual)}
              {" · "}
              {t("frsalary.total.label")} € {fmt(res.totalDeduction / 12)}/mois
            </div>
          </div>

          {/* Deduction breakdown */}
          <div className="rounded-xl border border-border bg-secondary/40">
            <div className="px-4 pt-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("frsalary.deduction.heading")} ({t("frsalary.brut.label")} € {fmtDec(res.brutMonthly)}/mois)
            </div>
            <div className="divide-y divide-border">
              <Row label={t("frsalary.cotisations")} monthly={res.cotisations / 12} annual={res.cotisations} />
              {showCsg && <Row label={t("frsalary.csg")} monthly={res.csg / 12} annual={res.csg} />}
              <Row label={t("frsalary.ir")} monthly={res.ir / 12} annual={res.ir} />
              <Row label={t("frsalary.total")} monthly={res.totalDeduction / 12} annual={res.totalDeduction} bold />
            </div>
          </div>

          {/* Tax brackets table */}
          <details className="rounded-xl border border-border overflow-hidden">
            <summary className="px-4 py-3 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
              ▼ {t("frsalary.brackets")}
            </summary>
            <table className="w-full text-xs border-t border-border">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Tranche</th>
                  <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-3 py-1.5">0 — 11 497 €</td><td className="px-3 py-1.5 text-right">0 %</td></tr>
                <tr><td className="px-3 py-1.5">11 497 — 29 315 €</td><td className="px-3 py-1.5 text-right">11 %</td></tr>
                <tr><td className="px-3 py-1.5">29 315 — 83 823 €</td><td className="px-3 py-1.5 text-right">30 %</td></tr>
                <tr><td className="px-3 py-1.5">83 823 — 180 294 €</td><td className="px-3 py-1.5 text-right">41 %</td></tr>
                <tr><td className="px-3 py-1.5">&gt; 180 294 €</td><td className="px-3 py-1.5 text-right">45 %</td></tr>
              </tbody>
            </table>
          </details>
        </>
      )}

      <p className="text-xs text-muted-foreground">{t("frsalary.note")}</p>
    </div>
  );
}

function Row({ label, monthly, annual, bold }: { label: string; monthly: number; annual: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-4 py-2.5 ${bold ? "bg-secondary/60" : ""}`}>
      <span className={`text-sm ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <div className="text-right">
        <div className={`text-sm tabular-nums ${bold ? "font-bold text-foreground" : "text-foreground"}`}>
          € {fmt(monthly)}<span className="text-muted-foreground text-xs">/mois</span>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">€ {fmt(annual)}/an</div>
      </div>
    </div>
  );
}
