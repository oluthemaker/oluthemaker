import React, { useEffect, useState } from "react";
import useSEO from "../hooks/useSEO";
import useProductStore from "../store/useProductStore";
import AuctionCard from "../components/AuctionCard";

const Auctions = () => {
  useSEO({
    title: "Auctions | Atelier Reserve",
    description: "Browse our timed reserve auctions and participate in exclusive piece bidding.",
  });

  const { fetchProducts, products, isLoading } = useProductStore();
  const [auctionProducts, setAuctionProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (products?.length) {
      const filtered = products.filter((item) => item.isAuction === true);
      setAuctionProducts(filtered);
    }
  }, [products]);

  return (
    <main className="min-h-screen bg-atelier-paper px-6 py-12 md:px-12 md:py-16">
      {/* Header Section */}
      <header className="mb-12 border-b border-atelier-ink/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif italic mb-2">Live Auctions</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-mono font-bold">
            Timed Reserve Bidding & Private Catalog
          </p>
        </div>

        <div className="text-[10px] tracking-[0.2em] uppercase font-mono opacity-60">
          Active Events: {auctionProducts.length}
        </div>
      </header>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="py-24 text-center text-[10px] tracking-widest uppercase opacity-40 font-mono">
          Loading Auction Catalog...
        </div>
      ) : auctionProducts.length === 0 ? (
        <div className="py-24 border border-dashed border-atelier-ink/20 text-center">
          <p className="font-serif italic text-lg opacity-60 mb-2">No Active Auctions</p>
          <span className="text-[9px] tracking-widest uppercase opacity-40 font-mono block">
            Check back soon for upcoming reserve events.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {auctionProducts.map((product, index) => (
            <AuctionCard key={product._id || index} product={product} index={index} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Auctions;
