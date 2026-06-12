import { type ReactNode } from 'react';
import ToolPageLayout from './ToolPageLayout';
import GameRoomBar from './GameRoomBar';
import GameRoomEntry from './GameRoomEntry';

interface Player {
  id: string;
  nickname: string;
  isHost?: boolean;
}

interface GameLayoutProps {
  toolId: string;
  roomId: string | null;
  isHost: boolean;
  players: Player[];
  isConnected: boolean;
  nickname: string;
  onNicknameChange: (v: string) => void;
  isNicknameValid: boolean;
  nicknameErrorKey: 'game.nickname_required' | 'game.nickname_too_long' | null;
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  onLeaveRoom: () => void;
  onCopyLink: () => void;
  linkCopied: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

export default function GameLayout({
  toolId,
  roomId,
  isHost,
  players,
  isConnected,
  nickname,
  onNicknameChange,
  isNicknameValid,
  nicknameErrorKey,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onCopyLink,
  linkCopied,
  isLoading,
  children,
}: GameLayoutProps) {
  return (
    <ToolPageLayout toolId={toolId}>
      <div className="space-y-5">
        {roomId ? (
          <GameRoomBar
            roomId={roomId}
            isHost={isHost}
            players={players}
            isConnected={isConnected}
            onLeave={onLeaveRoom}
            onCopyLink={onCopyLink}
            linkCopied={linkCopied}
          />
        ) : (
          <GameRoomEntry
            nickname={nickname}
            onNicknameChange={onNicknameChange}
            isNicknameValid={isNicknameValid}
            nicknameErrorKey={nicknameErrorKey}
            onCreateRoom={onCreateRoom}
            onJoinRoom={onJoinRoom}
            isLoading={isLoading}
          />
        )}
        {roomId && children}
      </div>
    </ToolPageLayout>
  );
}
