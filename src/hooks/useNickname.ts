import { useState, useCallback } from 'react';

const STORAGE_KEY = 'lifetool_game_nickname';
const MAX_LENGTH = 8;

const RANDOM_NICKNAMES = [
  '귀여운토끼', '빠른여우', '날쌘곰', '용감한펭귄',
  '엉뚱한고양이', '멋진독수리', '씩씩한호랑이', '작은다람쥐',
  '귀여운펭귄', '빠른고양이', '용감한여우', '엉뚱한곰',
  '멋진토끼', '씩씩한다람쥐', '날쌘호랑이', '작은펭귄',
];

const generateNickname = (): string =>
  RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];

interface UseNicknameReturn {
  nickname: string;
  setNickname: (name: string) => void;
  isValid: boolean;
  errorKey: 'game.nickname_required' | 'game.nickname_too_long' | null;
}

export const useNickname = (): UseNicknameReturn => {
  const [nickname, setNicknameState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored;
    const generated = generateNickname();
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  });

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
