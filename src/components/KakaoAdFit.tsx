import { useEffect, useRef } from "react";

interface Props {
  adUnit: string;
  adWidth: number;
  adHeight: number;
  className?: string;
}

/**
 * 카카오 AdFit 광고 슬롯 컴포넌트.
 *
 * React SPA에서 ba.min.js를 index.html에 정적으로 삽입하면
 * 스크립트가 먼저 실행된 뒤 React가 마운트되기 때문에
 * <ins> 태그를 인식하지 못합니다.
 * 이 컴포넌트는 마운트 후 ins + script를 동적으로 삽입하여
 * 항상 올바른 타이밍에 AdFit이 초기화되도록 합니다.
 */
export default function KakaoAdFit({ adUnit, adWidth, adHeight, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 이전 렌더링 잔재 제거 (route 변경 시 재초기화)
    container.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", adUnit);
    ins.setAttribute("data-ad-width", String(adWidth));
    ins.setAttribute("data-ad-height", String(adHeight));
    container.appendChild(ins);

    const script = document.createElement("script");
    script.async = true;
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [adUnit, adWidth, adHeight]);

  return <div ref={containerRef} className={className} />;
}
