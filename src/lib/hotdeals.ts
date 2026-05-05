import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key || url.includes("xxxx")) return null;
  _client = createClient(url, key);
  return _client;
}

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
