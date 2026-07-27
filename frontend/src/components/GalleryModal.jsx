import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GALLERY_IMAGES = [
  {
    url: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_1600/v1785146486/IMG_0797_vr74yy.png",
    thumb: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_600/v1785146486/IMG_0797_vr74yy.png",
    caption: "Plate N° 01 — Craftsmanship & Details",
  },
  {
    url: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_1600/v1785146481/IMG_0798_apiyyw.png",
    thumb: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_600/v1785146481/IMG_0798_apiyyw.png",
    caption: "Plate N° 02 — Finishing Touches",
  },
  {
    url: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_1600/v1785146401/IMG_0712_yqo5fa.png",
    thumb: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_600/v1785146401/IMG_0712_yqo5fa.png",
    caption: "Plate N° 03 — Material Archival",
  },
  {
    url: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_1600/v1785146394/IMG_0687_vslrlk.png",
    thumb: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_600/v1785146394/IMG_0687_vslrlk.png",
    caption: "Plate N° 04 — Workshop Perspectives",
  },
  {
    url: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_1600/v1785146345/IMG_0752_nbvizo.png",
    thumb: "https://res.cloudinary.com/ds78nckog/image/upload/f_auto,q_auto,w_600/v1785146345/IMG_0752_nbvizo.png",
    caption: "Plate N° 05 — The Final Last",
  },
];

const GalleryModal = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(null); // null = Grid View; number = Lightbox View

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const handlePrev = () => {
    setSelectedIdx((prev) =>
      prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        if (selectedIdx !== null) setSelectedIdx(null);
        else onClose();
      }
      if (selectedIdx !== null) {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIdx]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-atelier-ink/95 backdrop-blur-md text-white overflow-y-auto"
      >
        {/* --- STICKY TOP NAVIGATION BAR --- */}
        <nav className="sticky top-0 z-30 bg-atelier-ink/95 backdrop-blur-md border-b border-white/10 px-6 md:px-12 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-white/50">
              Gallery
            </span>
            {selectedIdx !== null && (
              <button
                onClick={() => setSelectedIdx(null)}
                className="text-[10px] font-mono underline opacity-70 hover:opacity-100 transition-opacity"
              >
                ← BACK TO GRID
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-[10px] tracking-[0.3em] uppercase border border-white/20 px-4 py-2 hover:bg-white hover:text-atelier-ink transition-all"
          >
            [ Close ]
          </button>
        </nav>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="p-6 md:p-12 flex flex-col justify-between min-h-[calc(100vh-89px)]">
          {/* VIEW 1: THUMBNAIL GRID */}
          {selectedIdx === null ? (
            <div className="my-6 max-w-7xl mx-auto w-full">


              {/* Editorial Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {GALLERY_IMAGES.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    className="group cursor-pointer space-y-3"
                  >
                    <div className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden relative">
                      <img
                        src={item.thumb}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3 bg-atelier-ink/80 backdrop-blur-sm px-2 py-0.5 text-[9px] font-mono tracking-widest border border-white/10">
                        0{idx + 1}
                      </div>
                    </div>
                    <p className="font-serif italic text-xs text-white/70 group-hover:text-white transition-colors">
                      {item.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VIEW 2: FULLSCREEN LIGHTBOX FOCUS */
            <div className="relative flex-1 flex flex-col justify-between my-4 overflow-hidden">
              <div className="relative flex-1 flex items-center justify-center min-h-[50vh]">
                <button
                  onClick={handlePrev}
                  className="absolute left-0 z-20 text-xs tracking-widest uppercase hover:opacity-50 p-4 transition-opacity hidden md:block"
                >
                  ← Prev
                </button>

                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="h-full max-h-[65vh] aspect-[4/5] md:aspect-[3/4] relative"
                >
                  <img
                    src={GALLERY_IMAGES[selectedIdx].url}
                    alt={GALLERY_IMAGES[selectedIdx].caption}
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <button
                  onClick={handleNext}
                  className="absolute right-0 z-20 text-xs tracking-widest uppercase hover:opacity-50 p-4 transition-opacity hidden md:block"
                >
                  Next →
                </button>
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-6 z-10 mt-8">
                <p className="font-serif italic text-sm text-white/70">
                  {GALLERY_IMAGES[selectedIdx].caption}
                </p>

                <div className="flex gap-3 items-center">
                  <span className="text-[10px] font-mono opacity-50 mr-2">
                    [ 0{selectedIdx + 1} / 0{GALLERY_IMAGES.length} ]
                  </span>
                  {GALLERY_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-8 h-[2px] transition-all ${
                        selectedIdx === idx ? "bg-white" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GalleryModal;
