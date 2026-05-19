import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu } from "lucide-react";
import CartDrawer from "./CartDrawer";
import useUserStore from "../store/useUserStore"; // Import your store
import useCartStore from "../store/useCartStore";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state
  const { isAuthenticated, user } = useUserStore();
  const { cartItems, setIsCartOpen } = useCartStore();
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const MobileMenu = ({ isOpen, onClose, isAuthenticated }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-atelier-paper animate-in fade-in slide-in-from-top-full duration-500">
        <div className="flex flex-col h-full p-8 pt-20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-[10px] tracking-[0.3em] uppercase font-bold opacity-40 hover:opacity-100 transition-opacity"
          >
            Close
          </button>

          <nav className="flex flex-col space-y-8 mt-12">
            <Link
              to="/store"
              onClick={onClose}
              className="text-5xl font-serif italic"
            >
              Store
            </Link>
            <Link
              to="/magazine"
              onClick={onClose}
              className="text-5xl font-serif italic"
            >
              Magazine
            </Link>
            <Link
              to="/journal"
              onClick={onClose}
              className="text-5xl font-serif italic"
            >
              Journal
            </Link>

            <div className="pt-12 border-t border-atelier-ink/10 flex flex-col space-y-6">
              <Link
                to={isAuthenticated ? "/profile" : "/auth"}
                onClick={onClose}
                className="text-[11px] tracking-[0.4em] uppercase font-bold text-atelier-tan"
              >
                {isAuthenticated ? "My Account" : "Sign In / Register"}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="border-b border-atelier-ink/10 bg-atelier-paper sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left Links (Desktop) */}
          <div className="hidden md:flex space-x-8 text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
            <Link
              to="/magazine"
              className="hover:text-atelier-tan transition-colors"
            >
              Magazine
            </Link>
            <Link
              to="/journal"
              className="hover:text-atelier-tan transition-colors"
            >
              Journal
            </Link>
            <Link
              to="/store"
              className="hover:text-atelier-tan transition-colors"
            >
              Store
            </Link>
          </div>

          {/* Center Identity - Adjusted for Mobile Left Alignment */}
          <div className="relative md:absolute md:left-1/2 md:-translate-x-1/2 text-center z-10 pointer-events-none">
            <Link
              to="/"
              className="text-2xl lg:text-3xl font-serif tracking-tighter uppercase italic pointer-events-auto"
            >
              <span className="not-italic font-normal">Olú THE MAKER</span>
            </Link>
          </div>

          {/* Right Icons - Reordered for Burger Far Right */}
          <div className="flex items-center space-x-4 md:space-x-6 z-20">
            <Link
              to={isAuthenticated ? "/profile" : "/auth"}
              className="hover:text-atelier-tan transition-colors opacity-80 flex items-center gap-2 group"
            >
              <User size={18} strokeWidth={1.5} />
              {isAuthenticated && (
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold hidden lg:block group-hover:text-atelier-tan transition-colors">
                  {user?.user?.name?.split(" ")[0] || "Client"}
                </span>
              )}
            </Link>

            {/* Bag Toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-atelier-tan transition-colors opacity-80"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-atelier-ink text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Burger Menu */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAuthenticated={isAuthenticated}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
};

export default Navbar;
