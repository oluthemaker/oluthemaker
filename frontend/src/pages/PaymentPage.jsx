import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { atelierToast } from "../utils/Toaster";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        atelierToast("Order not found.", "error");
        navigate("/store");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, navigate]);

  const handlePayment = () => {
    // Logic to trigger Flutterwave checkout using order.totalPrice
    // and then call your /api/orders/:id/pay route on success
    //console.log("Triggering Flutterwave for order:", orderId);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-atelier-paper flex items-center justify-center font-serif italic opacity-40">
        Authenticating Order...
      </div>
    );

  return (
    <main className="bg-atelier-paper min-h-screen py-20 px-6 flex flex-col items-center">
      <div className="max-w-md w-full border border-atelier-ink/5 p-12 bg-white">
        <h1 className="text-3xl font-serif italic mb-8 text-center">
          Commission Checkout
        </h1>

        <div className="space-y-4 mb-12">
          <div className="flex justify-between text-[10px] tracking-widest uppercase opacity-50">
            <span>Order Reference</span>
            <span>{order._id.slice(-8)}</span>
          </div>
          <div className="flex justify-between font-serif italic text-xl border-t border-atelier-ink/10 pt-4">
            <span>Total Due</span>
            <span>${order.totalPrice}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-atelier-ink text-white py-5 text-[10px] tracking-[0.3em] uppercase hover:bg-atelier-tan transition-all duration-700"
        >
          Authenticate & Pay
        </button>
      </div>
    </main>
  );
};

export default PaymentPage;
