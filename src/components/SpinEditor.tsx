import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { SPIN_PRESETS } from "@/lib/spinPresets";

interface Props {
  items: string[];
  canAdd: boolean;
  canRemove: boolean;
  disabled?: boolean;
  onUpdateItem: (index: number, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onReset: () => void;
  onLoadPreset: (id: string) => void;
}

export default function SpinEditor({
  items,
  canAdd,
  canRemove,
  disabled,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onReset,
  onLoadPreset,
}: Props) {
  const { t, lang } = useLanguage();

  const presetName = (p: (typeof SPIN_PRESETS)[number]) =>
    lang === "ko" ? p.nameKo : lang === "fr" ? p.nameFr : p.nameEn;

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t("spin.preset.title")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SPIN_PRESETS.map((p) => (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => onLoadPreset(p.id)}
              className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {presetName(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("spin.editor.title")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onReset}
            className="h-6 text-xs px-2 text-muted-foreground"
          >
            {t("spin.editor.reset")}
          </Button>
        </div>

        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
              />
              <input
                type="text"
                maxLength={20}
                value={item}
                disabled={disabled}
                placeholder={t("spin.editor.placeholder")}
                onChange={(e) => onUpdateItem(i, e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                onClick={() => onRemoveItem(i)}
                disabled={disabled || !canRemove}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {!canRemove && (
          <p className="text-xs text-amber-500 mt-1.5">{t("spin.editor.minWarn")}</p>
        )}
        {!canAdd && (
          <p className="text-xs text-amber-500 mt-1.5">{t("spin.editor.maxWarn")}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !canAdd}
          onClick={onAddItem}
          className="mt-3 w-full text-xs"
        >
          {t("spin.editor.add")}
        </Button>
      </div>
    </div>
  );
}

export const WHEEL_COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#ec4899",
  "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444",
  "#14b8a6", "#a855f7", "#6366f1", "#84cc16",
];
