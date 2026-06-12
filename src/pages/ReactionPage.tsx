import { useLanguage } from '@/i18n/LanguageContext';
import GameLayout from '@/components/GameLayout';
import GameReactions from '@/components/GameReactions';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useReactionRoom } from '@/hooks/useReactionRoom';

const ROUND_OPTIONS = [3, 5, 7];

export default function ReactionPage() {
  const { t } = useLanguage();
  const incoming: { id: number; emoji: string; x: number }[] = [];

  const {
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
  } = useGameRoom({ gameKey: 'reaction' });

  const {
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
  } = useReactionRoom({ roomId, playerId, nickname, isHost });

  const sortedScores = [...scores].sort((a, b) => a.reactionMs - b.reactionMs);
  const isEarly = earlyPressIds.includes(playerId);

  const winnerNickname = sortedScores.length > 0 ? sortedScores[0]?.nickname : null;

  return (
    <GameLayout
      toolId="reaction"
      roomId={roomId}
      isHost={isHost}
      players={players}
      isConnected={isConnected}
      nickname={nickname}
      onNicknameChange={setNickname}
      isNicknameValid={isNicknameValid}
      nicknameErrorKey={nicknameErrorKey}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      onLeaveRoom={handleLeaveRoom}
      onCopyLink={copyRoomLink}
      linkCopied={linkCopied}
    >
      <div className="space-y-5">
        {/* Waiting */}
        {phase === 'waiting' && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {players.length < 2 ? t('reaction.waiting_players') : t('reaction.ready_to_start')}
            </p>
            {isHost && players.length >= 2 && (
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <p className="text-sm font-medium">{t('reaction.choose_rounds')}</p>
                <div className="flex gap-3">
                  {ROUND_OPTIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => startGame(r)}
                      className="w-14 h-14 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isHost && players.length >= 2 && (
              <p className="text-sm text-muted-foreground">{t('reaction.host_will_start')}</p>
            )}
          </div>
        )}

        {/* Ready phase - waiting for signal */}
        {phase === 'ready' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {t('reaction.round')} {currentRound} / {totalRounds}
            </p>
            <button
              onClick={pressButton}
              className="w-44 h-44 rounded-full bg-secondary border-4 border-border text-muted-foreground text-lg font-semibold transition-all hover:bg-secondary/80 active:scale-95 select-none"
            >
              {t('reaction.wait')}
            </button>
            <p className="text-xs text-muted-foreground animate-pulse">{t('reaction.get_ready')}</p>
          </div>
        )}

        {/* Signal phase - tap! */}
        {phase === 'signal' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {t('reaction.round')} {currentRound} / {totalRounds}
            </p>
            <button
              onClick={pressButton}
              className="w-44 h-44 rounded-full border-4 border-transparent text-white text-2xl font-black transition-all active:scale-90 select-none shadow-lg"
              style={{ backgroundColor: signalColor }}
            >
              {t('reaction.tap_now')}
            </button>
          </div>
        )}

        {/* Round result */}
        {phase === 'result' && (
          <div className="flex flex-col items-center gap-5 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {t('reaction.round')} {currentRound} / {totalRounds}
            </p>
            {currentRound >= totalRounds && winnerNickname && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">🏆</span>
                <p className="text-lg font-bold">{winnerNickname} {t('reaction.wins')}</p>
              </div>
            )}
            {/* Scoreboard */}
            <div className="w-full max-w-xs space-y-2">
              {sortedScores.map((s, i) => (
                <div
                  key={s.playerId}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${i === 0 ? 'bg-yellow-500/15 border border-yellow-500/30' : 'bg-secondary/60'}`}
                >
                  <span className="text-sm font-medium">
                    {i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `${i + 1}. `}
                    {s.nickname}
                  </span>
                  <span className="text-sm font-mono tabular-nums text-muted-foreground">{s.reactionMs}ms</span>
                </div>
              ))}
              {earlyPressIds.length > 0 && (
                <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-xs text-destructive">
                    {t('reaction.early_press')}: {players.filter(p => earlyPressIds.includes(p.id)).map(p => p.nickname).join(', ')}
                  </p>
                </div>
              )}
            </div>
            {isHost && currentRound < totalRounds && (
              <button
                onClick={nextRound}
                className="px-6 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('reaction.next_round')}
              </button>
            )}
            {isHost && currentRound >= totalRounds && (
              <button
                onClick={resetGame}
                className="px-6 h-10 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-muted transition-colors"
              >
                {t('reaction.play_again')}
              </button>
            )}
            {!isHost && <p className="text-xs text-muted-foreground">{t('reaction.host_will_start')}</p>}
          </div>
        )}

        {/* Early press warning */}
        {isEarly && phase !== 'waiting' && (
          <div className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-sm text-destructive font-medium">{t('reaction.you_pressed_early')}</p>
          </div>
        )}

        <GameReactions onSend={() => {}} incoming={incoming} />
      </div>
    </GameLayout>
  );
}
