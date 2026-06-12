import { useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import GameLayout from '@/components/GameLayout';
import GameReactions from '@/components/GameReactions';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useNunchiRoom } from '@/hooks/useNunchiRoom';

const RANGES = [
  { label: '1-5', max: 5 },
  { label: '1-10', max: 10 },
  { label: '1-20', max: 20 },
  { label: '1-30', max: 30 },
];

export default function NunchiPage() {
  const { t } = useLanguage();
  const [reactionIncoming] = [[] as { id: number; emoji: string; x: number }[]];

  const {
    phase: roomPhase,
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
    setPhase,
  } = useGameRoom({ gameKey: 'nunchi' });

  const {
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
  } = useNunchiRoom({ roomId, playerId, nickname, isHost });

  useEffect(() => {
    if (roomPhase === 'lobby') setPhase('lobby');
  }, [roomPhase, setPhase]);

  function handleCreate() {
    handleCreateRoom();
  }

  const numbers = Array.from({ length: targetCount }, (_, i) => i + 1);
  const amLoser = loserIds.includes(playerId);
  const amWinner = phase === 'result' && !amLoser;

  return (
    <GameLayout
      toolId="nunchi"
      roomId={roomId}
      isHost={isHost}
      players={players}
      isConnected={isConnected}
      nickname={nickname}
      onNicknameChange={setNickname}
      isNicknameValid={isNicknameValid}
      nicknameErrorKey={nicknameErrorKey}
      onCreateRoom={handleCreate}
      onJoinRoom={handleJoinRoom}
      onLeaveRoom={handleLeaveRoom}
      onCopyLink={copyRoomLink}
      linkCopied={linkCopied}
    >
      <div className="space-y-5">
        {/* Waiting / lobby */}
        {phase === 'waiting' && (
          <div className="flex flex-col gap-4 items-center pt-4">
            <p className="text-sm text-muted-foreground text-center">
              {players.length < 2
                ? t('nunchi.waiting_players')
                : t('nunchi.ready_to_start')}
            </p>
            {isHost && players.length >= 2 && (
              <div className="flex flex-col gap-3 items-center w-full max-w-xs">
                <p className="text-sm font-medium">{t('nunchi.choose_range')}</p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {RANGES.map(r => (
                    <button
                      key={r.max}
                      onClick={() => startGame(r.max)}
                      className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isHost && players.length >= 2 && (
              <p className="text-sm text-muted-foreground">{t('nunchi.host_will_start')}</p>
            )}
          </div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <div className="flex flex-col items-center gap-2 py-10">
            <p className="text-sm text-muted-foreground">{t('nunchi.game_starting')}</p>
            <span className="text-7xl font-black tabular-nums animate-ping-once">{countdown}</span>
          </div>
        )}

        {/* Playing */}
        {phase === 'playing' && (
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm text-muted-foreground">
              {t('nunchi.pick_prompt').replace('{max}', String(targetCount))}
            </p>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(targetCount, 5)}, 1fr)` }}
            >
              {numbers.map(n => (
                <button
                  key={n}
                  onClick={() => pickNumber(n)}
                  disabled={myPick !== null}
                  className={`w-14 h-14 rounded-xl text-xl font-bold transition-all
                    ${myPick === n
                      ? 'bg-primary text-primary-foreground scale-95'
                      : myPick !== null
                        ? 'bg-secondary text-muted-foreground opacity-50 cursor-default'
                        : 'bg-secondary text-foreground hover:bg-primary/20 active:scale-95 cursor-pointer'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {/* Picks so far */}
            <div className="flex flex-wrap gap-2 justify-center">
              {picks.map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                  {p.nickname}: {p.number}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`text-5xl ${amWinner ? 'animate-bounce' : ''}`}>
              {amLoser ? '💥' : amWinner ? '🎉' : '🎊'}
            </div>
            <p className={`text-xl font-bold ${amLoser ? 'text-destructive' : 'text-green-500'}`}>
              {amLoser ? t('nunchi.you_lost') : t('nunchi.you_survived')}
            </p>
            {duplicateNumbers.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {t('nunchi.duplicate_numbers').replace('{nums}', duplicateNumbers.join(', '))}
              </p>
            )}
            {loserIds.length > 0 && (
              <p className="text-sm text-destructive text-center">
                {t('nunchi.losers').replace('{names}', picks.filter(p => loserIds.includes(p.playerId)).map(p => p.nickname).join(', '))}
              </p>
            )}
            {isHost && (
              <button
                onClick={resetGame}
                className="px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('nunchi.play_again')}
              </button>
            )}
            {!isHost && <p className="text-xs text-muted-foreground">{t('nunchi.host_will_start')}</p>}
          </div>
        )}

        {/* Reactions */}
        <GameReactions onSend={() => {}} incoming={reactionIncoming} />
      </div>
    </GameLayout>
  );
}
