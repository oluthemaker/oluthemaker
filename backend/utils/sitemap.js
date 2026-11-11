const DEFAULT_SITE_URL = "https://oluthemaker.com";

const escapeXml = (value) => String(value).replace(/[<>&"']/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;",
}[character]));

const toLastmod = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
};

export const buildSitemapEntries = ({ products = [], blogs = [], siteUrl = DEFAULT_SITE_URL } = {}) => {
  const base = String(siteUrl || DEFAULT_SITE_URL).replace(/\/$/, "");
  const staticPaths = [
    "/", "/store", "/shop/products", "/footwear", "/leather-goods", "/merchandise",
    "/auction", "/commission", "/magazine", "/journal", "/about", "/faq",
    "/contact", "/shipping", "/terms", "/privacy", "/cookies", "/glossary",
  ];
  const entries = staticPaths.map((path) => ({ loc: `${base}${path}`, changefreq: path === "/" ? "weekly" : "monthly", priority: path === "/" ? "1.0" : "0.6" }));
  for (const product of products) {
    if (!product?.slug) continue;
    const isMagazine = product.category === "Magazine";
    entries.push({
      loc: `${base}/${isMagazine ? "magazine" : "product"}/${encodeURIComponent(product.slug)}`,
      lastmod: toLastmod(product.updatedAt || product.createdAt),
      changefreq: "weekly",
      priority: "0.7",
    });
  }
  for (const blog of blogs) {
    if (!blog?.slug) continue;
    entries.push({
      loc: `${base}/journal/${encodeURIComponent(blog.slug)}`,
      lastmod: toLastmod(blog.updatedAt || blog.publishedAt),
      changefreq: "monthly",
      priority: "0.6",
    });
  }
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
};

export const renderSitemapXml = (entries = []) => {
  const urls = entries.map((entry) => `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}${entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ""}${entry.priority ? `\n    <priority>${entry.priority}</priority>` : ""}\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
};
