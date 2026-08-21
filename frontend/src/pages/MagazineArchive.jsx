import React, { useEffect, useState, useMemo, useRef } from "react";
import MagazineCard from "../components/MagazineCard";
import useProductStore from "../store/useProductStore";
import useSEO from "../hooks/useSEO";

const MagazineArchive = () => {
  const { magazines, fetchProducts, loading } = useProductStore();
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useSEO({
    title: "Magazine Archive",
    description:
      "A seasonal exploration of footwear, philosophy, and the hands that build them.",
  });

  // Extract unique available years sorted newest first
  const availableYears = useMemo(() => {
    if (!magazines || magazines.length === 0) return [];
    const years = magazines
      .map((item) => item?.magazineDetails?.year)
      .filter(Boolean);

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [magazines]);

  // Filter magazines based on selection
  const filteredMagazines = useMemo(() => {
    if (selectedYear === "ALL") return magazines;
    return magazines.filter(
      (item) => String(item?.magazineDetails?.year) === String(selectedYear)
    );
  }, [magazines, selectedYear]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading && magazines.length === 0) {
    return (
      <div className="bg-atelier-paper min-h-screen flex items-center justify-center italic font-serif opacity-40">
        Opening the archive...
      </div>
    );
  }

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-40 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER & FILTER DROPDOWN */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans font-bold opacity-40 block mb-4">
              Printed Matter
            </span>
            <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter mb-6 leading-[0.9]">
              The <span className="not-italic">Archive</span>
            </h1>
            <p className="text-xl font-serif italic opacity-70 leading-relaxed">
              A seasonal exploration of footwear, philosophy, and the hands that
              build them.
            </p>
          </div>

          {/* ELEGANT ATELIER DROPDOWN */}
          {availableYears.length > 0 && (
            <div className="relative self-start md:self-end" ref={dropdownRef}>
              <span className="text-[9px] tracking-[0.3em] uppercase font-sans font-bold opacity-40 block mb-2">
                Filter by Edition Year
              </span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-6 border-b border-atelier-ink pb-2 min-w-[180px] text-left text-[11px] tracking-[0.25em] uppercase font-sans font-bold transition-opacity hover:opacity-70"
              >
                <span>
                  {selectedYear === "ALL" ? "All Years" : `Edition ${selectedYear}`}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full bg-atelier-paper border border-atelier-ink/10 shadow-xl z-30 max-h-60 overflow-y-auto no-scrollbar py-2">
                  <button
                    onClick={() => {
                      setSelectedYear("ALL");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase font-sans font-bold transition-colors ${
                      selectedYear === "ALL"
                        ? "bg-atelier-ink text-white"
                        : "hover:bg-atelier-ink/5 opacity-70 hover:opacity-100"
                    }`}
                  >
                    All Years
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase font-sans font-bold transition-colors ${
                        String(selectedYear) === String(year)
                          ? "bg-atelier-ink text-white"
                          : "hover:bg-atelier-ink/5 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20">
          {filteredMagazines?.length > 0 ? (
            filteredMagazines.map((issue) => (
              <MagazineCard key={issue._id} issue={issue} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-y border-atelier-ink/5">
              <p className="font-serif italic opacity-40">
                No issues found for {selectedYear === "ALL" ? "the archive" : selectedYear}.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER CALLOUT */}
        <div className="mt-40 pt-20 border-t border-atelier-ink/5 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase font-sans opacity-40 mb-6">
            Physical copies available at the Atelier
          </p>
          <div className="inline-block h-12 w-[1px] bg-atelier-tan" />
        </div>
      </div>
    </main>
  );
};

export default MagazineArchive;
