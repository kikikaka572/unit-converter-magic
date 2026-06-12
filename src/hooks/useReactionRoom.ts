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
  const isEarlyRef = useRef(false);

  const players: ReactionPlayer[] = Object.values(presenceState)
    .flat()
    .map(e => e as PresenceEntry)
    .filter((e): e is PresenceEntry => !!e.playerId);

  const onMessage = useCallback((event: string, payload: unknown) => {
    if (event === 'game_start') {
      const p = payload as { rounds: number; round: number; color: string };
      setTotalRounds(p.rounds);
      setCurrentRound(p.round);
      setSignalColor(p.color);
      setScores([]);
      setEarlyPressIds([]);
      roundScoresRef.current = [];
      isEarlyRef.current = false;
      reactionSound.ready();
      setPhase('ready');
    }

    if (event === 'signal') {
      const p = payload as { color: string; signalTime: number };
      setSignalColor(p.color);
      signalTimeRef.current = p.signalTime;
      isEarlyRef.current = false;
      reactionSound.go();
      setPhase('signal');
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
      setScores(p.allScores);
      reactionSound.roundEnd();
      setPhase('result');
    }

    if (event === 'game_reset') {
      setPhase('waiting');
      setScores([]);
      setCurrentRound(1);
      setEarlyPressIds([]);
      roundScoresRef.current = [];
    }
  }, []);

  const { broadcast, presenceState: rawPresence, isConnected } = useBroadcastChannel({
    channelName: roomId ? `reaction:${roomId}` : '',
    onMessage,
    presenceData: roomId ? { playerId, nickname, isHost } : undefined,
  });

  useEffect(() => { setPresenceState(rawPresence); }, [rawPresence]);

  const startGame = useCallback(async (rounds: number) => {
    if (!isHost) return;
    const color = SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)];
    await broadcast('game_start', { rounds, round: 1, color });
    // Host fires the signal after a random delay 1.5-4s
    const delay = 1500 + Math.random() * 2500;
    await sleep(delay);
    const signalTime = Date.now();
    signalTimeRef.current = signalTime;
    roundScoresRef.current = [];
    isEarlyRef.current = false;
    await broadcast('signal', { color, signalTime });
  }, [isHost, broadcast]);

  const pressButton = useCallback(() => {
    if (phase === 'ready') {
      // Early press
      isEarlyRef.current = true;
      reactionSound.earlyPress();
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
    setCurrentRound(next);
    setEarlyPressIds([]);
    roundScoresRef.current = [];
    isEarlyRef.current = false;
    const color = SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)];
    await broadcast('game_start', { rounds: totalRounds, round: next, color });
    const delay = 1500 + Math.random() * 2500;
    await sleep(delay);
    const signalTime = Date.now();
    signalTimeRef.current = signalTime;
    await broadcast('signal', { color, signalTime });
  }, [isHost, currentRound, totalRounds, broadcast]);

  // Host collects all presses after a grace period and publishes round_result
  useEffect(() => {
    if (!isHost || phase !== 'signal') return;
    const timer = setTimeout(() => {
      const allScores = [...scores, ...roundScoresRef.current.filter(
        s => !scores.some(e => e.playerId === s.playerId && e.round === s.round)
      )];
      broadcast('round_result', { roundScores: roundScoresRef.current, allScores });
    }, 3000);
    return () => clearTimeout(timer);
  }, [phase, isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetGame = useCallback(() => {
    if (!isHost) return;
    broadcast('game_reset', {});
  }, [isHost, broadcast]);

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
