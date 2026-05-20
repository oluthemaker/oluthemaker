import { create } from "zustand";
import API from "../api/axios"; // Adjust path to your API file

const useAdminStore = create((set) => ({
  isLoading: false,
  error: null,

  // Create a new Product (Shoe or Magazine)
  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      // Your protected admin route
      const res = await API.post("/products", productData);

      set({ isLoading: false });
      return { success: true, data: res.data };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to publish commission";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // deleteProduct: async (productId) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     // Your protected admin route
  //     await API.delete(`/products/${productId}`);

  //     set({ isLoading: false });
  //     return { success: true };
  //   } catch (error) {
  //     const message =
  //       error.response?.data?.message || "Failed to delete product";
  //     set({ isLoading: false, error: message });
  //     return { success: false, error: message };
  //   }
  // },

  // updateProduct: async (productId, productData) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     // Your protected admin route
  //     const res = await API.put(`/products/${productId}`, productData);

  //     set({ isLoading: false });
  //     return { success: true, data: res.data };
  //   } catch (error) {
  //     const message =
  //       error.response?.data?.message || "Failed to update product";
  //     set({ isLoading: false, error: message });
  //     return { success: false, error: message };
  //   }
  // },

  // You can easily add deleteProduct or updateProduct here later
}));

export default useAdminStore;
