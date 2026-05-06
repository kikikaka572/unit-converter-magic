// Daily RSS fetcher for Lifetool hotdeals.
// Runs in GitHub Actions, writes public/hotdeals.json (committed back to repo).
// No server, no DB required.

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";

const FEEDS = [
  { source: "ppomppu",    url: "https://www.ppomppu.co.kr/rss.php?id=ppomppu" },
  { source: "ruliweb",    url: "https://bbs.ruliweb.com/news/board/1020/rss" },
  { source: "quasarzone", url: "https://quasarzone.com/rss/qb_saleinfo" },
];

const OUT = "public/hotdeals.json";
const MAX_PER_FEED = 30;
const MAX_AGE_DAYS = 30;

function decodeEntities(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}
const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
};
const extractThumb = (html) => {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
};
const stripHtml = (html) => html.replace(/<[^>]+>/g, "").trim();
const hashId = (source, guid) =>
  createHash("sha1").update(`${source}::${guid}`).digest("hex").slice(0, 16);

function parseRss(xml) {
  const items = [];
  const re = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = pick(block, "title");
    const link = pick(block, "link");
    const guid = pick(block, "guid") || link;
    const descRaw = pick(block, "description");
    const pubDate = pick(block, "pubDate") || new Date().toISOString();
    items.push({
      title,
      link,
      guid,
      description: stripHtml(descRaw).slice(0, 500),
      pubDate,
      thumbnail: extractThumb(descRaw),
    });
  }
  return items;
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 LifetoolBot/1.0 (+github actions)" },
    });
    if (!res.ok) {
      console.error(`[${feed.source}] HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseRss(xml).slice(0, MAX_PER_FEED).map((it) => ({
      id: hashId(feed.source, it.guid),
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
  } catch (e) {
    console.error(`[${feed.source}] error`, e.message);
    return [];
  }
}

async function loadExisting() {
  try {
    const raw = await readFile(OUT, "utf8");
    return JSON.parse(raw).deals ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const fresh = (await Promise.all(FEEDS.map(fetchFeed))).flat();
  const existing = await loadExisting();

  // merge by id, prefer fresh
  const map = new Map();
  for (const d of existing) map.set(d.id, d);
  for (const d of fresh) map.set(d.id, d);

  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const merged = Array.from(map.values())
    .filter((d) => new Date(d.posted_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at))
    .slice(0, 300);

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify(
      { generated_at: new Date().toISOString(), count: merged.length, deals: merged },
      null,
      2
    )
  );
  console.log(`Saved ${merged.length} deals (fresh: ${fresh.length}) → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
