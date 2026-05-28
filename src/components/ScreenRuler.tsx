import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/i18n/LanguageContext";

const CREDIT_CARD_MM = 85.6;
const STORAGE_KEY = "ruler_dpi";
const RULER_THICKNESS = 68;

type Unit = "cm" | "mm" | "in";
type Dir = "h" | "v";

function savedDpi(): number | null {
  const s = localStorage.getItem(STORAGE_KEY);
  return s ? Number(s) : null;
}

// ---- Canvas drawing --------------------------------------------------------

function drawTick(
  ctx: CanvasRenderingContext2D,
  pos: number,
  th: number,
  isH: boolean,
  W: number,
  H: number,
) {
  ctx.beginPath();
  if (isH) {
    ctx.moveTo(pos, H - 1.5);
    ctx.lineTo(pos, H - 1.5 - th);
  } else {
    ctx.moveTo(W - 1.5, pos);
    ctx.lineTo(W - 1.5 - th, pos);
  }
  ctx.stroke();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  pos: number,
  isH: boolean,
) {
  if (pos < 12) return;
  ctx.save();
  if (isH) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, pos, 5);
  } else {
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 4, pos);
  }
  ctx.restore();
}

function drawRuler(
  canvas: HTMLCanvasElement,
  logW: number,
  logH: number,
  dpi: number,
  unit: Unit,
  dir: Dir,
) {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains("dark");
  ctx.fillStyle = isDark ? "#0f172a" : "#fffdf5";
  ctx.fillRect(0, 0, logW, logH);

  const isH = dir === "h";
  const length = isH ? logW : logH;

  ctx.strokeStyle = isDark ? "#334155" : "#c8b890";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (isH) {
    ctx.moveTo(0, logH - 0.75);
    ctx.lineTo(logW, logH - 0.75);
  } else {
    ctx.moveTo(logW - 0.75, 0);
    ctx.lineTo(logW - 0.75, logH);
  }
  ctx.stroke();

  ctx.strokeStyle = isDark ? "#94a3b8" : "#6b5a30";
  ctx.fillStyle = isDark ? "#cbd5e1" : "#3a2a0a";
  ctx.font = "10px 'Courier New', monospace";

  const pxPerMm = dpi / 25.4;

  if (unit === "in") {
    const total16 = Math.ceil((length / dpi) * 16) + 16;
    for (let i = 0; i <= total16; i++) {
      const pos = (i / 16) * dpi;
      if (pos > length) break;
      let th: number;
      const isWhole = i % 16 === 0;
      if (isWhole)           { th = 24; }
      else if (i % 8 === 0)  { th = 17; }
      else if (i % 4 === 0)  { th = 12; }
      else if (i % 2 === 0)  { th = 8; }
      else                   { th = 5; }
      ctx.lineWidth = isWhole ? 1.5 : th >= 12 ? 1 : 0.5;
      drawTick(ctx, pos, th, isH, logW, logH);
      if (isWhole) drawLabel(ctx, `${i / 16}″`, pos, isH);
    }
  } else {
    const totalMm = Math.ceil(length / pxPerMm) + 10;
    for (let mm = 0; mm <= totalMm; mm++) {
      const pos = mm * pxPerMm;
      if (pos > length) break;
      let th: number;
      const isMajor = mm % 10 === 0;
      if (isMajor)          { th = 24; }
      else if (mm % 5 === 0){ th = 14; }
      else                  { th = 7; }
      ctx.lineWidth = isMajor ? 1.5 : mm % 5 === 0 ? 1 : 0.5;
      drawTick(ctx, pos, th, isH, logW, logH);
      if (isMajor) {
        const lbl = unit === "cm" ? String(mm / 10) : String(mm);
        drawLabel(ctx, lbl, pos, isH);
      }
    }
  }

  ctx.restore();
}

// ---- Calibration widget ----------------------------------------------------

interface CalibProps {
  defaultDpi: number;
  onConfirm: (dpi: number) => void;
  onSkip: () => void;
  ko: boolean;
  fr: boolean;
}

