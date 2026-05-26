import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

type SizeTab = "shoes" | "top" | "bottom";
type Gender = "men" | "women";

interface ShoeRow { fr: number; kr: number; usM: string; usW: string; uk: string }
interface ClothesRow { label: string; fr: string; kr: string; us: string }
interface BottomRow { fr: number; kr: string; us: string }

const SHOES_MEN: ShoeRow[] = [
  { fr: 38, kr: 240, usM: "6",   usW: "7.5", uk: "5"   },
  { fr: 39, kr: 245, usM: "6.5", usW: "8",   uk: "5.5" },
  { fr: 40, kr: 250, usM: "7",   usW: "8.5", uk: "6"   },
  { fr: 41, kr: 255, usM: "7.5", usW: "9",   uk: "6.5" },
  { fr: 42, kr: 260, usM: "8",   usW: "9.5", uk: "7"   },
  { fr: 43, kr: 265, usM: "9",   usW: "10.5",uk: "8"   },
  { fr: 44, kr: 270, usM: "9.5", usW: "11",  uk: "8.5" },
  { fr: 45, kr: 275, usM: "10",  usW: "11.5",uk: "9"   },
  { fr: 46, kr: 280, usM: "11",  usW: "12.5",uk: "10"  },
  { fr: 47, kr: 285, usM: "12",  usW: "13.5",uk: "11"  },
];

const SHOES_WOMEN: ShoeRow[] = [
  { fr: 35, kr: 220, usM: "4",   usW: "5",   uk: "2.5" },
  { fr: 36, kr: 225, usM: "4.5", usW: "5.5", uk: "3"   },
  { fr: 37, kr: 235, usM: "5",   usW: "6",   uk: "3.5" },
  { fr: 38, kr: 240, usM: "5.5", usW: "7",   uk: "4"   },
  { fr: 39, kr: 245, usM: "6",   usW: "7.5", uk: "4.5" },
  { fr: 40, kr: 250, usM: "6.5", usW: "8",   uk: "5"   },
  { fr: 41, kr: 255, usM: "7",   usW: "8.5", uk: "5.5" },
  { fr: 42, kr: 260, usM: "7.5", usW: "9",   uk: "6"   },
];

const TOPS: ClothesRow[] = [
  { label: "XS", fr: "34-36", kr: "85",       us: "XS"  },
  { label: "S",  fr: "36-38", kr: "88-90",    us: "S"   },
  { label: "M",  fr: "38-40", kr: "90-95",    us: "M"   },
  { label: "L",  fr: "40-42", kr: "95-100",   us: "L"   },
  { label: "XL", fr: "42-44", kr: "100-105",  us: "XL"  },
  { label: "2XL",fr: "44-46", kr: "105-110",  us: "XXL" },
  { label: "3XL",fr: "46-48", kr: "110-115",  us: "3XL" },
  { label: "4XL",fr: "48-50", kr: "115-120",  us: "4XL" },
];

const BOTTOMS: BottomRow[] = [
  { fr: 34, kr: "66",  us: "25" },
  { fr: 36, kr: "68",  us: "26" },
  { fr: 38, kr: "70",  us: "27" },
  { fr: 40, kr: "72",  us: "28" },
  { fr: 42, kr: "74-76", us: "29-30" },
  { fr: 44, kr: "78-80", us: "31-32" },
  { fr: 46, kr: "82-84", us: "33-34" },
  { fr: 48, kr: "86-88", us: "35-36" },
  { fr: 50, kr: "90-92", us: "38-39" },
];

export default function SizeConverter() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<SizeTab>("shoes");
  const [gender, setGender] = useState<Gender>("men");
  const [selected, setSelected] = useState<string | null>(null);

  const TABS: { key: SizeTab; label: string }[] = [
    { key: "shoes",  label: t("size.tab.shoes")  },
    { key: "top",    label: t("size.tab.top")    },
    { key: "bottom", label: t("size.tab.bottom") },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("size.heading")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("size.subheading")}</p>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-3 gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setSelected(null); }}
            className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
              tab === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Gender toggle (shoes only) */}
      {tab === "shoes" && (
        <div className="grid grid-cols-2 gap-2">
          {(["men", "women"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => { setGender(g); setSelected(null); }}
              className={`py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                gender === g
                  ? "bg-secondary text-foreground border-border shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {t(g === "men" ? "size.gender.men" : "size.gender.women")}
            </button>
          ))}
        </div>
      )}

      {/* Find my size input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t("size.your")}</label>
        <input
          type="text"
          value={selected ?? ""}
          onChange={(e) => setSelected(e.target.value || null)}
          placeholder={tab === "shoes" ? "42" : tab === "top" ? "M" : "40"}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {tab === "shoes" && <ShoeTable rows={gender === "men" ? SHOES_MEN : SHOES_WOMEN} gender={gender} selected={selected} t={t} />}
        {tab === "top"   && <TopTable rows={TOPS} selected={selected} t={t} />}
        {tab === "bottom"&& <BottomTable rows={BOTTOMS} selected={selected} t={t} />}
      </div>

      <p className="text-xs text-muted-foreground">
        {tab === "shoes" ? t("size.note.shoes") : t("size.note.clothes")}
      </p>
    </div>
  );
}

function isMatch(val: string, search: string | null): boolean {
  if (!search) return false;
  return String(val).toLowerCase() === search.toLowerCase();
}

function ShoeTable({ rows, gender, selected, t }: { rows: ShoeRow[]; gender: Gender; selected: string | null; t: (k: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) => string }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-secondary/60 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.fr")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.kr")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">US {gender === "men" ? "M" : "W"}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.uk")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r) => {
          const hi = isMatch(String(r.fr), selected) || isMatch(String(r.kr), selected) || isMatch(gender === "men" ? r.usM : r.usW, selected) || isMatch(r.uk, selected);
          return (
            <tr key={r.fr} className={hi ? "bg-primary/10 font-semibold" : "hover:bg-secondary/30"}>
              <td className="px-3 py-2">{r.fr}</td>
              <td className="px-3 py-2">{r.kr}</td>
              <td className="px-3 py-2">{gender === "men" ? r.usM : r.usW}</td>
              <td className="px-3 py-2">{r.uk}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TopTable({ rows, selected, t }: { rows: ClothesRow[]; selected: string | null; t: (k: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) => string }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-secondary/60 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.label")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.fr")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.kr.clothes")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.us")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r) => {
          const hi = isMatch(r.label, selected) || isMatch(r.fr, selected) || isMatch(r.kr, selected) || isMatch(r.us, selected);
          return (
            <tr key={r.label} className={hi ? "bg-primary/10 font-semibold" : "hover:bg-secondary/30"}>
              <td className="px-3 py-2">{r.label}</td>
              <td className="px-3 py-2">{r.fr}</td>
              <td className="px-3 py-2">{r.kr}</td>
              <td className="px-3 py-2">{r.us}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function BottomTable({ rows, selected, t }: { rows: BottomRow[]; selected: string | null; t: (k: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) => string }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-secondary/60 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.fr")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.kr.clothes")}</th>
          <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{t("size.col.us")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r) => {
          const hi = isMatch(String(r.fr), selected) || isMatch(r.kr, selected) || isMatch(r.us, selected);
          return (
            <tr key={r.fr} className={hi ? "bg-primary/10 font-semibold" : "hover:bg-secondary/30"}>
              <td className="px-3 py-2">{r.fr}</td>
              <td className="px-3 py-2">{r.kr}</td>
              <td className="px-3 py-2">{r.us}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
