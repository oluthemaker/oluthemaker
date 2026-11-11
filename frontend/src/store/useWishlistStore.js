import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createWishlistSnapshot, getWishlistProductId, normaliseWishlistItems } from "../utils/wishlist";

const useWishlistStore = create(persist((set, get) => ({
  items: [],

  isWishlisted: (productOrId) => {
    const id = typeof productOrId === "object" ? getWishlistProductId(productOrId) : String(productOrId || "");
    return Boolean(id) && get().items.some((item) => item.productId === id);
  },

  toggleWishlist: (product) => {
    const productId = getWishlistProductId(product);
    if (!productId) throw new Error("This product is missing its catalogue ID. Refresh the page and try again.");
    if (get().isWishlisted(productId)) {
      set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
      return false;
    }
    const snapshot = createWishlistSnapshot(product);
    set((state) => ({ items: [...state.items, snapshot] }));
    return true;
  },

  removeFromWishlist: (productOrId) => {
    const id = typeof productOrId === "object" ? getWishlistProductId(productOrId) : String(productOrId || "");
    set((state) => ({ items: state.items.filter((item) => item.productId !== id) }));
  },

  clearWishlist: () => set({ items: [] }),
}), {
  name: "atelier-wishlist-storage",
  version: 1,
  storage: createJSONStorage(() => localStorage),
  migrate: (persistedState) => ({ items: normaliseWishlistItems(persistedState?.items) }),
  partialize: (state) => ({ items: state.items }),
}));

export default useWishlistStore;
