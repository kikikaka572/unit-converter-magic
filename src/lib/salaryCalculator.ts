// 2026년 기준 4대보험 요율 및 실수령액 계산
// ※ 2025년 말 기준 발표/예고된 요율을 반영한 추정치입니다. 확정 시 업데이트가 필요할 수 있습니다.

export const INSURANCE_RATES_2026 = {
  // 국민연금: 근로자 4.5% (사업주 4.5% 별도). 기준소득월액 상한선 추정 6,500,000원
  nationalPension: { rate: 0.045, ceiling: 6_500_000, floor: 400_000 },
  // 건강보험: 근로자 3.545% (총 7.09% 중 절반). 2024~2026 동결 기조 반영
  healthInsurance: { rate: 0.03545 },
  // 장기요양: 건강보험료의 12.95%
  longTermCare: { rate: 0.1295 }, // health premium × 12.95%
  // 고용보험: 근로자 0.9%
  employmentInsurance: { rate: 0.009 },
} as const;

// 2026년 최저임금 (2025.7 결정, 시간당 10,320원 기준)
export const MIN_WAGE_2026 = {
  hourly: 10_320,
  monthly: 10_320 * 209, // 주 40시간 + 주휴 = 월 209시간
};

// 근로소득 간이세액표 근사 계산 (2024년 간이세액표 기반, 100% 적용 가정)
// 정확한 간이세액표 대신 누진 근사식을 사용 (실 고지액과 ±몇 천원 차이 가능)
export function estimateIncomeTax(monthlyTaxable: number, dependents: number = 1): number {
  // dependents: 본인 포함 부양가족 수 (최소 1)
  const deps = Math.max(1, dependents);
  // 연환산 과세표준 근사 (월 과세소득 × 12 - 근로소득공제 간이)
  const annual = monthlyTaxable * 12;
  // 근로소득공제 간이 (2024 기준)
  let earnedDeduction = 0;
  if (annual <= 5_000_000) earnedDeduction = annual * 0.7;
  else if (annual <= 15_000_000) earnedDeduction = 3_500_000 + (annual - 5_000_000) * 0.4;
  else if (annual <= 45_000_000) earnedDeduction = 7_500_000 + (annual - 15_000_000) * 0.15;
  else if (annual <= 100_000_000) earnedDeduction = 12_000_000 + (annual - 45_000_000) * 0.05;
  else earnedDeduction = 14_750_000 + (annual - 100_000_000) * 0.02;

  // 인적공제 (본인+부양가족 1명당 150만원)
  const personalDeduction = deps * 1_500_000;
  // 표준세액공제·국민연금 등 기타공제 간이 (대략 250만원)
  const otherDeduction = 2_500_000;

  const taxBase = Math.max(0, annual - earnedDeduction - personalDeduction - otherDeduction);

  // 종합소득세율 (2024 개정 기준)
  let annualTax = 0;
  if (taxBase <= 14_000_000) annualTax = taxBase * 0.06;
  else if (taxBase <= 50_000_000) annualTax = 840_000 + (taxBase - 14_000_000) * 0.15;
  else if (taxBase <= 88_000_000) annualTax = 6_240_000 + (taxBase - 50_000_000) * 0.24;
  else if (taxBase <= 150_000_000) annualTax = 15_360_000 + (taxBase - 88_000_000) * 0.35;
  else if (taxBase <= 300_000_000) annualTax = 37_060_000 + (taxBase - 150_000_000) * 0.38;
  else if (taxBase <= 500_000_000) annualTax = 94_060_000 + (taxBase - 300_000_000) * 0.40;
  else if (taxBase <= 1_000_000_000) annualTax = 174_060_000 + (taxBase - 500_000_000) * 0.42;
  else annualTax = 384_060_000 + (taxBase - 1_000_000_000) * 0.45;

  // 근로소득세액공제 (간이 약 50만원 한도 차감)
  annualTax = Math.max(0, annualTax - 500_000);

  return Math.floor(annualTax / 12);
}

export interface SalaryBreakdown {
  monthlyGross: number;        // 월 환산 세전
  nationalPension: number;     // 국민연금 (근로자)
  healthInsurance: number;     // 건강보험 (근로자)
  longTermCare: number;        // 장기요양 (근로자)
  employmentInsurance: number; // 고용보험 (근로자)
  incomeTax: number;           // 소득세
  localTax: number;            // 지방소득세 (소득세의 10%)
  totalDeduction: number;      // 총 공제액
  netMonthly: number;          // 월 실수령액
  netAnnual: number;           // 연 실수령액
}

/**
 * 연봉을 입력하면 4대보험·세금 공제 후 월 실수령액을 계산합니다.
 * @param annualGross 연봉 (세전, 비과세 제외)
 * @param dependents 부양가족 수 (본인 포함, 기본 1)
 * @param nonTaxable 월 비과세 (식대 등, 기본 200,000원 = 식대 비과세 한도)
 */
export function calcNetSalary(
  annualGross: number,
  dependents: number = 1,
  nonTaxable: number = 200_000,
): SalaryBreakdown {
  const monthlyGross = annualGross / 12;
  const monthlyTaxable = Math.max(0, monthlyGross - nonTaxable);

  // 국민연금 (상·하한 적용)
  const np = INSURANCE_RATES_2026.nationalPension;
  const npBase = Math.min(np.ceiling, Math.max(np.floor, monthlyTaxable));
  const nationalPension = Math.floor(npBase * np.rate);

  // 건강보험
  const healthInsurance = Math.floor(monthlyTaxable * INSURANCE_RATES_2026.healthInsurance.rate);
  // 장기요양 (건강보험료의 12.95%)
  const longTermCare = Math.floor(healthInsurance * INSURANCE_RATES_2026.longTermCare.rate);
  // 고용보험
  const employmentInsurance = Math.floor(monthlyTaxable * INSURANCE_RATES_2026.employmentInsurance.rate);

  // 소득세 / 지방세
  const incomeTax = estimateIncomeTax(monthlyTaxable, dependents);
  const localTax = Math.floor(incomeTax * 0.1);

  const totalDeduction =
    nationalPension + healthInsurance + longTermCare + employmentInsurance + incomeTax + localTax;
  const netMonthly = monthlyGross - totalDeduction;
  const netAnnual = netMonthly * 12;

  return {
    monthlyGross,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localTax,
    totalDeduction,
    netMonthly,
    netAnnual,
  };
}

// 100만원 단위 ~ 3억원까지 실수령액 표 생성
export function buildSalaryTable(
  startMan: number = 2_000, // 2,000만원부터
  endMan: number = 30_000,  // 3억(30,000만원)까지
  stepMan: number = 100,    // 100만원 단위
  dependents: number = 1,
): Array<{ annual: number; monthly: number; net: number; deduction: number }> {
  const rows: Array<{ annual: number; monthly: number; net: number; deduction: number }> = [];
  for (let man = startMan; man <= endMan; man += stepMan) {
    const annual = man * 10_000;
    const b = calcNetSalary(annual, dependents);
    rows.push({
      annual,
      monthly: b.monthlyGross,
      net: b.netMonthly,
      deduction: b.totalDeduction,
    });
  }
  return rows;
}
