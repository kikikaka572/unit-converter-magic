import { useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import SpinWheel, { type SpinWheelHandle } from "@/components/SpinWheel";
import SpinEditor from "@/components/SpinEditor";
import SpinResult from "@/components/SpinResult";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { useLanguage } from "@/i18n/LanguageContext";

function relativeTime(timestamp: number, agoLabel: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return "< 1" + agoLabel;
  return `${mins}${agoLabel}`;
}

export default function SpinPage() {
  const { t, lang } = useLanguage();
  const wheelRef = useRef<SpinWheelHandle>(null);
  const {
    items,
    winner,
    showResult,
    history,
    soundEnabled,
    setSoundEnabled,
    canAdd,
    canRemove,
    updateItem,
    addItem,
    removeItem,
    resetItems,
    loadPreset,
    handleSpinComplete,
    dismissResult,
    clearHistory,
    deleteHistoryItem,
  } = useSpinWheel();

  function handleSpinAgain() {
    // small delay so the modal closes before the spin starts
    setTimeout(() => wheelRef.current?.spin(), 120);
  }

  return (
    <ToolPageLayout toolId="spin">
      <div className="space-y-6">
        {/* Sound toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                {t("spin.soundOn")}
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                {t("spin.soundOff")}
              </>
            )}
          </button>
        </div>

        {/* Main: wheel + editor */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Wheel */}
          <div className="mx-auto lg:mx-0 w-full" style={{ maxWidth: 380 }}>
            <SpinWheel
              ref={wheelRef}
              items={items}
              soundEnabled={soundEnabled}
              onSpinComplete={handleSpinComplete}
            />
            <p className="mt-2 text-xs text-center text-muted-foreground">
              {lang === "ko" ? "클릭하거나 탭해서 돌리세요" :
               lang === "fr" ? "Cliquez pour tourner" :
               "Click or tap to spin"}
            </p>
          </div>

          {/* Editor */}
          <div className="w-full lg:w-auto">
            <SpinEditor
              items={items}
              canAdd={canAdd}
              canRemove={canRemove}
              onUpdateItem={updateItem}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onReset={resetItems}
              onLoadPreset={loadPreset}
            />
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <section className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">{t("spin.history.title")}</h2>
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("spin.history.clear")}
              </button>
            </div>
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/50 text-sm"
                >
                  <span className="font-medium">{h.item}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {relativeTime(h.timestamp, t("spin.history.ago"))}
                    <button
                      onClick={() => deleteHistoryItem(i)}
                      className="hover:text-foreground transition-colors"
                      aria-label="delete"
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            {t("spin.history.empty")}
          </p>
        )}
      </div>

      <SpinResult
        open={showResult}
        winner={winner ?? ""}
        onClose={dismissResult}
        onSpinAgain={handleSpinAgain}
      />
    </ToolPageLayout>
  );
}
