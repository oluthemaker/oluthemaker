import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const BENTO_ITEMS = [
  {
    id: "auctions",
    title: "Auctions",
    subtitle: "Timed Collector Bidding",
    description: "1-of-1 archival prototypes, bespoke trial pieces, and rare material releases.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
    link: "/auctions",
    tag: "Exclusives",
  },
  {
    id: "footwear",
    title: "Footwear",
    subtitle: "Hand-Lasted Bespoke",
    description: "Oxfords, Loafers, Derbies, and Boots made with archival European leathers.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1200&auto=format&fit=crop",
    link: "/footwear",
    tag: "Footwear",
  },
  {
    id: "leather-goods",
    title: "Leather Goods",
    subtitle: "Precision Accessories",
    description: "Wallets, card cases, belts, and luxury carry goods tailored to perfection.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
    link: "/leather-goods",
    tag: "Leather",
  },
  {
    id: "merchandise",
    title: "Merchandise",
    subtitle: "Apparel & Atelier Objects",
    description: "Heavyweight branded tees, workshop accessories, and limited studio runs.",
    image: "https://images.pexels.com/photos/18978674/pexels-photo-18978674.jpeg",
    link: "/merchandise",
    tag: "Apparel",
  },
];

const Store = () => {
  useSEO({
    title: "Store",
    description: "Explore our collection across Footwear, Leather Goods, Merchandise, and Auctions.",
  });

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        {/* --- EDITORIAL HEADER --- */}
        <header className="mb-12 border-b border-atelier-ink/10 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40 block mb-2">
              Catalog Navigation
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">
              Store
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] tracking-[0.3em] uppercase opacity-40 font-mono block">
              Curated Selection • 2026 Edition
            </span>
          </div>
        </header>

        {/* --- EQUAL 2x2 BENTO GRID VARIATION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BENTO_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={item.link}
                className="group relative flex flex-col justify-between h-[420px] md:h-[480px] p-8 border border-atelier-ink/10 bg-atelier-ink/5 overflow-hidden block"
              >
                {/* Background Image & Vignette Filter */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-atelier-paper via-atelier-paper/50 to-transparent group-hover:opacity-90 transition-opacity duration-300" />
                </div>

                {/* Top Badge Details */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="text-[9px] tracking-[0.3em] uppercase font-bold font-mono bg-atelier-paper/80 backdrop-blur-sm px-3 py-1 border border-atelier-ink/10">
                    {item.tag}
                  </span>
                  {/* <div className="w-8 h-8 rounded-full border border-atelier-ink/20 flex items-center justify-center group-hover:bg-atelier-ink group-hover:text-white transition-all">
                    <span className="text-xs">↗</span>
                  </div>*/}
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 space-y-2">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-bold opacity-50 block">
                    {/* {item.subtitle}*/}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif italic group-hover:translate-x-1 transition-transform duration-300">
                    {item.title}
                  </h2>
                  <p className="text-s font-serif leading-relaxed text-atelier-ink/80 max-w-sm">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Store;
