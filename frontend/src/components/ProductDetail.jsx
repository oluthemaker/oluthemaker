import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SizeGuide from "../components/SizeGuide";
import useProductStore from "../store/useProductStore";
import { PRICE_MODIFIERS } from "../utils/MasterMenu";
import useCartStore from "../store/useCartStore";
import useSEO from "../hooks/useSEO";

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductBySlug, loading, fetchProducts, products } =
    useProductStore();
  const { addToCart } = useCartStore();

  const [activeTab, setActiveTab] = useState("description");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Selection State
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedWidth, setSelectedWidth] = useState(null);
  const [selectedLast, setSelectedLast] = useState(null);
  const [selectedSole, setSelectedSole] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const product = getProductBySlug(slug);
  const productDetails = getProductBySlug(slug)?.shoeDetails;

  // UseEffect
  useEffect(() => {
    // If the store is empty (products array is length 0), trigger the fetch
    if (!products || products.length === 0) {
      if (fetchProducts) fetchProducts();
    }
  }, [products, fetchProducts]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price) || 0;
    const materialAdd = PRICE_MODIFIERS.material[selectedMaterial] || 0;
    const soleAdd = PRICE_MODIFIERS.soles[selectedSole] || 0;
    return base + materialAdd + soleAdd;
  }, [product, selectedMaterial, selectedSole]);

  const isFullyConfigured =
    selectedSize &&
    selectedWidth &&
    selectedLast &&
    selectedSole &&
    selectedMaterial;

  const handleAddToCart = () => {
    if (!isFullyConfigured) return;
    addToCart({
      id: product._id || slug,
      name: product.name,
      price: totalPrice,
      image: product.images?.[0],
      size: selectedSize,
      width: selectedWidth,
      last: selectedLast,
      sole: selectedSole,
      material: selectedMaterial,
    });
  };
  useSEO({
    title: product?.name,
    description: product?.description,
    ogImage: product?.images?.[0],
  });

  if (loading)
    return (
      <div className="min-h-screen pt-40 text-center font-serif italic">
        Consulting archives...
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen pt-40 text-center font-serif italic">
        Piece not found.
      </div>
    );

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-24 md:pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-32 items-start">
          {/* IMAGE SECTION */}
          <div className="md:sticky md:top-32">
            <div className="aspect-[4/5] bg-atelier-ink/5 overflow-hidden">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* INFO & CONFIGURATION */}
          <div className="pt-4">
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter mb-4">
              {product.name}
            </h1>
            <p className="text-xl font-sans mb-10">${totalPrice}</p>

            <div className="space-y-10 mb-12">
              {/* SIZE SELECTION */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-bold">
                    Size (EU)
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10px] border-b border-atelier-ink opacity-60 hover:opacity-100 uppercase"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(productDetails.sizes || []).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border text-xs transition-all ${
                        String(selectedSize) === String(size)
                          ? "bg-atelier-ink text-white"
                          : "border-atelier-ink/10 hover:border-atelier-ink"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/*  OPTIONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  {
                    label: "Width",
                    state: selectedWidth,
                    setter: setSelectedWidth,
                    options: productDetails.width,
                  },
                  {
                    label: "The Last",
                    state: selectedLast,
                    setter: setSelectedLast,
                    options: productDetails.last,
                  },
                  {
                    label: "Upper Material",
                    state: selectedMaterial,
                    setter: setSelectedMaterial,
                    options: productDetails.material,
                  },
                  {
                    label: "Sole Type",
                    state: selectedSole,
                    setter: setSelectedSole,
                    options: productDetails.soles,
                  },
                ].map((filter) => (
                  <div key={filter.label}>
                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold block mb-4">
                      {filter.label}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(filter.options || []).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => filter.setter(opt)}
                          className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-all ${
                            filter.state === opt
                              ? "bg-atelier-ink text-white border-atelier-ink"
                              : "border-atelier-ink/10 hover:border-atelier-ink"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA SECTION WITH LEAD TIME & CONSTRUCTION */}
            <div className="bg-atelier-ink text-white p-8">
              <h2 className="text-2xl font-serif italic mb-4 text-center">
                Ready to Elevate Your Wardrobe?
              </h2>

              {/* Added Lead Time & Construction meta-data here */}
              <div className="flex justify-between border-t border-b border-white/10 py-4 mb-6">
                <div className="text-center flex-1 border-r border-white/10">
                  <span className="block text-[8px] tracking-[0.3em] uppercase opacity-50 mb-1">
                    Lead Time
                  </span>
                  <span className="text-[10px] tracking-widest uppercase">
                    {productDetails.leadTime || "4-6 Weeks"}
                  </span>
                </div>
                <div className="text-center flex-1">
                  <span className="block text-[8px] tracking-[0.3em] uppercase opacity-50 mb-1">
                    Construction
                  </span>
                  <span className="text-[10px] tracking-widest uppercase">
                    {productDetails.construction?.[0] || "Hand-Welted"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isFullyConfigured}
                className={`w-full py-4 text-[10px] tracking-[0.3em] font-bold uppercase transition-colors ${
                  isFullyConfigured
                    ? "bg-white text-atelier-ink hover:bg-atelier-tan hover:text-white"
                    : "bg-white/20 text-white/50 cursor-not-allowed"
                }`}
              >
                {isFullyConfigured
                  ? `Add to Cart — $${totalPrice}`
                  : "Complete Configuration"}
              </button>
            </div>
          </div>
        </section>

        {/* DETAILS TABS */}
        <section className="max-w-4xl mx-auto border-t border-atelier-ink/10 pt-16">
          <div className="flex flex-wrap gap-8 border-b border-atelier-ink/10 mb-12">
            {[
              "description",
              "details",
              "material-care",
              "delivery-returns",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] tracking-[0.3em] uppercase font-bold transition-all ${activeTab === tab ? "border-b-2 border-atelier-ink opacity-100" : "opacity-40 hover:opacity-70"}`}
              >
                {tab.replace("-", " & ")}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[200px] font-serif italic opacity-80 text-lg leading-relaxed"
            >
              {activeTab === "description" && <p>{product.description}</p>}
              {activeTab === "details" && (
                <p>
                  Expertly crafted using {product.construction?.[0]}{" "}
                  construction. This pair is built on the{" "}
                  {selectedLast || "Lagos"} last to ensure a superior silhouette
                  and longevity.
                </p>
              )}
              {activeTab === "material-care" && (
                <p>
                  Featuring {selectedMaterial || "premium leather"}. We
                  recommend cedar shoe trees and monthly conditioning to
                  maintain the leather's natural oils.
                </p>
              )}
              {activeTab === "delivery-returns" && (
                <p>
                  Each pair is made to order with a lead time of{" "}
                  {product.leadTime}. We offer free worldwide shipping via DHL
                  Express.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-atelier-ink/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute -top-12 right-0 text-white text-[10px] uppercase font-bold"
            >
              Close [X]
            </button>
            <SizeGuide />
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetail;
