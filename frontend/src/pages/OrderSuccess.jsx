import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, AlertCircle } from "lucide-react";
import API from "../api/axios";
import useCartStore from "../store/useCartStore";

const money = (amount, currency = "NGN") => new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
  style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2,
}).format(Number(amount || 0));

const OrderSuccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const { clearCart } = useCartStore();

  useEffect(() => {
    let active = true;
    const confirmPayment = async () => {
      const transactionId = searchParams.get("transaction_id");
      const checkoutToken = sessionStorage.getItem(`olu-order-token:${id}`);
      if (!transactionId) {
        if (active) {
          setVerificationError("We have not received a transaction reference from the payment provider.");
          setLoading(false);
        }
        return;
      }
      try {
        const { data } = await API.post(`/orders/${id}/verify-payment`, { transaction_id: transactionId }, {
          skipAuth: true,
          headers: checkoutToken ? { "x-order-access-token": checkoutToken } : {},
        });
        if (!active) return;
        if (!data.isPaid) {
          setVerificationError("Your payment is not yet confirmed. Please allow a moment and check again.");
          setOrder(data);
        } else {
          setOrder(data);
          clearCart();
          sessionStorage.removeItem(`olu-order-token:${id}`);
        }
      } catch (error) {
        if (!active) return;
        setVerificationError(error.response?.data?.message || "We could not verify the payment yet. Please contact the store with your order reference.");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) confirmPayment();
    return () => { active = false; };
  }, [id, searchParams, clearCart]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="min-h-screen bg-atelier-paper flex flex-col items-center justify-center font-serif italic opacity-60"><div className="animate-pulse">Verifying your payment securely…</div></div>;
  }

  if (!order || !order.isPaid) {
    return (
      <main className="min-h-screen bg-atelier-paper pt-40 pb-20 px-6">
        <div className="max-w-2xl mx-auto border border-atelier-ink/10 p-8 md:p-16 text-center">
          <AlertCircle className="mx-auto mb-6 opacity-40" size={44} />
          <h1 className="text-3xl md:text-4xl font-serif italic mb-4">Payment Confirmation Pending</h1>
          <p className="text-sm opacity-70 leading-relaxed">{verificationError || "Your order has been created, but payment has not been confirmed."}</p>
          <p className="text-[10px] tracking-widest uppercase opacity-50 mt-6">Order reference: {id}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="border border-atelier-ink px-6 py-4 text-[10px] tracking-widest uppercase">Retry Verification</button>
            <Link to="/contact" className="bg-atelier-ink text-white px-6 py-4 text-[10px] tracking-widest uppercase">Contact the Store</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-atelier-paper pt-40 pb-20 px-6">
      <div className="max-w-2xl mx-auto border border-atelier-ink/10 p-8 md:p-16 bg-white/30 backdrop-blur-sm relative overflow-hidden">
        <div className="text-center mb-16">
          <CheckCircle2 className="mx-auto mb-6 text-atelier-ink opacity-30" size={48} />
          <h1 className="text-4xl md:text-5xl font-serif italic mb-4">Order Confirmed</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-60">Order Reference: <span className="font-sans font-bold">{order._id}</span></p>
          <p className="text-xs opacity-60 mt-3">A confirmation has been sent to {order.customer?.email || "your email address"}.</p>
        </div>

        <div className="space-y-8 mb-12">
          <h3 className="text-[10px] tracking-[0.4em] uppercase font-bold border-b border-atelier-ink/10 pb-4">Order Items</h3>
          {order.orderItems.map((item, index) => (
            <div key={item._id || index} className="flex justify-between items-start text-sm">
              <div>
                <p className="font-serif italic text-lg">{item.name}</p>
                <p className="text-[9px] tracking-widest uppercase opacity-50 mt-1">Qty: {item.qty}{item.configuration?.size ? ` | Size: ${item.configuration.size}` : ""}</p>
              </div>
              <p className="font-sans">{money(item.price * item.qty, order.currency)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-atelier-ink/10 pt-8 space-y-4 mb-16">
          <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Subtotal</span><span>{money(order.itemsPrice, order.currency)}</span></div>
          {order.shippingZone?.name ? <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Delivery Zone</span><span>{order.shippingZone.name}</span></div> : null}
          <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Shipping</span><span>{money(order.shippingPrice, order.currency)}</span></div>
          <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-60"><span>Tax</span><span>{money(order.taxPrice, order.currency)}</span></div>
          <div className="flex justify-between text-[10px] tracking-widest uppercase pt-3 border-t border-atelier-ink/10"><span className="font-bold">Total Paid</span><span className="font-sans text-sm">{money(order.totalPrice, order.currency)}</span></div>
          <div className="flex justify-between text-[10px] tracking-widest uppercase"><span className="font-bold">Payment Status</span><span className="text-green-800 font-bold">Verified</span></div>
          {order.fulfillmentStatus === "manual_review" && <p className="text-xs opacity-70">Your payment is confirmed. Our team will review the order before fulfilment.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/store" className="flex items-center justify-center gap-3 border border-atelier-ink py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-atelier-ink hover:text-white transition-all">Back to Store <ArrowRight size={14} /></Link>
          <button onClick={handlePrint} className="flex items-center justify-center gap-3 bg-atelier-ink text-white py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-atelier-tan transition-all">Print Receipt</button>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none"><Package size={200} /></div>
      </div>
    </main>
  );
};

export default OrderSuccess;
