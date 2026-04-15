import { useState, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import {
  type Category,
  categories,
  getUnitsForCategory,
  getDefaultUnits,
  convert,
  getConversionFormula,
  formatNumber,
} from "@/lib/conversions";

const categoryKeys = Object.keys(categories) as Category[];

const Index = () => {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState(() => getDefaultUnits("length")[0]);
  const [toUnit, setToUnit] = useState(() => getDefaultUnits("length")[1]);
  const [inputValue, setInputValue] = useState("1");

  const units = useMemo(() => getUnitsForCategory(category), [category]);

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";
    return formatNumber(convert(category, fromUnit, toUnit, num));
  }, [category, fromUnit, toUnit, inputValue]);

  const formula = useMemo(
    () => getConversionFormula(category, fromUnit, toUnit),
    [category, fromUnit, toUnit]
  );

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const [defFrom, defTo] = getDefaultUnits(cat);
    setFromUnit(defFrom);
    setToUnit(defTo);
    setInputValue("1");
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) setInputValue(result);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            단위 환산 계산기
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            간편하고 정확한 단위 변환
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <span className="mr-1.5">{categories[cat].icon}</span>
              {categories[cat].labelKo}
            </button>
          ))}
        </div>

        {/* Converter Card */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-5 sm:p-8 space-y-6">
            {/* From */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                변환할 값
              </label>
              <div className="flex flex-col gap-2">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {units.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.info.labelKo} ({u.info.symbol})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-3xl sm:text-4xl font-bold text-foreground px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent tabular-nums"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
                title="단위 교환"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                결과
              </label>
              <div className="flex flex-col gap-2">
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {units.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.info.labelKo} ({u.info.symbol})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={result}
                  readOnly
                  className="w-full text-3xl sm:text-4xl font-bold text-primary px-4 py-3 border border-converter-result-border rounded-lg bg-converter-result-bg focus:outline-none tabular-nums"
                  placeholder="—"
                />
              </div>
            </div>

            {/* Formula */}
            <p className="text-center text-muted-foreground text-sm">
              {formula}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-secondary/50 p-5 sm:p-8 border-t border-border rounded-b-lg">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              빠른 프리셋
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { cat: "temperature" as Category, from: "c", to: "f", icon: "🌡️", label: "℃ → ℉" },
                { cat: "weight" as Category, from: "kg", to: "lb", icon: "⚖️", label: "kg → lb" },
                { cat: "length" as Category, from: "km", to: "mi", icon: "📏", label: "km → mi" },
                { cat: "area" as Category, from: "sqm", to: "pyeong", icon: "📐", label: "m² → 평" },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCategory(preset.cat);
                    setFromUnit(preset.from);
                    setToUnit(preset.to);
                    setInputValue("1");
                  }}
                  className="bg-card p-3 rounded-lg border border-border hover:shadow-md transition-shadow duration-150 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xl mb-1">{preset.icon}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
