import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  open: boolean;
  winner: string;
  onClose: () => void;
  onSpinAgain: () => void;
}

export default function SpinResult({ open, winner, onClose, onSpinAgain }: Props) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("spin.result.title")}</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="text-5xl font-bold text-primary break-words leading-tight">
            {winner || "?"}
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onClose}>
            {t("spin.result.close")}
          </Button>
          <Button
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
          >
            {t("spin.result.again")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
