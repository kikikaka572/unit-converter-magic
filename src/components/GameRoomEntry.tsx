import { useState } from 'react';
import { Link, LogIn, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface GameRoomEntryProps {
  nickname: string;
  onNicknameChange: (v: string) => void;
  isNicknameValid: boolean;
  nicknameErrorKey: 'game.nickname_required' | 'game.nickname_too_long' | null;
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  isLoading?: boolean;
}

export default function GameRoomEntry({
  nickname,
  onNicknameChange,
  isNicknameValid,
  nicknameErrorKey,
  onCreateRoom,
  onJoinRoom,
  isLoading,
}: GameRoomEntryProps) {
  const { t } = useLanguage();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState(false);

  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError(true); return; }
    setJoinError(false);
    onJoinRoom(code);
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm mx-auto">
      {/* Nickname */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">{t('game.nickname')}</label>
        <input
          type="text"
          value={nickname}
          maxLength={8}
          onChange={e => onNicknameChange(e.target.value)}
          placeholder={t('game.nickname_placeholder')}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {nicknameErrorKey && (
          <p className="text-xs text-destructive">{t(nicknameErrorKey)}</p>
        )}
      </div>

      {/* Create room */}
      <button
        onClick={onCreateRoom}
        disabled={!isNicknameValid || isLoading}
        className="flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('game.create_room')}
      </button>

      <div className="relative flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">{t('game.or')}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Join room */}
      <div className="flex gap-2">
        <input
          type="text"
          value={joinCode}
          maxLength={8}
          onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder={t('game.enter_room_code')}
          className={`flex-1 h-9 rounded-md border bg-background px-3 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring ${joinError ? 'border-destructive' : 'border-input'}`}
        />
        <button
          onClick={handleJoin}
          disabled={!isNicknameValid || isLoading}
          className="flex items-center gap-1.5 px-3 h-9 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          {t('game.join')}
        </button>
      </div>
      {joinError && (
        <p className="text-xs text-destructive -mt-3">{t('game.enter_room_code')}</p>
      )}
    </div>
  );
}
