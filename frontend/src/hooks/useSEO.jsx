import { useEffect } from "react";

const SITE_NAME = "Olú The Maker";
const SITE_URL = "https://oluthemaker.com";
const DEFAULT_IMAGE = "https://res.cloudinary.com/ds78nckog/image/upload/v1785146735/IMG_0688_ny0nlp.png";
const PRIVATE_PATHS = [
  /^\/admin(?:\/|$)/,
  /^\/auth(?:\/|$)/,
  /^\/profile(?:\/|$)/,
  /^\/checkout(?:\/|$)/,
  /^\/payment(?:\/|$)/,
  /^\/order(?:\/|$)/,
  /^\/order-lookup(?:\/|$)/,
  /^\/wishlist(?:\/|$)/,
  /^\/cart(?:\/|$)/,
  /^\/reset-password(?:\/|$)/,
  /^\/forgot-password(?:\/|$)/,
  /^\/journal\/(?:write|drafts|edit)(?:\/|$)/,
];

export const isPrivateSEOPath = (pathname = window.location.pathname) =>
  PRIVATE_PATHS.some((pattern) => pattern.test(pathname));

const useSEO = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
  structuredData = null,
}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : SITE_NAME;

    const pathname = window.location.pathname;
    const pageUrl = canonical || `${SITE_URL}${pathname}`;
    const effectiveNoIndex = noIndex || isPrivateSEOPath(pathname);

    const image = ogImage || DEFAULT_IMAGE;
    const metaDescription = String(description || "Discover considered footwear, leather goods, menswear and editorial stories from Olú The Maker.")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    document.title = fullTitle;

    // --------------------------------
    // Meta helper
    // --------------------------------

    const setMetaTag = (attr, value, content) => {
      if (!content) return;

      let element = document.querySelector(
        `meta[${attr}="${value}"]`
      );

      if (!element) {
        element = document.createElement("meta");

        element.setAttribute(attr, value);

        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    // --------------------------------
    // Link helper
    // --------------------------------

    const setLinkTag = (rel, href) => {
      let element = document.querySelector(
        `link[rel="${rel}"]`
      );

      if (!element) {
        element = document.createElement("link");

        element.setAttribute("rel", rel);

        document.head.appendChild(element);
      }

      element.setAttribute("href", href);
    };

    // --------------------------------
    // Canonical
    // --------------------------------

    setLinkTag("canonical", pageUrl);

    // --------------------------------
    // Robots
    // --------------------------------

    setMetaTag(
      "name",
      "robots",
      effectiveNoIndex
        ? "noindex, nofollow"
        : "index, follow"
    );

    // --------------------------------
    // Standard SEO
    // --------------------------------

    setMetaTag(
      "name",
      "description",
      metaDescription
    );

    // --------------------------------
    // Open Graph
    // --------------------------------

    setMetaTag(
      "property",
      "og:title",
      fullTitle
    );

    setMetaTag(
      "property",
      "og:description",
      metaDescription
    );

    setMetaTag(
      "property",
      "og:url",
      pageUrl
    );

    setMetaTag(
      "property",
      "og:type",
      ogType
    );

    setMetaTag(
      "property",
      "og:site_name",
      SITE_NAME
    );

    setMetaTag(
      "property",
      "og:image",
      image
    );

    setMetaTag(
      "property",
      "og:image:width",
      "1200"
    );

    setMetaTag(
      "property",
      "og:image:height",
      "630"
    );

    // --------------------------------
    // Twitter
    // --------------------------------

    setMetaTag(
      "name",
      "twitter:card",
      "summary_large_image"
    );

    setMetaTag(
      "name",
      "twitter:title",
      fullTitle
    );

    setMetaTag(
      "name",
      "twitter:description",
      metaDescription
    );

    setMetaTag(
      "name",
      "twitter:image",
      image
    );

    // --------------------------------
    // Structured Data
    // --------------------------------

    const existingSchema =
      document.getElementById(
        "seo-structured-data"
      );

    if (existingSchema) {
      existingSchema.remove();
    }

    if (structuredData) {
      const script =
        document.createElement("script");

      script.id =
        "seo-structured-data";

      script.type =
        "application/ld+json";

      script.textContent =
        JSON.stringify(structuredData);

      document.head.appendChild(script);
    }

    // --------------------------------
    // Cleanup
    // --------------------------------

    return () => {
      const schema =
        document.getElementById(
          "seo-structured-data"
        );

      if (schema) {
        schema.remove();
      }
    };
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    noIndex,
    structuredData,
  ]);
};

export default useSEO;
