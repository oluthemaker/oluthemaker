import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../hooks/useSEO";
import useProductStore from "../store/useProductStore";
import ProductCard from "../components/ProductCard";

const MERCHANDISE_SUBCATEGORIES = [
  "All",
  "T-Shirts",
  "Caps",
  "Totes",
  "Socks",
  "Accessories",
  "Mugs",
];

const Merchandise = () => {
  useSEO({
    title: "Merchandise",
    description: "Browse our exclusive merchandise and atelier objects",
  });

  const { products, merchandise, fetchProducts, loading } = useProductStore();
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const merchItems = useMemo(() => {
    const source = merchandise?.length > 0
      ? merchandise
      : products.filter((p) => p.category === "Merchandise");

    if (selectedSubCategory === "All") return source;

    return source.filter((item) => item.subCategory === selectedSubCategory);
  }, [merchandise, products, selectedSubCategory]);

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        {/* PAGE HEADER */}
        <header className="mb-12 border-b border-atelier-ink/10 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40 block mb-2">
              Limited Editions
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">
              Merchandise
            </h1>
          </div>

          {/* Mobile Burger Trigger Button (Visible under MD) */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-3 border border-atelier-ink/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <span>Filter Category</span>
            <span className="text-base leading-none">☰</span>
          </button>
        </header>

        {/* DESKTOP SUBCATEGORY MENU (Hidden on small devices) */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-4 mb-16 border-b border-atelier-ink/5">
          {MERCHANDISE_SUBCATEGORIES.map((subCat) => {
            const isActive = selectedSubCategory === subCat;
            return (
              <button
                key={subCat}
                onClick={() => setSelectedSubCategory(subCat)}
                className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-atelier-ink text-white"
                    : "border border-atelier-ink/10 opacity-60 hover:opacity-100"
                }`}
              >
                {subCat}
              </button>
            );
          })}
        </div>

        {/* MOBILE BURGER DRAWER MENU */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-atelier-ink/40 backdrop-blur-sm z-40 md:hidden"
              />

              {/* Slide-out Panel */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-atelier-paper z-50 p-8 shadow-2xl flex flex-col justify-between md:hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-8 border-b border-atelier-ink/10 pb-4">
                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-40">
                      Subcategories
                    </span>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                      [ Close ]
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {MERCHANDISE_SUBCATEGORIES.map((subCat) => {
                      const isActive = selectedSubCategory === subCat;
                      return (
                        <button
                          key={subCat}
                          onClick={() => {
                            setSelectedSubCategory(subCat);
                            setIsMobileFilterOpen(false);
                          }}
                          className={`text-left px-4 py-3 text-[11px] tracking-[0.2em] uppercase font-serif italic border transition-all ${
                            isActive
                              ? "bg-atelier-ink text-white"
                              : "border-atelier-ink/10 hover:border-atelier-ink/30"
                          }`}
                        >
                          {subCat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[9px] uppercase tracking-widest opacity-40 text-center pt-6 border-t border-atelier-ink/10">
                  Select a category to filter
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* PRODUCT GRID USING REUSABLE PRODUCTCARD */}
        {loading && merchItems.length === 0 ? (
          <div className="py-24 text-center font-serif italic text-atelier-ink/60">
            Curating merchandise selection...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {merchItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && merchItems.length === 0 && (
          <div className="py-24 text-center space-y-3">
            <p className="font-serif italic text-lg opacity-50">
              No merchandise pieces currently available in this subcategory.
            </p>
            <button
              onClick={() => setSelectedSubCategory("All")}
              className="text-[10px] tracking-[0.3em] uppercase font-bold underline opacity-70 hover:opacity-100"
            >
              [ View All Merchandise ]
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Merchandise;
