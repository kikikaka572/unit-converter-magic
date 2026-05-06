// Static JSON loader — no backend.
// Data is generated daily by .github/workflows/fetch-hotdeals.yml
// and committed to public/hotdeals.json.

export interface Hotdeal {
  id: string;
  external_id: string;
  source: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  description: string | null;
  price: string | null;
  category: string | null;
  posted_at: string;
  fetched_at: string;
}

export interface HotdealsFile {
  generated_at: string;
  count: number;
  deals: Hotdeal[];
}

let _cache: HotdealsFile | null = null;

export async function loadHotdeals(): Promise<HotdealsFile> {
  if (_cache) return _cache;
  const base = import.meta.env.BASE_URL || "/";
  const url = `${base.replace(/\/$/, "")}/hotdeals.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load hotdeals.json (${res.status})`);
  const data = (await res.json()) as HotdealsFile;
  _cache = data;
  return data;
}

export async function getHotdealById(id: string): Promise<Hotdeal | null> {
  const { deals } = await loadHotdeals();
  return deals.find((d) => d.id === id) ?? null;
}

export function clearHotdealsCache() {
  _cache = null;
}
