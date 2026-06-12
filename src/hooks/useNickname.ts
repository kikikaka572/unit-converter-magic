import { useState, useCallback } from 'react';

const STORAGE_KEY = 'lifetool_game_nickname';
const MAX_LENGTH = 8;

interface UseNicknameReturn {
  nickname: string;
  setNickname: (name: string) => void;
  isValid: boolean;
  errorKey: 'game.nickname_required' | 'game.nickname_too_long' | null;
}

export const useNickname = (): UseNicknameReturn => {
  const [nickname, setNicknameState] = useState<string>(() =>
    localStorage.getItem(STORAGE_KEY) ?? ''
  );

  const setNickname = useCallback((name: string) => {
    setNicknameState(name);
    localStorage.setItem(STORAGE_KEY, name);
  }, []);

  const trimmed = nickname.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_LENGTH;
  const errorKey: UseNicknameReturn['errorKey'] =
    trimmed.length === 0
      ? 'game.nickname_required'
      : trimmed.length > MAX_LENGTH
        ? 'game.nickname_too_long'
        : null;

  return { nickname, setNickname, isValid, errorKey };
};
