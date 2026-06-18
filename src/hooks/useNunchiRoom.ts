import { useCallback, useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from './useBroadcastChannel';
import { nunchiSound } from '@/lib/nunchiSound';

export type NunchiPhase = 'waiting' | 'countdown' | 'playing' | 'result';

export interface NunchiPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
}

export interface NunchiPick {
  playerId: string;
  nickname: string;
  number: number;
  pickedAt: number;
}

interface UseNunchiRoomOptions {
  roomId: string | null;
  playerId: string;
  nickname: string;
  isHost: boolean;
}

interface UseNunchiRoomReturn {
  phase: NunchiPhase;
  players: NunchiPlayer[];
  picks: NunchiPick[];
  targetCount: number;
  countdown: number;
  isConnected: boolean;
  myPick: number | null;
  duplicateNumbers: number[];
  loserIds: string[];
  startGame: (count: number) => void;
  pickNumber: (n: number) => void;
  resetGame: () => void;
}

interface PresenceEntry {
  playerId: string;
  nickname: string;
  isHost: boolean;
}

export const useNunchiRoom = ({
  roomId,
  playerId,
  nickname,
  isHost,
}: UseNunchiRoomOptions): UseNunchiRoomReturn => {
  const [phase, setPhase] = useState<NunchiPhase>('waiting');
  const [picks, setPicks] = useState<NunchiPick[]>([]);
  const [targetCount, setTargetCount] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [myPick, setMyPick] = useState<number | null>(null);
  const [duplicateNumbers, setDuplicateNumbers] = useState<number[]>([]);
  const [loserIds, setLoserIds] = useState<string[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [presenceState, setPresenceState] = useState<Record<string, unknown[]>>({});
  const expectedPlayersRef = useRef(0);
  const evaluatedRef = useRef(false);

  const players: NunchiPlayer[] = Object.values(presenceState)
    .flat()
    .map(e => e as PresenceEntry)
    .filter((e): e is PresenceEntry => !!e.playerId);

  // Extracted so both onMessage (guests) and startGame (host) can call it
  const applyGameStart = useCallback((count: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    evaluatedRef.current = false;
    setTargetCount(count);
    setPicks([]);
    setMyPick(null);
    setDuplicateNumbers([]);
    setLoserIds([]);
    setCountdown(3);
    setPhase('countdown');
    nunchiSound.countdown();

    let c = 3;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c > 0) nunchiSound.countdown();
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        setPhase('playing');
      }
    }, 1000);
  }, []);

  // Extracted so both onMessage (guests) and the effect (host) can call it
  const applyRoundResult = useCallback((dups: number[], losers: string[]) => {
    setDuplicateNumbers(dups);
    setLoserIds(losers);
    setPhase('result');
    if (losers.length > 0) nunchiSound.duplicate();
    else nunchiSound.success();
  }, []);

  // Extracted so both onMessage (guests) and resetGame (host) can call it
  const applyReset = useCallback(() => {
    setPhase('waiting');
    setPicks([]);
    setMyPick(null);
    setDuplicateNumbers([]);
    setLoserIds([]);
  }, []);

  const onMessage = useCallback((event: string, payload: unknown) => {
    if (event === 'game_start') {
      const p = payload as { count: number };
      applyGameStart(p.count);
    }

    if (event === 'player_pick') {
      const p = payload as NunchiPick;
      nunchiSound.pick();
      setPicks(prev => [...prev, p]);
    }

    if (event === 'round_result') {
      const p = payload as { duplicates: number[]; losers: string[] };
      applyRoundResult(p.duplicates, p.losers);
    }

    if (event === 'game_reset') {
      applyReset();
    }
  }, [applyGameStart, applyRoundResult, applyReset]);

  const { broadcast, presenceState: rawPresence, isConnected } = useBroadcastChannel({
    channelName: roomId ? `nunchi:${roomId}` : '',
    onMessage,
    presenceData: roomId ? { playerId, nickname, isHost } : undefined,
    presenceKey: playerId,
  });

  useEffect(() => { setPresenceState(rawPresence); }, [rawPresence]);

  // Host evaluates results when all players have picked
  useEffect(() => {
    if (!isHost || phase !== 'playing') return;
    if (evaluatedRef.current) return;

    // Deduplicate by playerId — keep the first pick per player
    const uniquePicks = picks.filter(
      (p, i) => picks.findIndex(q => q.playerId === p.playerId) === i
    );
    const expected = expectedPlayersRef.current;
    if (expected < 2 || uniquePicks.length < expected) return;

    evaluatedRef.current = true;

    const numbers = uniquePicks.map(p => p.number);
    const freq = numbers.reduce<Record<number, number>>((acc, n) => {
      acc[n] = (acc[n] ?? 0) + 1;
      return acc;
    }, {});
    const duplicates = Object.entries(freq)
      .filter(([, c]) => c > 1)
      .map(([n]) => Number(n));
    const losers = uniquePicks
      .filter(p => duplicates.includes(p.number))
      .map(p => p.playerId);

    // Apply locally for host (self: false — host won't receive own broadcast)
    applyRoundResult(duplicates, losers);
    broadcast('round_result', { duplicates, losers });
  }, [picks, phase, isHost, broadcast, applyRoundResult]);

  const startGame = useCallback((count: number) => {
    if (!isHost) return;
    // Snapshot player count at game start — presence state may lag mid-game
    expectedPlayersRef.current = players.length;
    // Apply locally first (host won't receive own broadcast due to self: false)
    applyGameStart(count);
    broadcast('game_start', { count });
  }, [isHost, players.length, broadcast, applyGameStart]);

  const pickNumber = useCallback((n: number) => {
    if (phase !== 'playing' || myPick !== null) return;
    setMyPick(n);
    const pick: NunchiPick = { playerId, nickname, number: n, pickedAt: Date.now() };
    // Add locally (self: false won't deliver own broadcast back)
    setPicks(prev => [...prev, pick]);
    nunchiSound.pick();
    broadcast('player_pick', pick);
  }, [phase, myPick, playerId, nickname, broadcast]);

  const resetGame = useCallback(() => {
    if (!isHost) return;
    // Apply locally for host, then broadcast to guests
    applyReset();
    broadcast('game_reset', {});
  }, [isHost, broadcast, applyReset]);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  return {
    phase,
    players,
    picks,
    targetCount,
    countdown,
    isConnected,
    myPick,
    duplicateNumbers,
    loserIds,
    startGame,
    pickNumber,
    resetGame,
  };
};
