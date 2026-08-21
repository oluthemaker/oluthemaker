import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../hooks/useSEO";
import useProductStore from "../store/useProductStore";
import ProductCard from "../components/ProductCard";

const LEATHER_GOODS_SUBCATEGORIES = [
  "All",
  "Wallets",
  "Belts",
  "Bags",
  "Cardholders",
  "Briefcases",
];

const LeatherGoods = () => {
  useSEO({
    title: "Leather Goods",
    description: "Explore our collection of leather goods, including belts, wallets, and card cases.",
  });

  const { products, leatherGoods, fetchProducts, loading } = useProductStore();
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const leatherItems = useMemo(() => {
    const source = leatherGoods?.length > 0
      ? leatherGoods
      : products.filter((p) => p.category === "Leather Goods");

    if (selectedSubCategory === "All") return source;

    return source.filter((item) => item.subCategory === selectedSubCategory);
  }, [leatherGoods, products, selectedSubCategory]);

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        {/* --- PAGE HEADER --- */}
        <header className="mb-12 border-b border-atelier-ink/10 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40 block mb-2">
              Handcrafted Atelier Pieces
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">
              Leather Goods
            </h1>
          </div>

          {/* Mobile Burger Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-3 border border-atelier-ink/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <span>Filter Category</span>
            <span className="text-base leading-none">☰</span>
          </button>
        </header>

        {/* --- DESKTOP SUBCATEGORY MENU --- */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-4 mb-16 border-b border-atelier-ink/5">
          {LEATHER_GOODS_SUBCATEGORIES.map((subCat) => {
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

        {/* --- MOBILE BURGER DRAWER --- */}
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

              {/* Slide-out Drawer */}
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
                    {LEATHER_GOODS_SUBCATEGORIES.map((subCat) => {
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

        {/* --- BENTO GRID WITH REUSABLE PRODUCT CARD --- */}
        {loading && leatherItems.length === 0 ? (
          <div className="py-24 text-center font-serif italic text-atelier-ink/60">
            Curating leather goods collection...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {leatherItems.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && leatherItems.length === 0 && (
          <div className="py-24 text-center space-y-3">
            <p className="font-serif italic text-lg opacity-50">
              No leather goods available in this subcategory.
            </p>
            <button
              onClick={() => setSelectedSubCategory("All")}
              className="text-[10px] tracking-[0.3em] uppercase font-bold underline opacity-70 hover:opacity-100"
            >
              [ View All Leather Goods ]
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default LeatherGoods;
