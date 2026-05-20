import React from "react";
import { Link } from "react-router-dom";

export const BlogImage = ({
  src,
  alt,
  layout = "default",
  caption,
  leftCaption,
  pairWith,
  externalLink,
}) => {
  // Enhanced Cloudinary optimization
  const optimizeUrl = (url, width = 1200) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  };

  const ImageWrapper = ({ link, children }) => {
    if (!link) return <>{children}</>;

    // Check if it's an internal link (starts with /)
    const isInternal = link.startsWith("/");

    if (isInternal) {
      return (
        <a href={link} className="cursor-pointer block group/link relative">
          {children}
          {/* Subtle overlay for feedback */}
          <div className="absolute inset-0 bg-white/0 group-hover/link:bg-atelier-ink/5 transition-colors duration-500" />
        </a>
      );
    }

    // Fallback for external links
    const formattedExternal = link.startsWith("http")
      ? link
      : `https://${link}`;

    return (
      <a
        href={formattedExternal}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer block group/link relative"
      >
        {children}
        <div className="absolute inset-0 bg-white/0 group-hover/link:bg-atelier-ink/5 transition-colors duration-500" />
      </a>
    );
  };

  const Caption = ({ text, className = "" }) => (
    <figcaption
      className={`mt-4 text-[10px] tracking-[0.2em] uppercase font-sans text-atelier-ink/50 text-center px-6 ${className}`}
    >
      {text}
    </figcaption>
  );

  // --- Side by Side Logic ---
  if (layout === "sideBySide" && pairWith) {
    return (
      <figure
        className="my-16 flex flex-col md:flex-row w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
                          gap-2 md:gap-4 lg:gap-8 bg-white"
      >
        {/* Left Image Container */}
        <div className="flex-1 group w-full">
          <ImageWrapper link={externalLink}>
            <div className="overflow-hidden bg-atelier-ink/5 aspect-[4/5] md:aspect-[3/4]">
              <img
                src={optimizeUrl(src, 1200)}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/link:scale-105"
              />
            </div>
          </ImageWrapper>
          {leftCaption && <Caption text={leftCaption} className="py-4" />}
        </div>

        {/* Right Image Container */}
        <div className="flex-1 group w-full">
          <ImageWrapper link={pairWith.externalLink}>
            <div className="w-full h-full object-cover transition-transform duration-1000 group-hover/link:scale-105">
              <img
                src={optimizeUrl(pairWith.src, 1200)}
                className="w-full h-full object-cover"
              />
            </div>
          </ImageWrapper>
          {pairWith.caption && (
            <Caption text={pairWith.caption} className="py-4" />
          )}
        </div>
      </figure>
    );
  }

  // --- Single Image Logic ---
  const layoutClasses = {
    default: "max-w-3xl mx-auto my-16 px-6",
    wide: "max-w-6xl mx-auto my-20 px-6 lg:px-12",
    // This trick forces the element to be 100vw regardless of parent constraints
    fullBleed:
      "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen my-24",
  };

  // FIX: Define imgWidth based on the layout
  const imgWidth =
    layout === "fullBleed" ? 2000 : layout === "wide" ? 1400 : 1000;

  return (
    <figure
      className={`${layoutClasses[layout]} group flex flex-col items-center`}
    >
      <div className="overflow-hidden bg-atelier-ink/5 w-full">
        <ImageWrapper link={externalLink}>
          <img
            src={optimizeUrl(src, imgWidth)}
            alt={alt}
            className={`w-full h-auto transition-all duration-1000 ${
              layout === "fullBleed"
                ? "block" // No aspect ratio or object-cover here
                : ""
            }`}
          />
        </ImageWrapper>
      </div>
      {caption && (
        <Caption
          text={caption}
          className={layout === "fullBleed" ? "max-w-3xl" : ""}
        />
      )}
    </figure>
  );
};
