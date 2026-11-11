import Product from "../models/productModel.js";
import Blog from "../models/blogModel.js";
import { buildSitemapEntries, renderSitemapXml } from "../utils/sitemap.js";

const publicProductFilter = {
  $and: [
    { $or: [{ publicationStatus: "Published" }, { publicationStatus: { $exists: false } }] },
    { status: { $ne: "Archived" } },
  ],
};

export const getSitemap = async (req, res) => {
  try {
    const [products, blogs] = await Promise.all([
      Product.find(publicProductFilter).select("slug category updatedAt createdAt").lean(),
      Blog.find({ status: "published" }).select("slug updatedAt publishedAt").lean(),
    ]);
    const entries = buildSitemapEntries({
      products,
      blogs,
      siteUrl: process.env.SITE_URL || "https://oluthemaker.com",
    });
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(renderSitemapXml(entries));
  } catch (error) {
    console.error("Sitemap generation failed:", error.message);
    return res.status(500).type("text/plain").send("Unable to generate sitemap.");
  }
};
