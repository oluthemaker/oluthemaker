import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || "https://oluthemaker.com").replace(/\/$/, "");
const apiBase = String(process.env.VITE_APP_URL || "").replace(/\/$/, "");
const fallbackPaths = [
  "/", "/store", "/shop/products", "/footwear", "/leather-goods", "/merchandise",
  "/auction", "/commission", "/magazine", "/journal", "/about", "/faq",
  "/contact", "/shipping", "/terms", "/privacy", "/cookies", "/glossary",
];
const escapeXml = (value) => String(value).replace(/[<>&"']/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;",
}[character]));
let sitemap;
if (apiBase) {
  try {
    const response = await fetch(`${apiBase}/api/seo/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
    const xml = await response.text();
    if (!xml.includes("<urlset") || !xml.includes("</urlset>")) throw new Error("Backend sitemap response was invalid");
    sitemap = xml;
    console.log("Generated sitemap with live published product and journal URLs.");
  } catch (error) {
    console.warn(`Could not fetch the live sitemap (${error.message}); using the static public-page fallback.`);
  }
}
if (!sitemap) {
  const urls = fallbackPaths.map((path) => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`).join("\n");
  sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}
const publicDir = resolve(process.cwd(), "public");
await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, "sitemap.xml"), sitemap, "utf8");
