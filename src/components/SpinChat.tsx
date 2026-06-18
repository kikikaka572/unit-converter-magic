import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useSpinRoom';

interface SpinChatProps {
  messages: ChatMessage[];
  myNickname: string;
  onSend: (text: string) => void;
}

export default function SpinChat({ messages, myNickname, onSend }: SpinChatProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5">
        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">채팅</p>
        <span className="text-xs text-muted-foreground ml-auto">{myNickname} (나)</span>
      </div>

      <div className="h-44 overflow-y-auto flex flex-col gap-1.5 pr-0.5 scroll-smooth">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            아직 메시지가 없어요 💬
          </p>
        )}
        {messages.map(m => {
          const isMine = m.nickname === myNickname;
          return (
            <div key={m.id} className={`flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-muted-foreground px-1">
                {isMine ? '나' : m.nickname}
              </span>
              <div className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                <span
                  className={`px-2.5 py-1.5 rounded-2xl text-xs max-w-[75%] break-words leading-relaxed
                    ${isMine
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-background border border-border text-foreground rounded-tl-sm'
                    }`}
                >
                  {m.text}
                </span>
                <span className="text-[9px] text-muted-foreground shrink-0 mb-0.5">
                  {formatTime(m.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend(); }}
          placeholder="메시지 입력..."
          maxLength={100}
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-default transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
