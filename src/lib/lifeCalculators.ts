export type LifeCalcKey =
  | 'salary'
  | 'fuel'
  | 'parcel'
  | 'interior'
  | 'serving'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'moving'
  | 'dday';

export interface LifeCalcMeta {
  key: LifeCalcKey;
  icon: string;
  labelKo: string;
  descKo: string;
}

export const lifeCalculators: LifeCalcMeta[] = [
  { key: 'salary', icon: '💰', labelKo: '월급 → 시급', descKo: '월급을 시급으로 환산' },
  { key: 'fuel', icon: '🚗', labelKo: '주행거리 → 연료비', descKo: '주행거리 기반 예상 연료비' },
  { key: 'parcel', icon: '📦', labelKo: '용량 → 택배 부피 무게', descKo: '가로·세로·높이로 부피무게(kg) 계산' },
  { key: 'interior', icon: '🏠', labelKo: '평수 → 인테리어 비용', descKo: '평수 기반 대략적인 인테리어 비용' },
  { key: 'serving', icon: '🍗', labelKo: '인분 → g 환산', descKo: '음식 종류별 인분당 그램 환산' },
];

// 월급 → 시급
export function calcHourlyWage(monthlySalary: number, weeklyHours: number): number {
  // 주당 시간 × 4.345주 = 월 근무시간
  const monthlyHours = weeklyHours * 4.345;
  if (monthlyHours <= 0) return 0;
  return monthlySalary / monthlyHours;
}

// 주행거리 → 예상 연료비
export function calcFuelCost(distanceKm: number, fuelEfficiency: number, fuelPrice: number): number {
  // 연비(km/L), 유가(원/L)
  if (fuelEfficiency <= 0) return 0;
  const liters = distanceKm / fuelEfficiency;
  return liters * fuelPrice;
}

// 택배 부피무게 (cm 기준, 부피무게 = (가로×세로×높이) / 6000 kg, 국제 표준)
export function calcParcelVolumetricWeight(w: number, h: number, d: number, divisor = 6000): number {
  return (w * h * d) / divisor;
}

// 평수 → 인테리어 비용 (평당 단가)
export function calcInteriorCost(pyeong: number, pricePerPyeong: number): number {
  return pyeong * pricePerPyeong;
}

// 인분 → g
export const servingPresets: Record<string, { labelKo: string; gramsPerServing: number }> = {
  rice: { labelKo: '밥', gramsPerServing: 210 },
  noodle: { labelKo: '면(생면)', gramsPerServing: 150 },
  pasta: { labelKo: '파스타(건면)', gramsPerServing: 100 },
  meat: { labelKo: '고기', gramsPerServing: 150 },
  chicken: { labelKo: '닭고기', gramsPerServing: 200 },
  fish: { labelKo: '생선', gramsPerServing: 120 },
  vegetable: { labelKo: '채소', gramsPerServing: 100 },
  soup: { labelKo: '국·찌개', gramsPerServing: 300 },
};

export function calcServingGrams(servings: number, foodKey: string): number {
  const preset = servingPresets[foodKey];
  if (!preset) return 0;
  return servings * preset.gramsPerServing;
}

export function formatKRW(n: number): string {
  if (!isFinite(n)) return '0';
  return Math.round(n).toLocaleString('ko-KR');
}

export function formatDecimal(n: number, digits = 2): string {
  if (!isFinite(n)) return '0';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: digits });
}
