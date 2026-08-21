import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AuctionCard = ({ product, index = 0 }) => {
  if (!product) return null;

  const mainImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop";

  const endTime = product.auctionDetails?.endTime
    ? new Date(product.auctionDetails.endTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  const startingPrice = product.auctionDetails?.startingBid || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group relative flex flex-col justify-between aspect-[16/10] md:aspect-[16/9] w-full p-6 md:p-8 border border-atelier-ink/10 bg-atelier-ink/5 overflow-hidden block"
      >
        {/* Background Image & Vignette Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atelier-paper via-atelier-paper/60 to-transparent group-hover:opacity-90 transition-opacity duration-300" />
        </div>

        {/* Top Bar: Category Badge & Direct Link Arrow */}
        <div className="relative z-10 flex justify-between items-center">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold font-mono bg-atelier-paper/80 backdrop-blur-sm px-3 py-1 border border-atelier-ink/10">
            {product.subCategory || product.category || "Reserve Listing"}
          </span>

          <div className="w-8 h-8 rounded-full border border-atelier-ink/20 flex items-center justify-center group-hover:bg-atelier-ink group-hover:text-white transition-all">
            <span className="text-xs">↗</span>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-end gap-4">
            <div>
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold opacity-50 block mb-1">
                Starting Bid
              </span>
              <h3 className="text-2xl md:text-3xl font-serif italic group-hover:translate-x-1 transition-transform duration-300 leading-tight">
                {product.name}
              </h3>
            </div>

            <span className="font-serif text-base md:text-lg font-semibold shrink-0">
              ₦{startingPrice?.toLocaleString()}
            </span>
          </div>

          {/* Bottom Right: Auction End Date */}
          <div className="flex justify-between items-center pt-2 border-t border-atelier-ink/10">
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono font-bold opacity-40">
              Reserve Event
            </span>
            <div className="text-[9px] tracking-[0.15em] uppercase font-mono font-bold text-right bg-atelier-paper/80 backdrop-blur-sm px-2.5 py-1 border border-atelier-ink/10">
              Ends: <span className="text-atelier-ink">{endTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AuctionCard;
