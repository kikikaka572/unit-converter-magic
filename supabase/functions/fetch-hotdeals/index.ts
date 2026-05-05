// Supabase Edge Function: fetch-hotdeals
// RSS 피드를 파싱해 public.hotdeals 테이블에 upsert 합니다.
//
// 배포:
//   supabase functions deploy fetch-hotdeals --no-verify-jwt
//
// 환경변수 (Supabase Dashboard > Edge Functions > Secrets):
//   SUPABASE_URL              (자동)
//   SUPABASE_SERVICE_ROLE_KEY (자동)
//
// 수동 실행:
//   curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/fetch-hotdeals \
//        -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Feed {
  source: string;
  url: string;
}

// 공개된 RSS 피드 — 사이트 변경 시 수정 필요
const FEEDS: Feed[] = [
  { source: "ppomppu", url: "https://www.ppomppu.co.kr/rss.php?id=ppomppu" },
  { source: "ruliweb", url: "https://bbs.ruliweb.com/news/board/1020/rss" },
  { source: "quasarzone", url: "https://quasarzone.com/rss/qb_saleinfo" },
];

interface ParsedItem {
  title: string;
  link: string;
  guid: string;
  description: string;
  pubDate: string;
  thumbnail: string | null;
}

function decodeEntities(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
}

function extractThumb(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function parseRss(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = pick(block, "title");
    const link = pick(block, "link");
    const guid = pick(block, "guid") || link;
    const descRaw = pick(block, "description");
    const pubDate = pick(block, "pubDate") || new Date().toISOString();
    const thumbnail = extractThumb(descRaw);
    items.push({
      title,
      link,
      guid,
      description: stripHtml(descRaw).slice(0, 500),
      pubDate,
      thumbnail,
    });
  }
  return items;
}

async function fetchFeed(feed: Feed): Promise<ParsedItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 LifetoolBot/1.0" },
    });
    if (!res.ok) {
      console.error(`Feed ${feed.source} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseRss(xml);
  } catch (e) {
    console.error(`Feed ${feed.source} error:`, e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  let totalInserted = 0;
  const perSource: Record<string, number> = {};

  for (const feed of FEEDS) {
    const items = await fetchFeed(feed);
    if (items.length === 0) continue;

    const rows = items.slice(0, 30).map((it) => ({
      external_id: it.guid,
      source: feed.source,
      title: it.title,
      url: it.link,
      thumbnail_url: it.thumbnail,
      description: it.description,
      price: null,
      category: null,
      posted_at: new Date(it.pubDate).toISOString(),
      fetched_at: new Date().toISOString(),
    }));

    const { error, count } = await supabase
      .from("hotdeals")
      .upsert(rows, { onConflict: "source,external_id", count: "exact", ignoreDuplicates: true });

    if (error) {
      console.error(`Upsert failed for ${feed.source}:`, error.message);
      perSource[feed.source] = -1;
    } else {
      perSource[feed.source] = count ?? rows.length;
      totalInserted += count ?? 0;
    }
  }

  // 30일 이상된 항목 정리
  await supabase
    .from("hotdeals")
    .delete()
    .lt("posted_at", new Date(Date.now() - 30 * 86400000).toISOString());

  return new Response(
    JSON.stringify({ ok: true, totalInserted, perSource }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
