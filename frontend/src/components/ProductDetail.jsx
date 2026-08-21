import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import useProductStore from "../store/useProductStore";
import useSEO from "../hooks/useSEO";

const ProductDetail = () => {
  const { slug } = useParams();
  const { products, fetchProducts, loading } = useProductStore();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  const product = products.find((p) => p.slug === slug);

  useSEO({
    title: product ? product.name : "Product Details",
    description: product ? product.description : "Explore item details",
  });

  if (loading && !product) {
    return (
      <div className="min-h-screen pt-40 text-center font-serif italic text-atelier-ink/60">
        Retrieving piece from archives...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 text-center space-y-4">
        <h2 className="font-serif italic text-2xl">Item Not Found</h2>
        <p className="text-xs opacity-60">The requested product does not exist in our catalog.</p>
        <Link
          to="/store"
          className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold underline"
        >
          [ Return to Store ]
        </Link>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <nav className="mb-8 text-[10px] uppercase tracking-[0.3em] opacity-50 flex items-center gap-2">
          <Link to="/store" className="hover:opacity-100 transition-opacity">Store</Link>
          <span>/</span>
          <Link to={`/${product.category.replace(/\s+/g, '-').toLowerCase()}`} className="hover:opacity-100 transition-opacity">
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-bold opacity-100">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] bg-atelier-ink/5 border border-atelier-ink/10 overflow-hidden relative">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images?.[selectedImage] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Row */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 aspect-square border overflow-hidden transition-all ${
                      selectedImage === idx
                        ? "border-atelier-ink opacity-100"
                        : "border-atelier-ink/10 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Specs & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-40 block mb-2">
                {product.subCategory || product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-serif font-medium mt-4">
                ₦{product.price?.toLocaleString()}
              </p>
            </div>

            <div className="w-12 h-[1px] bg-atelier-ink/20" />

            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-40">
                Description
              </h3>
              <p className="font-serif italic text-base leading-relaxed text-atelier-ink/80">
                {product.description || "No description available for this archival item."}
              </p>
            </div>

            {/* Shoe Specs (Conditional Rendering) */}
            {product.shoeDetails && (product.shoeDetails.style?.length > 0 || product.shoeDetails.sizes?.length > 0) && (
              <div className="pt-4 border-t border-atelier-ink/10 space-y-3">
                <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-40">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  {product.shoeDetails.style?.length > 0 && (
                    <div>
                      <span className="opacity-50 block text-[9px] uppercase">Style</span>
                      <span>{product.shoeDetails.style.join(", ")}</span>
                    </div>
                  )}
                  {product.shoeDetails.material?.length > 0 && (
                    <div>
                      <span className="opacity-50 block text-[9px] uppercase">Material</span>
                      <span>{product.shoeDetails.material.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase CTA */}
            <div className="pt-6 border-t border-atelier-ink/10 space-y-4">
              <button
                disabled={isSoldOut}
                className={`w-full py-4 text-[10px] tracking-[0.3em] uppercase font-bold border transition-all ${
                  isSoldOut
                    ? "bg-atelier-ink/10 border-transparent cursor-not-allowed opacity-50"
                    : "bg-atelier-ink text-white hover:bg-atelier-ink/90 border-atelier-ink"
                }`}
              >
                {isSoldOut ? "Item Sold Out" : "Add to Cart"}
              </button>

              <p className="text-[9px] uppercase tracking-widest text-center opacity-40">
                Crafted in limited runs • Lagos & London Delivery
              </p>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
