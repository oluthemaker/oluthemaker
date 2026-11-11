import React from "react";

const CloudinaryImage = ({ src, alt, layout, caption }) => {
  if (!src) return null;

  // Cloudinary Transformation Logic
  // w_auto,c_scale: dynamic scaling
  // q_auto,f_auto: automatic quality and format (WebP/AVIF)
  const getTransformedUrl = (url, isFullBleed) => {
    if (!url.includes("cloudinary.com")) return url;
    const parts = url.split("/upload/");
    const width = isFullBleed ? "w_1920" : "w_1200";
    return `${parts[0]}/upload/f_auto,q_auto,${width},c_limit/${parts[1]}`;
  };

  const isFullBleed = layout === "fullBleed";

  return (
    <figure
      className={`my-16 ${isFullBleed ? "-mx-6 md:-mx-24 lg:-mx-48" : "max-w-3xl mx-auto"}`}
    >
      <div className="overflow-hidden bg-atelier-paper">
        <img
          src={getTransformedUrl(src, isFullBleed)}
          alt={alt || "Editorial imagery"}
          className={`w-full h-auto object-cover transition-opacity duration-700 ${isFullBleed ? "aspect-[21/9]" : "aspect-auto"}`}
          loading="lazy"
          decoding="async"
        />
      </div>

      {caption && (
        <figcaption
          className={`mt-4 px-6 md:px-0 ${isFullBleed ? "max-w-4xl mx-auto" : ""}`}
        >
          <span className="block text-[10px] tracking-[0.2em] uppercase text-atelier-ink/50 mb-1">
            Figure Detail
          </span>
          <p className="text-sm font-serif italic text-atelier-ink/80 border-l border-atelier-tan pl-4">
            {caption}
          </p>
        </figcaption>
      )}
    </figure>
  );
};

export default CloudinaryImage;
