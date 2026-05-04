import { useState, useMemo, useEffect, useCallback } from "react";
import { ArrowLeftRight, Share2, Copy, Sparkles, Code2, Check } from "lucide-react";
import {
  type Category,
  categories,
  getUnitsForCategory,
  getDefaultUnits,
  convert,
  getConversionFormula,
  formatNumber,
} from "@/lib/conversions";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const categoryKeys = Object.keys(categories) as Category[];

const catLabelKey: Record<Category, TranslationKey> = {
  length: "uc.cat.length",
  weight: "uc.cat.weight",
  temperature: "uc.cat.temperature",
  volume: "uc.cat.volume",
  area: "uc.cat.area",
  speed: "uc.cat.speed",
};

const HISTORY_KEY = "uc-history-v1";
const MAX_HISTORY = 5;

interface HistoryItem {
  category: Category;
  from: string;
  to: string;
  value: string;
  result: string;
  ts: number;
}

const POPULAR: Array<{ cat: Category; from: string; to: string; value: string; label: string }> = [
  { cat: "weight", from: "kg", to: "lb", value: "100", label: "100 kg → lb" },
  { cat: "length", from: "cm", to: "in", value: "180", label: "180 cm → in" },
  { cat: "temperature", from: "c", to: "f", value: "25", label: "25 °C → °F" },
  { cat: "length", from: "km", to: "mi", value: "10", label: "10 km → mi" },
  { cat: "weight", from: "lb", to: "kg", value: "150", label: "150 lb → kg" },
  { cat: "volume", from: "l", to: "gal", value: "1", label: "1 L → gal" },
];

function readURL(): Partial<{ cat: Category; from: string; to: string; value: string }> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const cat = p.get("cat") as Category | null;
  return {
    cat: cat && categoryKeys.includes(cat) ? cat : undefined,
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    value: p.get("value") ?? undefined,
  };
}

function unitSymbol(category: Category, key: string): string {
  return getUnitsForCategory(category).find((u) => u.key === key)?.info.symbol ?? key;
}

