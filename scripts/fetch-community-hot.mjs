// Daily RSS fetcher for community hot posts (Clien, Today Humor, Reddit r/korea).
// Runs in GitHub Actions, writes public/community-hot.json (committed back to repo).

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";

const FEEDS = [
  { source: "clien",      url: "https://www.clien.net/service/board/park/rss",  type: "rss" },
  { source: "todayhumor", url: "http://www.todayhumor.co.kr/rss/rss.xml",       type: "rss" },
  { source: "reddit",     url: "https://www.reddit.com/r/korea/.rss",           type: "atom" },
];

const OUT = "public/community-hot.json";
const MAX_PER_FEED = 30;
const MAX_AGE_DAYS = 14;

function decodeEntities(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}
const pick = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? decodeEntities(m[1]).trim() : "";
};
const pickAttr = (xml, tag, attr) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`, "i"));
  return m ? m[1] : "";
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
    items.push({
      title: pick(block, "title"),
      link: pick(block, "link"),
      guid: pick(block, "guid") || pick(block, "link"),
      description: stripHtml(pick(block, "description")).slice(0, 500),
      thumbnail: extractThumb(pick(block, "description")),
      pubDate: pick(block, "pubDate") || pick(block, "dc:date") || new Date().toISOString(),
      author: pick(block, "author") || pick(block, "dc:creator") || "",
    });
  }
  return items;
}

function parseAtom(xml) {
  const items = [];
  const re = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const link = pickAttr(block, "link", "href") || pick(block, "id");
    const content = pick(block, "content") || pick(block, "summary");
    items.push({
      title: pick(block, "title"),
      link,
      guid: pick(block, "id") || link,
      description: stripHtml(content).slice(0, 500),
      thumbnail: extractThumb(content),
      pubDate: pick(block, "updated") || pick(block, "published") || new Date().toISOString(),
      author: pick(pick(block, "author"), "name") || "",
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
    const parsed = feed.type === "atom" ? parseAtom(xml) : parseRss(xml);
    return parsed.slice(0, MAX_PER_FEED).map((it) => ({
      id: hashId(feed.source, it.guid),
      external_id: it.guid,
      source: feed.source,
      title: it.title,
      url: it.link,
      thumbnail_url: it.thumbnail,
      description: it.description,
      author: it.author || null,
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
    return JSON.parse(raw).posts ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const fresh = (await Promise.all(FEEDS.map(fetchFeed))).flat();
  const existing = await loadExisting();

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
      { generated_at: new Date().toISOString(), count: merged.length, posts: merged },
      null,
      2
    )
  );
  console.log(`Saved ${merged.length} community posts (fresh: ${fresh.length}) → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
