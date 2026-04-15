export type Category = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed';

export interface UnitInfo {
  label: string;
  labelKo: string;
  symbol: string;
}

// All units relative to a base unit per category (except temperature)
const lengthUnits: Record<string, { info: UnitInfo; toBase: number }> = {
  mm: { info: { label: 'Millimeter', labelKo: '밀리미터', symbol: 'mm' }, toBase: 0.001 },
  cm: { info: { label: 'Centimeter', labelKo: '센티미터', symbol: 'cm' }, toBase: 0.01 },
  m: { info: { label: 'Meter', labelKo: '미터', symbol: 'm' }, toBase: 1 },
  km: { info: { label: 'Kilometer', labelKo: '킬로미터', symbol: 'km' }, toBase: 1000 },
  in: { info: { label: 'Inch', labelKo: '인치', symbol: 'in' }, toBase: 0.0254 },
  ft: { info: { label: 'Foot', labelKo: '피트', symbol: 'ft' }, toBase: 0.3048 },
  yd: { info: { label: 'Yard', labelKo: '야드', symbol: 'yd' }, toBase: 0.9144 },
  mi: { info: { label: 'Mile', labelKo: '마일', symbol: 'mi' }, toBase: 1609.344 },
};

const weightUnits: Record<string, { info: UnitInfo; toBase: number }> = {
  mg: { info: { label: 'Milligram', labelKo: '밀리그램', symbol: 'mg' }, toBase: 0.000001 },
  g: { info: { label: 'Gram', labelKo: '그램', symbol: 'g' }, toBase: 0.001 },
  kg: { info: { label: 'Kilogram', labelKo: '킬로그램', symbol: 'kg' }, toBase: 1 },
  t: { info: { label: 'Ton', labelKo: '톤', symbol: 't' }, toBase: 1000 },
  oz: { info: { label: 'Ounce', labelKo: '온스', symbol: 'oz' }, toBase: 0.0283495 },
  lb: { info: { label: 'Pound', labelKo: '파운드', symbol: 'lb' }, toBase: 0.453592 },
};

const volumeUnits: Record<string, { info: UnitInfo; toBase: number }> = {
  ml: { info: { label: 'Milliliter', labelKo: '밀리리터', symbol: 'mL' }, toBase: 0.001 },
  l: { info: { label: 'Liter', labelKo: '리터', symbol: 'L' }, toBase: 1 },
  gal: { info: { label: 'Gallon', labelKo: '갤런', symbol: 'gal' }, toBase: 3.78541 },
  qt: { info: { label: 'Quart', labelKo: '쿼트', symbol: 'qt' }, toBase: 0.946353 },
  cup: { info: { label: 'Cup', labelKo: '컵', symbol: 'cup' }, toBase: 0.236588 },
};

const areaUnits: Record<string, { info: UnitInfo; toBase: number }> = {
  sqm: { info: { label: 'Square Meter', labelKo: '제곱미터', symbol: 'm²' }, toBase: 1 },
  sqkm: { info: { label: 'Square Kilometer', labelKo: '제곱킬로미터', symbol: 'km²' }, toBase: 1e6 },
  sqft: { info: { label: 'Square Foot', labelKo: '제곱피트', symbol: 'ft²' }, toBase: 0.092903 },
  acre: { info: { label: 'Acre', labelKo: '에이커', symbol: 'ac' }, toBase: 4046.86 },
  ha: { info: { label: 'Hectare', labelKo: '헥타르', symbol: 'ha' }, toBase: 10000 },
  pyeong: { info: { label: 'Pyeong', labelKo: '평', symbol: '평' }, toBase: 3.30579 },
};

const speedUnits: Record<string, { info: UnitInfo; toBase: number }> = {
  ms: { info: { label: 'm/s', labelKo: '미터/초', symbol: 'm/s' }, toBase: 1 },
  kmh: { info: { label: 'km/h', labelKo: '킬로미터/시', symbol: 'km/h' }, toBase: 0.277778 },
  mph: { info: { label: 'mph', labelKo: '마일/시', symbol: 'mph' }, toBase: 0.44704 },
  knot: { info: { label: 'Knot', labelKo: '노트', symbol: 'kn' }, toBase: 0.514444 },
};

export const categories: Record<Category, { labelKo: string; icon: string }> = {
  length: { labelKo: '길이', icon: '📏' },
  weight: { labelKo: '무게', icon: '⚖️' },
  temperature: { labelKo: '온도', icon: '🌡️' },
  volume: { labelKo: '부피', icon: '🧪' },
  area: { labelKo: '넓이', icon: '📐' },
  speed: { labelKo: '속도', icon: '💨' },
};

const unitMaps: Record<string, Record<string, { info: UnitInfo; toBase: number }>> = {
  length: lengthUnits,
  weight: weightUnits,
  volume: volumeUnits,
  area: areaUnits,
  speed: speedUnits,
};

export function getUnitsForCategory(category: Category): { key: string; info: UnitInfo }[] {
  if (category === 'temperature') {
    return [
      { key: 'c', info: { label: 'Celsius', labelKo: '섭씨', symbol: '°C' } },
      { key: 'f', info: { label: 'Fahrenheit', labelKo: '화씨', symbol: '°F' } },
      { key: 'k', info: { label: 'Kelvin', labelKo: '켈빈', symbol: 'K' } },
    ];
  }
  const map = unitMaps[category];
  return Object.entries(map).map(([key, val]) => ({ key, info: val.info }));
}

export function getDefaultUnits(category: Category): [string, string] {
  switch (category) {
    case 'length': return ['m', 'ft'];
    case 'weight': return ['kg', 'lb'];
    case 'temperature': return ['c', 'f'];
    case 'volume': return ['l', 'gal'];
    case 'area': return ['sqm', 'pyeong'];
    case 'speed': return ['kmh', 'mph'];
  }
}

export function convert(category: Category, fromUnit: string, toUnit: string, value: number): number {
  if (category === 'temperature') {
    return convertTemperature(fromUnit, toUnit, value);
  }
  const map = unitMaps[category];
  const fromBase = map[fromUnit].toBase;
  const toBase = map[toUnit].toBase;
  return (value * fromBase) / toBase;
}

function convertTemperature(from: string, to: string, val: number): number {
  // Convert to Celsius first
  let celsius: number;
  if (from === 'c') celsius = val;
  else if (from === 'f') celsius = (val - 32) * 5 / 9;
  else celsius = val - 273.15; // kelvin

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * 9 / 5 + 32;
  return celsius + 273.15; // kelvin
}

export function getConversionFormula(category: Category, fromUnit: string, toUnit: string): string {
  const fromInfo = getUnitsForCategory(category).find(u => u.key === fromUnit)!;
  const toInfo = getUnitsForCategory(category).find(u => u.key === toUnit)!;
  const factor = convert(category, fromUnit, toUnit, 1);
  return `1 ${fromInfo.info.symbol} = ${formatNumber(factor)} ${toInfo.info.symbol}`;
}

export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  if (Math.abs(n) >= 1) return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return n.toPrecision(6).replace(/0+$/, '').replace(/\.$/, '');
}
