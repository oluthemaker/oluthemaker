import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, AlertTriangle, RefreshCw } from "lucide-react";
import useCartStore from "../store/useCartStore";
import API from "../api/axios";

const formatNGN = (amount) => `₦${Number(amount || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, syncWithCatalogue } = useCartStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  useEffect(() => {
    if (!isCartOpen) return undefined;
    let cancelled = false;
    const refreshCatalogue = async () => {
      setIsRefreshing(true);
      setRefreshError("");
      try {
        const { data } = await API.get("/products");
        if (!cancelled) syncWithCatalogue(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) setRefreshError(error.response?.data?.message || "We couldn't refresh availability. We'll verify your cart again at checkout.");
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };
    refreshCatalogue();
    return () => { cancelled = true; };
  }, [isCartOpen, syncWithCatalogue]);

  const subtotal = useMemo(() => cartItems.reduce((total, item) => total + Number(item.price || 0) * item.qty, 0), [cartItems]);
  const hasUnavailableItems = cartItems.some((item) => !item.isAvailable || (item.availableStock != null && item.qty > item.availableStock));

  const handleCheckout = () => {
    if (hasUnavailableItems || isRefreshing) return;
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.button aria-label="Close cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-atelier-ink/40 backdrop-blur-sm z-[60]" />
          <motion.aside role="dialog" aria-modal="true" aria-label="Shopping cart" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-atelier-paper shadow-2xl z-[70] flex flex-col">
            <header className="p-6 md:p-8 border-b border-atelier-ink/10 flex justify-between items-center">
              <div>
                <h2 className="text-[11px] tracking-[0.5em] uppercase font-sans font-bold">Your Selection</h2>
                <p className="text-[10px] opacity-50 mt-2">{cartItems.reduce((sum, item) => sum + item.qty, 0)} item(s)</p>
              </div>
              <button type="button" aria-label="Close cart" onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300"><X size={20} strokeWidth={1} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7">
              {isRefreshing && <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-50"><RefreshCw size={12} className="animate-spin"/> Checking current availability</p>}
              {refreshError && <p role="status" className="text-xs bg-amber-900/5 border border-amber-900/20 p-3">{refreshError}</p>}

              {cartItems.length > 0 ? cartItems.map((item) => {
                const quantityLimitReached = item.availableStock != null && item.qty >= item.availableStock;
                const lineTotal = Number(item.price || 0) * item.qty;
                return (
                  <article key={item.cartItemId} className="flex gap-4 relative group">
                    <div className="w-24 shrink-0 aspect-[4/5] bg-atelier-ink/5 overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><ShoppingBag size={24}/></div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div className="pr-7">
                        <h3 className="font-serif italic text-lg leading-tight">{item.name}</h3>
                        <div className="space-y-1 mt-2 text-[9px] tracking-widest uppercase opacity-60">
                          {item.format && <p>Format: {item.format}</p>}
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Colour: {item.color}</p>}
                          {item.width && <p>Width: {item.width}</p>}
                          {item.material && <p>Material: {item.material}</p>}
                          {item.variantSku && <p>SKU: {item.variantSku}</p>}
                        </div>
                        {!item.isAvailable && <p className="mt-2 text-[10px] text-red-800 flex items-start gap-1"><AlertTriangle size={12} className="shrink-0 mt-0.5"/>{item.availabilityMessage || "Currently unavailable"}</p>}
                        {item.isAvailable && item.availableStock != null && item.availableStock <= 5 && <p className="mt-2 text-[10px] text-amber-800">Only {item.availableStock} left</p>}
                        {item.availableStock != null && item.qty > item.availableStock && <p className="mt-2 text-[10px] text-red-800">Quantity exceeds current stock. Reduce quantity to continue.</p>}
                      </div>
                      <div className="flex justify-between items-end gap-3 mt-4">
                        <div className="flex items-center border border-atelier-ink/10">
                          <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQuantity(item.cartItemId, item.qty - 1)} className="p-2 hover:bg-atelier-ink/5 disabled:opacity-30"><Minus size={12}/></button>
                          <span aria-live="polite" className="px-3 text-xs font-sans tabular-nums">{item.qty}</span>
                          <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={quantityLimitReached} onClick={() => updateQuantity(item.cartItemId, item.qty + 1)} className="p-2 hover:bg-atelier-ink/5 disabled:opacity-30"><Plus size={12}/></button>
                        </div>
                        <span className="font-sans text-sm tabular-nums">{formatNGN(lineTotal)}</span>
                      </div>
                    </div>
                    <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.cartItemId)} className="absolute top-1 right-0 opacity-40 hover:opacity-100 hover:text-red-800 transition-all"><Trash2 size={16}/></button>
                  </article>
                );
              }) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={28} strokeWidth={1} className="opacity-30 mb-5"/>
                  <p className="font-serif italic opacity-50 mb-4">The atelier is currently empty.</p>
                  <Link to="/store" onClick={() => setIsCartOpen(false)} className="text-[10px] tracking-widest uppercase border-b border-atelier-ink pb-1">Return to Store</Link>
                </div>
              )}
            </div>

            {cartItems.length > 0 && <footer className="p-6 md:p-8 bg-white border-t border-atelier-ink/10 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Subtotal</span><span className="tabular-nums">{formatNGN(subtotal)}</span></div>
                <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Shipping</span><span>Calculated at checkout</span></div>
                <div className="flex justify-between font-sans font-bold pt-4 border-t border-atelier-ink/5"><span className="text-[11px] tracking-[0.3em] uppercase">Subtotal Due</span><span className="tabular-nums">{formatNGN(subtotal)}</span></div>
              </div>
              <button type="button" onClick={handleCheckout} disabled={hasUnavailableItems || isRefreshing} className="w-full bg-atelier-ink text-white py-5 text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-atelier-tan transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{isRefreshing ? "Checking Availability…" : hasUnavailableItems ? "Review Unavailable Items" : "Proceed to Checkout"}</button>
              <p className="text-[9px] text-center opacity-40 italic font-serif">Final prices and stock are confirmed securely at checkout.</p>
            </footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
