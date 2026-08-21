import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../hooks/useSEO";
import useProductStore from "../store/useProductStore";
import ProductCard from "../components/ProductCard";

const Footwear = () => {
  useSEO({
    title: "Footwear",
    description: "Browse our hand-crafted footwear and shoes.",
  });

  const { products, shoes, fetchProducts, loading } = useProductStore();

  // Selected Filter States
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Base list of shoes
  const baseShoes = useMemo(() => {
    return shoes?.length > 0
      ? shoes
      : products.filter(
          (p) => p.category === "Shoe" || p.category === "Footwear" || p.category === "Shoes"
        );
  }, [shoes, products]);

  // Dynamically extract unique values from base dataset
  const filterOptions = useMemo(() => {
    const subCategories = new Set();
    const styles = new Set();
    const materials = new Set();
    const colors = new Set();
    const sizes = new Set();

    baseShoes.forEach((item) => {
      if (item.subCategory) subCategories.add(item.subCategory);
      if (item.shoeDetails) {
        item.shoeDetails.style?.forEach((val) => styles.add(val));
        item.shoeDetails.material?.forEach((val) => materials.add(val));
        item.shoeDetails.color?.forEach((val) => colors.add(val));
        item.shoeDetails.sizes?.forEach((val) => sizes.add(Number(val)));
      }
    });

    return {
      subCategories: ["All", ...Array.from(subCategories)],
      styles: ["All", ...Array.from(styles)],
      materials: ["All", ...Array.from(materials)],
      colors: ["All", ...Array.from(colors)],
      sizes: ["All", ...Array.from(sizes).sort((a, b) => a - b)],
    };
  }, [baseShoes]);

  // Apply active filters to dataset
  const filteredShoes = useMemo(() => {
    return baseShoes.filter((item) => {
      // Subcategory check
      if (selectedSubCategory !== "All" && item.subCategory !== selectedSubCategory) {
        return false;
      }

      const details = item.shoeDetails || {};

      // Style check
      if (
        selectedStyle !== "All" &&
        !details.style?.some(
          (s) => s.toLowerCase() === selectedStyle.toLowerCase()
        )
      ) {
        return false;
      }

      // Material check
      if (
        selectedMaterial !== "All" &&
        !details.material?.some(
          (m) => m.toLowerCase() === selectedMaterial.toLowerCase()
        )
      ) {
        return false;
      }

      // Color check
      if (
        selectedColor !== "All" &&
        !details.color?.some(
          (c) => c.toLowerCase() === selectedColor.toLowerCase()
        )
      ) {
        return false;
      }

      // Size check
      if (
        selectedSize !== "All" &&
        !details.sizes?.some((sz) => Number(sz) === Number(selectedSize))
      ) {
        return false;
      }

      return true;
    });
  }, [
    baseShoes,
    selectedSubCategory,
    selectedStyle,
    selectedMaterial,
    selectedColor,
    selectedSize,
  ]);

  const resetAllFilters = () => {
    setSelectedSubCategory("All");
    setSelectedStyle("All");
    setSelectedMaterial("All");
    setSelectedColor("All");
    setSelectedSize("All");
  };

  const hasActiveFilters =
    selectedSubCategory !== "All" ||
    selectedStyle !== "All" ||
    selectedMaterial !== "All" ||
    selectedColor !== "All" ||
    selectedSize !== "All";

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        {/* --- PAGE HEADER --- */}
        <header className="mb-10 border-b border-atelier-ink/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40 block mb-2">
              Ready To Wear Shoes
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">
              Footwear
            </h1>
          </div>

          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-3 border border-atelier-ink/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-atelier-ink" />
            )}
            <span className="text-base leading-none">☰</span>
          </button>
        </header>

        {/* --- DESKTOP SHOE DETAILS FILTER BAR --- */}
        <div className="hidden md:block mb-12 border-b border-atelier-ink/10 pb-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Subcategory */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-40 block mb-2">
                Category
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 focus:outline-none font-serif italic"
              >
                {filterOptions.subCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-40 block mb-2">
                Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 focus:outline-none font-serif italic"
              >
                {filterOptions.styles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-40 block mb-2">
                Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 focus:outline-none font-serif italic"
              >
                {filterOptions.materials.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-40 block mb-2">
                Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 focus:outline-none font-serif italic capitalize"
              >
                {filterOptions.colors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-40 block mb-2">
                EU Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 focus:outline-none font-serif italic"
              >
                {filterOptions.sizes.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All Sizes" : `EU ${option}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetAllFilters}
                className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-60 hover:opacity-100 underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* --- MOBILE DRAWER FILTERS --- */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-atelier-ink/40 backdrop-blur-sm z-40 md:hidden"
              />

              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-atelier-paper z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-atelier-ink/10 pb-4">
                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-40">
                      Filter Footwear
                    </span>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                      [ Close ]
                    </button>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-50 block mb-2">
                      Category
                    </label>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 font-serif italic"
                    >
                      {filterOptions.subCategories.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-50 block mb-2">
                      Style
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 font-serif italic"
                    >
                      {filterOptions.styles.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-50 block mb-2">
                      Material
                    </label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 font-serif italic"
                    >
                      {filterOptions.materials.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-50 block mb-2">
                      Color
                    </label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 font-serif italic capitalize"
                    >
                      {filterOptions.colors.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase font-bold opacity-50 block mb-2">
                      EU Size
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full bg-transparent border border-atelier-ink/15 text-xs py-2 px-3 font-serif italic"
                    >
                      {filterOptions.sizes.map((option) => (
                        <option key={option} value={option}>
                          {option === "All" ? "All Sizes" : `EU ${option}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-atelier-ink/10 flex flex-col gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="w-full py-2 border border-atelier-ink/20 text-[10px] uppercase tracking-widest font-bold"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-3 bg-atelier-ink text-white text-[10px] uppercase tracking-widest font-bold"
                  >
                    Apply & View ({filteredShoes.length})
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* --- BENTO GRID WITH PRODUCT CARDS --- */}
        {loading && filteredShoes.length === 0 ? (
          <div className="py-24 text-center font-serif italic text-atelier-ink/60">
            Curating footwear collection...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredShoes.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!loading && filteredShoes.length === 0 && (
          <div className="py-24 text-center space-y-3">
            <p className="font-serif italic text-lg opacity-50">
              No footwear matching your specified details.
            </p>
            <button
              onClick={resetAllFilters}
              className="text-[10px] tracking-[0.3em] uppercase font-bold underline opacity-70 hover:opacity-100"
            >
              [ Clear Filters ]
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Footwear;
