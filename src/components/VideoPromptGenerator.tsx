import { useState, useCallback } from "react";
import { Film, Copy, Check, RefreshCw, Wand2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Style    = "cinematic" | "anime" | "realistic" | "documentary" | "commercial" | "music-video" | "abstract";
type Camera   = "static" | "pan" | "zoom-in" | "zoom-out" | "tracking" | "drone" | "handheld";
type Mood     = "dark-moody" | "warm-cozy" | "bright-energetic" | "melancholic" | "epic-dramatic" | "minimal-calm";
type Duration = "5s" | "10s" | "30s" | "60s";

const styleOptions: { value: Style; ko: string; en: string }[] = [
  { value: "cinematic",   ko: "영화 같은",         en: "Cinematic" },
  { value: "anime",       ko: "애니메이션",         en: "Anime" },
  { value: "realistic",   ko: "실사",               en: "Realistic" },
  { value: "documentary", ko: "다큐멘터리",         en: "Documentary" },
  { value: "commercial",  ko: "광고",               en: "Commercial" },
  { value: "music-video", ko: "뮤직비디오",         en: "Music Video" },
  { value: "abstract",    ko: "추상적 / 아트",      en: "Abstract" },
];

const cameraOptions: { value: Camera; ko: string; en: string }[] = [
  { value: "static",    ko: "고정",      en: "Static shot" },
  { value: "pan",       ko: "패닝",      en: "Pan" },
  { value: "zoom-in",   ko: "줌인",      en: "Zoom in" },
  { value: "zoom-out",  ko: "줌아웃",    en: "Zoom out" },
  { value: "tracking",  ko: "트래킹",    en: "Tracking shot" },
  { value: "drone",     ko: "드론",      en: "Aerial / Drone" },
  { value: "handheld",  ko: "핸드헬드",  en: "Handheld" },
];

const moodOptions: { value: Mood; ko: string; en: string }[] = [
  { value: "dark-moody",       ko: "어둡고 무거운",        en: "Dark & Moody" },
  { value: "warm-cozy",        ko: "따뜻하고 아늑한",      en: "Warm & Cozy" },
  { value: "bright-energetic", ko: "밝고 활기찬",          en: "Bright & Energetic" },
  { value: "melancholic",      ko: "몽환적 / 감성적",      en: "Melancholic" },
  { value: "epic-dramatic",    ko: "웅장하고 드라마틱",    en: "Epic & Dramatic" },
  { value: "minimal-calm",     ko: "미니멀하고 차분한",    en: "Minimal & Calm" },
];

const durationOptions: { value: Duration; ko: string }[] = [
  { value: "5s",  ko: "5초 이내" },
  { value: "10s", ko: "10초" },
  { value: "30s", ko: "30초" },
  { value: "60s", ko: "1분" },
];

const styleMap: Record<Style, string> = {
  cinematic:     "Cinematic style, film grain texture, anamorphic lens flare",
  anime:         "Anime style, vibrant colors, hand-drawn aesthetic",
  realistic:     "Ultra-realistic, photorealistic, lifelike details",
  documentary:   "Documentary style, raw and natural lighting, observational tone",
  commercial:    "Commercial style, clean and polished, high-end production",
  "music-video": "Music video style, dynamic cuts, stylized visuals",
  abstract:      "Abstract art style, surreal visuals, experimental aesthetics",
};

const cameraMap: Record<Camera, string> = {
  static:    "Static shot, fixed camera, no movement",
  pan:       "Smooth pan shot, horizontal camera movement",
  "zoom-in": "Slow zoom in, gradually closing in on the subject",
  "zoom-out":"Slow zoom out, pulling back to reveal the scene",
  tracking:  "Tracking shot following the subject",
  drone:     "Aerial drone shot, bird-eye view, sweeping movement",
  handheld:  "Handheld camera, slight shake, intimate and raw feel",
};

const moodMap: Record<Mood, string> = {
  "dark-moody":       "Dark and moody atmosphere, deep shadows, brooding tone",
  "warm-cozy":        "Warm and cozy atmosphere, golden tones, soft lighting",
  "bright-energetic": "Bright and energetic, vivid colors, dynamic feel",
  melancholic:        "Melancholic and dreamlike, soft focus, emotional tone",
  "epic-dramatic":    "Epic and dramatic, powerful composition, sweeping scale",
  "minimal-calm":     "Minimal and calm, clean composition, peaceful mood",
};

const durationMap: Record<Duration, string> = {
  "5s":  "5 seconds",
  "10s": "10 seconds",
  "30s": "30 seconds",
  "60s": "60 seconds",
};

const QUALITY = "4K resolution, ultra-high quality, cinematic color grading, professional lighting";

function buildBlocks(scene: string, style: Style, camera: Camera, mood: Mood, duration: Duration, extra: string): string[] {
  const blocks = [
    "[Scene] " + scene,
    "[Style] " + styleMap[style],
    "[Camera] " + cameraMap[camera],
    "[Mood] " + moodMap[mood],
    "[Quality] " + QUALITY,
    "[Duration] " + durationMap[duration],
  ];
  if (extra.trim()) blocks.push("[Notes] " + extra.trim());
  return blocks;
}

const AI_LIST = [
  { name: "Sora",    emoji: "⚡", url: "https://sora.com/",                                        hov: "hover:border-green-400" },
  { name: "Runway",  emoji: "🎬", url: "https://runwayml.com/",                                    hov: "hover:border-purple-400" },
  { name: "Kling",   emoji: "🎞", url: "https://klingai.com/",                                     hov: "hover:border-pink-400" },
  { name: "Pika",    emoji: "🎥", url: "https://pika.art/",                                        hov: "hover:border-blue-400" },
  { name: "Veo",     emoji: "✦",  url: "https://deepmind.google/technologies/veo/",                hov: "hover:border-amber-400" },
];

const BCOLORS = [
  "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
  "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700",
  "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
  "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800",
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

export default function VideoPromptGenerator() {
  const { lang } = useLanguage();
  const ko = lang === "ko";

  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [scene,    setScene]    = useState("");
  const [style,    setStyle]    = useState<Style>("cinematic");
  const [camera,   setCamera]   = useState<Camera>("tracking");
  const [mood,     setMood]     = useState<Mood>("dark-moody");
  const [duration, setDuration] = useState<Duration>("10s");
  const [extra,    setExtra]    = useState("");
  const [blocks,   setBlocks]   = useState<string[]>([]);
  const [copied,   setCopied]   = useState(false);

  const full = blocks.join("\n\n");

  const handleGenerate = useCallback(() => {
    if (!scene.trim()) {
      (document.getElementById("vp-scene") as HTMLTextAreaElement | null)?.focus();
      return;
    }
    setBlocks(buildBlocks(scene.trim(), style, camera, mood, duration, extra));
    setStep(2);
  }, [scene, style, camera, mood, duration, extra]);

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
    setStep(1); setScene(""); setExtra("");
    setStyle("cinematic"); setCamera("tracking");
    setMood("dark-moody"); setDuration("10s");
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
          {/* 장면 묘사 */}
          <div>
            <label htmlFor="vp-scene" className="text-sm font-medium text-foreground block mb-1.5">
              {ko ? "어떤 영상을 만들고 싶으신가요?" : "Describe the video scene"}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              id="vp-scene"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              placeholder={
                ko
                  ? "예: 새벽 도심 골목을 걷는 여성, 빗속에서 우산을 쓰고 천천히 걷는 장면"
                  : "e.g. A woman walking slowly through a narrow alley in the early morning city, holding an umbrella in the rain"
              }
              rows={3}
              className="w-full min-h-[90px] px-3 py-2.5 text-sm border border-border rounded-xl bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* 옵션 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "영상 스타일" : "Style"}
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as Style)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {styleOptions.map((o) => (
                  <option key={o.value} value={o.value}>{ko ? o.ko : o.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "카메라 무브먼트" : "Camera"}
              </label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value as Camera)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {cameraOptions.map((o) => (
                  <option key={o.value} value={o.value}>{ko ? o.ko : o.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "분위기 / 감성" : "Mood"}
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as Mood)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {moodOptions.map((o) => (
                  <option key={o.value} value={o.value}>{ko ? o.ko : o.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                {ko ? "영상 길이" : "Duration"}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as Duration)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {durationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.ko}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 추가 참고사항 */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              {ko ? "추가 참고사항" : "Additional notes"}
              <span className="text-xs text-muted-foreground font-normal ml-1">
                ({ko ? "선택사항" : "optional"})
              </span>
            </label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder={ko ? "예: 4K 화질, 골든아워 조명, 슬로우모션 효과 포함" : "e.g. 4K quality, golden hour lighting, slow motion effect"}
              rows={2}
              className="w-full min-h-[60px] px-3 py-2.5 text-sm border border-border rounded-xl bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Film size={14} className="shrink-0" />
            {ko ? "영상 생성 AI에 최적화된 영문 프롬프트입니다." : "Optimized English prompt for video AI."}
          </div>
          <div className="space-y-2">
            {blocks.map((block, i) => (
              <div key={i} className={"p-3 rounded-xl border text-sm leading-relaxed font-mono " + BCOLORS[i % BCOLORS.length]}>
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
              {copied ? (ko ? "복사됨" : "Copied!") : (ko ? "영문 프롬프트 복사" : "Copy Prompt")}
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
              {ko ? "AI에서 사용하기 →" : "Use in AI →"}
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
              : "Prompt copied. Paste (Ctrl+V / Cmd+V) once the AI service opens."}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
