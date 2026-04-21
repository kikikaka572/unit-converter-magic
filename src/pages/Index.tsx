import { useState } from "react";
import UnitConverter from "@/components/UnitConverter";
import LifeCalculators from "@/components/LifeCalculators";
import SalaryCalculator from "@/components/SalaryCalculator";
import ShareButton from "@/components/ShareButton";

type MainTab = "salary" | "life" | "converter";

const TAB_META: Record<MainTab, { title: string; desc: string; emoji: string; label: string }> = {
  salary: {
    title: "연봉 실수령액 계산기",
    desc: "2026년 4대보험·세금 반영 실수령액",
    emoji: "💼",
    label: "연봉 계산",
  },
  life: {
    title: "실생활 계산기",
    desc: "일상에서 자주 쓰는 빠른 계산",
    emoji: "🧮",
    label: "실생활 계산",
  },
  converter: {
    title: "단위 환산 계산기",
    desc: "간편하고 정확한 단위 변환",
    emoji: "📐",
    label: "단위 환산",
  },
};

const TAB_ORDER: MainTab[] = ["salary", "life", "converter"];

const Index = () => {
  const [tab, setTab] = useState<MainTab>("salary");
  const meta = TAB_META[tab];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-28">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {meta.title}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{meta.desc}</p>
            </div>
            <ShareButton />
          </div>

          {/* Main tab switcher */}
          <div role="tablist" className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-lg mb-6">
            {TAB_ORDER.map((key) => {
              const m = TAB_META[key];
              const active = tab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`py-2.5 px-1 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 truncate ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>

          {tab === "salary" && <SalaryCalculator />}
          {tab === "life" && <LifeCalculators />}
          {tab === "converter" && <UnitConverter />}
        </div>
      </main>

      {/* Side ad slot - PC only (카카오 애드핏 세로 160x600) */}
      <aside
        className="hidden xl:block fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(1rem, calc((100vw - 42rem) / 2 - 180px))" }}
        aria-label="사이드 광고 영역"
      >
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit="DAN-T9XQ5UbtP5nbv77q"
          data-ad-width="160"
          data-ad-height="600"
        />
      </aside>

      {/* Bottom ad slot (카카오 애드핏) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div
          id="ad-slot-bottom"
          className="mx-auto max-w-3xl h-[60px] sm:h-[100px] flex items-center justify-center pointer-events-none"
          aria-label="광고 영역"
        >
          {/* Mobile: 320x50 */}
          <ins
            className="kakao_ad_area sm:hidden pointer-events-auto"
            style={{ display: "none" }}
            data-ad-unit="DAN-6tTcPC6UlHze0Mjr"
            data-ad-width="320"
            data-ad-height="50"
          />
          {/* PC: 728x90 */}
          <ins
            className="kakao_ad_area hidden sm:inline-block pointer-events-auto"
            style={{ display: "none" }}
            data-ad-unit="DAN-rZBdEeZIqgjpI6x9"
            data-ad-width="728"
            data-ad-height="90"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
