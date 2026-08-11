import React, { useRef } from "react";
import { Link } from "react-router-dom";

const MagazineCarousel = ({ magazines = [] }) => {
  const scrollRef = useRef(null);

  if (!magazines || magazines.length === 0) return null;

  // Take the 4 most recent magazines
  const recentMagazines = magazines.slice(0, 4);

  // Manual scroll helper for arrows
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-28 bg-atelier-paper border-b border-atelier-ink/10">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold opacity-40 block mb-2">
            Print & Digital Archive
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic leading-[1.1]">
            <a href="/magazine">The Magazines</a>
          </h2>
        </div>

        {/* Header Right: Controls & Description */}
        <div className="flex items-center gap-8">
          <p className="text-xs font-serif italic text-atelier-ink/60 max-w-xs hidden sm:block">
            Swipe or drag to explore curations and historical studies captured in our latest editions.
          </p>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Magazine"
              className="w-10 h-10 rounded-full border border-atelier-ink/20 flex items-center justify-center hover:bg-atelier-ink hover:text-white transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next Magazine"
              className="w-10 h-10 rounded-full border border-atelier-ink/20 flex items-center justify-center hover:bg-atelier-ink hover:text-white transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Track */}
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recentMagazines.map((item, index) => {
            const coverImage = item?.images?.[0] || item?.magazineDetails?.articles?.[0]?.headerImage;
            const issueTitle = item?.name || "Issue";
            const issueSlug = item?.slug;

            return (
              <div
                key={item?._id || index}
                /*
                   Mobile: 1 per view (100% width)
                   Medium (md): 2 per view (50% minus gap share)
                   Large (lg): 4 per view (25% minus gap share)
                */
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] flex-shrink-0 snap-start"
              >
                <Link
                  to={`/magazine/${issueSlug}`}
                  className="group/card block space-y-4"
                >
                  {/* Magazine Cover */}
                  <div className="border-[10px] border-atelier-ink/10 bg-atelier-ink/5">
                    <div className="relative aspect-[3/4] overflow-hidden border border-atelier-ink/10 bg-atelier-ink/5 shadow-sm">
                      <img
                        src={coverImage}
                        alt={issueTitle}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-atelier-ink/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-3 right-3 bg-atelier-paper/90 backdrop-blur-sm px-3 py-1 text-[8px] uppercase tracking-[0.3em] font-bold border border-atelier-ink/10">
                        Read Issue
                      </div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] tracking-[0.2em] uppercase font-sans font-bold opacity-50">
                      <span>Vol. {item?.magazineDetails?.issueNumber || "01"}</span>
                      <span>
                        {item?.magazineDetails?.month} {item?.magazineDetails?.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif italic group-hover/card:text-atelier-tan transition-colors line-clamp-1">
                      {issueTitle}
                    </h3>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MagazineCarousel;
