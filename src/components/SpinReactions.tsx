import type { FloatingReaction } from "@/hooks/useSpinRoom";

const REACTION_LIST = ["🎉", "👍", "😲", "🔥"];

interface Props {
  floating: FloatingReaction[];
  onSend: (emoji: string) => void;
}

export default function SpinReactions({ floating, onSend }: Props) {
  return (
    <div className="relative">
      <style>{`
        @keyframes spin-float-up {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          60%  { transform: translateY(-60px) scale(1.4); opacity: 0.9; }
          100% { transform: translateY(-100px) scale(1.6); opacity: 0; }
        }
        .spin-float { animation: spin-float-up 2.2s ease-out forwards; }
      `}</style>

      {/* Floating emojis */}
      <div className="relative h-16 pointer-events-none overflow-hidden" aria-hidden>
        {floating.map((r) => (
          <span
            key={r.id}
            className="absolute bottom-0 select-none spin-float text-2xl"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="flex gap-3 justify-center">
        {REACTION_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSend(emoji)}
            className="text-2xl hover:scale-125 active:scale-90 transition-transform leading-none"
            aria-label={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
