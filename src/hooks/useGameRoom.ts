import { useEffect, useState } from 'react';
import { useNickname } from './useNickname';
import { generateRoomId, getOrCreatePlayerId, isRoomHost, registerAsHost, getRoomUrlParam, setRoomUrlParam, clearRoomUrlParam } from '@/lib/gameUtils';

export type GamePhase = 'lobby' | 'waiting' | 'playing' | 'result';

interface UseGameRoomOptions {
  gameKey: string;
  onUrlRoomId?: (roomId: string) => void;
}

interface UseGameRoomReturn {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  roomId: string | null;
  playerId: string;
  isHost: boolean;
  nickname: string;
  setNickname: (name: string) => void;
  isNicknameValid: boolean;
  nicknameErrorKey: 'game.nickname_required' | 'game.nickname_too_long' | null;
  handleCreateRoom: () => string;
  handleJoinRoom: (id: string) => void;
  handleLeaveRoom: () => void;
  copyRoomLink: () => void;
  linkCopied: boolean;
}

export const useGameRoom = ({ gameKey, onUrlRoomId }: UseGameRoomOptions): UseGameRoomReturn => {
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const playerId = getOrCreatePlayerId();
  const { nickname, setNickname, isValid: isNicknameValid, errorKey: nicknameErrorKey } = useNickname();

  const isHost = roomId ? isRoomHost(gameKey, roomId) : false;

  // Auto-join from URL ?room=CODE
  useEffect(() => {
    const urlRoomId = getRoomUrlParam();
    if (!urlRoomId) return;
    setRoomId(urlRoomId);
    setPhase('waiting');
    onUrlRoomId?.(urlRoomId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateRoom = (): string => {
    const id = generateRoomId();
    registerAsHost(gameKey, id);
    setRoomId(id);
    setRoomUrlParam(id);
    setPhase('waiting');
    return id;
  };

  const handleJoinRoom = (id: string): void => {
    setRoomId(id);
    setRoomUrlParam(id);
    setPhase('waiting');
  };

  const handleLeaveRoom = (): void => {
    setRoomId(null);
    setPhase('lobby');
    clearRoomUrlParam();
  };

  const copyRoomLink = (): void => {
    if (!roomId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return {
    phase,
    setPhase,
    roomId,
    playerId,
    isHost,
    nickname,
    setNickname,
    isNicknameValid,
    nicknameErrorKey,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    copyRoomLink,
    linkCopied,
  };
};
