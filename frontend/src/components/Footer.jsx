import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "@formspree/react";
import { Instagram, Youtube, Facebook } from "lucide-react";
import AnalogClock from "../components/AnalogClock"; // Ensure path is correct

export const TikTokIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a4 4 0 0 0-4 4" />
  </svg>
);

const Footer = ({ navLinks = [] }) => {
  const [state, handleSubmit] = useForm("xeokgazj");

  const defaultNavigation = [
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "FAQ", path: "/faq" },
    { name: "Shipping", path: "/shipping" },
    { name: "Terms", path: "/terms" },
    { name: "Privacy", path: "/privacy" },
    { name: "Cookies", path: "/cookies" },
    { name: "Our Lasts", path: "/our-lasts" },
    { name: "Glossary", path: "/glossary" },
  ];

  const footerLinks = navLinks.length > 0 ? navLinks : defaultNavigation;

  return (
    <footer className="bg-atelier-paper pt-20 px-6 md:px-12 lg:px-24 border-t border-atelier-ink/10 text-atelier-ink">
      {/* SECTION 1: THE ATELIERS (Locations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-20 max-w-7xl mx-auto">
        {/* England */}
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif italic mb-2">44</span>
            <AnalogClock timezoneOffset={0} />
          </div>
          <div className="text-sm tracking-wide leading-relaxed pt-2 uppercase font-sans opacity-80">
            <p className="font-bold mb-1">Northampton Studio</p>
            <p>St James End, NN5</p>
            <p>United Kingdom</p>
            <p className="mt-4 italic lowercase">london@oluthemaker.com</p>
          </div>
        </div>

        {/* Lagos */}
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif italic mb-2">234</span>
            <AnalogClock timezoneOffset={1} />
          </div>
          <div className="text-sm tracking-wide leading-relaxed pt-2 uppercase font-sans opacity-80">
            <p className="font-bold mb-1">Lagos Workshop</p>
            <p>Victoria Island</p>
            <p>Lagos, Nigeria</p>
            <p className="mt-4 italic lowercase">lagos@oluthemaker.com</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE JOURNAL (Newsletter + Social) */}
      <div className="border-t border-atelier-ink/10 py-16 flex flex-col lg:flex-row justify-between items-center gap-12 max-w-7xl mx-auto">
        <div className="w-full max-w-md text-center lg:text-left">
          <h3 className="font-serif italic text-2xl mb-6">Join the Journal</h3>
          {state.succeeded ? (
            <p className="text-atelier-green font-sans text-sm tracking-widest uppercase">
              Thank you for subscribing.
            </p>
          ) : (
            <form
              className="flex border-b border-atelier-ink/30 pb-2"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                id="email"
                name="email"
                className="bg-transparent flex-1 py-2 text-sm focus:outline-none placeholder:text-atelier-ink/40 font-sans tracking-widest"
                required
              />
              <button
                disabled={state.submitting}
                type="submit"
                className="text-xs tracking-[0.2em] font-sans hover:text-atelier-tan transition-colors uppercase"
              >
                {state.submitting ? "Sending..." : "Subscribe"}
              </button>
            </form>
          )}
        </div>

        {/* Social Icons using Lucide for consistency */}
        <div className="flex gap-8">
          <a
            href="https://instagram.com/oluthemaker"
            className="hover:text-atelier-tan transition-colors"
          >
            <Instagram size={20} strokeWidth={1.2} />
          </a>
          <a
            href="https://x.com/oluthemaker"
            className="hover:text-atelier-tan transition-colors"
          >
            {/* X/Twitter custom SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>

      {/* SECTION 3: NAVIGATION LINKS */}
      <div className="pb-12 border-b border-atelier-ink/10">
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-[10px] tracking-[0.3em] uppercase font-sans opacity-70">
          {footerLinks.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="hover:opacity-100 hover:text-atelier-tan transition-all underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* SECTION 4: SIGNATURE + COPYRIGHT */}
      <div className="py-12 text-center">
        <Link to="/">
          <h2 className="text-3xl font-serif tracking-tighter uppercase mb-4 italic">
            <span className="not-italic"> Olú The Maker</span>
          </h2>
        </Link>
        <p className="text-[10px] tracking-widest opacity-50 uppercase font-sans">
          © {new Date().getFullYear()} All Rights Reserved. Crafted with
          purpose.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
