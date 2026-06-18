import { useState } from 'react';
import { Users, Link, LogOut, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface Player {
  id: string;
  nickname: string;
  isHost?: boolean;
}

interface GameRoomBarProps {
  roomId: string;
  isHost: boolean;
  players: Player[];
  isConnected: boolean;
  currentPlayerId?: string;
  onLeave: () => void;
  onCopyLink: () => void;
  linkCopied: boolean;
}

export default function GameRoomBar({
  roomId,
  isHost,
  players,
  isConnected,
  currentPlayerId,
  onLeave,
  onCopyLink,
  linkCopied,
}: GameRoomBarProps) {
  const { t } = useLanguage();
  const [codeCopied, setCodeCopied] = useState(false);

  function handleCopyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/60 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-xs font-medium text-foreground">
            {isHost ? t('game.host') : t('game.guest')}
          </span>
          <span className="text-xs text-muted-foreground font-mono tracking-wider">{roomId}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyCode}
            title={t('game.copy_code')}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {codeCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onCopyLink}
            title={t('game.copy_link')}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onLeave}
            title={t('game.leave')}
            className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {players.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {players.map(p => (
            <span
              key={p.id}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.isHost ? 'bg-primary/15 text-primary' : 'bg-secondary text-secondary-foreground'}`}
            >
              {p.nickname}{p.isHost ? ' 👑' : ''}{p.id === currentPlayerId ? ' (나)' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
