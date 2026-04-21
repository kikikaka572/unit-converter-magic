import { useMemo, useState } from "react";
import {
  calcNetSalary,
  buildSalaryTable,
  INSURANCE_RATES_2026,
  MIN_WAGE_2026,
} from "@/lib/salaryCalculator";
import { formatKRW } from "@/lib/lifeCalculators";
import { useLanguage } from "@/i18n/LanguageContext";

const inputClass =
  "w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent tabular-nums";
const labelClass =
  "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider";

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
      <div className="text-sm text-foreground">
        {label}
        {sub && <span className="text-xs text-muted-foreground ml-1">{sub}</span>}
      </div>
      <div className="text-sm font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export default function SalaryCalculator() {
  const { t, lang } = useLanguage();
  const [annualMan, setAnnualMan] = useState("4000");
  const [dependents, setDependents] = useState("1");
  const [nonTaxable, setNonTaxable] = useState("200000");
  const [showTable, setShowTable] = useState(false);

  const annual = (parseFloat(annualMan) || 0) * 10_000;
  const deps = parseInt(dependents) || 1;
  const nt = parseFloat(nonTaxable) || 0;
  const b = useMemo(() => calcNetSalary(annual, deps, nt), [annual, deps, nt]);
  const table = useMemo(() => buildSalaryTable(2_000, 30_000, 100, deps), [deps]);

  const wonUnit = t("salary.unitWon");
  const manUnit = t("salary.unitMan");

  return (
    <section className="w-full">
      <div className="bg-card rounded-lg border border-border shadow-sm p-5 sm:p-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">{t("salary.heading")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("salary.subheading")}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>{t("salary.annualLabel")}</label>
              <input
                type="number"
                value={annualMan}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseFloat(val) || 0;
                  if (num <= 30000) {
                    setAnnualMan(val);
                  } else {
                    setAnnualMan("30000");
                  }
                }}
                className={inputClass}
                min={0}
                max={30000}
              />
            </div>
            <div>
              <label className={labelClass}>{t("salary.dependentsLabel")}</label>
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                className={inputClass}
                min={1}
              />
            </div>
            <div>
              <label className={labelClass}>{t("salary.nonTaxableLabel")}</label>
              <input
                type="number"
                value={nonTaxable}
                onChange={(e) => setNonTaxable(e.target.value)}
                className={inputClass}
                min={0}
              />
            </div>
          </div>

          {/* 실수령액 강조 */}
          <div className="bg-converter-result-bg border border-converter-result-border rounded-lg px-4 py-4">
            <div className="text-xs text-muted-foreground mb-1">{t("salary.netMonthly")}</div>
            <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
              {formatKRW(Math.round(b.netMonthly))}{" "}
              <span className="text-base font-medium text-muted-foreground">{wonUnit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {t("salary.netAnnualText")} {formatKRW(Math.round(b.netAnnual))} {wonUnit} ·{" "}
              {t("salary.deductionTotalText")} {formatKRW(Math.round(b.totalDeduction))} {wonUnit}
            </div>
          </div>

          {/* 공제 내역 */}
          <div className="bg-secondary/40 rounded-lg px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              {t("salary.deductionHeading")}
            </div>
            <Row
              label={t("salary.nationalPension")}
              sub={`(${(INSURANCE_RATES_2026.nationalPension.rate * 100).toFixed(1)}%)`}
              value={`${formatKRW(b.nationalPension)} ${wonUnit}`}
            />
            <Row
              label={t("salary.healthInsurance")}
              sub={`(${(INSURANCE_RATES_2026.healthInsurance.rate * 100).toFixed(3)}%)`}
              value={`${formatKRW(b.healthInsurance)} ${wonUnit}`}
            />
            <Row
              label={t("salary.longTermCare")}
              sub={`(${t("salary.longTermCareSub")} ${(INSURANCE_RATES_2026.longTermCare.rate * 100).toFixed(2)}%)`}
              value={`${formatKRW(b.longTermCare)} ${wonUnit}`}
            />
            <Row
              label={t("salary.employmentInsurance")}
              sub={`(${(INSURANCE_RATES_2026.employmentInsurance.rate * 100).toFixed(1)}%)`}
              value={`${formatKRW(b.employmentInsurance)} ${wonUnit}`}
            />
            <Row
              label={t("salary.incomeTax")}
              sub={t("salary.incomeTaxSub")}
              value={`${formatKRW(b.incomeTax)} ${wonUnit}`}
            />
            <Row
              label={t("salary.localTax")}
              sub={t("salary.localTaxSub")}
              value={`${formatKRW(b.localTax)} ${wonUnit}`}
            />
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
              <div className="text-sm font-semibold text-foreground">{t("salary.totalDeduction")}</div>
              <div className="text-sm font-bold tabular-nums text-destructive">
                -{formatKRW(Math.round(b.totalDeduction))} {wonUnit}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            {t("salary.minWageNote")}: {formatKRW(MIN_WAGE_2026.hourly)} {wonUnit} /{" "}
            {formatKRW(MIN_WAGE_2026.monthly)} {wonUnit}
            <br />
            {t("salary.estimateNote")}
          </p>

          {/* 연봉별 실수령 표 */}
          <div>
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              {showTable ? t("salary.tableClose") : t("salary.tableOpen")}
            </button>

            {showTable && (
              <div className="mt-3 max-h-[480px] overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-secondary text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">{t("salary.col.annual")}</th>
                      <th className="px-3 py-2 text-right font-semibold">{t("salary.col.monthly")}</th>
                      <th className="px-3 py-2 text-right font-semibold">{t("salary.col.deduction")}</th>
                      <th className="px-3 py-2 text-right font-semibold">{t("salary.col.net")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((r) => {
                      const highlight = Math.abs(r.annual - annual) < 1_000_000;
                      const annualLabel =
                        lang === "ko"
                          ? `${(r.annual / 10_000).toLocaleString()}${manUnit}`
                          : `₩${(r.annual / 10_000).toLocaleString()} ${manUnit}`;
                      return (
                        <tr
                          key={r.annual}
                          className={`border-t border-border/60 tabular-nums ${
                            highlight ? "bg-primary/10 font-semibold" : ""
                          }`}
                        >
                          <td className="px-3 py-1.5 text-left">{annualLabel}</td>
                          <td className="px-3 py-1.5 text-right">{formatKRW(Math.round(r.monthly))}</td>
                          <td className="px-3 py-1.5 text-right text-destructive/80">
                            -{formatKRW(Math.round(r.deduction))}
                          </td>
                          <td className="px-3 py-1.5 text-right text-primary">
                            {formatKRW(Math.round(r.net))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