export default function UnitConverter() {
  const { t, lang } = useLanguage();
  const initial = readURL();
  const [category, setCategory] = useState<Category>(initial.cat ?? "length");
  const [fromUnit, setFromUnit] = useState(
    () => initial.from ?? getDefaultUnits(initial.cat ?? "length")[0]
  );
  const [toUnit, setToUnit] = useState(
    () => initial.to ?? getDefaultUnits(initial.cat ?? "length")[1]
  );
  const [inputValue, setInputValue] = useState(initial.value ?? "1");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState<string | null>(null);

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

  // Sync URL (replaceState — no reload) for shareable links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    p.set("tab", "converter");
    p.set("cat", category);
    p.set("from", fromUnit);
    p.set("to", toUnit);
    p.set("value", inputValue);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [category, fromUnit, toUnit, inputValue]);

  // Save history (debounced via timeout)
  useEffect(() => {
    if (!result || !inputValue) return;
    const id = setTimeout(() => {
      setHistory((prev) => {
        const item: HistoryItem = {
          category,
          from: fromUnit,
          to: toUnit,
          value: inputValue,
          result,
          ts: Date.now(),
        };
        const filtered = prev.filter(
          (h) =>
            !(
              h.category === item.category &&
              h.from === item.from &&
              h.to === item.to &&
              h.value === item.value
            )
        );
        const next = [item, ...filtered].slice(0, MAX_HISTORY);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }, 800);
    return () => clearTimeout(id);
  }, [category, fromUnit, toUnit, inputValue, result]);

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

  const applyConversion = (cat: Category, from: string, to: string, value: string) => {
    setCategory(cat);
    setFromUnit(from);
    setToUnit(to);
    setInputValue(value);
  };

  const fromSym = unitSymbol(category, fromUnit);
  const toSym = unitSymbol(category, toUnit);
  const queryPhrase = `${inputValue} ${fromSym} to ${toSym}`;
  const shareURL =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?tab=converter&cat=${category}&from=${fromUnit}&to=${toUnit}&value=${inputValue}`
      : "";
  const chatgptPrompt = `Convert ${inputValue} ${fromSym} to ${toSym}. Show the formula and the result.`;
  const embedCode = `<iframe src="${shareURL}" width="380" height="640" style="border:1px solid #e5e7eb;border-radius:12px" title="Lifetool unit converter"></iframe>`;

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }, []);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Lifetool", text: queryPhrase, url: shareURL });
        return;
      } catch {}
    }
    copy(shareURL, "share");
  };

  const openChatGPT = () => {
    window.open(`https://chat.openai.com/?q=${encodeURIComponent(chatgptPrompt)}`, "_blank");
  };

  const unitLabel = (info: { label: string; labelKo: string; symbol: string }) =>
    lang === "ko" ? `${info.labelKo} (${info.symbol})` : `${info.label} (${info.symbol})`;

  const isKo = lang === "ko";
  const T = {
    popular: isKo ? "인기 변환" : "Popular conversions",
    history: isKo ? "최근 변환" : "Recent",
    clear: isKo ? "지우기" : "Clear",
    share: isKo ? "공유 링크" : "Share link",
    query: isKo ? "검색 문구" : "Query phrase",
    chatgpt: isKo ? "ChatGPT로 묻기" : "Ask ChatGPT",
    embed: isKo ? "내 사이트에 임베드" : "Embed on your site",
    copy: isKo ? "복사" : "Copy",
    copied: isKo ? "복사됨!" : "Copied!",
  };

  return (
    <div className="w-full">
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
            {t(catLabelKey[cat])}
          </button>
        ))}
      </div>

      {/* Converter Card */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-5 sm:p-8 space-y-6">
          {/* From */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              {t("uc.fromLabel")}
            </label>
            <div className="flex flex-col gap-2">
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {units.map((u) => (
                  <option key={u.key} value={u.key}>
                    {unitLabel(u.info)}
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
              title={t("uc.swap")}
              aria-label={t("uc.swap")}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* To */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              {t("uc.toLabel")}
            </label>
            <div className="flex flex-col gap-2">
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-input rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {units.map((u) => (
                  <option key={u.key} value={u.key}>
                    {unitLabel(u.info)}
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
          <p className="text-center text-muted-foreground text-sm">{formula}</p>

          {/* Viral actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={share}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
            >
              {copied === "share" ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied === "share" ? T.copied : T.share}
            </button>
            <button
              onClick={() => copy(queryPhrase, "query")}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition"
            >
              {copied === "query" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "query" ? T.copied : T.query}
            </button>
            <button
              onClick={openChatGPT}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {T.chatgpt}
            </button>
            <button
              onClick={() => copy(embedCode, "embed")}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition"
            >
              {copied === "embed" ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              {copied === "embed" ? T.copied : T.embed}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-secondary/50 p-5 sm:p-8 border-t border-border rounded-b-lg space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              {T.popular}
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((p, i) => (
                <button
                  key={i}
                  onClick={() => applyConversion(p.cat, p.from, p.to, p.value)}
                  className="bg-card px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:shadow-sm transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {T.history}
                </h2>
                <button
                  onClick={() => {
                    localStorage.removeItem(HISTORY_KEY);
                    setHistory([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {T.clear}
                </button>
              </div>
              <ul className="space-y-1.5">
                {history.map((h, i) => {
                  const fSym = unitSymbol(h.category, h.from);
                  const tSym = unitSymbol(h.category, h.to);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => applyConversion(h.category, h.from, h.to, h.value)}
                        className="w-full text-left bg-card px-3 py-2 rounded-lg border border-border hover:shadow-sm transition text-sm tabular-nums flex items-center justify-between"
                      >
                        <span>
                          {h.value} {fSym} → {tSym}
                        </span>
                        <span className="font-semibold text-primary">{h.result}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
