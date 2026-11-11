import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/useCartStore";
import useOrderStore from "../store/useOrderStore";
import { atelierToast } from "../utils/Toaster";
import FlutterwaveButton from "../components/FlutterwaveButton";

const money = (amount, currency) => new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
  style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2,
}).format(Number(amount || 0));

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems } = useCartStore();
  const { customer, shippingAddress, currency, abandonedCartId, createOrder, loading, error } = useOrderStore();
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const hasCheckoutDetails = Boolean(customer?.name && customer?.email && customer?.phoneNumber && shippingAddress?.addressLine1 && shippingAddress?.city && shippingAddress?.country);
  const itemCount = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0), [cartItems]);

  const handleCreateOrder = async () => {
    if (!hasCheckoutDetails) {
      atelierToast("Please complete your contact and delivery details first.", "error");
      navigate("/checkout");
      return;
    }
    if (!cartItems.length) return;
    setIsCreating(true);
    const payload = {
      orderItems: cartItems.map((item) => ({
        product: item.productId || item.product || item._id || item.id,
        qty: item.qty,
        variantSku: item.variantSku || undefined,
        size: item.size || undefined,
        color: item.color || undefined,
        width: item.width || undefined,
        last: item.last || undefined,
        material: item.material || undefined,
        sole: item.sole || undefined,
        format: item.format || undefined,
      })),
      customer,
      shippingAddress,
      currency,
      abandonedCartId,
      paymentMethod: "Flutterwave",
    };

    const order = await createOrder(payload);
    setIsCreating(false);
    if (!order?._id || !order?.payment?.tx_ref || !order?.checkoutToken) {
      atelierToast(useOrderStore.getState().error || "We could not prepare your order. Please try again.", "error");
      return;
    }

    // Keep the guest credential out of the URL and persistent local storage.
    sessionStorage.setItem(`olu-order-token:${order._id}`, order.checkoutToken);
    setCreatedOrder(order);
  };

  const handlePaymentSuccess = (response) => {
    const transactionId = response.transaction_id || response.id;
    navigate(`/order/${createdOrder._id}/success?transaction_id=${encodeURIComponent(transactionId)}`);
  };

  if (!cartItems.length && !createdOrder) {
    return (
      <main className="min-h-screen bg-atelier-paper pt-40 px-6 text-center">
        <p className="font-serif italic text-2xl mb-6">Your selection is empty.</p>
        <Link to="/store" className="text-xs uppercase tracking-widest underline">Return to the store</Link>
      </main>
    );
  }

  const orderItems = createdOrder?.orderItems || cartItems;
  const orderCurrency = createdOrder?.currency || currency || "NGN";

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <section>
          <h1 className="text-4xl font-serif italic mb-8">Review Your Order</h1>
          <div className="space-y-6 mb-10">
            {orderItems.map((item, index) => (
              <div key={item._id || item.cartItemId || index} className="flex gap-4 border-b border-atelier-ink/10 pb-6">
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-atelier-ink/5" />
                <div>
                  <h3 className="font-serif italic text-lg">{item.name}</h3>
                  <div className="text-[9px] tracking-[0.2em] uppercase opacity-60 mt-2 space-y-1">
                    {item.configuration?.size || item.size ? <p>Size: {item.configuration?.size || item.size}</p> : null}
                    {item.configuration?.color || item.color ? <p>Colour: {item.configuration?.color || item.color}</p> : null}
                    {item.configuration?.format || item.format ? <p>Format: {item.configuration?.format || item.format}</p> : null}
                    <p>Qty: {item.qty}</p>
                  </div>
                </div>
                <div className="ml-auto font-sans text-sm whitespace-nowrap">
                  {createdOrder ? money(item.price * item.qty, orderCurrency) : `${item.qty} × ${money(item.price, "NGN")}`}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-atelier-ink/5 p-6 text-[10px] tracking-widest uppercase space-y-2">
            <p className="font-bold mb-2">Delivering To: {customer.name}</p>
            <p className="opacity-70">{customer.email} · {customer.phoneNumber}</p>
            <p className="opacity-70">{shippingAddress.addressLine1}</p>
            <p className="opacity-70">{shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ""} {shippingAddress.postalCode}</p>
            <p className="opacity-70">{shippingAddress.country}</p>
            <Link to="/checkout" className="inline-block underline mt-3">Edit details</Link>
          </div>
        </section>

        <aside className="border border-atelier-ink/10 p-8 h-fit md:sticky md:top-32">
          <h2 className="text-[10px] tracking-[0.4em] uppercase font-bold mb-8">Order Summary</h2>
          {!createdOrder ? (
            <>
              <div className="flex justify-between text-sm mb-4"><span className="opacity-60">Items</span><span>{itemCount}</span></div>
              <div className="flex justify-between text-sm mb-8"><span className="opacity-60">Payment currency</span><span>{currency}</span></div>
              <p className="text-xs leading-relaxed opacity-60 mb-8">Your final subtotal, delivery charge and any applicable tax will be calculated from the live catalogue and store settings when your order is created.</p>
              <button onClick={handleCreateOrder} disabled={isCreating || loading} className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-[0.3em] uppercase font-bold disabled:opacity-50">
                {isCreating || loading ? "Preparing Your Order…" : "Create Order & Continue"}
              </button>
              {error && <p role="alert" className="text-xs text-red-800 mt-4">{error}</p>}
            </>
          ) : (
            <>
              <div className="space-y-4 font-sans text-sm mb-8 pb-8 border-b border-atelier-ink/10">
                <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{money(createdOrder.itemsPrice, orderCurrency)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Shipping</span><span>{money(createdOrder.shippingPrice, orderCurrency)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Tax</span><span>{money(createdOrder.taxPrice, orderCurrency)}</span></div>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Total</span>
                <span className="text-2xl font-serif italic">{money(createdOrder.totalPrice, orderCurrency)}</span>
              </div>
              <p className="text-[10px] tracking-widest uppercase opacity-50 mb-5">Order reference: {createdOrder._id}</p>
              <FlutterwaveButton
                payment={createdOrder.payment}
                customer={customer}
                onSuccess={handlePaymentSuccess}
                onFailure={() => atelierToast("Flutterwave did not complete the payment. Your order is saved and you can retry.", "error")}
                onClose={() => {}}
              />
            </>
          )}
        </aside>
      </div>
    </main>
  );
};

export default Payment;
