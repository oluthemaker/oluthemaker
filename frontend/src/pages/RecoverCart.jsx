import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios.js";
import useCartStore from "../store/useCartStore";
import useOrderStore from "../store/useOrderStore";

const RecoverCart = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const saveCurrency = useOrderStore((state) => state.saveCurrency);
  const saveCustomer = useOrderStore((state) => state.saveCustomer);
  const setAbandonedCartId = useOrderStore((state) => state.setAbandonedCartId);
  const [message, setMessage] = useState("Restoring your selection…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const { data } = await API.get(`/abandoned-carts/recover/${encodeURIComponent(token)}`, { skipAuth: true });
        if (!active) return;
        const available = (data.items || []).filter((item) => item.isAvailable);
        const unavailableCount = (data.items || []).length - available.length;
        if (!available.length) {
          setFailed(true);
          setMessage("The saved items are no longer available. You can return to the store to browse the current collection.");
          return;
        }
        available.forEach((item) => {
          try { addToCart(item, item.qty); } catch (error) { console.warn("Could not restore a cart item:", error.message); }
        });
        saveCurrency(data.currency);
        saveCustomer({ name: data.customer?.name || "", email: data.customer?.email || "", phoneNumber: "" });
        setAbandonedCartId(data.abandonedCartId);
        setMessage(unavailableCount ? `${unavailableCount} saved item(s) are no longer available. Your available items have been restored.` : "Your selection has been restored. Taking you back to checkout…");
        window.setTimeout(() => { if (active) navigate("/checkout", { replace: true }); }, 1800);
      } catch (error) {
        if (!active) return;
        setFailed(true);
        setMessage(error.response?.data?.message || "This checkout recovery link is invalid or has expired.");
      }
    };
    restore();
    return () => { active = false; };
  }, [token, addToCart, saveCurrency, saveCustomer, setAbandonedCartId, navigate]);

  return (
    <main className="min-h-screen bg-atelier-paper text-atelier-ink pt-40 px-6 text-center">
      <h1 className="font-serif italic text-4xl mb-5">{failed ? "Selection unavailable" : "Welcome back"}</h1>
      <p className="max-w-xl mx-auto text-sm opacity-70 leading-relaxed">{message}</p>
      {failed && <Link to="/store" className="inline-block mt-8 underline text-xs tracking-widest uppercase">Return to the store</Link>}
    </main>
  );
};

export default RecoverCart;
