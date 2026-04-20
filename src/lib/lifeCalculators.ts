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
  { key: 'salary', icon: '💰', labelKo: '시급계산', descKo: '월급을 시급으로 환산' },
  { key: 'fuel', icon: '🚗', labelKo: '차량연료비', descKo: '주행거리 기반 예상 연료비' },
  { key: 'parcel', icon: '📦', labelKo: '택배요금계산', descKo: '가로·세로·높이로 부피무게(kg) 계산' },
  { key: 'interior', icon: '🏠', labelKo: '인테리어비용', descKo: '평수 기반 대략적인 인테리어 비용' },
  { key: 'serving', icon: '🍗', labelKo: '칼로리계산', descKo: '음식 종류별 칼로리 계산' },
  { key: 'electricity', icon: '💡', labelKo: '전기요금계산', descKo: '월 kWh 사용량으로 전기요금 추정' },
  { key: 'water', icon: '🚿', labelKo: '수도요금계산', descKo: '월 m³ 사용량으로 수도요금 추정' },
  { key: 'gas', icon: '🔥', labelKo: '가스요금계산', descKo: '월 m³ 사용량으로 도시가스 요금 추정' },
  { key: 'moving', icon: '🚚', labelKo: '이사비용계산', descKo: '거리·평수·이사 종류별 예상 비용' },
  { key: 'dday', icon: '📅', labelKo: 'D-day계산', descKo: '두 날짜 사이의 남은/지난 일수 계산' },
];

// 시급계산
export function calcHourlyWage(monthlySalary: number, weeklyHours: number): number {
  // 주당 시간 × 4.345주 = 월 근무시간
  const monthlyHours = weeklyHours * 4.345;
  if (monthlyHours <= 0) return 0;
  return monthlySalary / monthlyHours;
}

// 치량연료비
export function calcFuelCost(distanceKm: number, fuelEfficiency: number, fuelPrice: number): number {
  // 연비(km/L), 유가(원/L)
  if (fuelEfficiency <= 0) return 0;
  const liters = distanceKm / fuelEfficiency;
  return liters * fuelPrice;
}

// 택배요금계산 (cm 기준, 부피무게 = (가로×세로×높이) / 6000 kg, 국제 표준)
export function calcParcelVolumetricWeight(w: number, h: number, d: number, divisor = 6000): number {
  return (w * h * d) / divisor;
}

// 인테리어비용 (평당 단가)
export function calcInteriorCost(pyeong: number, pricePerPyeong: number): number {
  return pyeong * pricePerPyeong;
}

// 몇인분계산
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
}// 몇인분계산
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

// 전기요금계산 (한전 주택용 저압 누진제 간이 계산, 부가세·기금 포함 대략치)
export function calcElectricityBill(kwh: number): { base: number; usage: number; total: number; tier: string } {
  if (kwh <= 0) return { base: 0, usage: 0, total: 0, tier: '-' };
  let base = 0;
  let usage = 0;
  let tier = '1단계 (0~200kWh)';
  if (kwh <= 200) {
    base = 910;
    usage = kwh * 120;
  } else if (kwh <= 400) {
    base = 1600;
    usage = 200 * 120 + (kwh - 200) * 214.6;
    tier = '2단계 (201~400kWh)';
  } else {
    base = 7300;
    usage = 200 * 120 + 200 * 214.6 + (kwh - 400) * 307.3;
    tier = '3단계 (400kWh 초과)';
  }
  const subtotal = base + usage;
  // 부가세 10% + 전력산업기반기금 3.7%
  const total = subtotal * 1.137;
  return { base, usage, total, tier };
}

// 수도요금계산 (서울시 가정용 누진 간이 계산, 원/m³, 상수도+하수도+물이용부담금)
export function calcWaterBill(cubicMeters: number): { water: number; sewer: number; fund: number; total: number } {
  if (cubicMeters <= 0) return { water: 0, sewer: 0, fund: 0, total: 0 };
  // 상수도 누진 (가정용)
  let water = 0;
  if (cubicMeters <= 30) water = cubicMeters * 580;
  else if (cubicMeters <= 50) water = 30 * 580 + (cubicMeters - 30) * 950;
  else water = 30 * 580 + 20 * 950 + (cubicMeters - 50) * 1270;
  // 하수도 누진
  let sewer = 0;
  if (cubicMeters <= 30) sewer = cubicMeters * 400;
  else if (cubicMeters <= 50) sewer = 30 * 400 + (cubicMeters - 30) * 930;
  else sewer = 30 * 400 + 20 * 930 + (cubicMeters - 50) * 1420;
  // 물이용부담금
  const fund = cubicMeters * 170;
  const total = water + sewer + fund;
  return { water, sewer, fund, total };
}

// 가스요금계산 (간이, 원/m³ 기준 단가 적용 + 기본요금)
export function calcGasBill(cubicMeters: number, unitPrice: number, baseFee: number): number {
  if (cubicMeters < 0) return 0;
  return baseFee + cubicMeters * unitPrice;
}

// 이사비용계산 (km당 단가 + 평수 단가 + 기본료)
export const movingTypes: Record<string, { labelKo: string; baseFee: number; perPyeong: number; perKm: number }> = {
  general: { labelKo: '일반이사 (포장X)', baseFee: 200000, perPyeong: 30000, perKm: 2000 },
  semi: { labelKo: '반포장이사', baseFee: 400000, perPyeong: 50000, perKm: 2500 },
  full: { labelKo: '포장이사', baseFee: 600000, perPyeong: 80000, perKm: 3000 },
};

export function calcMovingCost(distanceKm: number, pyeong: number, type: string): number {
  const m = movingTypes[type];
  if (!m) return 0;
  return m.baseFee + m.perPyeong * pyeong + m.perKm * distanceKm;
}

// D-day계산
export function calcDday(targetDate: string): { days: number; label: string } {
  if (!targetDate) return { days: 0, label: '-' };
  const target = new Date(targetDate);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  let label = '';
  if (days === 0) label = 'D-Day';
  else if (days > 0) label = `D-${days}`;
  else label = `D+${Math.abs(days)}`;
  return { days, label };
}
