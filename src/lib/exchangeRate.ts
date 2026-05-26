export type CurrencyCode = "EUR" | "USD" | "KRW";

export interface RateResult {
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
  isFallback: boolean;
}

// Fallback rates (updated periodically)
const FALLBACK: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08,
  KRW: 1480,
};

export async function fetchRates(): Promise<RateResult> {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/EUR",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    if (json.result !== "success") throw new Error("api error");

    const rates: Record<CurrencyCode, number> = {
      EUR: 1,
      USD: json.rates.USD,
      KRW: json.rates.KRW,
    };
    return {
      rates,
      updatedAt: new Date().toLocaleTimeString(),
      isFallback: false,
    };
  } catch {
    return {
      rates: { ...FALLBACK },
      updatedAt: "-",
      isFallback: true,
    };
  }
}

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  const inEur = amount / rates[from];
  return inEur * rates[to];
}
