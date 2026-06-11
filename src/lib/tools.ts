export type ToolCategory = "ai" | "fr" | "finance" | "life" | "unit" | "etc";

export type Tool = {
  id: string;
  path: string;
  category: ToolCategory;
  emoji: string;
  titleKey: string;
  descKey: string;
  keywords: string[];
  gradient: string;
  badge?: "hot" | "new";
};

export const TOOLS: Tool[] = [
  // ── AI ────────────────────────────────────────────────────────────────────
  {
    id: "prompt-generator",
    path: "/prompt-generator",
    category: "ai",
    emoji: "✨",
    titleKey: "header.prompt.title",
    descKey: "header.prompt.desc",
    keywords: ["프롬프트", "AI", "ChatGPT", "Claude", "prompt", "generator"],
    gradient:
      "bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-200 dark:from-violet-950 dark:via-purple-900 dark:to-fuchsia-950",
  },
  {
    id: "video-prompt",
    path: "/video-prompt",
    category: "ai",
    emoji: "🎬",
    titleKey: "header.videoprompt.title",
    descKey: "header.videoprompt.desc",
    keywords: ["영상", "비디오", "프롬프트", "Sora", "Runway", "Kling", "video", "prompt"],
    gradient:
      "bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200 dark:from-sky-950 dark:via-blue-900 dark:to-indigo-950",
    badge: "new",
  },
  // ── France ────────────────────────────────────────────────────────────────
  {
    id: "tva",
    path: "/tva",
    category: "fr",
    emoji: "🧾",
    titleKey: "header.tva.title",
    descKey: "header.tva.desc",
    keywords: ["TVA", "부가세", "프랑스", "세금", "VAT", "France", "taxe"],
    gradient:
      "bg-gradient-to-br from-blue-50 via-blue-100 to-sky-200 dark:from-blue-950 dark:via-blue-900 dark:to-sky-950",
  },
  {
    id: "fr-salary",
    path: "/fr-salary",
    category: "fr",
    emoji: "🇫🇷",
    titleKey: "header.frsalary.title",
    descKey: "header.frsalary.desc",
    keywords: ["프랑스", "급여", "순수령", "salaire", "net", "France", "임금"],
    gradient:
      "bg-gradient-to-br from-blue-100 via-indigo-50 to-red-100 dark:from-blue-950 dark:via-slate-900 dark:to-red-950",
  },
  {
    id: "currency",
    path: "/currency",
    category: "fr",
    emoji: "💱",
    titleKey: "header.currency.title",
    descKey: "header.currency.desc",
    keywords: ["환율", "유로", "달러", "원", "EUR", "KRW", "USD", "환전"],
    gradient:
      "bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-950 dark:via-yellow-900 dark:to-orange-950",
  },
  {
    id: "size",
    path: "/size",
    category: "fr",
    emoji: "👟",
    titleKey: "header.size.title",
    descKey: "header.size.desc",
    keywords: ["사이즈", "신발", "의류", "FR", "KR", "US", "UK", "옷", "size"],
    gradient:
      "bg-gradient-to-br from-emerald-100 via-green-100 to-teal-200 dark:from-emerald-950 dark:via-green-900 dark:to-teal-950",
  },
  // ── Calculators ───────────────────────────────────────────────────────────
  {
    id: "salary",
    path: "/salary",
    category: "finance",
    emoji: "💼",
    titleKey: "header.salary.title",
    descKey: "header.salary.desc",
    keywords: ["연봉", "월급", "실수령", "4대보험", "세금", "salary", "net pay"],
    gradient:
      "bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-200 dark:from-indigo-950 dark:via-blue-900 dark:to-cyan-950",
    badge: "hot",
  },
  {
    id: "life",
    path: "/life",
    category: "life",
    emoji: "🧮",
    titleKey: "header.life.title",
    descKey: "header.life.desc",
    keywords: ["실생활", "배달비", "칼로리", "연료비", "이사비", "전기세", "수도", "가스"],
    gradient:
      "bg-gradient-to-br from-teal-100 via-cyan-100 to-sky-200 dark:from-teal-950 dark:via-cyan-900 dark:to-sky-950",
  },
  {
    id: "converter",
    path: "/converter",
    category: "unit",
    emoji: "📐",
    titleKey: "header.converter.title",
    descKey: "header.converter.desc",
    keywords: ["단위", "변환", "길이", "무게", "온도", "cm", "kg", "unit", "converter"],
    gradient:
      "bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-200 dark:from-orange-950 dark:via-amber-900 dark:to-yellow-950",
  },
  {
    id: "ruler",
    path: "/ruler",
    category: "etc",
    emoji: "📏",
    titleKey: "header.ruler.title",
    descKey: "header.ruler.desc",
    keywords: ["자", "눈금", "센티미터", "인치", "ruler", "screen", "cm", "inch", "화면"],
    gradient:
      "bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-200 dark:from-slate-800 dark:via-zinc-800 dark:to-gray-900",
    badge: "new",
  },
];

export const CATEGORY_LABELS: Record<ToolCategory, { ko: string; en: string; fr: string }> = {
  ai:      { ko: "AI",       en: "AI",             fr: "IA"        },
  fr:      { ko: "프랑스",   en: "France",          fr: "France"    },
  finance: { ko: "재무",     en: "Finance",         fr: "Finance"   },
  life:    { ko: "실생활",   en: "Life",            fr: "Quotidien" },
  unit:    { ko: "단위환산", en: "Unit Converter",  fr: "Unités"    },
  etc:     { ko: "기타",     en: "Tools",           fr: "Outils"    },
};

export const toolsByCategory = (category: ToolCategory): Tool[] =>
  TOOLS.filter((t) => t.category === category);

export const toolByPath = (path: string): Tool | undefined =>
  TOOLS.find((t) => t.path === path);

export const toolById = (id: string): Tool | undefined =>
  TOOLS.find((t) => t.id === id);
