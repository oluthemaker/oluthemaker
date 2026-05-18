import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const processSteps = [
  {
    number: "01",
    title: "The Dialogue & Measure",
    description:
      "Whether in our Lagos studio, London pop-up, or via a digital consultation, we begin by discussing your lifestyle, aesthetic preferences, and biomechanics. Precise measurements and foot impressions are taken.",
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: "02",
    title: "Carving the Last",
    description:
      "A block of hornbeam wood is hand-carved to replicate the exact anatomy of your foot. This wooden 'last' becomes your personal blueprint, kept in our archives for all future commissions.",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/lastbench_vzjakh.jpg",
  },
  {
    number: "03",
    title: "Welting the Sole",
    description:
      "A block of hornbeam wood is hand-carved to replicate the exact anatomy of your foot. This wooden 'last' becomes your personal blueprint, kept in our archives for all future commissions.",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1778750901/craftsmanship_k4db0r.jpg",
  },
  {
    number: "04",
    title: "The Fitting Shoe",
    description:
      "Before cutting into your chosen exhibition-grade leather, we build a prototype shoe. During the fitting, we assess the volume, instep, and heel grip, making micro-adjustments to the wooden last.",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1778750903/machine_xfydmy.jpg",
  },
  {
    number: "05",
    title: "The Final Commission",
    description:
      "Over 200 individual steps culminate in the final hand-welted pair. Hand-dyed, hand-stitched, and meticulously polished, your shoes are delivered with bespoke lasted shoetrees.",
    image:
      "https://images.unsplash.com/photo-1616406432452-07bc5938759d?q=80&w=1200&auto=format&fit=crop",
  },
];

const Bespoke = () => {
  useSEO({
    title: "Bespoke | Olú THE MAKER",
    description: "The Art of the Commission",
  });

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-32 md:mb-56 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <span className="text-[10px] tracking-[0.5em] uppercase font-sans font-bold text-atelier-tan">
            Bespoke
          </span>
          <h1 className="text-5xl md:text-9xl font-serif italic tracking-tighter leading-[0.85]">
            The Art of the <br />
            <span className="not-italic">Commission</span>
          </h1>
          <p className="text-xl md:text-2xl font-serif italic opacity-70 leading-relaxed pt-10 max-w-2xl mx-auto">
            A bespoke pair of shoes is not merely purchased; it is commissioned.
            A dialogue resulting in a silhouette unique to your anatomy.
          </p>
        </motion.div>
      </section>

      {/* THE PROCESS (Full Width Horizontal Layout) */}
      <section className="space-y-40 md:space-y-64 mb-60">
        {processSteps.map((step, index) => (
          <div key={step.number} className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              {/* IMAGE BLOCK - Now 4:3 Ratio */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="md:col-span-8 relative aspect-[4/3] overflow-hidden bg-atelier-ink/5 shadow-sm"
              >
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              </motion.div>

              {/* TEXT BLOCK - Positioned to the side/bottom */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="md:col-span-4 md:pl-12 pb-4 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-serif italic opacity-20">
                    {step.number}
                  </span>
                  <div className="h-[1px] flex-grow bg-atelier-ink/10" />
                </div>

                <h2 className="text-4xl md:text-5xl font-serif italic tracking-tighter leading-tight">
                  {step.title}
                </h2>

                <p className="text-lg font-serif italic opacity-70 leading-relaxed">
                  {step.description}
                </p>

                <div className="pt-4">
                  <span className="text-[9px] tracking-[0.4em] uppercase font-sans font-bold opacity-30">
                    Phase {step.number} / 04
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
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
                Bespoke commissions begin at $2,500. Prices adjust based on the
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

export default Bespoke;
