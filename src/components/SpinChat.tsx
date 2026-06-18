import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, Pencil, Check, X, ChevronDown } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useSpinRoom';

interface SpinChatProps {
  messages: ChatMessage[];
  myNickname: string;
  onSend: (text: string) => void;
  onNicknameChange?: (name: string) => void;
}

export default function SpinChat({ messages, myNickname, onSend, onNicknameChange }: SpinChatProps) {
  const [text, setText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(myNickname);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const isAtBottomRef = useRef(true);
  const prevLengthRef = useRef(messages.length);

  // Sync nicknameInput when prop changes (e.g., after save)
  useEffect(() => {
    if (!editingNickname) setNicknameInput(myNickname);
  }, [myNickname, editingNickname]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    isAtBottomRef.current = atBottom;
    if (atBottom) setUnreadCount(0);
  }

  // New message arrived
  useEffect(() => {
    const newLen = messages.length;
    if (newLen <= prevLengthRef.current) {
      prevLengthRef.current = newLen;
      return;
    }
    const added = newLen - prevLengthRef.current;
    prevLengthRef.current = newLen;

    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setUnreadCount(prev => prev + added);
    }
  }, [messages.length]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
    isAtBottomRef.current = true;
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
    setTimeout(scrollToBottom, 50);
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function startEditNickname() {
    setNicknameInput(myNickname);
    setEditingNickname(true);
    setTimeout(() => nicknameInputRef.current?.select(), 40);
  }

  function saveNickname() {
    const trimmed = nicknameInput.trim();
    if (trimmed && trimmed.length <= 8) {
      onNicknameChange?.(trimmed);
    } else {
      setNicknameInput(myNickname);
    }
    setEditingNickname(false);
  }

  function cancelEdit() {
    setNicknameInput(myNickname);
    setEditingNickname(false);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">채팅</p>
        <div className="ml-auto flex items-center gap-1">
          {editingNickname ? (
            <>
              <input
                ref={nicknameInputRef}
                value={nicknameInput}
                onChange={e => setNicknameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveNickname();
                  if (e.key === 'Escape') cancelEdit();
                }}
                maxLength={8}
                className="w-20 text-xs px-1.5 py-0.5 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button onClick={saveNickname} className="p-0.5 text-green-500 hover:text-green-400 transition-colors">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={cancelEdit} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button
              onClick={startEditNickname}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
              title="닉네임 변경"
            >
              <span>{myNickname} (나)</span>
              <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="relative">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-44 overflow-y-auto flex flex-col gap-1.5 pr-0.5"
        >
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

        {/* New message toast */}
        {unreadCount > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <ChevronDown className="w-3 h-3" />
            새 메시지 {unreadCount}개
          </button>
        )}
      </div>

      {/* Input */}
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
