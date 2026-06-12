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

export const reactionSound = {
  ready() {
    playTone(440, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(550, 0.1, 'sine', 0.25), 120);
  },
  go() {
    playTone(880, 0.08, 'square', 0.4);
    setTimeout(() => playTone(1100, 0.12, 'square', 0.4), 60);
  },
  earlyPress() {
    playTone(220, 0.3, 'sawtooth', 0.5);
  },
  tap() {
    playTone(1200, 0.06, 'sine', 0.3);
  },
  roundEnd() {
    [784, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.1, 'sine', 0.3), i * 90));
  },
  winner() {
    [523, 659, 784, 1047, 1175].forEach((f, i) => setTimeout(() => playTone(f, 0.12, 'sine', 0.35), i * 70));
  },
};
