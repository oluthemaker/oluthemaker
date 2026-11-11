import { create } from "zustand";
import { persist } from "zustand/middleware";
import API from "../api/axios.js";

const useOrderStore = create(
  persist(
    (set) => ({
      shippingAddress: {},
      customer: {},
      currency: "NGN",
      paymentMethod: "Flutterwave",
      loading: false,
      error: null,
      order: null,
      abandonedCartId: null,

      saveShippingAddress: (data) => set({ shippingAddress: data }),
      saveCustomer: (data) => set({ customer: data }),
      setAbandonedCartId: (id) => set({ abandonedCartId: id || null }),
      saveCurrency: (currency) => set({ currency: currency === "USD" ? "USD" : "NGN" }),
      saveCheckoutDetails: ({ customer, shippingAddress, currency, abandonedCartId = null }) => set({
        customer,
        shippingAddress,
        currency: currency === "USD" ? "USD" : "NGN",
        abandonedCartId,
      }),
      savePaymentMethod: (data) => set({ paymentMethod: data }),

      createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await API.post("/orders", orderData, {
            skipAuth: true,
            headers: { "Content-Type": "application/json" },
          });
          set({ order: data, loading: false });
          return data;
        } catch (error) {
          const message = error.response?.data?.message || error.message || "Unable to create your order.";
          set({ error: message, loading: false });
          return null;
        }
      },

      clearOrder: () => set({ order: null, error: null }),
    }),
    {
      name: "atelier-checkout-storage",
      version: 2,
      // Customer and delivery details remain in memory only; persist currency only.
      partialize: (state) => ({ currency: state.currency, paymentMethod: state.paymentMethod }),
      migrate: (persistedState) => ({
        currency: persistedState?.currency === "USD" ? "USD" : "NGN",
        paymentMethod: "Flutterwave",
      }),
    },
  ),
);

export default useOrderStore;
