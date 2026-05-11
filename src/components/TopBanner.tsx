/**
 * TopBanner — 페이지 상단 띠배너 광고 영역
 *
 * ─────────────────────────────────────────────
 * 광고 스크립트 삽입 가이드
 * ─────────────────────────────────────────────
 * 현재 카카오 애드핏(Kakao AdFit) 슬롯이 모바일/PC 두 가지로 구성되어 있습니다.
 * - 모바일(<640px): 320x100  → data-ad-unit 을 모바일용 단위 ID로 교체
 * - PC(≥640px)   : 728x90   → data-ad-unit 을 PC용 단위 ID로 교체
 *
 * 카카오 애드핏 로더 스크립트는 index.html 에 이미 삽입되어 있어
 * 별도 추가가 필요 없습니다. (//t1.daumcdn.net/kas/static/ba.min.js)
 *
 * 다른 광고로 교체하려면 아래 <ins> 영역을 지우고
 * <a><img/></a> 또는 구글 애드센스 <ins className="adsbygoogle"> 코드로 바꾸세요.
 * 구글 애드센스의 경우 useEffect 에서
 *   (window.adsbygoogle = window.adsbygoogle || []).push({});
 * 를 호출해야 합니다.
 * ─────────────────────────────────────────────
 */
interface Props {
  /** 배너 식별용 라벨 (디버깅/구분용) */
  slot?: string;
  className?: string;
  /** 모바일(320x100) 카카오 애드핏 ad-unit ID */
  mobileAdUnit?: string;
  /** PC(728x90) 카카오 애드핏 ad-unit ID */
  pcAdUnit?: string;
}

export default function TopBanner({
  slot = "top",
  className = "",
  // TODO: 카카오 애드핏에서 발급받은 실제 ad-unit ID로 교체하세요.
  mobileAdUnit = "DAN-REPLACE-MOBILE-320x100",
  pcAdUnit = "DAN-REPLACE-PC-728x90",
}: Props) {
  return (
    <div
      data-ad-slot={slot}
      aria-label="advertisement"
      className={
        "w-full mb-4 flex items-center justify-center overflow-hidden " +
        className
      }
    >
      {/* 모바일 (320x100) */}
      <ins
        className="kakao_ad_area sm:hidden"
        style={{ display: "none" }}
        data-ad-unit={DAN-9oftv3L6uNEyDwk7}
        data-ad-width="320"
        data-ad-height="100"
      />
      {/* PC / 태블릿 (728x90) */}
      <ins
        className="kakao_ad_area hidden sm:inline-block"
        style={{ display: "none" }}
        data-ad-unit={DAN-ThNhcPcQHx51NNLd}
        data-ad-width="728"
        data-ad-height="90"
      />
    </div>
  );
}
