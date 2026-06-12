import { useEffect, useRef, useState } from 'react';

const REACTIONS = ['👍', '😂', '😮', '🔥', '❤️', '👏'];

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

interface GameReactionsProps {
  onSend: (emoji: string) => void;
  incoming: FloatingEmoji[];
}

export default function GameReactions({ onSend, incoming }: GameReactionsProps) {
  const [local, setLocal] = useState<FloatingEmoji[]>([]);
  const counter = useRef(0);

  function handleSend(emoji: string) {
    const id = ++counter.current;
    const x = Math.random() * 60 + 20;
    setLocal(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setLocal(prev => prev.filter(e => e.id !== id)), 2200);
    onSend(emoji);
  }

  const allFloating = [...local, ...incoming];

  return (
    <div className="relative">
      {/* Floating emojis */}
      <div className="absolute bottom-full left-0 right-0 h-40 pointer-events-none overflow-hidden">
        {allFloating.map(e => (
          <span
            key={e.id}
            className="absolute text-2xl animate-float select-none"
            style={{ left: `${e.x}%` }}
          >
            {e.emoji}
          </span>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleSend(emoji)}
            className="text-xl hover:scale-125 active:scale-110 transition-transform select-none"
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
