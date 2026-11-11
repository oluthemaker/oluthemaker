import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import useSEO from "../hooks/useSEO";

const PAGE_SIZE = 12;
const CATEGORIES = ["Shoe", "Leather Goods", "Merchandise", "Magazine", "Auction"];
const SORT_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const ProductCatalogue = () => {
  useSEO({ title: "Shop All Products", description: "Search and explore the Olú The Maker catalogue." });
  const initialFilters = { search: "", category: "", subCategory: "", color: "", size: "", minPrice: "", maxPrice: "", sort: "standard" };
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ products: [], pagination: { total: 0, totalPages: 0, hasMore: false } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const resetFilters = () => {
    setPage(1);
    setFilters(initialFilters);
  };

  const fetchPage = useCallback(async (activeFilters, activePage, signal) => {
    const params = { ...activeFilters, page: activePage, limit: PAGE_SIZE };
    Object.keys(params).forEach((key) => { if (params[key] === "") delete params[key]; });
    const response = await API.get("/products/browse", { params, signal });
    return response.data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      fetchPage(filters, page, controller.signal)
        .then((data) => setResult(data))
        .catch((err) => {
          if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") setError(err.response?.data?.message || "We couldn't load the catalogue. Please try again.");
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters, page, fetchPage, retryKey]);

  const hasActiveFilters = useMemo(() => Object.entries(filters).some(([key, value]) => key === "sort" ? value !== "standard" : Boolean(value)), [filters]);
  const selectClass = "w-full bg-transparent border border-atelier-ink/20 px-3 py-3 text-xs focus:outline-none focus:border-atelier-ink";
  const fieldLabel = "mb-2 block text-[9px] font-bold uppercase tracking-[0.25em] opacity-50";

  const renderFilterFields = () => (
    <div className="space-y-5">
      <div>
        <label className={fieldLabel} htmlFor="catalog-category">Category</label>
        <select id="catalog-category" className={selectClass} value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>
      <div>
        <label className={fieldLabel} htmlFor="catalog-subcategory">Subcategory</label>
        <input id="catalog-subcategory" className={selectClass} value={filters.subCategory} onChange={(event) => updateFilter("subCategory", event.target.value)} placeholder="e.g. Oxford, Wallet" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabel} htmlFor="catalog-min-price">Min. price (₦)</label>
          <input id="catalog-min-price" type="number" min="0" inputMode="numeric" className={selectClass} value={filters.minPrice} onChange={(event) => updateFilter("minPrice", event.target.value)} placeholder="0" />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="catalog-max-price">Max. price (₦)</label>
          <input id="catalog-max-price" type="number" min="0" inputMode="numeric" className={selectClass} value={filters.maxPrice} onChange={(event) => updateFilter("maxPrice", event.target.value)} placeholder="Any" />
        </div>
      </div>
      <div>
        <label className={fieldLabel} htmlFor="catalog-color">Colour</label>
        <input id="catalog-color" className={selectClass} value={filters.color} onChange={(event) => updateFilter("color", event.target.value)} placeholder="e.g. Black" />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="catalog-size">Size</label>
        <input id="catalog-size" className={selectClass} value={filters.size} onChange={(event) => updateFilter("size", event.target.value)} placeholder="e.g. 42 or UK 9" />
      </div>
      <div className="pt-1">
        <button type="button" onClick={resetFilters} className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-bold underline underline-offset-4 opacity-60 hover:opacity-100">
          <RotateCcw size={12} /> Reset filters
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-atelier-paper text-atelier-ink pt-28 md:pt-32 pb-28">
      <section className="max-w-7xl mx-auto px-5 md:px-6">
        <header className="border-b border-atelier-ink/10 pb-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <Link to="/store" className="text-[9px] uppercase tracking-[0.3em] opacity-45 hover:opacity-100">Store / All products</Link>
            <h1 className="mt-3 text-4xl md:text-6xl font-serif italic">The Catalogue</h1>
            <p className="mt-3 text-sm font-serif opacity-60">Explore the complete Olú The Maker collection.</p>
          </div>
          <div className="text-[9px] uppercase tracking-[0.25em] opacity-50">{result.pagination.total || 0} pieces</div>
        </header>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              aria-label="Search products"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search products, materials, categories..."
              className="w-full bg-transparent border border-atelier-ink/20 pl-11 pr-12 py-4 text-sm focus:outline-none focus:border-atelier-ink"
            />
            {filters.search && <button type="button" aria-label="Clear search" onClick={() => updateFilter("search", "")} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50"><X size={16} /></button>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 border border-atelier-ink/20 px-4 py-3 text-[10px] uppercase tracking-widest"><SlidersHorizontal size={15} /> Filters</button>
            <label className="flex items-center gap-3 border border-atelier-ink/20 px-3 py-2 text-[9px] uppercase tracking-widest whitespace-nowrap">
              Sort
              <select aria-label="Sort products" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)} className="bg-transparent text-xs normal-case tracking-normal focus:outline-none">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-8">
          <aside className="hidden md:block border-r border-atelier-ink/10 pr-6">
            <div className="flex items-center justify-between mb-6"><h2 className="text-[10px] uppercase tracking-[0.3em] font-bold">Refine</h2>{hasActiveFilters && <span className="text-[9px] opacity-40">Active</span>}</div>
            {renderFilterFields()}
          </aside>

          <div>
            <div className="flex items-center justify-between border-b border-atelier-ink/10 pb-4 mb-6 text-[10px] uppercase tracking-widest opacity-55">
              <span>{loading ? "Updating selection..." : `${result.pagination.total} results`}</span>
              {hasActiveFilters && <button onClick={resetFilters} className="underline underline-offset-4">Clear all</button>}
            </div>

            {error ? <div role="alert" className="py-20 text-center"><p className="font-serif italic">{error}</p><button onClick={() => setRetryKey((current) => current + 1)} className="mt-4 text-xs underline">Try again</button></div> : null}
            {loading && result.products.length === 0 ? <div className="py-24 text-center font-serif italic opacity-60">Finding your selection...</div> : null}
            {!loading && !error && result.products.length === 0 ? (
              <div className="py-24 text-center space-y-3"><p className="font-serif text-2xl italic">Nothing found just yet.</p><p className="text-xs opacity-50">Try another search or adjust your filters.</p><button onClick={resetFilters} className="mt-3 text-[10px] uppercase tracking-widest underline">Clear search and filters</button></div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 ${loading ? "opacity-50" : ""}`}>
                {result.products.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}
              </div>
            )}

            {result.pagination.totalPages > 1 && (
              <nav aria-label="Catalogue pagination" className="mt-14 flex items-center justify-center gap-6">
                <button disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="disabled:opacity-25 p-2" aria-label="Previous page"><ChevronLeft size={18} /></button>
                <span className="text-[10px] uppercase tracking-widest">Page {page} of {result.pagination.totalPages}</span>
                <button disabled={!result.pagination.hasMore || loading} onClick={() => setPage((current) => current + 1)} className="disabled:opacity-25 p-2" aria-label="Next page"><ChevronRight size={18} /></button>
              </nav>
            )}
          </div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-black/40" />
          <aside role="dialog" aria-modal="true" aria-label="Product filters" className="absolute right-0 top-0 h-full w-[min(88vw,380px)] overflow-y-auto bg-atelier-paper p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-atelier-ink/10 pb-5 mb-6"><h2 className="font-serif text-2xl italic">Refine selection</h2><button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filter panel"><X /></button></div>
            {renderFilterFields()}
          </aside>
        </div>
      )}
    </main>
  );
};

export default ProductCatalogue;
