import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type LifeCalcKey,
  lifeCalculators,
  calcHourlyWage,
  calcFuelCost,
  calcParcelVolumetricWeight,
  calcParcelFee,
  parcelCarriers,
  calcInteriorCost,
  calcCalories,
  caloriePresets,
  calcElectricityBill,
  calcWaterBill,
  calcGasBill,
  calcMovingCost,
  movingTypes,
  calcDday,
  formatKRW,
  formatDecimal,
} from "@/lib/lifeCalculators";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const inputClass =
  "w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent tabular-nums";
const selectClass =
  "w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";
const labelClass =
  "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider";

// Translation keys for life calculator metadata (label & description)
const lifeMetaKey: Record<LifeCalcKey, { label: TranslationKey; desc: TranslationKey }> = {
  salary: { label: "life.salary", desc: "life.salary.desc" },
  fuel: { label: "life.fuel", desc: "life.fuel.desc" },
  parcel: { label: "life.parcel", desc: "life.parcel.desc" },
  interior: { label: "life.interior", desc: "life.interior.desc" },
  serving: { label: "life.serving", desc: "life.serving.desc" },
  electricity: { label: "life.electricity", desc: "life.electricity.desc" },
  water: { label: "life.water", desc: "life.water.desc" },
  gas: { label: "life.gas", desc: "life.gas.desc" },
  moving: { label: "life.moving", desc: "life.moving.desc" },
  dday: { label: "life.dday", desc: "life.dday.desc" },
};

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
  const { t } = useLanguage();
  const [salary, setSalary] = useState("3000000");
  const [hours, setHours] = useState("40");
  const hourly = calcHourlyWage(parseFloat(salary) || 0, parseFloat(hours) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.salary.monthlyLabel")}</label>
        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.salary.weeklyHoursLabel")}</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={t("life.salary.resultLabel")} value={formatKRW(hourly)} unit={t("life.salary.resultUnit")} />
      <p className="text-xs text-muted-foreground text-center">{t("life.salary.note")}</p>
    </div>
  );
}

function FuelCalc() {
  const { t } = useLanguage();
  const [distance, setDistance] = useState("100");
  const [efficiency, setEfficiency] = useState("12");
  const [price, setPrice] = useState("1700");
  const cost = calcFuelCost(parseFloat(distance) || 0, parseFloat(efficiency) || 0, parseFloat(price) || 0);
  const liters = (parseFloat(distance) || 0) / (parseFloat(efficiency) || 1);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.fuel.distance")}</label>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.fuel.efficiency")}</label>
        <input type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.fuel.price")}</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={t("life.fuel.result")} value={formatKRW(cost)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">
        {t("life.fuel.note")} {formatDecimal(liters, 2)} L
      </p>
    </div>
  );
}

