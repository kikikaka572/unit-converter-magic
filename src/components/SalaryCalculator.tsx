import { useMemo, useState } from "react";
import {
  calcNetSalary,
  buildSalaryTable,
  INSURANCE_RATES_2026,
  MIN_WAGE_2026,
} from "@/lib/salaryCalculator";
import { formatKRW } from "@/lib/lifeCalculators";

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
  const [annualMan, setAnnualMan] = useState("4000"); // 만원 단위 입력
  const [dependents, setDependents] = useState("1");
  const [nonTaxable, setNonTaxable] = useState("200000"); // 월 비과세 (식대 등)
  const [showTable, setShowTable] = useState(false);

  const annual = (parseFloat(annualMan) || 0) * 10_000;
  const deps = parseInt(dependents) || 1;
  const nt = parseFloat(nonTaxable) || 0;
  const b = useMemo(() => calcNetSalary(annual, deps, nt), [annual, deps, nt]);

  const table = useMemo(() => buildSalaryTable(2_000, 30_000, 100, deps), [deps]);

  return (
    <section className="w-full">
      <div className="bg-card rounded-lg border border-border shadow-sm p-5 sm:p-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">💼 2026년 연봉 실수령액 계산기</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            2026년 4대보험 요율 기준 · 비과세 식대 월 20만원 자동 적용
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>연봉 (만원)</label>
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
              <label className={labelClass}>부양가족 수 (본인 포함)</label>
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                className={inputClass}
                min={1}
              />
            </div>
            <div>
              <label className={labelClass}>월 비과세액 (원)</label>
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
            <div className="text-xs text-muted-foreground mb-1">월 실수령액</div>
            <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
              {formatKRW(Math.round(b.netMonthly))}{" "}
              <span className="text-base font-medium text-muted-foreground">원</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              연 실수령 약 {formatKRW(Math.round(b.netAnnual))}원 · 월 공제 합계{" "}
              {formatKRW(Math.round(b.totalDeduction))}원
            </div>
          </div>

          {/* 공제 내역 */}
          <div className="bg-secondary/40 rounded-lg px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              월 공제 내역 (4대보험 + 세금)
            </div>
            <Row
              label="국민연금"
              sub={`(${(INSURANCE_RATES_2026.nationalPension.rate * 100).toFixed(1)}%)`}
              value={`${formatKRW(b.nationalPension)} 원`}
            />
            <Row
              label="건강보험"
              sub={`(${(INSURANCE_RATES_2026.healthInsurance.rate * 100).toFixed(3)}%)`}
              value={`${formatKRW(b.healthInsurance)} 원`}
            />
            <Row
              label="장기요양보험"
              sub={`(건보료의 ${(INSURANCE_RATES_2026.longTermCare.rate * 100).toFixed(2)}%)`}
              value={`${formatKRW(b.longTermCare)} 원`}
            />
            <Row
              label="고용보험"
              sub={`(${(INSURANCE_RATES_2026.employmentInsurance.rate * 100).toFixed(1)}%)`}
              value={`${formatKRW(b.employmentInsurance)} 원`}
            />
            <Row label="소득세" sub="(간이세액표)" value={`${formatKRW(b.incomeTax)} 원`} />
            <Row label="지방소득세" sub="(소득세의 10%)" value={`${formatKRW(b.localTax)} 원`} />
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
              <div className="text-sm font-semibold text-foreground">공제 합계</div>
              <div className="text-sm font-bold tabular-nums text-destructive">
                -{formatKRW(Math.round(b.totalDeduction))} 원
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            ※ 2026년 최저임금 시급 {formatKRW(MIN_WAGE_2026.hourly)}원 / 월{" "}
            {formatKRW(MIN_WAGE_2026.monthly)}원 (주 40h + 주휴 209h 기준) 반영
            <br />※ 본 계산은 추정치이며, 실제 급여명세서와 일부 차이가 있을 수 있습니다
          </p>

          {/* 연봉별 실수령 표 */}
          <div>
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-secondary hover:bg-muted transition-colors"
            >
              {showTable ? "▲ 연봉별 실수령액 표 닫기" : "▼ 연봉별 실수령액 표 보기 (100만원 단위 · 3억까지)"}
            </button>

            {showTable && (
              <div className="mt-3 max-h-[480px] overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-secondary text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">연봉</th>
                      <th className="px-3 py-2 text-right font-semibold">월 세전</th>
                      <th className="px-3 py-2 text-right font-semibold">월 공제</th>
                      <th className="px-3 py-2 text-right font-semibold">월 실수령</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((r) => {
                      const highlight =
                        Math.abs(r.annual - annual) < 1_000_000;
                      return (
                        <tr
                          key={r.annual}
                          className={`border-t border-border/60 tabular-nums ${
                            highlight ? "bg-primary/10 font-semibold" : ""
                          }`}
                        >
                          <td className="px-3 py-1.5 text-left">
                            {(r.annual / 10_000).toLocaleString()}만원
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            {formatKRW(Math.round(r.monthly))}
                          </td>
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
