import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../../hooks/useSEO";

const lastsData = [
  {
    id: "last1",
    name: "The Classic",
    subName: "Form 001 / Round",
    description:
      "A timeless silhouette, balanced for the traditional gentleman.",
    modalContent:
      "The Classic last is the foundation of the Olú collection. Designed for premium box calf leather, it features a generous toe box.",
    specs: {
      ToeShape: "Rounded",
      IntendedUse: "Formal / Dress",
      FitProfile: "Standard",
      Construction: "Traditional Hand-Welted",
    },
    // Adjust these percentages to line up with the lasts on your shelf image
    coords: { x: "10%", y: "45%" },
  },
  {
    id: "last2",
    name: "The Sporty",
    subName: "Form 002 / Kinetic",
    description:
      "Engineered for movement, without sacrificing the atelier aesthetic.",
    modalContent:
      "Form 002 is inspired by 1960s tennis silhouettes but built with dress shoe precision.",
    specs: {
      ToeShape: "Soft Square",
      IntendedUse: "Casual / Travel",
      FitProfile: "Wide",
      Construction: "Modern Bluberi",
    },
    coords: { x: "42%", y: "42%" },
  },
  {
    id: "last3",
    name: "The Elegant",
    subName: "Form 003 / Taper",
    description:
      "A sharp, aggressive silhouette for the contemporary sartorialist.",
    modalContent:
      "The Elegant last is our most technical form. It tapers sharply at the toe to create a 'chisel' effect.",
    specs: {
      ToeShape: "Tapered Chisel",
      IntendedUse: "Formal / Gala",
      FitProfile: "Slim",
      Construction: "Refined Italian",
    },
    coords: { x: "75%", y: "48%" },
  },
  {
    id: "last3",
    name: "The Elegant",
    subName: "Form 003 / Taper",
    description:
      "A sharp, aggressive silhouette for the contemporary sartorialist.",
    modalContent:
      "The Elegant last is our most technical form. It tapers sharply at the toe to create a 'chisel' effect.",
    specs: {
      ToeShape: "Tapered Chisel",
      IntendedUse: "Formal / Gala",
      FitProfile: "Slim",
      Construction: "Refined Italian",
    },
    coords: { x: "15%", y: "80%" },
  },
];

const OurLasts = () => {
  const [selectedLast, setSelectedLast] = useState(null);

  useSEO({
    title: "The Last Archive | Olú THE MAKER",
    description: "Explore the architectural foundations of our footwear.",
  });

  return (
    <div className="relative w-full h-screen bg-atelier-ink overflow-hidden flex items-center justify-center p-4">
      {/* 1. ASPECT RATIO CONTAINER - Keeps dots pinned to image pixels regardless of screen size */}
      <div className="relative w-full max-w-[1200px] aspect-[4/3] group">
        <img
          src="https://res.cloudinary.com/ds78nckog/image/upload/v1778748095/ourlasts_l4aifi.jpg"
          alt="Artisan Shoe Lasts on Shelf"
          className="w-full h-full object-cover rounded-sm opacity-80 border border-atelier-paper/10"
        />

        {/* 2. INTERACTIVE HOTSPOTS */}
        {lastsData.map((last) => (
          <motion.div
            key={last.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: last.coords.x, top: last.coords.y }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <button
              onClick={() => setSelectedLast(last)}
              className="relative flex items-center justify-center w-10 h-10 group/dot"
            >
              <span className="absolute inset-0 rounded-full bg-atelier-paper animate-ping opacity-20"></span>
              <span className="relative w-3.5 h-3.5 rounded-full bg-atelier-paper border border-atelier-ink shadow-2xl transition-transform group-hover/dot:scale-125"></span>

              <span className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-atelier-ink text-atelier-paper text-[9px] tracking-widest uppercase px-3 py-1 opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none border border-atelier-paper/20">
                {last.name}
              </span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* 3. OVERLAY TEXT (Fixed Position) */}
      <div className="absolute top-12 left-8 md:left-16 pointer-events-none">
        <h1 className="text-3xl md:text-6xl font-serif italic text-atelier-paper/90 tracking-tighter">
          The Last Archive
        </h1>
        <p className="text-[9px] tracking-[0.4em] uppercase text-atelier-paper/40 mt-2">
          Select a form to view specifications
        </p>
      </div>

      {/* 4. MODAL */}
      <AnimatePresence>
        {selectedLast && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLast(null)}
              className="fixed inset-0 bg-atelier-ink/95 backdrop-blur-md z-[100] cursor-zoom-out"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-10 pointer-events-none"
            >
              <div className="bg-atelier-paper text-atelier-ink p-6 md:p-16 max-w-4xl w-full pointer-events-auto shadow-2xl relative overflow-y-auto max-h-[90vh]">
                {/* Fixed "Close" for Mobile accessibility */}
                <button
                  onClick={() => setSelectedLast(null)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 text-[11px] tracking-[0.2em] uppercase font-bold hover:opacity-50 p-2"
                >
                  Close ✕
                </button>

                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start mt-8 md:mt-0">
                  <div className="space-y-4">
                    <span className="text-[9px] tracking-[0.4em] uppercase opacity-40">
                      Sheet No. {selectedLast.id}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-serif italic leading-none">
                      {selectedLast.name}
                    </h2>
                    <p className="font-serif text-base md:text-lg italic opacity-70 leading-relaxed pt-4">
                      {selectedLast.modalContent}
                    </p>
                  </div>

                  <div className="bg-atelier-ink/[0.03] p-6 md:p-10 space-y-6 border border-atelier-ink/5">
                    {Object.entries(selectedLast.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="border-b border-atelier-ink/10 pb-3 last:border-0"
                      >
                        <p className="text-[8px] tracking-[0.3em] uppercase opacity-40 mb-1">
                          {key}
                        </p>
                        <p className="font-serif text-lg md:text-xl italic">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OurLasts;
