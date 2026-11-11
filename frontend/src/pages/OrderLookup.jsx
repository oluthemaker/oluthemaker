import React, { useState } from "react";
import { ArrowRight, PackageCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import API from "../api/axios";

const money = (amount, currency = "NGN") => new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
  style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2,
}).format(Number(amount || 0));

const statusLabel = (status = "pending") => ({
  pending: "Order received", processing: "In preparation", ready_for_dispatch: "Ready for dispatch",
  shipped: "On its way", completed: "Delivered", manual_review: "Under review", cancelled: "Cancelled",
}[status] || status.replaceAll("_", " "));

const OrderLookup = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [sessionToken, setSessionToken] = useState("");
  const [refreshingOrderId, setRefreshingOrderId] = useState(null);

  const requestCode = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const { data } = await API.post("/orders/lookup/request-code", { email }, { skipAuth: true });
      setMessage(data.message || "If this email is associated with orders, a code will arrive shortly.");
      setStep("code");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to request a code right now.");
    } finally { setBusy(false); }
  };

  const refreshOrder = async (orderId) => {
    if (!sessionToken) return;
    setRefreshingOrderId(orderId);
    setMessage("");
    try {
      const { data } = await API.get(`/orders/${orderId}`, {
        skipAuth: true,
        headers: { "x-order-access-token": sessionToken },
      });
      setOrders((current) => current.map((order) => order._id === orderId ? {
        ...order,
        isPaid: Boolean(data.isPaid),
        paymentStatus: data.paymentStatus,
        fulfillmentStatus: data.fulfillmentStatus,
        refundStatus: data.refundStatus || "none",
        trackingNumber: data.trackingNumber || "",
        trackingUrl: data.trackingUrl || "",
        fulfillmentNote: data.fulfillmentNote || "",
      } : order));
    } catch (error) {
      setMessage(error.response?.data?.message || "Your secure session may have expired. Request a new code to continue.");
    } finally { setRefreshingOrderId(null); }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const { data } = await API.post("/orders/lookup/verify-code", { email, code }, { skipAuth: true });
      setOrders(data.orders || []);
      setSessionToken(data.accessToken || "");
      setStep("orders");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to verify that code.");
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-atelier-paper pt-36 pb-24 px-5">
      <div className="max-w-4xl mx-auto">
        <header className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-[9px] tracking-[0.35em] uppercase opacity-50 mb-4">The Maker · Order services</p>
          <h1 className="font-serif italic text-4xl md:text-6xl text-atelier-ink mb-5">Your orders, in view.</h1>
          <p className="text-sm leading-7 opacity-60">Access your order history and delivery updates securely. No customer account is required.</p>
        </header>

        {step !== "orders" ? (
          <section className="max-w-xl mx-auto bg-white border border-atelier-ink/10 p-7 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-7"><ShieldCheck size={20} /><h2 className="font-serif italic text-2xl">{step === "email" ? "Find your orders" : "Verify your email"}</h2></div>
            {step === "email" ? (
              <form onSubmit={requestCode} className="space-y-5">
                <label className="block text-[9px] tracking-[0.25em] uppercase">Email used at checkout<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-atelier-ink/15 bg-atelier-paper/40 p-4 text-sm outline-none focus:border-atelier-ink" placeholder="you@example.com" /></label>
                <button disabled={busy} className="w-full bg-atelier-ink text-white p-4 text-[10px] tracking-[0.25em] uppercase font-bold flex items-center justify-center gap-3 disabled:opacity-50">{busy ? "Requesting…" : "Send verification code"}<ArrowRight size={14} /></button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-5">
                <p className="text-xs opacity-60 leading-6">Enter the six-digit code sent to <strong>{email}</strong>. It expires after 10 minutes.</p>
                <label className="block text-[9px] tracking-[0.25em] uppercase">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-2 w-full border border-atelier-ink/15 bg-atelier-paper/40 p-4 text-center font-mono tracking-[0.5em] text-xl outline-none focus:border-atelier-ink" placeholder="000000" /></label>
                <button disabled={busy || code.length !== 6} className="w-full bg-atelier-ink text-white p-4 text-[10px] tracking-[0.25em] uppercase font-bold flex items-center justify-center gap-3 disabled:opacity-50">{busy ? "Verifying…" : "View my orders"}<ArrowRight size={14} /></button>
                <button type="button" onClick={() => { setStep("email"); setCode(""); setMessage(""); }} className="w-full text-[9px] tracking-widest uppercase underline underline-offset-4 opacity-60">Use a different email</button>
              </form>
            )}
            {message && <p role="status" className="mt-5 text-xs leading-6 opacity-70">{message}</p>}
          </section>
        ) : sessionToken ? (
          <section className="space-y-5">
            {message && <p role="status" className="bg-white border border-atelier-ink/10 p-4 text-xs opacity-70">{message}</p>}
            <div className="flex flex-wrap justify-between items-center gap-3"><div><h2 className="font-serif italic text-2xl">Order history</h2><p className="text-xs opacity-50 mt-1">Verified for {email}</p></div><button type="button" onClick={() => { setStep("email"); setCode(""); setOrders([]); setSessionToken(""); }} className="flex items-center gap-2 text-[9px] tracking-widest uppercase underline"><RefreshCw size={13} /> End session</button></div>
            {orders.map((order) => (
              <article key={order._id} className="bg-white border border-atelier-ink/10 p-6 md:p-8">
                <div className="flex flex-wrap justify-between gap-4 border-b border-atelier-ink/10 pb-5 mb-5">
                  <div><p className="text-[9px] tracking-[0.25em] uppercase opacity-50">Order reference</p><p className="font-mono text-xs mt-2">{order.paymentReference}</p><p className="text-[10px] opacity-50 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                  <div className="text-right"><p className="font-serif italic text-2xl">{money(order.totalPrice, order.currency || "USD")}</p><p className={`text-[9px] tracking-widest uppercase mt-2 ${order.isPaid ? "text-green-700" : "text-amber-700"}`}>{order.refundStatus === "refunded" ? "Refund completed" : order.refundStatus === "processing" ? "Refund processing" : order.refundStatus === "partially_refunded" ? "Partially refunded" : order.isPaid ? "Payment confirmed" : "Awaiting payment"}</p></div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5"><div className="flex items-center gap-3"><PackageCheck size={18} /><div><p className="font-serif italic text-lg">{statusLabel(order.fulfillmentStatus)}</p><p className="text-[9px] tracking-widest uppercase opacity-50">Fulfilment status{order.refundStatus && order.refundStatus !== "none" ? ` · refund ${order.refundStatus.replaceAll("_", " ")}` : ""}</p></div></div><button type="button" onClick={() => refreshOrder(order._id)} disabled={refreshingOrderId === order._id} className="flex items-center gap-2 text-[9px] tracking-widest uppercase underline disabled:opacity-40"><RefreshCw size={12} className={refreshingOrderId === order._id ? "animate-spin" : ""} /> Refresh status</button></div>
                <div className="space-y-2 mb-5">{order.orderItems.map((item, index) => <div key={`${order._id}-${index}`} className="flex justify-between gap-4 text-xs"><span>{item.name} × {item.qty}{item.configuration?.size ? ` · ${item.configuration.size}` : ""}{item.configuration?.color ? ` · ${item.configuration.color}` : ""}</span><span>{money(item.price * item.qty, order.currency || "USD")}</span></div>)}</div>
                {order.trackingNumber && <p className="text-xs opacity-70 mb-3">Tracking number: <strong>{order.trackingNumber}</strong></p>}
                {order.fulfillmentNote && <p className="text-xs opacity-70 mb-3">{order.fulfillmentNote}</p>}
                {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-atelier-ink text-white px-5 py-3 text-[9px] tracking-widest uppercase"><Truck size={13} /> Track delivery</a>}
              </article>
            ))}
          </section>
        ) : null}
        <p className="text-center text-[9px] tracking-widest uppercase opacity-40 mt-12">Your verification session expires automatically after 30 minutes.</p>
      </div>
    </main>
  );
};

export default OrderLookup;
