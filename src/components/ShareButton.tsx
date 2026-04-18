import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ShareButton = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = "정말 쓸만한 일상계산기";
  const shareText = "단위 환산부터 실생활 계산까지! 한 번에 해결하세요.";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "주소가 복사되었어요" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "복사에 실패했어요", variant: "destructive" });
    }
  };

  const socials: { name: string; bg: string; emoji: string; href: string }[] = [
    {
      name: "카카오톡",
      bg: "bg-[hsl(53,100%,50%)] text-[hsl(0,0%,15%)]",
      emoji: "💬",
      href: `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "페이스북",
      bg: "bg-[hsl(221,44%,41%)] text-white",
      emoji: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X (트위터)",
      bg: "bg-[hsl(0,0%,8%)] text-white",
      emoji: "𝕏",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "라인",
      bg: "bg-[hsl(135,72%,42%)] text-white",
      emoji: "L",
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "텔레그램",
      bg: "bg-[hsl(200,80%,52%)] text-white",
      emoji: "✈️",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "이메일",
      bg: "bg-secondary text-foreground",
      emoji: "✉️",
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setOpen(false);
      } catch {
        /* user cancelled */
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="공유하기"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-muted text-foreground transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>공유하기</DialogTitle>
        </DialogHeader>

        {/* Social icons */}
        <div className="grid grid-cols-3 gap-3 py-2">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <span
                className={`flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${s.bg}`}
              >
                {s.emoji}
              </span>
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </a>
          ))}
        </div>

        {/* Copy URL */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            링크 주소
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border border-input rounded-lg text-sm bg-secondary text-foreground truncate"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-2 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-secondary transition-colors"
          >
            기기 공유 메뉴 열기
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;
