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

function ElectricityCalc() {
  const [kwh, setKwh] = useState("300");
  const r = calcElectricityBill(parseFloat(kwh) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>월 사용량 (kWh)</label>
        <input type="number" value={kwh} onChange={(e) => setKwh(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={`예상 전기요금 (${r.tier})`} value={formatKRW(r.total)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">
        기본 {formatKRW(r.base)}원 + 사용 {formatKRW(r.usage)}원 (부가세·기금 포함)
      </p>
      <p className="text-xs text-muted-foreground text-center">※ 한전 주택용 저압 누진제 기반 추정치</p>
    </div>
  );
}

function WaterCalc() {
  const [m3, setM3] = useState("20");
  const r = calcWaterBill(parseFloat(m3) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>월 사용량 (m³)</label>
        <input type="number" value={m3} onChange={(e) => setM3(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label="예상 수도요금" value={formatKRW(r.total)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">
        상수도 {formatKRW(r.water)} + 하수도 {formatKRW(r.sewer)} + 물이용부담금 {formatKRW(r.fund)}
      </p>
      <p className="text-xs text-muted-foreground text-center">※ 서울시 가정용 누진 단가 기반 추정치</p>
    </div>
  );
}

function GasCalc() {
  const [m3, setM3] = useState("50");
  const [unit, setUnit] = useState("1100");
  const [base, setBase] = useState("1000");
  const cost = calcGasBill(parseFloat(m3) || 0, parseFloat(unit) || 0, parseFloat(base) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>월 사용량 (m³)</label>
        <input type="number" value={m3} onChange={(e) => setM3(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>단가 (원/m³)</label>
        <input type="number" value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>기본요금 (원)</label>
        <input type="number" value={base} onChange={(e) => setBase(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label="예상 가스요금" value={formatKRW(cost)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">※ 지역·계절별 단가가 다르니 고지서 단가를 입력하면 정확합니다</p>
    </div>
  );
}

function MovingCalc() {
  const [distance, setDistance] = useState("30");
  const [pyeong, setPyeong] = useState("20");
  const [type, setType] = useState("full");
  const cost = calcMovingCost(parseFloat(distance) || 0, parseFloat(pyeong) || 0, type);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>이사 거리 (km)</label>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>평수</label>
        <input type="number" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>이사 종류</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          {Object.entries(movingTypes).map(([k, v]) => (
            <option key={k} value={k}>{v.labelKo}</option>
          ))}
        </select>
      </div>
      <ResultBox label="예상 이사 비용" value={formatKRW(cost)} unit="원" />
      <p className="text-xs text-muted-foreground text-center">※ 시즌·층수·짐량에 따라 실제 견적과 차이가 있을 수 있습니다</p>
    </div>
  );
}

function DdayCalc() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const r = calcDday(date);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>목표 날짜</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={r.label} value={formatDecimal(Math.abs(r.days), 0)} unit={r.days >= 0 ? "일 남음" : "일 지남"} />
      <p className="text-xs text-muted-foreground text-center">오늘 기준 {date} 까지의 일수</p>
    </div>
  );
}

const calcMap: Record<LifeCalcKey, () => JSX.Element> = {
  salary: SalaryCalc,
  fuel: FuelCalc,
  parcel: ParcelCalc,
  interior: InteriorCalc,
  serving: ServingCalc,
  electricity: ElectricityCalc,
  water: WaterCalc,
  gas: GasCalc,
  moving: MovingCalc,
  dday: DdayCalc,
};

export default function LifeCalculators() {
  const [active, setActive] = useState<LifeCalcKey>("salary");
  const ActiveCalc = calcMap[active];
  const meta = lifeCalculators.find((c) => c.key === active)!;

  return (
    <section className="w-full">
      <div className="-mx-4 sm:mx-0 mb-4">
        <div
          className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="실생활 계산기 선택"
        >
          {lifeCalculators.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={active === c.key}
              onClick={() => setActive(c.key)}
              className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                active === c.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <span className="mr-1">{c.icon}</span>
              {c.labelKo}
            </button>
          ))}
        </div>
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
