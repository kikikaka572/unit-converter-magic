import { useState } from "react";
import { Users, Copy, Check, X, LogIn, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SpinRoom } from "@/lib/spinRoom";
import type { RoomRole } from "@/hooks/useSpinRoom";

interface Props {
  room: SpinRoom | null;
  role: RoomRole | null;
  loading: boolean;
  error: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
}

export default function MultiWatchPanel({ room, role, loading, error, onCreateRoom, onJoinRoom, onLeaveRoom }: Props) {
  const [code, setCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const { lang } = useLanguage();
  const ko = lang === "ko";

  function handleCopyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.id).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length >= 6) {
      onJoinRoom(code.trim());
      setCode("");
      setShowJoin(false);
    }
  }

  if (room) {
    return (
      <div className="flex items-center gap-2 flex-wrap text-sm py-2 px-3 rounded-xl bg-secondary/60 border border-border">
        <span className="text-xs text-muted-foreground">
          {ko ? "방 코드" : lang === "fr" ? "Code" : "Room"}
        </span>
        <span className="font-mono font-bold text-base tracking-[0.2em] text-primary">
          {room.id}
        </span>
        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copiedCode ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copiedCode ? (ko ? "복사됨" : "Copied") : (ko ? "코드 복사" : "Copy code")}
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copiedLink ? <Check className="w-3 h-3 text-green-500" /> : <Link className="w-3 h-3" />}
          {copiedLink ? (ko ? "복사됨" : "Copied") : (ko ? "링크 복사" : "Copy link")}
        </button>
        <div className="flex items-center gap-1 text-muted-foreground text-xs ml-1">
          <Users className="w-3 h-3" />
          <span>{room.viewer_count}</span>
        </div>
        {role === "host" && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {ko ? "방장" : "Host"}
          </span>
        )}
        <button
          onClick={onLeaveRoom}
          className="ml-auto p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
          aria-label={ko ? "방 나가기" : "Leave room"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onCreateRoom}
          className="text-xs gap-1.5 h-8"
        >
          <Users className="w-3.5 h-3.5" />
          {ko ? "같이 보기" : lang === "fr" ? "Regarder ensemble" : "Watch Together"}
        </Button>

        {!showJoin ? (
          <button
            onClick={() => setShowJoin(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            {ko ? "코드로 참가" : lang === "fr" ? "Rejoindre" : "Join with code"}
          </button>
        ) : (
          <form onSubmit={handleJoin} className="flex items-center gap-1.5">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder={ko ? "코드 입력" : "Enter code"}
              maxLength={6}
              autoFocus
              className="w-24 px-2 py-1 text-xs font-mono uppercase border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="submit"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={loading || code.length < 6}
            >
              {ko ? "참가" : "Join"}
            </Button>
            <button
              type="button"
              onClick={() => { setShowJoin(false); setCode(""); }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
