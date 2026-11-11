import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../store/useOrderStore";
import useCartStore from "../store/useCartStore";
import API from "../api/axios.js";

const fieldClass = "w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:outline-none focus:border-atelier-ink transition-colors font-serif italic text-lg";
const labelClass = "text-[10px] tracking-[0.3em] uppercase font-bold mb-2 block";

const Checkout = () => {
  const navigate = useNavigate();
  const { shippingAddress, customer: savedCustomer, currency: savedCurrency, abandonedCartId: savedAbandonedCartId, saveCheckoutDetails } = useOrderStore();
  const { cartItems } = useCartStore();
  const [customer, setCustomer] = useState({
    name: savedCustomer.name || "",
    email: savedCustomer.email || "",
    phoneNumber: savedCustomer.phoneNumber || "",
  });
  const [address, setAddress] = useState({
    addressLine1: shippingAddress.addressLine1 || "",
    city: shippingAddress.city || "",
    state: shippingAddress.state || "",
    postalCode: shippingAddress.postalCode || "",
    country: shippingAddress.country || "Nigeria",
    deliveryInstructions: shippingAddress.deliveryInstructions || "",
  });
  const [currency, setCurrency] = useState(savedCurrency || "NGN");
  const [abandonedCartConsent, setAbandonedCartConsent] = useState(Boolean(savedAbandonedCartId));
  const [savingCheckout, setSavingCheckout] = useState(false);
  const [consentMessage, setConsentMessage] = useState("");
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingQuoteLoading, setShippingQuoteLoading] = useState(false);
  const [shippingQuoteError, setShippingQuoteError] = useState("");

  useEffect(() => {
    if (!address.city.trim() || !address.country.trim()) {
      setShippingQuote(null);
      setShippingQuoteError("");
      setShippingQuoteLoading(false);
      return undefined;
    }
    let active = true;
    setShippingQuote(null);
    setShippingQuoteLoading(true);
    const timer = setTimeout(async () => {
      setShippingQuoteError("");
      try {
        const { data } = await API.post("/shipping/quote", { address, currency }, { skipAuth: true });
        if (active) setShippingQuote(data);
      } catch (error) {
        if (active) {
          setShippingQuote(null);
          setShippingQuoteError(error.response?.data?.message || "We could not calculate delivery for this location.");
        }
      } finally {
        if (active) setShippingQuoteLoading(false);
      }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [address.city, address.state, address.country, currency]);

  const updateCustomer = (event) => setCustomer((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateAddress = (event) => setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cartItems.length || savingCheckout) return;
    if (!shippingQuote) {
      setShippingQuoteError("Please enter a delivery city and country with an available shipping zone before continuing.");
      return;
    }
    setSavingCheckout(true);
    let abandonedCartId = savedAbandonedCartId || null;
    if (abandonedCartConsent) {
      try {
        const { data } = await API.post("/abandoned-carts", {
          customer,
          currency,
          consent: true,
          abandonedCartId: savedAbandonedCartId || undefined,
          items: cartItems.map((item) => ({
            productId: item.productId || item._id || item.id,
            qty: item.qty,
            size: item.size,
            color: item.color,
            width: item.width,
            last: item.last,
            material: item.material,
            sole: item.sole,
            format: item.format,
            variantSku: item.variantSku,
          })),
        }, { skipAuth: true });
        abandonedCartId = data.abandonedCartId || null;
        setConsentMessage("");
      } catch (error) {
        console.error("Abandoned cart opt-in could not be saved:", error.response?.data || error.message);
        if (!savedAbandonedCartId) setConsentMessage("We couldn't save this reminder preference, but you can continue checkout. No reminders will be sent for this session.");
      }
    } else if (savedAbandonedCartId) {
      try {
        await API.post(`/abandoned-carts/${savedAbandonedCartId}/withdraw`, { email: customer.email }, { skipAuth: true });
        abandonedCartId = null;
        setConsentMessage("");
      } catch (error) {
        console.error("Could not withdraw abandoned cart consent:", error.response?.data || error.message);
        setConsentMessage("We couldn't update your reminder preference. Please use the unsubscribe link in a reminder email if you no longer want these messages.");
      }
    }
    saveCheckoutDetails({ customer, shippingAddress: address, currency, abandonedCartId });
    setSavingCheckout(false);
    navigate("/payment");
  };

  if (cartItems.length === 0) {
    return <div className="min-h-screen pt-40 text-center font-serif italic bg-atelier-paper">Your selection is empty.</div>;
  }

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter mb-4 text-center">Guest Checkout</h1>
        <p className="text-center text-xs tracking-wide opacity-60 mb-12">No account is required. Your order confirmation will be sent by email.</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold border-b border-atelier-ink/10 pb-3">Contact Details</h2>
            <div>
              <label className={labelClass} htmlFor="customer-name">Full Name</label>
              <input id="customer-name" name="name" autoComplete="name" required minLength={2} value={customer.name} onChange={updateCustomer} className={fieldClass} placeholder="Your full name" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass} htmlFor="customer-email">Email Address</label>
                <input id="customer-email" name="email" type="email" autoComplete="email" required value={customer.email} onChange={updateCustomer} className={fieldClass} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelClass} htmlFor="customer-phone">Phone Number</label>
                <input id="customer-phone" name="phoneNumber" type="tel" autoComplete="tel" required minLength={7} value={customer.phoneNumber} onChange={updateCustomer} className={fieldClass} placeholder="+234..." />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold border-b border-atelier-ink/10 pb-3">Delivery Address</h2>
            <div>
              <label className={labelClass} htmlFor="addressLine1">Street Address</label>
              <input id="addressLine1" name="addressLine1" autoComplete="street-address" required value={address.addressLine1} onChange={updateAddress} className={fieldClass} placeholder="House number and street" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelClass} htmlFor="city">City</label>
                <input id="city" name="city" autoComplete="address-level2" required value={address.city} onChange={updateAddress} className={fieldClass} placeholder="Lagos" />
              </div>
              <div>
                <label className={labelClass} htmlFor="state">State / Province</label>
                <input id="state" name="state" autoComplete="address-level1" value={address.state} onChange={updateAddress} className={fieldClass} placeholder="Lagos State" />
              </div>
              <div>
                <label className={labelClass} htmlFor="postalCode">Postal Code</label>
                <input id="postalCode" name="postalCode" autoComplete="postal-code" value={address.postalCode} onChange={updateAddress} className={fieldClass} placeholder="Postal code (if applicable)" />
              </div>
              <div>
                <label className={labelClass} htmlFor="country">Country</label>
                <input id="country" name="country" autoComplete="country-name" required value={address.country} onChange={updateAddress} className={fieldClass} placeholder="Nigeria" />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
              <textarea id="deliveryInstructions" name="deliveryInstructions" rows={3} value={address.deliveryInstructions} onChange={updateAddress} className={`${fieldClass} resize-y`} placeholder="Gate details, preferred delivery time, etc." />
            </div>
          </section>

          <section className="border-y border-atelier-ink/10 py-5 space-y-2" aria-live="polite">
            <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold">Delivery Estimate</h2>
            {shippingQuoteLoading ? <p className="text-xs opacity-60">Calculating delivery…</p> : null}
            {shippingQuote ? <div className="flex justify-between gap-4 text-sm"><span className="opacity-70">{shippingQuote.zone.name}</span><strong>{new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", { style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(shippingQuote.shippingPrice)}</strong></div> : null}
            {shippingQuoteError ? <p role="alert" className="text-xs text-red-800">{shippingQuoteError}</p> : null}
            {!shippingQuote && !shippingQuoteError && !shippingQuoteLoading ? <p className="text-xs opacity-60">Enter your city and country to see the delivery rate.</p> : null}
          </section>

          <section className="border-y border-atelier-ink/10 py-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={abandonedCartConsent}
                onChange={(event) => setAbandonedCartConsent(event.target.checked)}
                className="mt-1 accent-atelier-ink"
              />
              <span className="text-xs leading-relaxed opacity-75">
                Email me up to two reminders if I leave this checkout unfinished. I understand these reminders are optional and I can ignore them.
              </span>
            </label>
            {consentMessage && <p role="status" className="text-[11px] text-red-800 mt-3">{consentMessage}</p>}
          </section>

          <section className="space-y-5">
            <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold border-b border-atelier-ink/10 pb-3">Payment Currency</h2>
            <p className="text-xs opacity-60">Choose the currency you would like to pay in. The final total is calculated securely by the store.</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ value: "NGN", title: "Nigerian Naira", symbol: "₦" }, { value: "USD", title: "US Dollar", symbol: "$" }].map((option) => (
                <label key={option.value} className={`border p-4 cursor-pointer transition-colors ${currency === option.value ? "border-atelier-ink bg-atelier-ink/5" : "border-atelier-ink/15"}`}>
                  <input className="mr-3 accent-atelier-ink" type="radio" name="currency" value={option.value} checked={currency === option.value} onChange={() => setCurrency(option.value)} />
                  <span className="font-serif italic text-lg">{option.symbol} {option.value}</span>
                  <span className="block text-[9px] uppercase tracking-widest opacity-60 mt-1 ml-6">{option.title}</span>
                </label>
              ))}
            </div>
            {currency === "USD" && <p className="text-[11px] opacity-60">USD checkout is available when the store’s exchange-rate configuration and Flutterwave account are enabled.</p>}
          </section>

          <div className="pt-8 border-t border-atelier-ink/10 flex flex-col sm:flex-row gap-5 justify-between items-center">
            <span className="font-serif italic text-sm opacity-70">{cartItems.reduce((sum, item) => sum + item.qty, 0)} item(s) in your order</span>
            <button type="submit" disabled={savingCheckout || shippingQuoteLoading || !shippingQuote} className="bg-atelier-ink text-white px-8 py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-atelier-tan transition-colors disabled:opacity-50">{savingCheckout ? "Saving…" : "Review Order &amp; Pay"}</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
