import { useCallback, useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from './useBroadcastChannel';
import { reactionSound } from '@/lib/reactionSound';
import { sleep } from '@/lib/gameUtils';

export type ReactionPhase = 'waiting' | 'ready' | 'signal' | 'result';

export interface ReactionPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
}

export interface ReactionScore {
  playerId: string;
  nickname: string;
  reactionMs: number;
  round: number;
}

interface UseReactionRoomOptions {
  roomId: string | null;
  playerId: string;
  nickname: string;
  isHost: boolean;
}

interface UseReactionRoomReturn {
  phase: ReactionPhase;
  players: ReactionPlayer[];
  scores: ReactionScore[];
  currentRound: number;
  totalRounds: number;
  signalColor: string;
  earlyPressIds: string[];
  isConnected: boolean;
  startGame: (rounds: number) => void;
  pressButton: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

interface PresenceEntry {
  playerId: string;
  nickname: string;
  isHost: boolean;
}

const SIGNAL_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export const useReactionRoom = ({
  roomId,
  playerId,
  nickname,
  isHost,
}: UseReactionRoomOptions): UseReactionRoomReturn => {
  const [phase, setPhase] = useState<ReactionPhase>('waiting');
  const [scores, setScores] = useState<ReactionScore[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [signalColor, setSignalColor] = useState('#22c55e');
  const [earlyPressIds, setEarlyPressIds] = useState<string[]>([]);
  const [presenceState, setPresenceState] = useState<Record<string, unknown[]>>({});
  const signalTimeRef = useRef<number>(0);
  const roundScoresRef = useRef<ReactionScore[]>([]);
  const scoresRef = useRef<ReactionScore[]>([]);  // mirror of scores for stale-closure-safe access in async functions
  const isEarlyRef = useRef(false);

  // Keep scoresRef in sync with scores state
  useEffect(() => { scoresRef.current = scores; }, [scores]);

  const players: ReactionPlayer[] = Object.values(presenceState)
    .flat()
    .map(e => e as PresenceEntry)
    .filter((e): e is PresenceEntry => !!e.playerId);

  // Extracted: apply ready-phase transition (same for host and guests)
  const applyReady = useCallback((rounds: number, round: number, color: string) => {
    setTotalRounds(rounds);
    setCurrentRound(round);
    setSignalColor(color);
    setEarlyPressIds([]);
    roundScoresRef.current = [];
    isEarlyRef.current = false;
    reactionSound.ready();
    setPhase('ready');
  }, []);

  // Extracted: apply signal transition
  const applySignal = useCallback((color: string, signalTime: number) => {
    setSignalColor(color);
    signalTimeRef.current = signalTime;
    isEarlyRef.current = false;
    reactionSound.go();
    setPhase('signal');
  }, []);

  // Extracted: apply round result
  const applyRoundResult = useCallback((allScores: ReactionScore[]) => {
    setScores(allScores);
    reactionSound.roundEnd();
    setPhase('result');
  }, []);

  // Extracted: apply reset
  const applyReset = useCallback(() => {
    setPhase('waiting');
    setScores([]);
    scoresRef.current = [];
    setCurrentRound(1);
    setEarlyPressIds([]);
    roundScoresRef.current = [];
  }, []);

  const onMessage = useCallback((event: string, payload: unknown) => {
    if (event === 'game_start') {
      const p = payload as { rounds: number; round: number; color: string };
      applyReady(p.rounds, p.round, p.color);
    }

    if (event === 'signal') {
      const p = payload as { color: string; signalTime: number };
      applySignal(p.color, p.signalTime);
    }

    if (event === 'player_react') {
      const p = payload as ReactionScore;
      reactionSound.tap();
      roundScoresRef.current = [...roundScoresRef.current, p];
    }

    if (event === 'early_press') {
      const p = payload as { playerId: string };
      reactionSound.earlyPress();
      setEarlyPressIds(prev => [...new Set([...prev, p.playerId])]);
    }

    if (event === 'round_result') {
      const p = payload as { roundScores: ReactionScore[]; allScores: ReactionScore[] };
      applyRoundResult(p.allScores);
    }

    if (event === 'game_reset') {
      applyReset();
    }
  }, [applyReady, applySignal, applyRoundResult, applyReset]);

  const { broadcast, presenceState: rawPresence, isConnected } = useBroadcastChannel({
    channelName: roomId ? `reaction:${roomId}` : '',
    onMessage,
    presenceData: roomId ? { playerId, nickname, isHost } : undefined,
  });

  useEffect(() => { setPresenceState(rawPresence); }, [rawPresence]);

  // Host fires signal after random delay then collects for 3s
  const runRound = useCallback(async (rounds: number, round: number, color: string) => {
    const delay = 1500 + Math.random() * 2500;
    await sleep(delay);
    const signalTime = Date.now();
    // Apply locally for host (self: false won't deliver own broadcast)
    applySignal(color, signalTime);
    await broadcast('signal', { color, signalTime });

    // 3 seconds to collect all presses, then publish result
    await sleep(3000);
    // Use scoresRef (accumulated previous rounds) + roundScoresRef (this round)
    const prev = scoresRef.current;
    const allScores = [
      ...prev,
      ...roundScoresRef.current.filter(
        s => !prev.some(e => e.playerId === s.playerId && e.round === s.round)
      ),
    ];
    applyRoundResult(allScores);
    await broadcast('round_result', { roundScores: roundScoresRef.current, allScores });
  }, [applySignal, applyRoundResult, broadcast]);

  const startGame = useCallback(async (rounds: number) => {
    if (!isHost) return;
    const color = SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)];
    // Apply locally for host (self: false won't deliver own broadcast)
    applyReady(rounds, 1, color);
    await broadcast('game_start', { rounds, round: 1, color });
    await runRound(rounds, 1, color);
  }, [isHost, broadcast, applyReady, runRound]);

  const pressButton = useCallback(() => {
    if (phase === 'ready') {
      isEarlyRef.current = true;
      reactionSound.earlyPress();
      // Apply locally (self: false won't deliver own early_press back)
      setEarlyPressIds(prev => [...new Set([...prev, playerId])]);
      broadcast('early_press', { playerId });
      return;
    }
    if (phase !== 'signal') return;
    const reactionMs = Date.now() - signalTimeRef.current;
    const score: ReactionScore = { playerId, nickname, reactionMs, round: currentRound };
    roundScoresRef.current = [...roundScoresRef.current, score];
    broadcast('player_react', score);
    reactionSound.tap();
  }, [phase, playerId, nickname, currentRound, broadcast]);

  const nextRound = useCallback(async () => {
    if (!isHost) return;
    const next = currentRound + 1;
    if (next > totalRounds) {
      reactionSound.winner();
      return;
    }
    const color = SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)];
    // Apply locally for host
    applyReady(totalRounds, next, color);
    await broadcast('game_start', { rounds: totalRounds, round: next, color });
    await runRound(totalRounds, next, color);
  }, [isHost, currentRound, totalRounds, broadcast, applyReady, runRound]);

  const resetGame = useCallback(() => {
    if (!isHost) return;
    // Apply locally for host
    applyReset();
    broadcast('game_reset', {});
  }, [isHost, broadcast, applyReset]);

  return {
    phase,
    players,
    scores,
    currentRound,
    totalRounds,
    signalColor,
    earlyPressIds,
    isConnected,
    startGame,
    pressButton,
    nextRound,
    resetGame,
  };
};
