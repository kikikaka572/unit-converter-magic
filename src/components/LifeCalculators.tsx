import { useState } from "react";
import {
  type LifeCalcKey,
  lifeCalculators,
  calcHourlyWage,
  calcFuelCost,
  calcParcelVolumetricWeight,
  calcInteriorCost,
  calcServingGrams,
  servingPresets,
  calcElectricityBill,
  calcWaterBill,
  calcGasBill,
  calcMovingCost,
  movingTypes,
  calcDday,
  formatKRW,
  formatDecimal,
} from "@/lib/lifeCalculators";

const inputClass =
  "w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent tabular-nums";
const selectClass =
  "w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";
const labelClass =
  "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider";

function ResultBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-converter-result-bg border border-converter-result-border rounded-lg px-4 py-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
        {value} <span className="text-base font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function SalaryCalc() {
  const [salary, setSalary] = useState("3000000");
  const [hours, setHours] = useState("40");
  const hourly = calcHourlyWage(parseFloat(salary) || 0, parseFloat(hours) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>월급 (원)</label>
        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>주당 근무시간</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label="시급" value={formatKRW(hourly)} unit="원/시간" />
      <p className="text-xs text-muted-foreground text-center">월 근무시간 = 주당 시간 × 4.345주</p>
    </div>
  );
}

function FuelCalc() {
  const [distance, setDistance] = useState("100");
  const [efficiency, setEfficiency] = useState("12");
  const [price, setPrice] = useState("1700");
  const cost = calcFuelCost(parseFloat(distance) || 0, parseFloat(efficiency) || 0, parseFloat(price) || 0);
  const liters = (parseFloat(distance) || 0) / (parseFloat(efficiency) || 1);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>주행거리 (km)</label>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>연비 (km/L)</label>
        <input type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>유가 (원/L)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label="예상 연료비" value={formatKRW(cost)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">필요 연료량 약 {formatDecimal(liters, 2)} L</p>
    </div>
  );
}

function ParcelCalc() {
  const [w, setW] = useState("30");
  const [h, setH] = useState("20");
  const [d, setD] = useState("15");
  const [divisor, setDivisor] = useState("6000");
  const vol = calcParcelVolumetricWeight(
    parseFloat(w) || 0,
    parseFloat(h) || 0,
    parseFloat(d) || 0,
    parseFloat(divisor) || 6000
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>가로 (cm)</label>
          <input type="number" value={w} onChange={(e) => setW(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>세로 (cm)</label>
          <input type="number" value={h} onChange={(e) => setH(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>높이 (cm)</label>
          <input type="number" value={d} onChange={(e) => setD(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>부피무게 계수</label>
        <select value={divisor} onChange={(e) => setDivisor(e.target.value)} className={selectClass}>
          <option value="6000">국제 표준 (6000)</option>
          <option value="5000">항공 특송 (5000)</option>
          <option value="8000">국내 택배 (8000)</option>
        </select>
      </div>
      <ResultBox label="부피 무게" value={formatDecimal(vol, 2)} unit="kg" />
      <p className="text-xs text-muted-foreground text-center">부피무게 = (가로 × 세로 × 높이) ÷ {divisor}</p>
    </div>
  );
}

function InteriorCalc() {
  const [pyeong, setPyeong] = useState("25");
  const [grade, setGrade] = useState("standard");
  const grades: Record<string, { labelKo: string; price: number }> = {
    basic: { labelKo: '기본 (도배·장판 위주)', price: 800000 },
    standard: { labelKo: '표준 (반셀프~일반)', price: 1500000 },
    premium: { labelKo: '프리미엄 (전체 리모델링)', price: 2500000 },
    luxury: { labelKo: '럭셔리 (고급 마감재)', price: 4000000 },
  };
  const cost = calcInteriorCost(parseFloat(pyeong) || 0, grades[grade].price);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>평수</label>
        <input type="number" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>인테리어 등급</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectClass}>
          {Object.entries(grades).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelKo} (평당 {formatKRW(v.price)}원)
            </option>
          ))}
        </select>
      </div>
      <ResultBox label="예상 인테리어 비용" value={formatKRW(cost)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">
        ※ 시장 평균 기반 추정치이며 실제 견적과 다를 수 있습니다
      </p>
    </div>
  );
}

function ServingCalc() {
  const [servings, setServings] = useState("2");
  const [food, setFood] = useState("rice");
  const grams = calcServingGrams(parseFloat(servings) || 0, food);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>음식 종류</label>
        <select value={food} onChange={(e) => setFood(e.target.value)} className={selectClass}>
          {Object.entries(servingPresets).map(([k, v]) => (
            <option key={k} value={k}>
              {v.labelKo} (1인분 {v.gramsPerServing}g)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>인분 수</label>
        <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label="총 분량" value={formatDecimal(grams, 0)} unit="g" />
      <p className="text-xs text-muted-foreground text-center">
        {servingPresets[food].labelKo} 1인분 기준 {servingPresets[food].gramsPerServing}g
      </p>
    </div>
  );
}

const calcMap: Record<LifeCalcKey, () => JSX.Element> = {
  salary: SalaryCalc,
  fuel: FuelCalc,
  parcel: ParcelCalc,
  interior: InteriorCalc,
  serving: ServingCalc,
};

export default function LifeCalculators() {
  const [active, setActive] = useState<LifeCalcKey>("salary");
  const ActiveCalc = calcMap[active];
  const meta = lifeCalculators.find((c) => c.key === active)!;

  return (
    <section className="w-full max-w-2xl mt-10">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          실생활 계산기
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          일상에서 자주 쓰는 빠른 계산
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {lifeCalculators.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
              active === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            <span className="mr-1.5">{c.icon}</span>
            {c.labelKo}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-5 sm:p-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">
            {meta.icon} {meta.labelKo}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{meta.descKo}</p>
        </div>
        <ActiveCalc />
      </div>
    </section>
  );
}
