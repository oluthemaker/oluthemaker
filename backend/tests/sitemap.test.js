import test from "node:test";
import assert from "node:assert/strict";
import { buildSitemapEntries, renderSitemapXml } from "../utils/sitemap.js";

test("sitemap includes only supplied public catalogue and published editorial records", () => {
  const entries = buildSitemapEntries({
    products: [
      { slug: "handmade-shoe", category: "Shoe", updatedAt: "2026-11-01T00:00:00.000Z" },
      { slug: "issue-01", category: "Magazine" },
    ],
    blogs: [{ slug: "atelier-notes", publishedAt: "2026-10-20T00:00:00.000Z" }],
  });
  assert.ok(entries.some((entry) => entry.loc.endsWith("/product/handmade-shoe")));
  assert.ok(entries.some((entry) => entry.loc.endsWith("/magazine/issue-01")));
  assert.ok(entries.some((entry) => entry.loc.endsWith("/journal/atelier-notes")));
  assert.ok(entries.some((entry) => entry.loc === "https://oluthemaker.com/"));
});

test("sitemap removes duplicate URLs and escapes XML values", () => {
  const entries = buildSitemapEntries({
    products: [{ slug: "same" }, { slug: "same" }],
    blogs: [{ slug: "a&b" }],
  });
  assert.equal(entries.filter((entry) => entry.loc.endsWith("/product/same")).length, 1);
  const xml = renderSitemapXml([{ loc: "https://oluthemaker.com/a&b", priority: "0.5" }]);
  assert.match(xml, /a&amp;b/);
  assert.match(xml, /<urlset/);
});
