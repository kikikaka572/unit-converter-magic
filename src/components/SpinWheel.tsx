import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { WHEEL_COLORS } from "./SpinEditor";

const WHEEL_SIZE = 380;
const RADIUS = WHEEL_SIZE / 2 - 12;
const CENTER_R = 40;
const BASE_DURATION = 13200;

const CONFETTI_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#ec4899", "#8b5cf6", "#f59e0b"];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export interface SpinWheelHandle {
  spin: () => void;
  /** Viewer sync: animate wheel continuing host's easing from startedAtMs. */
  spinTo: (targetAngle: number, durationMs: number, startedAtMs: number) => void;
  /** Snap rotation without animation (for room join sync). */
  setRotation: (angle: number) => void;
}

interface Props {
  items: string[];
  soundEnabled: boolean;
  onSpinComplete: (winner: string) => void;
  /** Host callback fired just before animation — use for room broadcast. */
  onSpinStart?: (targetAngle: number, durationMs: number) => void;
  /** When true, clicking the wheel does nothing (viewer mode). */
  disabled?: boolean;
}

const SpinWheel = forwardRef<SpinWheelHandle, Props>(function SpinWheel(
  { items, soundEnabled, onSpinComplete, onSpinStart, disabled },
  ref,
) {
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(0);
  const spinningRef = useRef(false);
  const itemsRef = useRef(items);
  const soundRef = useRef(soundEnabled);
  const onCompleteRef = useRef(onSpinComplete);
  const onSpinStartRef = useRef(onSpinStart);
  const audioRef = useRef<AudioContext | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { onCompleteRef.current = onSpinComplete; }, [onSpinComplete]);
  useEffect(() => { onSpinStartRef.current = onSpinStart; }, [onSpinStart]);

  const getAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    return audioRef.current;
  }, []);

  const playTick = useCallback(() => {
    if (!soundRef.current) return;
    try {
      const ac = getAudio();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = "square";
      osc.frequency.value = 660;
      g.gain.setValueAtTime(0.07, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.04);
    } catch { /* noop */ }
  }, [getAudio]);

  const playWin = useCallback(() => {
    if (!soundRef.current) return;
    try {
      const ac = getAudio();
      [261.63, 329.63, 392.0].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.start(t); osc.stop(t + 0.45);
      });
    } catch { /* noop */ }
  }, [getAudio]);

  const drawWheel = useCallback((rotation: number, isSpinning = false) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const its = itemsRef.current;
    const n = its.length;
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const sliceAngle = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    for (let i = 0; i < n; i++) {
      const sa = i * sliceAngle - Math.PI / 2 + rotation;
      const ea = sa + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, RADIUS, sa, ea);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sa + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${n > 8 ? 11 : 13}px sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 3;
      ctx.fillText(truncate(its[i] || "?", 8), RADIUS - 14, 5);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, CENTER_R, 0, 2 * Math.PI);
    ctx.fillStyle = isSpinning ? "#475569" : "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.fillText(isSpinning ? "···" : "SPIN", cx, cy);

    const px = cx;
    const py = cy - RADIUS - 6;
    ctx.beginPath();
    ctx.moveTo(px - 10, py - 16);
    ctx.lineTo(px + 10, py - 16);
    ctx.lineTo(px, py + 3);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const spawnConfetti = useCallback(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * WHEEL_SIZE,
      y: -10,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 1.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: Math.random() * 9 + 5,
      h: Math.random() * 5 + 4,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.15,
    }));

    const start = performance.now();
    function frame(now: number) {
      const el = now - start;
      if (el > 1600) { ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE); return; }
      ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);
      const alpha = Math.max(0, 1 - el / 1600);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.13; p.rot += p.rs;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, []);

  const finishSpin = useCallback((targetRot: number) => {
    const n = itemsRef.current.length;
    const sliceAngle = (2 * Math.PI) / n;
    rotRef.current = targetRot;
    spinningRef.current = false;
    setSpinning(false);
    const finalNorm = ((-targetRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const winIdx = Math.floor(finalNorm / sliceAngle) % n;
    drawWheel(targetRot, false);
    playWin();
    spawnConfetti();
    onCompleteRef.current(itemsRef.current[winIdx] ?? "");
  }, [drawWheel, playWin, spawnConfetti]);

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    const its = itemsRef.current;
    if (its.length < 2) return;

    spinningRef.current = true;
    setSpinning(true);

    const n = its.length;
    const sliceAngle = (2 * Math.PI) / n;
    const extraRotations = Math.random() * 2 + 5;
    const targetSlice = Math.floor(Math.random() * n);
    const angleInSlice = sliceAngle * (0.15 + Math.random() * 0.7);
    const targetDelta = 2 * Math.PI * extraRotations + targetSlice * sliceAngle + angleInSlice;
    const targetRot = rotRef.current + targetDelta;
    const duration = BASE_DURATION + Math.min(n - 2, 10) * 120;

    onSpinStartRef.current?.(targetRot, duration);

    const t0 = performance.now();
    const r0 = rotRef.current;

    let lastSlice = Math.floor(
      (((-rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle,
    );

    function frame(now: number) {
      const prog = Math.min((now - t0) / duration, 1);
      const eased = easeOutCubic(prog);
      const cur = r0 + targetDelta * eased;
      rotRef.current = cur;

      const norm = ((-cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const curSlice = Math.floor(norm / sliceAngle) % n;
      if (curSlice !== lastSlice) { playTick(); lastSlice = curSlice; }

      drawWheel(cur, prog < 1);

      if (prog < 1) {
        requestAnimationFrame(frame);
      } else {
        finishSpin(targetRot);
      }
    }
    requestAnimationFrame(frame);
  }, [drawWheel, playTick, finishSpin]);

  const spinTo = useCallback((targetAngle: number, durationMs: number, startedAtMs: number) => {
    if (spinningRef.current) return;

    const elapsed = Date.now() - startedAtMs;
    if (elapsed >= durationMs) {
      finishSpin(targetAngle);
      return;
    }

    spinningRef.current = true;
    setSpinning(true);

    const n = itemsRef.current.length;
    const sliceAngle = (2 * Math.PI) / n;
    const r0 = rotRef.current;
    const totalDelta = targetAngle - r0;

    // Set virtual t0 so normT = elapsed/durationMs on the very first frame
    const t0 = performance.now() - elapsed;

    let lastSlice = Math.floor(
      (((-r0 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle,
    );

    function frame(now: number) {
      const normT = Math.min((now - t0) / durationMs, 1);
      const eased = easeOutCubic(normT);
      const cur = r0 + totalDelta * eased;
      rotRef.current = cur;

      const norm = ((-cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const curSlice = Math.floor(norm / sliceAngle) % n;
      if (curSlice !== lastSlice) { playTick(); lastSlice = curSlice; }

      drawWheel(cur, normT < 1);

      if (normT < 1) {
        requestAnimationFrame(frame);
      } else {
        finishSpin(targetAngle);
      }
    }
    requestAnimationFrame(frame);
  }, [drawWheel, playTick, finishSpin]);

  const setRotation = useCallback((angle: number) => {
    rotRef.current = angle;
    if (!spinningRef.current) drawWheel(angle, false);
  }, [drawWheel]);

  useImperativeHandle(ref, () => ({ spin, spinTo, setRotation }), [spin, spinTo, setRotation]);

  useEffect(() => {
    if (!spinningRef.current) drawWheel(rotRef.current, false);
  }, [items, drawWheel]);

  useEffect(() => { drawWheel(0, false); }, [drawWheel]);

  return (
    <div
      className="relative w-full mx-auto"
      style={{ maxWidth: WHEEL_SIZE, aspectRatio: "1 / 1" }}
    >
      <canvas
        ref={wheelRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className={`block select-none ${disabled ? "cursor-default" : spinning ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={{ width: "100%", height: "auto" }}
        onClick={disabled ? undefined : spin}
        aria-label="Spin wheel"
      />
      <canvas
        ref={confettiRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});

export default SpinWheel;
