export type Lang = "ko" | "en";

const dict = {
  // Header / Tabs
  "tab.salary": { ko: "연봉 계산", en: "Salary" },
  "tab.life": { ko: "실생활 계산", en: "Life" },
  "tab.converter": { ko: "단위 환산", en: "Units" },
  "header.salary.title": { ko: "연봉 실수령액 계산기", en: "Take-Home Salary Calculator" },
  "header.salary.desc": { ko: "2026년 4대보험·세금 반영 실수령액", en: "2026 net pay after Korean insurance & tax" },
  "header.life.title": { ko: "실생활 계산기", en: "Everyday Calculators" },
  "header.life.desc": { ko: "일상에서 자주 쓰는 빠른 계산", en: "Quick calculators for daily life" },
  "header.converter.title": { ko: "단위 환산 계산기", en: "Unit Converter" },
  "header.converter.desc": { ko: "간편하고 정확한 단위 변환", en: "Simple and accurate unit conversion" },

  // Share
  "share.button": { ko: "공유하기", en: "Share" },
  "share.title": { ko: "공유하기", en: "Share" },
  "share.linkLabel": { ko: "링크 주소", en: "Link URL" },
  "share.copy": { ko: "복사", en: "Copy" },
  "share.copied": { ko: "복사됨", en: "Copied" },
  "share.copiedToast": { ko: "주소가 복사되었어요", en: "Link copied" },
  "share.copyFail": { ko: "복사에 실패했어요", en: "Failed to copy" },
  "share.openNative": { ko: "기기 공유 메뉴 열기", en: "Open device share menu" },
  "share.shareText": {
    ko: "단위 환산부터 실생활 계산까지! 한 번에 해결하세요.",
    en: "From unit conversion to daily calculators — all in one place.",
  },

  // Language
  "lang.ko": { ko: "한국어", en: "Korean" },
  "lang.en": { ko: "English", en: "English" },

  // Salary calculator
  "salary.heading": { ko: "💼 2026년 연봉 실수령액 계산기", en: "💼 2026 Take-Home Salary Calculator" },
  "salary.subheading": {
    ko: "2026년 4대보험 요율 기준 · 비과세 식대 월 20만원 자동 적용",
    en: "Based on 2026 Korean insurance rates · Default ₩200,000/month meal allowance (non-taxable)",
  },
  "salary.annualLabel": { ko: "연봉 (만원)", en: "Annual salary (10,000 KRW)" },
  "salary.dependentsLabel": { ko: "부양가족 수 (본인 포함)", en: "Dependents (incl. yourself)" },
  "salary.nonTaxableLabel": { ko: "월 비과세액 (원)", en: "Monthly non-taxable (KRW)" },
  "salary.netMonthly": { ko: "월 실수령액", en: "Monthly take-home" },
  "salary.unitWon": { ko: "원", en: "KRW" },
  "salary.netAnnualText": { ko: "연 실수령 약", en: "Annual take-home approx." },
  "salary.deductionTotalText": { ko: "월 공제 합계", en: "Total monthly deduction" },
  "salary.deductionHeading": { ko: "월 공제 내역 (4대보험 + 세금)", en: "Monthly deductions (insurance + tax)" },
  "salary.nationalPension": { ko: "국민연금", en: "National Pension" },
  "salary.healthInsurance": { ko: "건강보험", en: "Health Insurance" },
  "salary.longTermCare": { ko: "장기요양보험", en: "Long-term Care" },
  "salary.longTermCareSub": { ko: "건보료의", en: "of health premium" },
  "salary.employmentInsurance": { ko: "고용보험", en: "Employment Insurance" },
  "salary.incomeTax": { ko: "소득세", en: "Income Tax" },
  "salary.incomeTaxSub": { ko: "(간이세액표)", en: "(simplified table)" },
  "salary.localTax": { ko: "지방소득세", en: "Local Income Tax" },
  "salary.localTaxSub": { ko: "(소득세의 10%)", en: "(10% of income tax)" },
  "salary.totalDeduction": { ko: "공제 합계", en: "Total deduction" },
  "salary.minWageNote": {
    ko: "※ 2026년 최저임금 시급 / 월 (주 40h + 주휴 209h 기준) 반영",
    en: "※ Reflects 2026 minimum wage (hourly / monthly, 209h basis incl. weekly paid rest)",
  },
  "salary.estimateNote": {
    ko: "※ 본 계산은 추정치이며, 실제 급여명세서와 일부 차이가 있을 수 있습니다",
    en: "※ This is an estimate; actual payslips may slightly differ",
  },
  "salary.tableOpen": {
    ko: "▼ 연봉별 실수령액 표 보기 (100만원 단위 · 3억까지)",
    en: "▼ View salary table (1M KRW steps · up to 300M)",
  },
  "salary.tableClose": { ko: "▲ 연봉별 실수령액 표 닫기", en: "▲ Hide salary table" },
  "salary.col.annual": { ko: "연봉", en: "Annual" },
  "salary.col.monthly": { ko: "월 세전", en: "Gross/mo" },
  "salary.col.deduction": { ko: "월 공제", en: "Deduction" },
  "salary.col.net": { ko: "월 실수령", en: "Net/mo" },
  "salary.unitMan": { ko: "만원", en: "×10K KRW" },

  // Life calculators - meta
  "life.salary": { ko: "시급계산", en: "Hourly Wage" },
  "life.salary.desc": { ko: "월급을 시급으로 환산", en: "Convert monthly salary to hourly" },
  "life.fuel": { ko: "차량연료비", en: "Fuel Cost" },
  "life.fuel.desc": { ko: "주행거리 기반 예상 연료비", en: "Estimated fuel cost by distance" },
  "life.parcel": { ko: "택배요금계산", en: "Parcel Fee" },
  "life.parcel.desc": { ko: "가로·세로·높이로 부피무게(kg) 계산", en: "Volumetric weight from W·H·D" },
  "life.interior": { ko: "인테리어비용", en: "Interior Cost" },
  "life.interior.desc": { ko: "평수 기반 대략적인 인테리어 비용", en: "Rough interior cost by area" },
  "life.serving": { ko: "칼로리계산", en: "Calories" },
  "life.serving.desc": { ko: "음식 종류별 칼로리 계산", en: "Calories by food type" },
  "life.electricity": { ko: "전기요금계산", en: "Electricity Bill" },
  "life.electricity.desc": { ko: "월 kWh 사용량으로 전기요금 추정", en: "Estimate by monthly kWh" },
  "life.water": { ko: "수도요금계산", en: "Water Bill" },
  "life.water.desc": { ko: "월 m³ 사용량으로 수도요금 추정", en: "Estimate by monthly m³" },
  "life.gas": { ko: "가스요금계산", en: "Gas Bill" },
  "life.gas.desc": { ko: "월 m³ 사용량으로 도시가스 요금 추정", en: "Estimate by monthly m³" },
  "life.moving": { ko: "이사비용계산", en: "Moving Cost" },
  "life.moving.desc": { ko: "거리·평수·이사 종류별 예상 비용", en: "By distance, area, type" },
  "life.dday": { ko: "D-day계산", en: "D-day" },
  "life.dday.desc": { ko: "두 날짜 사이의 남은/지난 일수 계산", en: "Days between today and a date" },
  "life.more": { ko: "더보기", en: "More" },
  "life.allTitle": { ko: "실생활 계산기", en: "Everyday Calculators" },
  "life.openAllAria": { ko: "전체 계산기 보기", en: "Open all calculators" },
  "life.tablistAria": { ko: "실생활 계산기 선택", en: "Select calculator" },

  // Life - common labels
  "life.salary.monthlyLabel": { ko: "월급 (원)", en: "Monthly salary (KRW)" },
  "life.salary.weeklyHoursLabel": { ko: "주당 근무시간", en: "Weekly hours" },
  "life.salary.resultLabel": { ko: "시급", en: "Hourly wage" },
  "life.salary.resultUnit": { ko: "원/시간", en: "KRW/hr" },
  "life.salary.note": { ko: "월 근무시간 = 주당 시간 × 4.345주", en: "Monthly hours = weekly hours × 4.345" },

  "life.fuel.distance": { ko: "주행거리 (km)", en: "Distance (km)" },
  "life.fuel.efficiency": { ko: "연비 (km/L)", en: "Fuel efficiency (km/L)" },
  "life.fuel.price": { ko: "유가 (원/L)", en: "Fuel price (KRW/L)" },
  "life.fuel.result": { ko: "예상 연료비", en: "Estimated fuel cost" },
  "life.fuel.note": { ko: "필요 연료량 약", en: "Required fuel approx." },

  "life.parcel.w": { ko: "가로 (cm)", en: "Width (cm)" },
  "life.parcel.h": { ko: "세로 (cm)", en: "Length (cm)" },
  "life.parcel.d": { ko: "높이 (cm)", en: "Height (cm)" },
  "life.parcel.actual": { ko: "실제 무게 (kg)", en: "Actual weight (kg)" },
  "life.parcel.divisor": { ko: "부피무게 계수", en: "Volumetric divisor" },
  "life.parcel.divisor.intl": { ko: "국제 표준 (6000)", en: "International (6000)" },
  "life.parcel.divisor.air": { ko: "항공 특송 (5000)", en: "Air express (5000)" },
  "life.parcel.divisor.dom": { ko: "국내 택배 (8000)", en: "Korea domestic (8000)" },
  "life.parcel.carrier": { ko: "택배사", en: "Carrier" },
  "life.parcel.result": { ko: "예상 택배요금", en: "Estimated parcel fee" },
  "life.parcel.oversize": { ko: "추가요금 발생", en: "oversize surcharge" },
  "life.parcel.volumetric": { ko: "부피무게", en: "Volumetric wt." },
  "life.parcel.sumCm": { ko: "3변 합", en: "Sum of sides" },
  "life.parcel.applyWeight": { ko: "적용 무게", en: "Applied weight" },
  "life.parcel.applyWeightSub": {
    ko: "(실무게·부피무게 중 큰 값)",
    en: "(greater of actual / volumetric)",
  },
  "life.parcel.note": {
    ko: "※ 택배사 표준 운임 기반 추정치, 실제 요금은 계약·지역에 따라 다릅니다",
    en: "※ Estimate based on standard rates; actual fees vary by contract/region",
  },

  "life.interior.pyeong": { ko: "평수", en: "Area (pyeong)" },
  "life.interior.grade": { ko: "인테리어 등급", en: "Interior grade" },
  "life.interior.basic": { ko: "기본 (도배·장판 위주)", en: "Basic (wallpaper/floor)" },
  "life.interior.standard": { ko: "표준 (반셀프~일반)", en: "Standard (semi-DIY)" },
  "life.interior.premium": { ko: "프리미엄 (전체 리모델링)", en: "Premium (full remodel)" },
  "life.interior.luxury": { ko: "럭셔리 (고급 마감재)", en: "Luxury (premium materials)" },
  "life.interior.perPyeong": { ko: "평당", en: "per pyeong" },
  "life.interior.result": { ko: "예상 인테리어 비용", en: "Estimated interior cost" },
  "life.interior.note": {
    ko: "※ 시장 평균 기반 추정치이며 실제 견적과 다를 수 있습니다",
    en: "※ Market-average estimate; actual quotes may vary",
  },

  "life.serving.food": { ko: "음식 종류", en: "Food type" },
  "life.serving.amount": { ko: "섭취량 (인분/개수)", en: "Servings / count" },
  "life.serving.result": { ko: "총 칼로리", en: "Total calories" },
  "life.serving.basis": { ko: "기준", en: "basis" },

  "life.electricity.kwh": { ko: "월 사용량 (kWh)", en: "Monthly usage (kWh)" },
  "life.electricity.result": { ko: "예상 전기요금", en: "Estimated electricity bill" },
  "life.electricity.tier1": { ko: "1단계 (0~200kWh)", en: "Tier 1 (0–200 kWh)" },
  "life.electricity.tier2": { ko: "2단계 (201~400kWh)", en: "Tier 2 (201–400 kWh)" },
  "life.electricity.tier3": { ko: "3단계 (400kWh 초과)", en: "Tier 3 (>400 kWh)" },
  "life.electricity.breakdown": {
    ko: "기본 + 사용 (부가세·기금 포함)",
    en: "Base + usage (incl. VAT & fund)",
  },
  "life.electricity.note": {
    ko: "※ 한전 주택용 저압 누진제 기반 추정치",
    en: "※ Based on KEPCO residential progressive tariff",
  },

  "life.water.m3": { ko: "월 사용량 (m³)", en: "Monthly usage (m³)" },
  "life.water.result": { ko: "예상 수도요금", en: "Estimated water bill" },
  "life.water.breakdown": {
    ko: "상수도 + 하수도 + 물이용부담금",
    en: "Water + sewer + water-use fund",
  },
  "life.water.note": {
    ko: "※ 서울시 가정용 누진 단가 기반 추정치",
    en: "※ Based on Seoul residential progressive rates",
  },

  "life.gas.m3": { ko: "월 사용량 (m³)", en: "Monthly usage (m³)" },
  "life.gas.unit": { ko: "단가 (원/m³)", en: "Unit price (KRW/m³)" },
  "life.gas.base": { ko: "기본요금 (원)", en: "Base fee (KRW)" },
  "life.gas.result": { ko: "예상 가스요금", en: "Estimated gas bill" },
  "life.gas.note": {
    ko: "※ 지역·계절별 단가가 다르니 고지서 단가를 입력하면 정확합니다",
    en: "※ Rates vary by region/season; enter your bill's unit price for accuracy",
  },

  "life.moving.distance": { ko: "이사 거리 (km)", en: "Distance (km)" },
  "life.moving.pyeong": { ko: "평수", en: "Area (pyeong)" },
  "life.moving.type": { ko: "이사 종류", en: "Moving type" },
  "life.moving.general": { ko: "일반이사 (포장X)", en: "Basic (no packing)" },
  "life.moving.semi": { ko: "반포장이사", en: "Semi-pack" },
  "life.moving.full": { ko: "포장이사", en: "Full pack" },
  "life.moving.result": { ko: "예상 이사 비용", en: "Estimated moving cost" },
  "life.moving.note": {
    ko: "※ 시즌·층수·짐량에 따라 실제 견적과 차이가 있을 수 있습니다",
    en: "※ Actual quotes vary by season, floor, and load",
  },

  "life.dday.target": { ko: "목표 날짜", en: "Target date" },
  "life.dday.left": { ko: "일 남음", en: "days left" },
  "life.dday.past": { ko: "일 지남", en: "days past" },
  "life.dday.note": { ko: "오늘 기준", en: "From today to" },

  // Unit converter
  "uc.cat.length": { ko: "길이", en: "Length" },
  "uc.cat.weight": { ko: "무게", en: "Weight" },
  "uc.cat.temperature": { ko: "온도", en: "Temperature" },
  "uc.cat.volume": { ko: "부피", en: "Volume" },
  "uc.cat.area": { ko: "넓이", en: "Area" },
  "uc.cat.speed": { ko: "속도", en: "Speed" },
  "uc.fromLabel": { ko: "변환할 값", en: "From" },
  "uc.toLabel": { ko: "결과", en: "Result" },
  "uc.swap": { ko: "단위 교환", en: "Swap units" },
  "uc.presets": { ko: "빠른 프리셋", en: "Quick presets" },

  // Footer
  "footer.foreignNotice": {
    ko: "한국에 거주하는 외국인을 위한 사이트입니다.",
    en: "A site for foreigners living in Korea.",
  },
} as const;

export type TranslationKey = keyof typeof dict;

export const translations: Record<Lang, Record<TranslationKey, string>> = {
  ko: Object.fromEntries(
    Object.entries(dict).map(([k, v]) => [k, v.ko])
  ) as Record<TranslationKey, string>,
  en: Object.fromEntries(
    Object.entries(dict).map(([k, v]) => [k, v.en])
  ) as Record<TranslationKey, string>,
};
