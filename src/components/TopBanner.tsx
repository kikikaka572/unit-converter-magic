import { useEffect, useState } from "react";
import KakaoAdFit from "./KakaoAdFit";

interface Props {
  slot?: string;
  className?: string;
  mobileAdUnit?: string;
  pcAdUnit?: string;
}

export default function TopBanner({
  slot = "top",
  className = "",
  mobileAdUnit = "DAN-9oftv3L6uNEyDwk7",
  pcAdUnit = "DAN-ThNhcPcQHx51NNLd",
}: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // 화면 크기 확인 전엔 렌더링하지 않아 잘못된 슬롯 초기화 방지
  if (isMobile === null) return null;

  return (
    <div
      data-ad-slot={slot}
      aria-label="advertisement"
      className={"w-full mb-4 flex items-center justify-center overflow-hidden " + className}
    >
      {isMobile ? (
        <KakaoAdFit adUnit={mobileAdUnit} adWidth={320} adHeight={100} />
      ) : (
        <KakaoAdFit adUnit={pcAdUnit} adWidth={728} adHeight={90} />
      )}
    </div>
  );
}
