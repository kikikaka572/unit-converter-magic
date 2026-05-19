import { useState, useCallback } from "react";
import {
  FileText, BarChart2, MessageSquare, Lightbulb,
  Search, Languages, Copy, Check, RefreshCw, Wand2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Category = "document" | "data" | "comm" | "idea" | "research" | "translate";
type Tone = "formal" | "concise" | "friendly" | "creative";
type Format = "paragraph" | "bullet" | "table" | "step";

const catData = {
  document:  { icon: "FT", ko: "문서 작성",     en: "Documents",     desc_ko: "보고서, 기획서, 이메일", desc_en: "Reports, proposals, emails",          role: "문서 작성 전문가",             context: "업무 문서 작성 및 비즈니스 글쓰기" },
  data:      { icon: "BC", ko: "데이터 분석",   en: "Data Analysis", desc_ko: "엑셀 수식, 데이터 해석", desc_en: "Excel formulas, data insights",        role: "데이터 분석 전문가",           context: "데이터 해석 및 인사이트 도출" },
  comm:      { icon: "MS", ko: "커뮤니케이션", en: "Communication", desc_ko: "회의록, 발표 자료",       desc_en: "Meeting notes, presentations",         role: "비즈니스 커뮤니케이션 전문가", context: "조직 내 커뮤니케이션 및 회의 관리" },
  idea:      { icon: "LB", ko: "아이디어 발산", en: "Ideation",      desc_ko: "브레인스토밍, 문제 해결", desc_en: "Brainstorming, problem solving",       role: "아이디어 기획 전문가",         context: "창의적 문제 해결 및 아이디어 발산" },
  research:  { icon: "SR", ko: "리서치",        en: "Research",      desc_ko: "시장조사, 경쟁사 분석",   desc_en: "Market research, competitor analysis", role: "시장 리서치 전문가",           context: "시장 및 경쟁 환경 분석" },
  translate: { icon: "LG", ko: "번역 / 교정",   en: "Translation",   desc_ko: "영문 번역, 문장 다듬기",  desc_en: "Translation, proofreading",           role: "번역 및 교정 전문가",         context: "정확하고 자연스러운 언어 변환" },
} as const;

const toneOptions: { value: Tone; ko: string; en: string }[] = [
  { value: "formal",   ko: "공식적 / 정중한",    en: "Formal & Professional" },
  { value: "concise",  ko: "간결하고 핵심만",     en: "Concise & To the Point" },
  { value: "friendly", ko: "친근하고 자연스럽게", en: "Friendly & Natural" },
  { value: "creative", ko: "창의적으로",          en: "Creative" },
];

const formatOptions: { value: Format; ko: string; en: string }[] = [
  { value: "paragraph", ko: "산문 (자연스러운 글)", en: "Prose" },
  { value: "bullet",    ko: "불릿 포인트 목록",     en: "Bullet Points" },
  { value: "table",     ko: "표 형태",             en: "Table" },
  { value: "step",      ko: "단계별 설명",          en: "Step-by-step" },
];

const toneMap: Record<Tone, string> = {
  formal: "격식체로, 정중하게", concise: "간결하게, 핵심만",
  friendly: "친근하고 자연스럽게", creative: "창의적이고 독창적으로",
};
const fmtMap: Record<Format, string> = {
  paragraph: "자연스러운 산문 형태", bullet: "불릿 포인트 목록",
  table: "표 형태로 정리", step: "단계별 번호 목록",
};

function buildBlocks(cat: Category, input: string, tone: Tone, fmt: Format): string[] {
  const c = catData[cat];
  return [
    "[역할] 당신은 " + c.role + "입니다.",
    "[맥락] " + c.context + " 분야에서 실무 경험이 풍부한 전문가로서 답변해주세요.",
    "[요청] " + input,
    "[형식] " + toneMap[tone] + "로 작성하고, " + fmtMap[fmt] + "로 출력해주세요.",
  ];
}

const AI_LIST = [
  { name: "ChatGPT", emoji: "🤖", url: "https://chat.openai.com/",   hov: "hover:border-green-400" },
  { name: "Claude",  emoji: "🧠", url: "https://claude.ai/new",      hov: "hover:border-orange-400" },
  { name: "Gemini",  emoji: "✨", url: "https://gemini.google.com/", hov: "hover:border-blue-400" },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

const BCOLORS = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-amber-50 border-amber-200",
  "bg-purple-50 border-purple-200",
];

function CatIcon({ icon }: { icon: string }) {
  if (icon === "FT") return <FileText size={20} />;
  if (icon === "BC") return <BarChart2 size={20} />;
  if (icon === "MS") return <MessageSquare size={20} />;
  if (icon === "LB") return <Lightbulb size={20} />;
  if (icon === "SR") return <Search size={20} />;
  return <Languages size={20} />;
}

export default function PromptGenerator() {
  const { lang } = useLanguage();
  const ko = lang === "ko";

  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category>("document");
  const [input,    setInput]    = useState("");
  const [tone,     setTone]     = useState<Tone>("formal");
  const [fmt,      setFmt]      = useState<Format>("paragraph");
  const [blocks,   setBlocks]   = useState<string[]>([]);
  const [copied,   setCopied]   = useState(false);

  const full = blocks.join("\n\n");

  const handleGenerate = useCallback(() => {
    if (!input.trim()) {
      (document.getElementById("pg-input") as HTMLTextAreaElement | null)?.focus();
      return;
    }
    setBlocks(buildBlocks(category, input.trim(), tone, fmt));
    setStep(2);
  }, [category, input, tone, fmt]);

  const handleCopy = useCallback(async () => {
    if (await copyText(full)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [full]);

  const sendToAI = useCallback(async (url: string) => {
    await copyText(full);
    window.open(url, "_blank", "noopener");
  }, [full]);

  const reset = () => {
    setStep(1); setInput(""); setCategory("document");
    setTone("formal"); setFmt("paragraph");
    setBlocks([]); setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={
            "rounded-full transition-all " +
            (step === s ? "w-6 h-2.5 bg-primary" : step > s ? "w-2.5 h-2.5 bg-primary/40" : "w-2.5 h-2.5 bg-muted")
          } />
        ))}
      </div>

      {/* STEP 1 — 입력 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              {ko ? "목적 선택" : "Select purpose"}
              <span className="text-xs text-muted-foreground font-normal ml-1">
                ({ko ? "선택사항" : "optional"})
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(catData) as Category[]).map((key) => {
                const c = catData[key];
                const active = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={
                      "flex items-start gap-2 p-3 rounded-xl border text-left transition-all " +
                      (active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50")
                    }
                  >
                    <span className={"mt-0.5 shrink-0 " + (active ? "text-primary" : "text-muted-foreground")}>
                      <CatIcon icon={c.icon} />
                    </span>
                    <div>
                      <div className={"text-sm font-semibold leading-tight " + (active ? "text-primary" : "text-foreground")}>
                        {ko ? c.ko : c.en}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {ko ? c.desc_ko : c.desc_en}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="pg-input" className="text-sm font-medium text-foreground block mb-1.5">
              {ko ? "무엇을 도와드릴까요?" : "What do you need help with?"}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              id="pg-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                ko
                  ? "예: 신규 서비스 런칭 관련 팀장 보고용 이메일을 써줘. 출시일은 다음 달 초고, 주요 기능 3가지를 강조해줘."
                  : "e.g. Write an email to my manager about a new service launch. Highlight 3 key features."
              }
              rows={4}
              className="w-full min-h-[100px] px-3 py-2.5 text-sm border border-border rounded-xl bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "톤" : "Tone"}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {toneOptions.map((o) => (
                  <option key={o.value} value={o.value}>{ko ? o.ko : o.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "형식" : "Format"}
              </label>
              <select
                value={fmt}
                onChange={(e) => setFmt(e.target.value as Format)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {formatOptions.map((o) => (
                  <option key={o.value} value={o.value}>{ko ? o.ko : o.en}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Wand2 size={16} />
            {ko ? "프롬프트 생성" : "Generate Prompt"}
          </button>
        </div>
      )}

      {/* STEP 2 — 확인 */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {ko ? "생성된 프롬프트를 확인하고 AI에게 전달하세요." : "Review your prompt and send it to an AI service."}
          </p>
          <div className="space-y-2">
            {blocks.map((block, i) => (
              <div key={i} className={"p-3 rounded-xl border text-sm leading-relaxed " + BCOLORS[i]}>
                {block}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className={
                "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all " +
                (copied ? "border-green-400 text-green-700 bg-green-50" : "border-border bg-card hover:border-primary/50")
              }
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? (ko ? "복사됨" : "Copied!") : (ko ? "전체 복사" : "Copy All")}
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/50 transition-all"
            >
              <RefreshCw size={14} />
              {ko ? "다시 작성" : "Rewrite"}
            </button>
            <button
              onClick={async () => { await copyText(full); setStep(3); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors sm:ml-auto"
            >
              {ko ? "AI에게 전달 →" : "Send to AI →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — AI 선택 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            {ko
              ? "프롬프트가 클립보드에 복사됐습니다. AI 서비스가 열리면 붙여넣기(Ctrl+V / Cmd+V)로 바로 사용하세요."
              : "Prompt copied to clipboard. Paste (Ctrl+V / Cmd+V) once the AI service opens."}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {AI_LIST.map((ai) => (
              <button
                key={ai.name}
                type="button"
                onClick={() => sendToAI(ai.url)}
                className={"flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card transition-all hover:shadow-md " + ai.hov}
              >
                <span className="text-3xl leading-none">{ai.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{ai.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/50 transition-all"
            >
              {ko ? "← 프롬프트 보기" : "← View Prompt"}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:border-primary/50 transition-all"
            >
              <RefreshCw size={14} />
              {ko ? "처음부터" : "Start Over"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
