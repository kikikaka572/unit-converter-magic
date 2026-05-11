/**
 * TopBanner — 페이지 상단 띠배너 광고 영역
 *
 * 광고 스크립트 삽입 가이드:
 * ─────────────────────────────────────────────
 * 1) 카카오 애드핏(현재 프로젝트 사용 중) 예시:
 *    아래 div 내부의 주석을 지우고 <ins> 태그를 넣으세요.
 *
 *    <ins
 *      className="kakao_ad_area"
 *      style={{ display: "none" }}
 *      data-ad-unit="DAN-XXXXXXXXXXXX"   // 애드핏에서 발급받은 광고단위 ID
 *      data-ad-width="320"               // 모바일: 320x50 / PC: 728x90
 *      data-ad-height="50"
 *    />
 *
 *    스크립트는 이미 index.html 에 한 번 로드되어 있어 별도 추가 불필요.
 *    (//t1.daumcdn.net/kas/static/ba.min.js)
 *
 * 2) 구글 애드센스 예시:
 *    <ins
 *      className="adsbygoogle"
 *      style={{ display: "block" }}
 *      data-ad-client="ca-pub-9613545366726961"
 *      data-ad-slot="0000000000"
 *      data-ad-format="auto"
 *      data-full-width-responsive="true"
 *    />
 *    그리고 useEffect 안에서:
 *      (window.adsbygoogle = window.adsbygoogle || []).push({});
 *
 * 3) 직접 만든 띠배너(이미지 링크) 예시:
 *    <a href="..." target="_blank" rel="noopener">
 *      <img src="/banners/xxx.jpg" alt="배너" className="w-full h-auto" />
 *    </a>
 * ─────────────────────────────────────────────
 */
interface Props {
  /** 배너 식별용 라벨 (디버깅/구분용) */
  slot?: string;
  className?: string;
}

export default function TopBanner({ slot = "top", className = "" }: Props) {
  return (
    <div
      data-ad-slot={slot}
      aria-label="advertisement"
      className={
        "w-full mb-4 rounded-md border border-dashed border-border bg-muted/30 " +
        "flex items-center justify-center overflow-hidden " +
        "min-h-[60px] sm:min-h-[90px] " +
        className
      }
    >
      {/* ⬇⬇⬇ 여기에 광고 <ins> 또는 <a><img/></a> 코드를 넣으세요 ⬇⬇⬇ */}
      <span className="text-[11px] text-muted-foreground select-none">
        광고 영역 (slot: {slot})
      </span>
      {/* ⬆⬆⬆ 여기까지 ⬆⬆⬆ */}
    </div>
  );
}
