import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
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

        {/* Copy URL only */}
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
