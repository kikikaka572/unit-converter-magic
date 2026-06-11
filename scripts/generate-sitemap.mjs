import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SITE = "https://unit-converter-magic.vercel.app";

// Static tool paths (mirrors src/lib/tools.ts — update both together)
const TOOL_PATHS = [
  "/prompt-generator",
  "/video-prompt",
  "/tva",
  "/fr-salary",
  "/currency",
  "/size",
  "/salary",
  "/life",
  "/life/hourly-wage",
  "/life/fuel",
  "/life/parcel",
  "/life/interior",
  "/life/calorie",
  "/life/electricity",
  "/life/water",
  "/life/gas",
  "/life/moving",
  "/life/dday",
  "/converter",
  "/ruler",
  "/spin",
];

const STATIC_PAGES = [
  { path: "/",          priority: "1.0", changefreq: "daily"  },
  { path: "/hotdeals",  priority: "0.7", changefreq: "daily"  },
  { path: "/community", priority: "0.6", changefreq: "weekly" },
];

const TOOL_PAGES = TOOL_PATHS.map((p) => ({
  path: p,
  priority: "0.9",
  changefreq: "monthly",
}));

const ALL = [...STATIC_PAGES, ...TOOL_PAGES];
const today = new Date().toISOString().split("T")[0];

const urls = ALL.map(
  ({ path, priority, changefreq }) => `
  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

writeFileSync(join(ROOT, "public", "sitemap.xml"), xml, "utf8");
console.log(`✓ sitemap.xml generated (${ALL.length} URLs)`);
