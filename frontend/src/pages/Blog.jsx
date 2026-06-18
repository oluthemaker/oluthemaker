import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiPlus,
} from "react-icons/fi";
import useBlogStore from "../store/useBlogStore";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard";
import useSEO from "../hooks/useSEO";
import useUserStore from "../store/useUserStore";

export default function Blog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const archiveRef = useRef(null); // Create a reference for the archive section
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track first load
  const { user } = useUserStore(); // Get user
  const isAdmin = user?.user?.isAdmin;

  const categories = [
    "all",
    "news",
    "masters-of-the-craft",
    "moving-hands",
    "our-advice",
  ];

  const {
    blogs,
    loading,
    fetchBlogs,
    featuredBlog,
    currentPage,
    totalPages,
    searchBlogs,
  } = useBlogStore();

  // Sync fetch with category changes
  useEffect(() => {
    // 1. Fetch the data
    fetchBlogs(currentPage, selectedCategory === "all" ? "" : selectedCategory);

    // 2. Control the scroll behavior
    if (isInitialLoad) {
      window.scrollTo(0, 0);
      setIsInitialLoad(false);
    } else {
      // Smooth scroll to the archive section when filters/page change
      archiveRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      searchBlogs(search);
    } else {
      fetchBlogs(1);
    }
  };

  useSEO({
    title: "Blog",
    description: "Read our latest blog posts on ",
  });

  if (loading && blogs.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-atelier-paper">
        <span className="text-[10px] tracking-[0.5em] uppercase animate-pulse text-atelier-ink">
          Opening Archive
        </span>
      </div>
    );

  const archiveArticles = blogs.filter((blog) => !blog.featured);

  return (
    <div className="flex flex-col min-h-screen bg-atelier-paper text-atelier-ink overflow-x-hidden">
      {/* 1. FULL SCREEN HERO SECTION */}
      {featuredBlog && (
        <section className="w-full h-[80vh] md:h-[130vh] lg:h-[200vh]  relative overflow-hidden bg-atelier-ink">
          <img
            src={featuredBlog.headerImage}
            alt={featuredBlog.title}
            className="w-full h-full object-cover  opacity-80"
          />
          {/* Subtle Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-atelier-ink/80 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-24 max-w-5xl">
            <span className="text-[10px] tracking-[0.4em] uppercase text-atelier-tan mb-4 font-bold">
              Featured Editorial
            </span>
            <h1 className="text-5xl md:text-8xl font-serif italic leading-none mb-8 text-atelier-paper">
              {featuredBlog.title}
            </h1>
            <p className="text-atelier-paper/70 leading-relaxed mb-8 font-serif italic text-xl md:text-2xl max-w-2xl">
              {featuredBlog.description}
            </p>
            <Link
              to={`/journal/${featuredBlog.slug}`}
              className="w-fit px-12 py-5 border border-atelier-paper text-atelier-paper text-[10px] tracking-[0.3em] uppercase hover:bg-atelier-paper hover:text-atelier-ink transition-all duration-700"
            >
              Read Full Feature
            </Link>
          </div>
        </section>
      )}

      {/* 2. STICKY NAV: BURGER (Left) & SEARCH (Right) */}
      <nav className="sticky top-0 z-[60] bg-atelier-paper/95 backdrop-blur-md border-y border-atelier-ink/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Admin Create Button - Displayed on the left of desktop menu or after burger */}
          {isAdmin && (
            <Link
              to="/journal/write"
              className="flex items-center gap-2 mr-6 px-4 py-2 bg-atelier-ink text-atelier-paper text-[10px] tracking-widest uppercase hover:bg-atelier-tan transition-colors"
            >
              <FiPlus size={14} />
              <span>New Entry</span>
            </Link>
          )}
          {/* Mobile Menu Toggle & Desktop Categories */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center gap-3 text-[10px] tracking-widest uppercase"
            >
              {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              <span>Menu</span>
            </button>

            <ul className="hidden md:flex gap-10 items-center">
              {categories.map((cat) => (
                <li
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] tracking-[0.2em] uppercase cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "text-atelier-tan font-bold border-b border-atelier-tan pb-1"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {cat.replace("-", " ")}
                </li>
              ))}
            </ul>
          </div>

          {/* Minimalist Search Input */}
          <form
            onSubmit={handleSearch}
            className="flex items-center group border-b border-atelier-ink/10 py-1"
          >
            <input
              type="text"
              placeholder="SEARCH ARCHIVE"
              className="bg-transparent text-[10px] tracking-widest outline-none w-28 md:w-48 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 text-atelier-ink/40 group-hover:text-atelier-ink"
            >
              <FiSearch size={14} />
            </button>
          </form>
        </div>

        {/* MOBILE BURGER MENU OVERLAY */}
        <div
          className={`absolute top-20 left-0 w-full bg-atelier-paper border-b border-atelier-ink/10 transition-all duration-500 overflow-hidden ${menuOpen ? "max-h-96" : "max-h-0"}`}
        >
          <ul className="p-8 space-y-6">
            {categories.map((cat) => (
              <li
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setMenuOpen(false);
                }}
                className={`text-xs tracking-[0.3em] uppercase transition-colors ${
                  selectedCategory === cat
                    ? "text-atelier-tan font-bold"
                    : "opacity-60"
                }`}
              >
                {cat.replace("-", " ")}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 3. MAIN ARCHIVE GRID */}
      <main
        ref={archiveRef}
        className="px-8 py-24 max-w-7xl mx-auto w-full scroll-mt-20"
      >
        <div className="flex flex-col items-center mb-24 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-atelier-tan/40 mb-4">
            Archive Collection
          </span>
          <h2 className="text-5xl font-serif italic capitalize">
            {selectedCategory.replace("-", " ")}
          </h2>
        </div>

        {archiveArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {archiveArticles.map((article) => (
              <ArticleCard
                key={article._id || article.slug}
                article={article}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-30 italic font-serif">
              No entries found in this category.
            </p>
          </div>
        )}

        {/* 4. EDITORIAL PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-32 pt-12 border-t border-atelier-ink/10">
            <button
              onClick={() => fetchBlogs(currentPage - 1, selectedCategory)}
              disabled={currentPage === 1}
              className="flex items-center gap-4 text-[10px] tracking-widest uppercase disabled:opacity-10 group"
            >
              <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <span className="text-[10px] tracking-widest uppercase opacity-30">
              {currentPage} — {totalPages}
            </span>

            <button
              onClick={() => fetchBlogs(currentPage + 1, selectedCategory)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-4 text-[10px] tracking-widest uppercase disabled:opacity-10 group"
            >
              Next
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
