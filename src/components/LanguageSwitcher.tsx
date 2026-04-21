import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-1 bg-secondary rounded-full p-0.5"
      role="group"
      aria-label="Language selector"
    >
      <Globe className="w-4 h-4 text-muted-foreground ml-2" aria-hidden />
      <button
        type="button"
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
          lang === "ko"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
          lang === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
