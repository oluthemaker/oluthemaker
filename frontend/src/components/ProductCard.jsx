import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import useWishlistStore from "../store/useWishlistStore";
import { atelierToast } from "../utils/Toaster";
import { optimizedImageUrl } from "../utils/optimizedImage";

const ProductCard = ({ product, index = 0 }) => {
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product?._id || product?.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  if (!product) return null;

  const hasVariantStock = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.some((variant) => variant.isActive !== false && Number(variant.stock || 0) > 0)
    : false;
  const isDigitalMagazine = product.category === "Magazine" && product.magazineDetails?.isDigital;
  const isSoldOut = product.status === "Sold Out" || (product.status !== "Pre-Order" && !isDigitalMagazine && (Array.isArray(product.variants) && product.variants.length > 0
    ? !hasVariantStock
    : Number(product.stock || 0) <= 0));
  const isUnavailable = product.publicationStatus === "Draft" || product.publicationStatus === "Archived" || product.status === "Archived";
  const mainImage = product.images?.[0] || product.magazineDetails?.coverImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop";

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const added = toggleWishlist(product);
      atelierToast(added ? "Added to your wishlist." : "Removed from your wishlist.");
    } catch (error) {
      atelierToast(error.message || "Unable to update your wishlist.", "error");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative"
    >
      <Link
        to={`/${product.category === "Magazine" ? "magazine" : "product"}/${product.slug}`}
        className="group relative flex flex-col justify-between h-[420px] md:h-[480px] p-8 border border-atelier-ink/10 bg-atelier-ink/5 overflow-hidden block"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={optimizedImageUrl(mainImage, 720)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out ${isSoldOut || isUnavailable ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atelier-paper via-atelier-paper/50 to-transparent group-hover:opacity-90 transition-opacity duration-300" />
        </div>

        <div className="relative z-10 flex justify-between items-center pr-12">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold font-mono bg-atelier-paper/80 backdrop-blur-sm px-3 py-1 border border-atelier-ink/10">
            {product.subCategory || product.category || "Atelier"}
          </span>
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[9px] tracking-[0.4em] uppercase font-bold opacity-50 block">
              {isUnavailable ? "Unavailable" : isSoldOut ? "Sold Out" : product.status || "Available"}
            </span>
            <span className="font-serif text-sm font-semibold">₦{Number(product.price || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-serif italic group-hover:translate-x-1 transition-transform duration-300 leading-tight">
            {product.name}
          </h3>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleWishlist}
        aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={isWishlisted}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center border border-atelier-ink/15 bg-atelier-paper/90 backdrop-blur-sm hover:bg-atelier-ink hover:text-white transition-colors"
      >
        <Heart size={17} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
      </button>
    </motion.article>
  );
};

export default ProductCard;
