import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import ToolPageLayout from "@/components/ToolPageLayout";
import SpinWheel, { type SpinWheelHandle } from "@/components/SpinWheel";
import SpinEditor from "@/components/SpinEditor";
import SpinResult from "@/components/SpinResult";
import MultiWatchPanel from "@/components/MultiWatchPanel";
import SpinReactions from "@/components/SpinReactions";
import SpinChat from "@/components/SpinChat";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { useSpinRoom, type RoomRole } from "@/hooks/useSpinRoom";
import { useNickname } from "@/hooks/useNickname";
import { useLanguage } from "@/i18n/LanguageContext";

function relativeTime(timestamp: number, agoLabel: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return "< 1" + agoLabel;
  return `${mins}${agoLabel}`;
}

export default function SpinPage() {
  const { t, lang } = useLanguage();
  const { nickname } = useNickname();
  const wheelRef = useRef<SpinWheelHandle>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const roleRef = useRef<RoomRole | null>(null);
  const syncTimeout = useRef<ReturnType<typeof setTimeout>>();

  const {
    items,
    winner,
    showResult,
    history,
    soundEnabled,
    setSoundEnabled,
    canAdd,
    canRemove,
    updateItem,
    addItem,
    removeItem,
    resetItems,
    loadPreset,
    handleSpinComplete,
    dismissResult,
    clearHistory,
    deleteHistoryItem,
  } = useSpinWheel();

  const {
    room,
    role,
    loading,
    error,
    floatingReactions,
    chatMessages,
    createRoom,
    joinRoom,
    leaveRoom,
    syncItems,
    notifyItemsUpdate,
    notifySpinStart,
    notifySpinEnd,
    sendReaction,
    sendChatMessage,
  } = useSpinRoom({
    onSpinStart: (targetAngle, durationMs, startedAtMs, role) => {
      if (role === "viewer") {
        wheelRef.current?.spinTo(targetAngle, durationMs, startedAtMs);
      }
    },
    onSpinEnd: (_result, _role) => {
      // Viewer result is handled by spinTo() completing locally.
      // spin_end broadcast is only used by the host to persist to DB.
    },
  });

  useEffect(() => { roleRef.current = role; }, [role]);

  // Auto-join from URL ?room=CODE
  useEffect(() => {
    const code = searchParams.get("room");
    if (!code || room) return;
    joinRoom(code).then((r) => {
      if (!r) return;
      setSearchParams({}, { replace: true });
      wheelRef.current?.setRotation(r.current_angle ?? 0);
      if (r.is_spinning && r.spin_target_angle != null && r.spin_duration_ms != null && r.spin_started_at) {
        const startedAtMs = new Date(r.spin_started_at).getTime();
        wheelRef.current?.spinTo(r.spin_target_angle, r.spin_duration_ms, startedAtMs);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleJoinRoom(code: string) {
    joinRoom(code).then((r) => {
      if (!r) return;
      wheelRef.current?.setRotation(r.current_angle ?? 0);
      if (r.is_spinning && r.spin_target_angle != null && r.spin_duration_ms != null && r.spin_started_at) {
        const startedAtMs = new Date(r.spin_started_at).getTime();
        wheelRef.current?.spinTo(r.spin_target_angle, r.spin_duration_ms, startedAtMs);
      }
    });
  }

  function handleCreateRoom() {
    createRoom(items, 0);
  }

  function handleWheelSpinStart(targetAngle: number, durationMs: number) {
    if (roleRef.current !== "host" || !room) return;
    notifySpinStart(targetAngle, durationMs, new Date().toISOString());
  }

  async function handleSpinCompleteWithRoom(result: string) {
    handleSpinComplete(result);
    if (roleRef.current === "host" && room) {
      await notifySpinEnd(result, 0);
    }
  }

  // Sync items to viewers when host edits them
  useEffect(() => {
    if (role !== "host" || !room) return;
    // Broadcast immediately for real-time viewer sync
    notifyItemsUpdate(items);
    // Debounced DB write for late joiners
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => syncItems(items), 800);
  }, [items, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const isViewer = role === "viewer";
  const displayItems = isViewer && room ? (room.items as string[]) : items;

  function handleSpinAgain() {
    setTimeout(() => wheelRef.current?.spin(), 120);
  }

  return (
    <ToolPageLayout toolId="spin">
      <div className="space-y-5">
        {/* Multi-watch */}
        <MultiWatchPanel
          room={room}
          role={role}
          loading={loading}
          error={error}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onLeaveRoom={leaveRoom}
        />

        {/* Sound toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          >
            {soundEnabled ? (
              <><Volume2 className="w-3.5 h-3.5" />{t("spin.soundOn")}</>
            ) : (
              <><VolumeX className="w-3.5 h-3.5" />{t("spin.soundOff")}</>
            )}
          </button>
        </div>

        {/* Wheel + editor */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="w-full lg:flex-shrink-0" style={{ maxWidth: 380 }}>
            <SpinWheel
              ref={wheelRef}
              items={displayItems}
              soundEnabled={soundEnabled}
              onSpinComplete={handleSpinCompleteWithRoom}
              onSpinStart={role === "host" ? handleWheelSpinStart : undefined}
              disabled={isViewer}
            />
            <p className="mt-2 text-xs text-center text-muted-foreground">
              {isViewer
                ? (lang === "ko" ? "시청 중 🎥" : lang === "fr" ? "En cours..." : "Watching...")
                : (lang === "ko" ? "클릭하거나 탭해서 돌리세요"
                  : lang === "fr" ? "Cliquez pour tourner"
                  : "Click or tap to spin")}
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {isViewer ? (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {lang === "ko" ? "항목" : lang === "fr" ? "Éléments" : "Items"}
                </p>
                <ul className="space-y-1.5">
                  {displayItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: `hsl(${(i * 30) % 360}, 65%, 55%)` }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <SpinEditor
                items={items}
                canAdd={canAdd}
                canRemove={canRemove}
                onUpdateItem={updateItem}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onReset={resetItems}
                onLoadPreset={loadPreset}
              />
            )}
          </div>
        </div>

        {/* Reactions (room mode only) */}
        {room && (
          <section className="pt-2">
            <SpinReactions floating={floatingReactions} onSend={sendReaction} />
          </section>
        )}

        {/* Chat (room mode only) */}
        {room && (
          <section>
            <SpinChat
              messages={chatMessages}
              myNickname={nickname}
              onSend={(text) => sendChatMessage(nickname, text)}
            />
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">{t("spin.history.title")}</h2>
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("spin.history.clear")}
              </button>
            </div>
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/50 text-sm"
                >
                  <span className="font-medium">{h.item}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {relativeTime(h.timestamp, t("spin.history.ago"))}
                    <button
                      onClick={() => deleteHistoryItem(i)}
                      className="hover:text-foreground transition-colors"
                      aria-label="delete"
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            {t("spin.history.empty")}
          </p>
        )}
      </div>

      <SpinResult
        open={showResult}
        winner={winner ?? ""}
        onClose={dismissResult}
        onSpinAgain={handleSpinAgain}
      />
    </ToolPageLayout>
  );
}
