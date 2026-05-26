import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "KO" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-1 bg-secondary rounded-full p-0.5"
      role="group"
      aria-label="Language selector"
    >
      <Globe className="w-4 h-4 text-muted-foreground ml-2" aria-hidden />
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            lang === code
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
