import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import useProductStore from "../store/useProductStore";
import useCartStore from "../store/useCartStore";
import useWishlistStore from "../store/useWishlistStore";
import useSEO from "../hooks/useSEO";
import { atelierToast } from "../utils/Toaster";
import { optimizedImageUrl } from "../utils/optimizedImage";

const formatNGN = (amount) => `₦${Number(amount || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const ProductDetail = () => {
  const { slug } = useParams();
  const { products, fetchProducts, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantSku, setSelectedVariantSku] = useState("");
  const [selectedLegacySize, setSelectedLegacySize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, [fetchProducts, products.length]);

  const product = products.find((p) => p.slug === slug);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product?._id || product?.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const variants = useMemo(() => (product?.variants || []).filter((variant) => variant.isActive !== false), [product]);
  const selectedVariant = variants.find((variant) => variant.sku === selectedVariantSku);
  const legacySizes = product?.shoeDetails?.sizes || [];
  const requiresVariant = variants.length > 0;
  const requiresLegacySize = !requiresVariant && legacySizes.length > 0;
  const hasSellableStock = product
    ? (product.status === "Pre-Order" || (requiresVariant
        ? variants.some((variant) => Number(variant.stock || 0) > 0)
        : (product.category === "Magazine" && product.magazineDetails?.isDigital) || Number(product.stock || 0) > 0))
    : false;
  const isSoldOut = !product || product.status === "Sold Out" || product.status === "Archived" || product.publicationStatus === "Draft" || product.publicationStatus === "Archived" || !hasSellableStock;
  const currentPrice = Number(selectedVariant?.price ?? product?.price ?? 0);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariantSku("");
    setSelectedLegacySize("");
    setQuantity(1);
  }, [slug]);

  const productStructuredData = useMemo(() => {
    if (!product) return null;
    const activeVariantPrices = (product.variants || [])
      .filter((variant) => variant.isActive !== false)
      .map((variant) => Number(variant.price ?? product.price))
      .filter((price) => Number.isFinite(price) && price >= 0);
    const availability = product.status === "Pre-Order"
      ? "https://schema.org/PreOrder"
      : !isSoldOut
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";
    const offers = activeVariantPrices.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "NGN",
          lowPrice: Math.min(...activeVariantPrices),
          highPrice: Math.max(...activeVariantPrices),
          offerCount: activeVariantPrices.length,
          availability,
          url: `https://oluthemaker.com/${product.category === "Magazine" ? "magazine" : "product"}/${product.slug}`,
        }
      : {
          "@type": "Offer",
          priceCurrency: "NGN",
          price: activeVariantPrices.length === 1 ? activeVariantPrices[0] : Number(product.price || 0),
          availability,
          url: `https://oluthemaker.com/${product.category === "Magazine" ? "magazine" : "product"}/${product.slug}`,
        };
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: (product.images || []).filter(Boolean),
      sku: product.sku || undefined,
      category: product.subCategory || product.category,
      brand: { "@type": "Brand", name: "Olú The Maker" },
      offers: product.isAuction || product.category === "Auction" ? undefined : offers,
    };
  }, [product, isSoldOut]);

  useSEO({
    title: product ? product.name : "Product Details",
    description: product ? product.description : "Explore item details",
    canonical: product ? `https://oluthemaker.com/${product.category === "Magazine" ? "magazine" : "product"}/${product.slug}` : undefined,
    ogImage: product?.images?.[0] || product?.magazineDetails?.coverImage,
    ogType: "product",
    noIndex: !product && !loading,
    structuredData: productStructuredData,
  });

  if (loading && !product) return <div className="min-h-screen pt-40 text-center font-serif italic text-atelier-ink/60">Retrieving piece from archives...</div>;
  if (!product) return (
    <div className="min-h-screen pt-40 text-center space-y-4">
      <h2 className="font-serif italic text-2xl">Item Not Found</h2>
      <p className="text-xs opacity-60">The requested product does not exist in our catalog.</p>
      <Link to="/store" className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold underline">[ Return to Store ]</Link>
    </div>
  );

  const handleToggleWishlist = () => {
    try {
      const added = toggleWishlist(product);
      atelierToast(added ? "Added to your wishlist." : "Removed from your wishlist.");
    } catch (error) {
      atelierToast(error.message || "Unable to update your wishlist.", "error");
    }
  };

  const handleAddToCart = () => {
    if (requiresVariant && !selectedVariant) {
      atelierToast("Please select an available size or colour first.", "error");
      return;
    }
    if (requiresLegacySize && !selectedLegacySize) {
      atelierToast("Please select a size first.", "error");
      return;
    }
    const stock = selectedVariant ? Number(selectedVariant.stock || 0) : Number(product.stock || 0);
    if (product.status !== "Pre-Order" && stock < 1) {
      atelierToast("This item is currently out of stock.", "error");
      return;
    }
    try {
      addToCart({
        _id: product._id,
        id: product._id,
        productId: product._id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: currentPrice,
        image: product.images?.[0] || product.magazineDetails?.coverImage || "",
        size: selectedVariant?.size || selectedLegacySize,
        color: selectedVariant?.color || "",
        variantSku: selectedVariant?.sku || "",
        availableStock: product.status === "Pre-Order" ? null : stock,
        stockTracked: product.status !== "Pre-Order" && !(product.category === "Magazine" && product.magazineDetails?.isDigital),
      }, quantity);
      atelierToast("Added to your selection.");
    } catch (error) {
      atelierToast(error.message || "Unable to add this item.", "error");
    }
  };

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        <nav className="mb-8 text-[10px] uppercase tracking-[0.3em] opacity-50 flex items-center gap-2">
          <Link to="/store" className="hover:opacity-100 transition-opacity">Store</Link><span>/</span>
          <Link to={`/${product.category.replace(/\s+/g, "-").toLowerCase()}`} className="hover:opacity-100 transition-opacity">{product.category}</Link><span>/</span>
          <span className="font-bold opacity-100">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] bg-atelier-ink/5 border border-atelier-ink/10 overflow-hidden relative">
              <motion.img key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} src={optimizedImageUrl(product.images?.[selectedImage] || product.magazineDetails?.coverImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop", 1400)} alt={product.name} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && <div className="flex gap-4 overflow-x-auto pb-2">{product.images.map((img, idx) => <button key={idx} type="button" onClick={() => setSelectedImage(idx)} className={`w-20 aspect-square border overflow-hidden transition-all ${selectedImage === idx ? "border-atelier-ink opacity-100" : "border-atelier-ink/10 opacity-50 hover:opacity-100"}`}><img src={optimizedImageUrl(img, 240)} alt={`${product.name} view ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover"/></button>)}</div>}
          </div>

          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-40 block mb-2">{product.subCategory || product.category}</span>
              <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">{product.name}</h1>
              <p className="text-2xl font-serif font-medium mt-4">{formatNGN(currentPrice)}</p>
              {selectedVariant?.price != null && <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Price for selected variant</p>}
            </div>
            <div className="w-12 h-[1px] bg-atelier-ink/20" />
            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-40">Description</h3>
              <p className="font-serif italic text-base leading-relaxed text-atelier-ink/80">{product.description || "No description available for this archival item."}</p>
            </div>

            {product.shoeDetails && (product.shoeDetails.style?.length > 0 || product.shoeDetails.sizes?.length > 0) && <div className="pt-4 border-t border-atelier-ink/10 space-y-3">
              <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-40">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                {product.shoeDetails.style?.length > 0 && <div><span className="opacity-50 block text-[9px] uppercase">Style</span><span>{product.shoeDetails.style.join(", ")}</span></div>}
                {product.shoeDetails.material?.length > 0 && <div><span className="opacity-50 block text-[9px] uppercase">Material</span><span>{product.shoeDetails.material.join(", ")}</span></div>}
              </div>
            </div>}

            <div className="pt-6 border-t border-atelier-ink/10 space-y-5">
              {requiresVariant && <div>
                <label htmlFor="product-variant" className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60 block mb-3">Select size / colour</label>
                <select id="product-variant" value={selectedVariantSku} onChange={(event) => { setSelectedVariantSku(event.target.value); setQuantity(1); }} className="w-full bg-transparent border border-atelier-ink/20 px-4 py-3 text-sm" required>
                  <option value="">Choose an option</option>
                  {variants.map((variant) => <option key={variant.sku || variant._id} value={variant.sku} disabled={Number(variant.stock || 0) < 1}>{[variant.size, variant.color, variant.sku].filter(Boolean).join(" · ")} — {Number(variant.stock || 0) > 0 ? `${variant.stock} available` : "Out of stock"}</option>)}
                </select>
                {selectedVariant && <p className="text-[10px] opacity-50 mt-2">{selectedVariant.stock} available · SKU {selectedVariant.sku}</p>}
              </div>}
              {requiresLegacySize && <div>
                <label htmlFor="product-size" className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60 block mb-3">Select size</label>
                <select id="product-size" value={selectedLegacySize} onChange={(event) => setSelectedLegacySize(event.target.value)} className="w-full bg-transparent border border-atelier-ink/20 px-4 py-3 text-sm" required>
                  <option value="">Choose a size</option>
                  {legacySizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>}
              {!isSoldOut && <div className="flex items-center justify-between gap-4">
                <label htmlFor="product-quantity" className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-60">Quantity</label>
                <input id="product-quantity" type="number" min="1" max={selectedVariant ? selectedVariant.stock : product.stock || 50} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, selectedVariant ? selectedVariant.stock : product.stock || 50)))} className="w-20 bg-transparent border border-atelier-ink/20 p-2 text-center" />
              </div>}
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <button type="button" disabled={isSoldOut || (requiresVariant && !variants.some((variant) => Number(variant.stock || 0) > 0))} onClick={handleAddToCart} className={`w-full py-4 text-[10px] tracking-[0.3em] uppercase font-bold border transition-all flex items-center justify-center gap-3 ${isSoldOut ? "bg-atelier-ink/10 border-transparent cursor-not-allowed opacity-50" : "bg-atelier-ink text-white hover:bg-atelier-ink/90 border-atelier-ink"}`}>
                  <ShoppingBag size={15}/>{isSoldOut ? "Item Sold Out" : "Add to Cart"}
                </button>
                <button type="button" onClick={handleToggleWishlist} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={isWishlisted} title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} className="w-14 border border-atelier-ink/20 flex items-center justify-center hover:bg-atelier-ink hover:text-white transition-colors">
                  <Heart size={19} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-center opacity-40">Crafted in limited runs • Lagos & London Delivery</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
