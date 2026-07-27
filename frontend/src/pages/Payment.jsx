import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/useCartStore";
import useOrderStore from "../store/useOrderStore";
import useUserStore from "../store/useUserStore";
import { atelierToast } from "../utils/Toaster";
import FlutterwaveButton from "../components/FlutterwaveButton";

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCartStore();
  const { shippingAddress, createOrder } = useOrderStore();
  const { user } = useUserStore(); // Assumes user state holds { name, email, etc. }
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // 1. Create a state to hold the dynamic tx_ref
  const [transactionRef, setTransactionRef] = useState("");

  // Financial Math (Ideally, calculate tax/shipping based on your business logic)
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const shippingPrice = itemsPrice > 500 ? 0 : 50; // Example: Free shipping over $500
  const taxPrice = itemsPrice * 0.05; // Example 5% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Flutterwave Config Generator
  // const handleFlutterwavePayment = useFlutterwave({
  //   public_key: import.meta.env.VITE_FLW_PUBLIC_KEY, // Add this to your .env
  //   tx_ref: transactionRef, // We will inject the MongoDB Order ID here dynamically
  //   amount: totalPrice,
  //   currency: "USD", // Or "NGN" depending on your store setup
  //   payment_options: "card,mobilemoney,ussd",
  //   customer: {
  //     email: user?.user?.email || "",
  //     name: user?.user?.name || "Client",
  //   },
  //   customizations: {
  //     title: "Olu THE MAKER",
  //     description: "Payment for Commission",
  //     logo: "https://your-logo-url.com/logo.png", // Optional
  //   },
  // });

  // const handlePlaceOrder = async () => {
  //   setIsProcessing(true);

  //   // 1. Create the Order in MongoDB FIRST (Status: isPaid = false)
  //   const orderData = {
  //     orderItems: cartItems,
  //     shippingAddress,
  //     paymentMethod: "Flutterwave",
  //     itemsPrice,
  //     taxPrice,
  //     shippingPrice,
  //     totalPrice,
  //   };

  //   const createdOrder = await createOrder(orderData);

  //   if (createdOrder && createdOrder._id) {
  //     // 2. Launch Flutterwave with the MongoDB Order ID as the tx_ref

  //     const orderId = String(createdOrder._id);
  //     setTransactionRef(orderId);
  //     handleFlutterwavePayment({
  //       tx_ref: orderId, // Force the specific ID here
  //       callback: (response) => {
  //         if (response.status === "successful") {
  //           clearCart();
  //           closePaymentModal();
  //           navigate(
  //             `/order/${orderId}/success?transaction_id=${response.transaction_id}`,
  //           );
  //         } else {
  //           closePaymentModal();
  //           navigate("/payment-failed");
  //         }
  //       },
  //       onClose: () => {
  //         setIsProcessing(false);
  //       },
  //     });
  //   } else {
  //     setIsProcessing(false);
  //     atelierToast("Failed to initialize order. Please try again.");
  //   }
  // };

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    const orderData = {
      orderItems: cartItems,
      shippingAddress,
      paymentMethod: "Flutterwave",
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    try {
      const order = await createOrder(orderData);
      if (order?._id) {
        setCreatedOrderId(order._id); // This triggers the button to appear
      }
    } catch (err) {
      atelierToast("Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) return null; // Edge case safeguard

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* ORDER SUMMARY (Left Side) */}
        <div>
          <h1 className="text-4xl font-serif italic mb-8">Review Commission</h1>
          <div className="space-y-6 mb-12">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 border-b border-atelier-ink/10 pb-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-24 object-cover bg-atelier-ink/5"
                />
                <div>
                  <h3 className="font-serif italic text-lg">{item.name}</h3>
                  {/* Display Bespoke Details */}
                  <div className="text-[9px] tracking-[0.2em] uppercase opacity-60 mt-2 space-y-1">
                    {item.size && <p>Size: {item.size}</p>}
                    {item.material && <p>Material: {item.material}</p>}
                    <p>Qty: {item.qty}</p>
                  </div>
                </div>
                <div className="ml-auto font-sans">
                  ${item.price * item.qty}
                </div>
              </div>
            ))}
          </div>

          {/* SHIPPING SUMMARY */}
          <div className="bg-atelier-ink/5 p-6 text-[10px] tracking-widest uppercase">
            <p className="font-bold mb-2">Shipping To:</p>
            <p className="opacity-70">{shippingAddress.addressLine1}</p>
            <p className="opacity-70">
              {shippingAddress.city}, {shippingAddress.postalCode}
            </p>
            <p className="opacity-70">{shippingAddress.country}</p>
          </div>
        </div>

        {/* TOTALS & ACTIONS (Right Side) */}
        <div className="border border-atelier-ink/10 p-8 h-fit sticky top-32">
          <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold mb-8">
            Financial Summary
          </h2>

          <div className="space-y-4 font-sans text-sm mb-8 pb-8 border-b border-atelier-ink/10">
            <div className="flex justify-between">
              <span className="opacity-60">Subtotal</span>{" "}
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Shipping</span>{" "}
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Tax</span>{" "}
              <span>${taxPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold">
              Total
            </span>
            <span className="text-2xl font-serif italic">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="mt-8">
            {!createdOrderId ? (
              <button
                onClick={handleCreateOrder}
                disabled={isProcessing}
                className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-[0.4em] uppercase font-bold disabled:opacity-50"
              >
                {isProcessing
                  ? "Generating Order..."
                  : "Confirm Commission Details"}
              </button>
            ) : (
              <FlutterwaveButton
                orderId={createdOrderId}
                amount={totalPrice}
                email={user?.email || user?.user?.email}
                name={user?.name || user?.user?.name}
                onSuccess={(res) => {
                  clearCart();
                  navigate(
                    `/order/${createdOrderId}/success?transaction_id=${res.transaction_id}`,
                  );
                }}
                onFailure={() => navigate("/payment-failed")}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Payment;