function CalibrationCard({ defaultDpi, onConfirm, onSkip, ko, fr }: CalibProps) {
  const [widthPx, setWidthPx] = useState((CREDIT_CARD_MM * defaultDpi) / 25.4);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = widthPx;
    },
    [widthPx],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setWidthPx(Math.max(80, startW.current + (e.clientX - startX.current)));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const newDpi = (widthPx / CREDIT_CARD_MM) * 25.4;
  const cardH = Math.round((widthPx * 54) / CREDIT_CARD_MM);

  const instruction = ko
    ? "신용카드를 화면에 올려놓고 오른쪽 핸들을 드래그해 카드 너비에 맞춰주세요."
    : fr
      ? "Posez une carte bancaire sur l'écran et faites glisser la poignée droite pour correspondre à sa largeur."
      : "Place a credit card flat on the screen and drag the right handle until the box matches its width.";

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <div className="text-center max-w-sm">
        <h3 className="font-bold text-base text-foreground mb-2">
          {ko ? "화면 캘리브레이션" : fr ? "Calibration de l'écran" : "Screen Calibration"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{instruction}</p>
      </div>

      <div className="relative">
        <div
          className="relative rounded-xl border-2 border-primary bg-primary/10 flex items-center justify-center select-none"
          style={{ width: widthPx, height: cardH }}
        >
          <span className="text-xs text-primary font-bold">85.6 mm</span>
          <div
            className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-col-resize rounded-r-xl bg-primary/20 hover:bg-primary/40 touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="flex gap-0.5">
              <div className="w-px h-6 bg-primary/80 rounded" />
              <div className="w-px h-6 bg-primary/80 rounded" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-mono">
        {widthPx.toFixed(0)} px → <strong>{newDpi.toFixed(1)} DPI</strong>
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          onClick={() => onConfirm(newDpi)}
        >
          {ko ? "이 DPI로 확인" : fr ? "Confirmer ce DPI" : "Confirm this DPI"}
        </button>
        <button
          className="w-full py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
          onClick={onSkip}
        >
          {ko ? "건너뛰기 (기본값 96 DPI 사용)" : fr ? "Ignorer (utiliser 96 DPI par défaut)" : "Skip (use default 96 DPI)"}
        </button>
      </div>
    </div>
  );
}

// ---- Main component --------------------------------------------------------

export default function ScreenRuler() {
  const { lang } = useLanguage();
  const ko = lang === "ko";
  const fr = lang === "fr";
  const { resolvedTheme } = useTheme();

  const [dpi, setDpi] = useState<number>(savedDpi() ?? 96);
  const [calibrating, setCalibrating] = useState(!savedDpi());
  const [unit, setUnit] = useState<Unit>("cm");
  const [dir, setDir] = useState<Dir>("h");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || calibrating) return;

    const dpr = window.devicePixelRatio || 1;
    const logW = dir === "h" ? container.clientWidth : RULER_THICKNESS;
    const logH = dir === "h" ? RULER_THICKNESS : container.clientHeight;

    canvas.width = logW * dpr;
    canvas.height = logH * dpr;
    canvas.style.width = `${logW}px`;
    canvas.style.height = `${logH}px`;

    drawRuler(canvas, logW, logH, dpi, unit, dir);
  }, [dpi, unit, dir, calibrating, resolvedTheme]);

  useEffect(() => {
    redraw();
    const obs = new ResizeObserver(redraw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [redraw]);

  const handleConfirm = (newDpi: number) => {
    localStorage.setItem(STORAGE_KEY, String(newDpi));
    setDpi(newDpi);
    setCalibrating(false);
  };

  if (calibrating) {
    return (
      <CalibrationCard
        defaultDpi={dpi}
        onConfirm={handleConfirm}
        onSkip={() => setCalibrating(false)}
        ko={ko}
        fr={fr}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          {(["cm", "mm", "in"] as Unit[]).map((u) => (
            <button
              key={u}
              className={`px-3 py-1.5 font-mono transition-colors ${
                unit === u
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          {(["h", "v"] as Dir[]).map((d) => (
            <button
              key={d}
              className={`px-3 py-1.5 transition-colors ${
                dir === d
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setDir(d)}
              title={d === "h" ? (ko ? "가로" : fr ? "Horizontal" : "Horizontal") : (ko ? "세로" : fr ? "Vertical" : "Vertical")}
            >
              {d === "h" ? "↔" : "↕"}
            </button>
          ))}
        </div>

        <button
          className="ml-auto px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          onClick={() => setCalibrating(true)}
        >
          {ko ? `캘리브레이션 (${dpi.toFixed(0)} DPI)` : fr ? `Calibrer (${dpi.toFixed(0)} DPI)` : `Calibrate (${dpi.toFixed(0)} DPI)`}
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full"
        style={dir === "v" ? { height: "70vh" } : undefined}
      >
        <canvas ref={canvasRef} className="block rounded-sm" />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {ko
          ? "캘리브레이션 없이는 오차가 발생할 수 있습니다."
          : fr
            ? "Sans calibration, des imprécisions sont possibles."
            : "Without calibration, measurements may be inaccurate."}
      </p>
    </div>
  );
}
