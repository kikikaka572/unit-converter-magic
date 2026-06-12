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

  const players: NunchiPlayer[] = Object.values(presenceState)
    .flat()
    .map(e => e as PresenceEntry)
    .filter((e): e is PresenceEntry => !!e.playerId);

  const onMessage = useCallback((event: string, payload: unknown) => {
    if (event === 'game_start') {
      const p = payload as { count: number };
      setTargetCount(p.count);
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
    }

    if (event === 'player_pick') {
      const p = payload as NunchiPick;
      nunchiSound.pick();
      setPicks(prev => {
        const next = [...prev, p];
        return next;
      });
    }

    if (event === 'round_result') {
      const p = payload as { duplicates: number[]; losers: string[] };
      setDuplicateNumbers(p.duplicates);
      setLoserIds(p.losers);
      setPhase('result');
      if (p.losers.length > 0) nunchiSound.duplicate();
      else nunchiSound.success();
    }

    if (event === 'game_reset') {
      setPhase('waiting');
      setPicks([]);
      setMyPick(null);
      setDuplicateNumbers([]);
      setLoserIds([]);
    }
  }, []);

  const { broadcast, presenceState: rawPresence, isConnected } = useBroadcastChannel({
    channelName: roomId ? `nunchi:${roomId}` : '',
    onMessage,
    presenceData: roomId ? { playerId, nickname, isHost } : undefined,
  });

  useEffect(() => { setPresenceState(rawPresence); }, [rawPresence]);

  // Host evaluates results when all players have picked
  useEffect(() => {
    if (!isHost || phase !== 'playing') return;
    if (picks.length < players.length || players.length < 2) return;

    const numbers = picks.map(p => p.number);
    const freq = numbers.reduce<Record<number, number>>((acc, n) => {
      acc[n] = (acc[n] ?? 0) + 1;
      return acc;
    }, {});
    const duplicates = Object.entries(freq)
      .filter(([, c]) => c > 1)
      .map(([n]) => Number(n));
    const losers = picks
      .filter(p => duplicates.includes(p.number))
      .map(p => p.playerId);

    broadcast('round_result', { duplicates, losers });
  }, [picks, players.length, phase, isHost, broadcast]);

  const startGame = useCallback((count: number) => {
    if (!isHost) return;
    broadcast('game_start', { count });
  }, [isHost, broadcast]);

  const pickNumber = useCallback((n: number) => {
    if (phase !== 'playing' || myPick !== null) return;
    setMyPick(n);
    const pick: NunchiPick = { playerId, nickname, number: n, pickedAt: Date.now() };
    setPicks(prev => [...prev, pick]);
    broadcast('player_pick', pick);
  }, [phase, myPick, playerId, nickname, broadcast]);

  const resetGame = useCallback(() => {
    if (!isHost) return;
    broadcast('game_reset', {});
  }, [isHost, broadcast]);

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
