import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductCard = ({ product, index = 0 }) => {
  if (!product) return null;

  const isSoldOut = product.stock <= 0;
  const mainImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group relative flex flex-col justify-between h-[420px] md:h-[480px] p-8 border border-atelier-ink/10 bg-atelier-ink/5 overflow-hidden block"
      >
        {/* Background Image & Vignette Filter */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className={`w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out ${
              isSoldOut ? "grayscale" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atelier-paper via-atelier-paper/50 to-transparent group-hover:opacity-90 transition-opacity duration-300" />
        </div>

        {/* Top Badge Details */}
        <div className="relative z-10 flex justify-between items-center">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold font-mono bg-atelier-paper/80 backdrop-blur-sm px-3 py-1 border border-atelier-ink/10">
            {product.subCategory || product.category || "Atelier"}
          </span>

          {/* <div className="w-8 h-8 rounded-full border border-atelier-ink/20 flex items-center justify-center group-hover:bg-atelier-ink group-hover:text-white transition-all">
            <span className="text-xs">↗</span>
          </div>*/}
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-10 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[9px] tracking-[0.4em] uppercase font-bold opacity-50 block">
              {isSoldOut ? "Sold Out" : product.status || "Available"}
            </span>
            <span className="font-serif text-sm font-semibold">
              ₦{product.price?.toLocaleString()}
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-serif italic group-hover:translate-x-1 transition-transform duration-300 leading-tight">
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