function ParcelCalc() {
  const { t, lang } = useLanguage();
  const [w, setW] = useState("30");
  const [h, setH] = useState("20");
  const [d, setD] = useState("15");
  const [actualWeight, setActualWeight] = useState("3");
  const [carrier, setCarrier] = useState("cj");
  const [divisor, setDivisor] = useState("6000");

  const wn = parseFloat(w) || 0;
  const hn = parseFloat(h) || 0;
  const dn = parseFloat(d) || 0;
  const aw = parseFloat(actualWeight) || 0;
  const div = parseFloat(divisor) || 6000;

  const vol = calcParcelVolumetricWeight(wn, hn, dn, div);
  const fee = calcParcelFee(wn, hn, dn, aw, carrier, div);

  // English carrier names
  const carrierNameEn: Record<string, string> = {
    cj: "CJ Logistics",
    hanjin: "Hanjin",
    lotte: "Lotte",
    post: "Korea Post",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>{t("life.parcel.w")}</label>
          <input type="number" value={w} onChange={(e) => setW(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("life.parcel.h")}</label>
          <input type="number" value={h} onChange={(e) => setH(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("life.parcel.d")}</label>
          <input type="number" value={d} onChange={(e) => setD(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t("life.parcel.actual")}</label>
          <input type="number" step="0.1" value={actualWeight} onChange={(e) => setActualWeight(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("life.parcel.divisor")}</label>
          <select value={divisor} onChange={(e) => setDivisor(e.target.value)} className={selectClass}>
            <option value="6000">{t("life.parcel.divisor.intl")}</option>
            <option value="5000">{t("life.parcel.divisor.air")}</option>
            <option value="8000">{t("life.parcel.divisor.dom")}</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>{t("life.parcel.carrier")}</label>
        <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className={selectClass}>
          {Object.entries(parcelCarriers).map(([k, v]) => (
            <option key={k} value={k}>
              {lang === "ko" ? v.labelKo : carrierNameEn[k] ?? v.labelKo}
            </option>
          ))}
        </select>
      </div>
      <ResultBox
        label={`${t("life.parcel.result")} (${fee.sizeLabel}${fee.oversize ? ` · ${t("life.parcel.oversize")}` : ""})`}
        value={formatKRW(fee.price)}
        unit="KRW"
      />
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="bg-secondary rounded-md px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">{t("life.parcel.volumetric")}</div>
          <div className="font-semibold text-foreground tabular-nums">{formatDecimal(vol, 2)} kg</div>
        </div>
        <div className="bg-secondary rounded-md px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">{t("life.parcel.sumCm")}</div>
          <div className="font-semibold text-foreground tabular-nums">{formatDecimal(fee.sumCm, 0)} cm</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {t("life.parcel.applyWeight")} {formatDecimal(fee.applyWeightKg, 2)}kg {t("life.parcel.applyWeightSub")}
      </p>
      <p className="text-xs text-muted-foreground text-center">{t("life.parcel.note")}</p>
    </div>
  );
}

function InteriorCalc() {
  const { t } = useLanguage();
  const [pyeong, setPyeong] = useState("25");
  const [grade, setGrade] = useState("standard");
  const grades: Record<string, { labelKey: TranslationKey; price: number }> = {
    basic: { labelKey: "life.interior.basic", price: 800000 },
    standard: { labelKey: "life.interior.standard", price: 1500000 },
    premium: { labelKey: "life.interior.premium", price: 2500000 },
    luxury: { labelKey: "life.interior.luxury", price: 4000000 },
  };
  const cost = calcInteriorCost(parseFloat(pyeong) || 0, grades[grade].price);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.interior.pyeong")}</label>
        <input type="number" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.interior.grade")}</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectClass}>
          {Object.entries(grades).map(([k, v]) => (
            <option key={k} value={k}>
              {t(v.labelKey)} ({t("life.interior.perPyeong")} {formatKRW(v.price)} KRW)
            </option>
          ))}
        </select>
      </div>
      <ResultBox label={t("life.interior.result")} value={formatKRW(cost)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">{t("life.interior.note")}</p>
    </div>
  );
}

// English food names for serving calculator
const foodNameEn: Record<string, { name: string; serving: string }> = {
  rice: { name: "Rice", serving: "1 bowl (210g)" },
  ramen: { name: "Ramen", serving: "1 pack" },
  noodle: { name: "Noodles", serving: "1 bowl" },
  pasta: { name: "Pasta", serving: "1 plate" },
  bread: { name: "Bread", serving: "1 slice" },
  pizza: { name: "Pizza", serving: "1 slice" },
  chicken: { name: "Chicken", serving: "1 piece" },
  burger: { name: "Burger", serving: "1 burger" },
  pork: { name: "Pork belly", serving: "100g" },
  beef: { name: "Beef", serving: "100g" },
  egg: { name: "Egg", serving: "1 egg" },
  apple: { name: "Apple", serving: "1 (200g)" },
  banana: { name: "Banana", serving: "1 banana" },
  milk: { name: "Milk", serving: "1 glass (200ml)" },
  coke: { name: "Cola", serving: "1 can (250ml)" },
  beer: { name: "Beer", serving: "1 can (355ml)" },
  soju: { name: "Soju", serving: "1 bottle (360ml)" },
};

function ServingCalc() {
  const { t, lang } = useLanguage();
  const [servings, setServings] = useState("1");
  const [food, setFood] = useState("rice");
  const kcal = calcCalories(parseFloat(servings) || 0, food);
  const preset = caloriePresets[food];
  const en = foodNameEn[food];
  const foodName = lang === "ko" ? preset.labelKo : en?.name ?? preset.labelKo;
  const servingDesc = lang === "ko" ? preset.servingDescKo : en?.serving ?? preset.servingDescKo;

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.serving.food")}</label>
        <select value={food} onChange={(e) => setFood(e.target.value)} className={selectClass}>
          {Object.entries(caloriePresets).map(([k, v]) => {
            const e = foodNameEn[k];
            const name = lang === "ko" ? v.labelKo : e?.name ?? v.labelKo;
            const sd = lang === "ko" ? v.servingDescKo : e?.serving ?? v.servingDescKo;
            return (
              <option key={k} value={k}>
                {name} ({sd} · {v.kcalPerServing}kcal)
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("life.serving.amount")}</label>
        <input type="number" step="0.5" value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={t("life.serving.result")} value={formatDecimal(kcal, 0)} unit="kcal" />
      <p className="text-xs text-muted-foreground text-center">
        {foodName} {servingDesc} {t("life.serving.basis")} {preset.kcalPerServing}kcal
      </p>
    </div>
  );
}

function ElectricityCalc() {
  const { t } = useLanguage();
  const [kwh, setKwh] = useState("300");
  const r = calcElectricityBill(parseFloat(kwh) || 0);
  // Map original tier label (Korean) to translated
  const tierKey =
    r.tier.startsWith("1")
      ? "life.electricity.tier1"
      : r.tier.startsWith("2")
      ? "life.electricity.tier2"
      : r.tier.startsWith("3")
      ? "life.electricity.tier3"
      : null;
  const tierLabel = tierKey ? t(tierKey as TranslationKey) : r.tier;
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.electricity.kwh")}</label>
        <input type="number" value={kwh} onChange={(e) => setKwh(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={`${t("life.electricity.result")} (${tierLabel})`} value={formatKRW(r.total)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">
        {formatKRW(r.base)} + {formatKRW(r.usage)} ({t("life.electricity.breakdown")})
      </p>
      <p className="text-xs text-muted-foreground text-center">{t("life.electricity.note")}</p>
    </div>
  );
}

function WaterCalc() {
  const { t } = useLanguage();
  const [m3, setM3] = useState("20");
  const r = calcWaterBill(parseFloat(m3) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.water.m3")}</label>
        <input type="number" value={m3} onChange={(e) => setM3(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={t("life.water.result")} value={formatKRW(r.total)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">
        {formatKRW(r.water)} + {formatKRW(r.sewer)} + {formatKRW(r.fund)} ({t("life.water.breakdown")})
      </p>
      <p className="text-xs text-muted-foreground text-center">{t("life.water.note")}</p>
    </div>
  );
}

function GasCalc() {
  const { t } = useLanguage();
  const [m3, setM3] = useState("50");
  const [unit, setUnit] = useState("1100");
  const [base, setBase] = useState("1000");
  const cost = calcGasBill(parseFloat(m3) || 0, parseFloat(unit) || 0, parseFloat(base) || 0);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.gas.m3")}</label>
        <input type="number" value={m3} onChange={(e) => setM3(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.gas.unit")}</label>
        <input type="number" value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.gas.base")}</label>
        <input type="number" value={base} onChange={(e) => setBase(e.target.value)} className={inputClass} />
      </div>
      <ResultBox label={t("life.gas.result")} value={formatKRW(cost)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">{t("life.gas.note")}</p>
    </div>
  );
}

function MovingCalc() {
  const { t } = useLanguage();
  const [distance, setDistance] = useState("30");
  const [pyeong, setPyeong] = useState("20");
  const [type, setType] = useState("full");
  const cost = calcMovingCost(parseFloat(distance) || 0, parseFloat(pyeong) || 0, type);
  const movingLabelKey: Record<string, TranslationKey> = {
    general: "life.moving.general",
    semi: "life.moving.semi",
    full: "life.moving.full",
  };
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.moving.distance")}</label>
        <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.moving.pyeong")}</label>
        <input type="number" value={pyeong} onChange={(e) => setPyeong(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("life.moving.type")}</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          {Object.keys(movingTypes).map((k) => (
            <option key={k} value={k}>{t(movingLabelKey[k])}</option>
          ))}
        </select>
      </div>
      <ResultBox label={t("life.moving.result")} value={formatKRW(cost)} unit="KRW" />
      <p className="text-xs text-muted-foreground text-center">{t("life.moving.note")}</p>
    </div>
  );
}

function DdayCalc() {
  const { t } = useLanguage();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const r = calcDday(date);
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("life.dday.target")}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>
      <ResultBox
        label={r.label}
        value={formatDecimal(Math.abs(r.days), 0)}
        unit={r.days >= 0 ? t("life.dday.left") : t("life.dday.past")}
      />
      <p className="text-xs text-muted-foreground text-center">
        {t("life.dday.note")} {date}
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
  electricity: ElectricityCalc,
  water: WaterCalc,
  gas: GasCalc,
  moving: MovingCalc,
  dday: DdayCalc,
};

export default function LifeCalculators() {
  const { t } = useLanguage();
  const [active, setActive] = useState<LifeCalcKey>("salary");
  const [open, setOpen] = useState(false);
  const ActiveCalc = calcMap[active];
  const meta = lifeCalculators.find((c) => c.key === active)!;

  const visibleCount = 4;
  const ordered = [
    ...lifeCalculators.filter((c) => c.key === active),
    ...lifeCalculators.filter((c) => c.key !== active),
  ];
  const visible = ordered.slice(0, visibleCount);

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("life.tablistAria")}
        >
          {visible.map((c) => (
            <button
              key={c.key}
              role="tab"
              aria-selected={active === c.key}
              onClick={() => setActive(c.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                active === c.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <span className="mr-1">{c.icon}</span>
              {t(lifeMetaKey[c.key].label)}
            </button>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={t("life.openAllAria")}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
              {t("life.more")}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("life.allTitle")}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {lifeCalculators.map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setActive(c.key);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    active === c.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="truncate">{t(lifeMetaKey[c.key].label)}</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-5 sm:p-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">
            {meta.icon} {t(lifeMetaKey[active].label)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t(lifeMetaKey[active].desc)}</p>
        </div>
        <ActiveCalc />
      </div>
    </section>
  );
}
