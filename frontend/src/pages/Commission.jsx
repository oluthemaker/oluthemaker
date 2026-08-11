import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

// Define MTM Last Profiles with placeholder images and specs
const MTM_PROFILES = [
  {
    id: "profile-1",
    name: "The Moore",
    heelHeight: "18mm",
    toeSpring: "13mm",
    fittingOptions: "F, E, EE",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1786448698/IMG_3584_qen1aq.png",
  },
  {
    id: "profile-2",
    name: "The Teemu 1",
    heelHeight: "18mm",
    toeSpring: "13mm",
    fittingOptions: "F, E, EE",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1786448698/IMG_3558_wt3pzl.png",
  },
  {
    id: "profile-3",
    name: "The Teemu 2",
    heelHeight: "18mm",
    toeSpring: "13mm",
    fittingOptions: "F, E, EE",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1786448688/IMG_3586_ouszk3.png",
  },
];

// Define Program Specifics matching the PDF document
const PROGRAM_DATA = {
  masters: {
    id: "masters",
    name: "Master's Fitting",
    badge: "Full Bespoke Experience",
    summary:
      "A personal last hand-carved to your exact anatomical measurements, complete with bespoke lasted shoetrees and full customization.",
    steps: [
      {
        number: "01",
        title: "The Dialogue & Measure",
        description:
          "Comprehensive physical anatomical assessment, foot impressions, and biomechanical analysis.",
        features: [
          "Bespoke fit with personal last",
          "Full leather swatch selection",
          "Large archive sample offering",
        ],
        image:
          "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
      },
      {
        number: "02",
        title: "Carving the Last",
        description:
          "A hornbeam wood last is hand-sculpted from scratch, replicating your exact volume and structure.",
        features: [
          "Individual custom wooden last",
          "Personal blueprint kept in archive",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/lastbench_vzjakh.jpg",
      },
      {
        number: "03",
        title: "Welting & Craftsmanship",
        description:
          "Hand-stitched construction tailored with ultra-fine density and bespoke sole finishing.",
        features: [
          "Sole stitching (12, 13, or 14 SPI)",
          "Brass Rivets (initials on sole bottom)",
          "Full, Half, or Natural Sole Paint",
          "Metal Toe Plates & Rubber Stick-on option",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/craftsmanship_k4db0r.jpg",
      },
      {
        number: "04",
        title: "The Fitting Shoe",
        description:
          "A preliminary waste-leather prototype to test volume, instep pressure, and heel grip before final leather cutting.",
        features: [
          "Trial fitting session",
          "Heel profile customisation (Pitched or Straight)",
          "Nail decorations on heel",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750903/machine_xfydmy.jpg",
      },
      {
        number: "05",
        title: "The Final Commission",
        description:
          "200+ steps resulting in a museum-grade pair supplied with luxury maintenance equipment.",
        features: [
          "Custom lasted Shoe Trees included",
          "Luxury care kit (Brush, Shine Cloth, Horn)",
          "Rubber Top piece and 1/4 Rubber Heel",
        ],
        image:
          "https://images.unsplash.com/photo-1616406432452-07bc5938759d?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  mtm: {
    id: "mtm",
    name: "Made to Measure",
    badge: "Modified Last Program",
    summary:
      "Built upon our signature last profiles with targeted leather build-ups for precise fit adjustment.",
    steps: [
      {
        number: "01",
        title: "The Selection & Measure",
        description:
          "We record your primary measurements and select from two iconic toe shape profiles.",
        features: [
          "Standard last foundation",
          "Entry-level leather swatch selection",
          "Select shoe sample offering",
        ],
        image:
          "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
      },
      {
        number: "02",
        title: "Last Modification",
        description:
          "Strategic leather fittings are added to our standard last to accommodate your instep and width.",
        features: [
          "Choice of two Toe Shape Profiles",
          "Targeted last padding/alteration programme",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/lastbench_vzjakh.jpg",
      },
      {
        number: "03",
        title: "Welting & Hand Finishing",
        description:
          "Classic hand-welted sole construction prioritizing durability and elegant finishing.",
        features: [
          "Standard sole stitching (11 SPI)",
          "Brass Rivets (initials on sole bottom)",
          "Full, Half, or Natural Sole Paint",
          "Metal Toe Plates & Rubber Stick-on option",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/craftsmanship_k4db0r.jpg",
      },
      {
        number: "04",
        title: "Heel & Silhouette Styling",
        description:
          "Fine-tuning the heel stance and sole contours to match your aesthetic preference.",
        features: [
          "Heel Profile customisation (Pitched or Straight)",
          "Balanced proportion check",
        ],
        image:
          "https://res.cloudinary.com/ds78nckog/image/upload/v1778750903/machine_xfydmy.jpg",
      },
      {
        number: "05",
        title: "Delivery & Presentation",
        description:
          "Hand-polished and finished with protective sole treatments.",
        features: [
          "Rubber Top piece and 1/4 Rubber Heel",
          "Optional shoe tree addition",
        ],
        image:
          "https://images.unsplash.com/photo-1616406432452-07bc5938759d?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
};

const Commission = () => {
  const [activeProgram, setActiveProgram] = useState("masters");
  const [selectedMtmProfile, setSelectedMtmProfile] = useState(null);

  useSEO({
    title: "The Commission | Olú THE MAKER",
    description:
      "The Art of the Commission — Master's Fitting & Made to Measure",
  });

  const currentData = PROGRAM_DATA[activeProgram];

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <span className="text-[30px] font-snell text-atelier-tan">
            Olú Fadairo Shoemaker
          </span>
          <h1 className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-[0.85]">
            The Art of the <br />
            <span className="not-italic">Commission</span>
          </h1>
          <p className="text-xl md:text-2xl font-serif italic opacity-70 leading-relaxed max-w-2xl mx-auto">
            A pair of shoes is not merely purchased; it is commissioned. A
            dialogue resulting in the creation of a piece of art to behold.
          </p>
        </motion.div>
      </section>

      {/* PROGRAM SELECTOR TOGGLE */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <div className="flex justify-center border-b border-atelier-ink/10 pb-4">
          <div className="inline-flex gap-8 md:gap-16">
            <button
              onClick={() => {
                setActiveProgram("masters");
                setSelectedMtmProfile(null);
              }}
              className={`relative pb-4 text-xs md:text-sm tracking-[0.3em] uppercase font-sans font-bold transition-all ${
                activeProgram === "masters"
                  ? "text-atelier-ink opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              Master's Fitting
              {activeProgram === "masters" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-atelier-ink"
                />
              )}
            </button>

            <button
              onClick={() => setActiveProgram("mtm")}
              className={`relative pb-4 text-xs md:text-sm tracking-[0.3em] uppercase font-sans font-bold transition-all ${
                activeProgram === "mtm"
                  ? "text-atelier-ink opacity-100"
                  : "opacity-40 hover:opacity-70"
              }`}
            >
              Made to Measure
              {activeProgram === "mtm" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-atelier-ink"
                />
              )}
            </button>
          </div>
        </div>

        {/* Program Summary Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProgram}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-8 text-center space-y-2"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-atelier-tan">
              {currentData.badge}
            </span>
            <p className="text-base font-serif italic text-atelier-ink/80 max-w-xl mx-auto">
              {currentData.summary}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* MTM INTERACTIVE LAST PROFILES SECTION */}
        {activeProgram === "mtm" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 pt-8 border-t border-atelier-ink/10"
          >
            <div className="text-center mb-6">
              <span className="text-[9px] tracking-[0.3em] uppercase font-sans font-bold text-atelier-tan block">
                Select a Profile to Inspect
              </span>
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-xl mx-auto">
              {MTM_PROFILES.map((profile) => {
                const isSelected = selectedMtmProfile?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedMtmProfile(profile)}
                    className="group relative text-left focus:outline-none"
                  >
                    <div
                      className={`relative aspect-[3/4] overflow-hidden bg-atelier-ink/5 border transition-all duration-300 ${
                        isSelected
                          ? "border-atelier-tan shadow-md"
                          : "border-atelier-ink/10 hover:border-atelier-ink/40"
                      }`}
                    >
                      <motion.img
                        src={profile.image}
                        alt={profile.name}
                        animate={{ scale: isSelected ? 1.08 : 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] tracking-wider uppercase font-sans font-semibold mt-2 text-center opacity-70 group-hover:opacity-100 truncate">
                      {profile.name}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Profile Detail Viewer (Zoom In + Right Side Specs & Description) */}
            <AnimatePresence mode="wait">
              {selectedMtmProfile && (
                <motion.div
                  key={selectedMtmProfile.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="mt-10 p-6 md:p-8 bg-white/70 border border-atelier-ink/10 max-w-3xl mx-auto shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Left: Zoomed-in Image Canvas */}
                    <div className="md:col-span-6 relative aspect-[3/4] overflow-hidden bg-atelier-ink/5 border border-atelier-ink/10">
                      <motion.img
                        src={selectedMtmProfile.image}
                        alt={selectedMtmProfile.name}
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.25 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right: Description & Technical Specifications */}
                    <div className="md:col-span-6 space-y-4 text-left">
                      <div className="flex justify-between items-start border-b border-atelier-ink/10 pb-3">
                        <div>
                          <span className="text-[9px] tracking-[0.3em] uppercase font-sans font-bold text-atelier-tan block">
                            Last Profile
                          </span>
                          <h4 className="text-2xl font-serif italic font-semibold">
                            {selectedMtmProfile.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedMtmProfile(null)}
                          className="text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 pt-1"
                        >
                          Close ✕
                        </button>
                      </div>
                      {/* Specs List */}
                      <dl className="space-y-2 text-xs font-sans pt-2 border-atelier-ink/10">
                        <div className="flex justify-between border-b border-atelier-ink/5 pb-1.5">
                          <dt className="opacity-60">Heel Height</dt>
                          <dd className="font-bold">
                            {selectedMtmProfile.heelHeight}
                          </dd>
                        </div>
                        <div className="flex justify-between border-b border-atelier-ink/5 pb-1.5">
                          <dt className="opacity-60">Toe Spring</dt>
                          <dd className="font-bold">
                            {selectedMtmProfile.toeSpring}
                          </dd>
                        </div>
                        <div className="flex justify-between border-b border-atelier-ink/5 pb-1.5">
                          <dt className="opacity-60">Fitting Options</dt>
                          <dd className="font-bold">
                            {selectedMtmProfile.fittingOptions}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* THE PROCESS STEPS */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeProgram}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-40 md:space-y-56 mb-40"
        >
          {currentData.steps.map((step) => (
            <div key={step.number} className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                {/* IMAGE BLOCK */}
                <div className="md:col-span-8 relative aspect-[4/3] overflow-hidden bg-atelier-ink/5 shadow-sm">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  />
                </div>

                {/* TEXT BLOCK WITH INCLUDED FEATURES */}
                <div className="md:col-span-4 md:pl-12 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-serif italic opacity-20">
                      {step.number}
                    </span>
                    <div className="h-[1px] flex-grow bg-atelier-ink/10" />
                  </div>

                  <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter leading-tight">
                    {step.title}
                  </h2>

                  <p className="text-base font-serif italic opacity-70 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Feature Highlights List */}
                  <div className="pt-4 border-t border-atelier-ink/10 space-y-2">
                    <span className="text-[9px] tracking-[0.3em] uppercase font-sans font-bold text-atelier-tan block mb-3">
                      Programme Features
                    </span>
                    <ul className="space-y-1.5">
                      {step.features.map((feat, i) => (
                        <li
                          key={i}
                          className="text-xs font-serif italic opacity-90 flex items-center gap-2"
                        >
                          <span className="w-1 h-1 bg-atelier-tan rounded-full" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] tracking-[0.4em] uppercase font-sans font-bold opacity-30">
                      Phase {step.number} / 05
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.section>
      </AnimatePresence>

      {/* COMPARATIVE SPECIFICATION MATRIX */}
      <section className="max-w-5xl mx-auto px-6 mb-32 border-t border-atelier-ink/10 pt-24">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.5em] uppercase font-sans font-bold opacity-40">
            Specifications
          </span>
          <h3 className="text-3xl md:text-5xl font-serif italic mt-2">
            Program Comparison
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Master's Fitting Card */}
          <div className="p-8 border border-atelier-ink/10 bg-white/40 space-y-6">
            <h4 className="text-2xl font-serif italic">Master's Fitting</h4>
            <p className="text-xs font-serif italic opacity-70">
              Uncompromising bespoke construction sculpted directly to your foot
              architecture.
            </p>
            <ul className="space-y-3 text-xs font-sans tracking-wider border-t border-atelier-ink/10 pt-6">
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Fit Type</span>
                <span className="font-bold">Hand-Carved Personal Last</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Stitching Density</span>
                <span className="font-bold">12 / 13 / 14 SPI</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Heel Profile</span>
                <span className="font-bold">Pitched/Straight + Nail Art</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Shoe Trees</span>
                <span className="font-bold">Lasted Trees Included</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Personalization</span>
                <span className="font-bold">Brass Rivets (Initials)</span>
              </li>
            </ul>
          </div>

          {/* Made to Measure Card */}
          <div className="p-8 border border-atelier-ink/10 bg-white/40 space-y-6">
            <h4 className="text-2xl font-serif italic">Made to Measure</h4>
            <p className="text-xs font-serif italic opacity-70">
              Refined entry program using standardized last shapes with custom
              anatomical build-ups.
            </p>
            <ul className="space-y-3 text-xs font-sans tracking-wider border-t border-atelier-ink/10 pt-6">
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Fit Type</span>
                <span className="font-bold">
                  Spring-Line Last + Leather Fitting
                </span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Stitching Density</span>
                <span className="font-bold">11 SPI</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Heel Profile</span>
                <span className="font-bold">Pitched / Straight</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Shoe Trees</span>
                <span className="font-bold">Optional Addition</span>
              </li>
              <li className="flex justify-between border-b border-atelier-ink/5 pb-2">
                <span className="opacity-60">Personalization</span>
                <span className="font-bold">Brass Rivets (Initials)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* LEAD TIME & PRICING */}
      <section className="bg-atelier-ink text-white py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter">
            Expectations & Investment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-y border-white/10 py-16">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold text-atelier-tan block mb-6">
                Timeline
              </span>
              <p className="font-serif text-lg italic opacity-80 leading-relaxed">
                Initial commissions require approximately 6 to 8 months,
                allowing time for the trial fitting and last refinements.
                Subsequent commissions on your established last take 4 to 6
                months.
              </p>
            </div>
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold text-atelier-tan block mb-6">
                Investment
              </span>
              <p className="font-serif text-lg italic opacity-80 leading-relaxed">
                Commissions begin at $2,500. Prices adjust based on the
                complexity of the pattern and the rarity of the chosen hides
                (e.g., Museum Calf, Shell Cordovan, or Exotics).
              </p>
            </div>
          </div>

          <div className="pt-12">
            <Link
              to="/contact"
              className="inline-block px-16 py-6 bg-white text-atelier-ink text-[10px] tracking-[0.4em] font-sans font-bold hover:bg-atelier-tan hover:text-white transition-all duration-500 uppercase"
            >
              Request a Consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Commission;
