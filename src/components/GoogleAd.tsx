import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

interface Props {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  className?: string;
}

export default function GoogleAd({ slot, format = "auto", className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isPlaceholder = slot === "REPLACE_WITH_SLOT_ID";

  useEffect(() => {
    if (isPlaceholder) return;
    const el = ref.current;
    if (!el) return;

    el.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.setAttribute("data-ad-client", "ca-pub-9613545366726961");
    ins.setAttribute("data-ad-slot", slot);
    ins.setAttribute("data-ad-format", format);
    ins.setAttribute("data-full-width-responsive", "true");
    el.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}

    return () => {
      el.innerHTML = "";
    };
  }, [slot, format, isPlaceholder]);

  if (isPlaceholder) return null;

  return <div ref={ref} className={className} />;
}
