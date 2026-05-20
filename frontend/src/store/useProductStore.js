// store/useProductStore.js
import { create } from "zustand";
import API from "../api/axios"; // Adjust path to your API file

const useProductStore = create((set, get) => ({
  products: [],
  magazines: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await API.get("/products");
      const allProducts = response.data;

      set({
        products: allProducts,
        // Automatically filter magazines for the archive
        magazines: allProducts.filter((p) => p.category === "Magazine"),
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Helper to find a specific product by slug (better for SEO)
  getProductBySlug: async (slug) => {
    // 1. If products are already loaded, just find and return
    const existing = get().products.find((p) => p.slug === slug);
    if (existing) return existing;

    // 2. If products array is empty, fetch them first
    if (get().products.length === 0) {
      set({ loading: true });
      try {
        const response = await API.get("/products");
        const allProducts = response.data;

        set({
          products: allProducts,
          magazines: allProducts.filter((p) => p.category === "Magazine"),
          loading: false,
        });

        // 3. Now try to find it again from the fresh batch
        return allProducts.find((p) => p.slug === slug);
      } catch (err) {
        set({ error: err.message, loading: false });
        return null;
      }
    }

    return null;
  },
}));

export default useProductStore;
