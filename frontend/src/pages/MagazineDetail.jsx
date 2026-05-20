import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import ArticleCard from "../components/ArticleCard";
import useProductStore from "../store/useProductStore";
import useCartStore from "../store/useCartStore";
import useSEO from "../hooks/useSEO";

const MagazineDetail = () => {
  const { slug } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCartStore();
  const { getProductBySlug, loading: storeLoading } = useProductStore();
  const [issueData, setIssueData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedFormat, setSelectedFormat] = useState("print");

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      const data = await getProductBySlug(slug);
      setIssueData(data);
      setIsInitialLoading(false);
    };

    if (slug) {
      loadData();
    }
    window.scrollTo(0, 0);
  }, [slug, getProductBySlug]);

  useSEO({
    title: issueData?.name,
    description: issueData?.description,
    ogImage: issueData?.images?.[0]?.url,
  });

  // Use the local loading state and the store's loading state
  if (isInitialLoading || storeLoading) {
    return <div className="pt-40 text-center italic">Loading Archive...</div>;
  }

  // Handle case where issue doesn't exist (e.g., user types a wrong URL)
  if (!issueData) {
    return (
      <div className="bg-atelier-paper min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif italic mb-4">
            Archive Entry Not Found
          </h1>
          <Link
            to="/magazine"
            className="text-[10px] tracking-widest uppercase border-b border-atelier-ink"
          >
            Return to Archive
          </Link>
        </div>
      </div>
    );
  }

  if (isInitialLoading || storeLoading)
    return <div className="pt-40 text-center italic">Loading...</div>;

  // You might want to initialize to "digital" if magazineDetails.isDigital is true and there is no print version.

  // NEW: Dynamic Pricing Calculation
  // Adjust these multipliers or replace them with actual database fields if you have them!
  const FORMAT_PRICES = {
    print: issueData?.price,
    digital: Math.round(issueData?.price * 0.6), // Example: Digital is 60% of the print price
    bundle: Math.round(issueData?.price * 1.3), // Example: Bundle is 130% of the print price
  };

  const currentPrice = FORMAT_PRICES[selectedFormat];

  const filteredArticles = issueData?.magazineDetails?.articles?.filter(
    (article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddToCart = () => {
    addToCart({
      id: issueData._id || slug,
      name: issueData.name,
      price: currentPrice,
      image: issueData.images?.[0],
      format: selectedFormat,
    });
  };

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION 1: ISSUE HEADER */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32 items-start">
          {/* Left: Big Cover Image */}
          <div className="md:col-span-5">
            <div className="sticky top-40 aspect-[4/6] shadow-2xl overflow-hidden bg-atelier-ink/10">
              <img
                src={issueData?.images?.[0]}
                className="w-full h-full object-cover"
                alt={name}
              />
              <div className="absolute inset-y-0 left-0 w-3 bg-black/10 blur-[1px]" />
            </div>
          </div>

          {/* Right: Issue Info & Actions */}
          <div className="md:col-span-7 space-y-10">
            <div>
              <span className="text-[10px] tracking-[0.5em] uppercase font-sans font-bold opacity-40 block mb-4">
                Issue No. {issueData?.magazineDetails?.issueNumber} •{" "}
                {issueData?.magazineDetails?.year}{" "}
              </span>
              <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter leading-none mb-8">
                {name}
              </h1>
              <div className="h-[1px] w-20 bg-atelier-tan mb-8" />
              <p className="text-xl md:text-2xl font-serif italic opacity-70 leading-relaxed">
                {issueData?.description}
              </p>
            </div>

            {/* NEW: FORMAT SELECTION & ACTION BUTTONS */}
            <div className="space-y-8 pt-4">
              {/* Format Selectors */}
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold block mb-4">
                  Select Format
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "print", label: "Print Edition" },
                    { id: "digital", label: "Digital PDF" },
                    { id: "bundle", label: "Print + Digital Bundle" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-all ${
                        selectedFormat === format.id
                          ? "bg-atelier-ink text-white border-atelier-ink"
                          : "border-atelier-ink/10 hover:border-atelier-ink"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart CTA */}
              <div className="flex flex-col items-start gap-4 border-t border-atelier-ink/10 pt-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full md:w-auto px-10 py-4 bg-atelier-ink text-white text-[10px] tracking-[0.3em] font-sans font-bold hover:bg-atelier-tan transition-all uppercase"
                >
                  Add {selectedFormat === "bundle" ? "Bundle" : selectedFormat}{" "}
                  to Cart — ₦{currentPrice}
                </button>

                <button className="block text-[9px] tracking-[0.4em] uppercase font-sans font-bold border-b border-transparent hover:border-atelier-tan py-2 transition-all mt-4">
                  Subscribe to the seasonal archive
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE INDEX (Articles) */}
        <section className="border-t border-atelier-ink/10 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8">
            <h2 className="text-3xl font-serif italic tracking-tight">
              Included in this Issue
            </h2>

            {/* Minimalist Search Bar */}
            <div className="relative w-full md:w-80 group">
              <Search
                className="absolute left-0 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-atelier-tan transition-colors"
                size={16}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH ARTICLES..."
                className="w-full bg-transparent border-b border-atelier-ink/10 py-2 pl-8 text-[10px] tracking-widest font-sans focus:outline-none focus:border-atelier-tan transition-all"
              />
            </div>
          </div>

          {filteredArticles?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
              {filteredArticles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-atelier-ink/10">
              <p className="font-serif italic opacity-40">
                No matching entries found in this issue.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MagazineDetail;
