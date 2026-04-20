import { useState } from "react";
import UnitConverter from "@/components/UnitConverter";
import LifeCalculators from "@/components/LifeCalculators";
import ShareButton from "@/components/ShareButton";

type MainTab = "converter" | "life";

const Index = () => {
  const [tab, setTab] = useState<MainTab>("converter");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-28">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {tab === "converter" ? "단위 환산 계산기" : "실생활 계산기"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {tab === "converter"
                  ? "간편하고 정확한 단위 변환"
                  : "일상에서 자주 쓰는 빠른 계산"}
              </p>
            </div>
            <ShareButton />
          </div>

          {/* Main tab switcher */}
          <div role="tablist" className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg mb-6">
            <button
              role="tab"
              aria-selected={tab === "converter"}
              onClick={() => setTab("converter")}
              className={`py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 ${
                tab === "converter"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📐 단위 환산
            </button>
            <button
              role="tab"
              aria-selected={tab === "life"}
              onClick={() => setTab("life")}
              className={`py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 ${
                tab === "life"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🧮 실생활 계산기
            </button>
          </div>

          {tab === "converter" ? <UnitConverter /> : <LifeCalculators />}
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
          className="mx-auto max-w-2xl h-[60px] sm:h-[90px] flex items-center justify-center pointer-events-auto"
          aria-label="광고 영역"
        >
          <ins
            className="kakao_ad_area"
            style={{ display: "none" }}
            data-ad-unit="DAN-6tTcPC6UlHze0Mjr"
            data-ad-width="320"
            data-ad-height="50"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
