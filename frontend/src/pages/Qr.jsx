import React, { useEffect } from "react";
import useSEO from "../hooks/useSEO";
import useProductStore from "../store/useProductStore";
import whatsapp from "../assets/whatsapp.png";
import mail from "../assets/mail.png";
import instagram from "../assets/instagram.png";
import x from "../assets/x.png";




const Qr = () => {
  useSEO({
    title: "Connect",
    description:
      "Discover the Atelier, explore our work, and connect with us.",
  });

  const { magazines, fetchProducts, loading } = useProductStore();

  useEffect(() => {
    fetchProducts(); // Refresh data on mount
  }, [fetchProducts]);


  // ==========================================================
  // DISCOVER DATA
  // Easy to replace these with API/CMS data later.
  // ==========================================================

  const discoverItems = [
    {
      label: "Website",
      title: "Explore the Commissions",
      href: "https://oluthemaker.com",
      image: "https://res.cloudinary.com/ds78nckog/image/upload/v1786448698/IMG_3584_qen1aq.png",
      alt: "Olú The Maker commission",
    },
    {
      label: "Collection",
      title: "View our store",
      href: "https://oluthemaker.com/store",
      image: "https://images.pexels.com/photos/6764994/pexels-photo-6764994.jpeg",
      alt: "Olú The Maker footwear collection",
    },
    {
      label: "Printed Matter",
      title: "Read Our Magazines",
      href: "https://oluthemaker.com/magazine",
      image: magazines[0]?.images[0],
      alt: "Olú The Maker magazine",
    },
  ];

  // ==========================================================
  // CONNECT / FOLLOW DATA
  // ==========================================================

  const connectItems = [
    {
      label: "WhatsApp",
      title: "Start a conversation",
      href: "https://wa.me/2348162317196",
      image: whatsapp,
      alt: "WhatsApp",
    },
    {
      label: "Email",
      title: "info@oluthemaker.com",
      href: "mailto:info@oluthemaker.com",
      image: mail,
      alt: "Email",
    },
    {
      label: "Instagram",
      title: "@oluthemaker",
      href: "https://instagram.com/oluthemaker",
      image: instagram,
      alt: "Instagram",
    },
    {
      label: "X",
      title: "@oluthemaker",
      href: "https://x.com/oluthemaker",
      image: x,
      alt: "X",
    },
  ];

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">

        {/* =====================================================
            BRAND
        ====================================================== */}
        <header className="text-center mb-24">
          <div className="flex justify-center mb-8">
            {/* Replace with actual logo */}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-tight mt-4 leading-none">
            Olú THE MAKER
          </h1>

          <p className="text-lg font-serif italic opacity-60 mt-5 leading-relaxed">
            Footwear, crafted with intention.
          </p>
        </header>


        {/* =====================================================
            ABOUT
        ====================================================== */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] tracking-[0.45em] uppercase font-sans font-bold opacity-40">
              About
            </span>

            <div className="h-px bg-atelier-ink/10 flex-1" />
          </div>

          <p className="font-serif text-xl md:text-2xl leading-relaxed">
            We create considered footwear for people who appreciate
            the beauty of things made slowly, thoughtfully, and by hand.
          </p>

          <p className="font-serif italic text-base opacity-60 leading-relaxed mt-6">
            From the first sketch to the final stitch, every pair carries
            the character of the hands that made it.
          </p>
        </section>


        {/* =====================================================
            DISCOVER
        ====================================================== */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] tracking-[0.45em] uppercase font-sans font-bold opacity-40">
              Discover
            </span>

            <div className="h-px bg-atelier-ink/10 flex-1" />
          </div>


          <div className="space-y-8">

            {discoverItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden aspect-[3/4] bg-atelier-ink/5">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-atelier-ink/0 group-hover:bg-atelier-ink/5 transition-colors duration-500" />
                </div>


                {/* TEXT */}
                <div className="flex items-center justify-between py-5 border-b border-atelier-ink/10">

                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.35em] font-sans opacity-40 mb-2">
                      {item.label}
                    </span>

                    <span className="font-serif text-xl">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xl opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    →
                  </span>

                </div>

              </a>
            ))}

          </div>
        </section>


        {/* =====================================================
            CONNECT + FOLLOW
        ====================================================== */}
        <section className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] tracking-[0.45em] uppercase font-sans font-bold opacity-40">
              Connect & Follow
            </span>

            <div className="h-px bg-atelier-ink/10 flex-1" />
          </div>


          <div className="grid grid-cols-2 gap-3">

            {connectItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  item.href.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="group border border-atelier-ink/10 p-5 min-h-[150px] flex flex-col justify-between hover:bg-atelier-ink hover:text-atelier-paper transition-colors duration-300"
              >

                {/* ICON / IMAGE */}
                <div className="w-8 h-8">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </div>


                {/* TEXT */}
                <div className="mt-8">
                  <span className="block text-[9px] uppercase tracking-[0.3em] font-sans opacity-40 group-hover:opacity-60 mb-2">
                    {item.label}
                  </span>

                  <span className="font-serif text-base">
                    {item.title}
                  </span>
                </div>

              </a>
            ))}

          </div>
        </section>


        {/* =====================================================
            LOCATION / FOOTER
        ====================================================== */}
        <footer className="text-center pt-12 border-t border-atelier-ink/10">

          <p className="text-[9px] tracking-[0.45em] uppercase font-sans opacity-40 mb-5">
            Olú THE MAKER
          </p>
          <p className="font-serif italic opacity-60">
            Lagos, Nigeria | London, UK
          </p>
          <div className="h-12 w-px bg-atelier-tan mx-auto mt-8" />
        </footer>

      </div>
    </main>
  );
};

export default Qr;
