let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const nunchiSound = {
  countdown() { playTone(660, 0.08, 'square', 0.2); },
  pick() { playTone(880, 0.12, 'sine', 0.35); },
  duplicate() {
    playTone(200, 0.15, 'sawtooth', 0.4);
    setTimeout(() => playTone(160, 0.25, 'sawtooth', 0.35), 100);
  },
  timeout() {
    playTone(330, 0.2, 'square', 0.3);
    setTimeout(() => playTone(220, 0.3, 'square', 0.25), 150);
  },
  success() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.3), i * 80));
  },
  fail() {
    [392, 330, 262].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'square', 0.25), i * 100));
  },
};
