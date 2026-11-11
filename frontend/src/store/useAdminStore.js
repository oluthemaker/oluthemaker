import { create } from "zustand";
import API from "../api/axios";

const messageFrom = (error, fallback) => error.response?.data?.message || fallback;

const useAdminStore = create((set) => ({
  isLoading: false,
  error: null,
  products: [],
  inventoryAdjustments: [],

  fetchAdminProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get("/products/admin", { params });
      set({ products: response.data, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = messageFrom(error, "Unable to load products.");
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.post("/products", productData);
      set((state) => ({ products: [response.data, ...state.products], isLoading: false }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = messageFrom(error, "Failed to create product.");
      set({ isLoading: false, error: message });
      return { success: false, error: message, errors: error.response?.data?.errors || [] };
    }
  },

  updateProduct: async (productId, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.put(`/products/${productId}`, productData);
      set((state) => ({ products: state.products.map((product) => product._id === productId ? response.data : product), isLoading: false }));
      return { success: true, data: response.data };
    } catch (error) {
      const message = messageFrom(error, "Failed to update product.");
      set({ isLoading: false, error: message });
      return { success: false, error: message, errors: error.response?.data?.errors || [] };
    }
  },

  archiveProduct: async (productId) => {
    try {
      const response = await API.patch(`/products/${productId}/archive`);
      set((state) => ({ products: state.products.map((product) => product._id === productId ? response.data.product : product) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: messageFrom(error, "Unable to archive product.") };
    }
  },

  deleteProduct: async (productId) => {
    try {
      await API.delete(`/products/${productId}`);
      set((state) => ({ products: state.products.filter((product) => product._id !== productId) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: messageFrom(error, "Unable to delete product.") };
    }
  },

  adjustInventory: async (productId, adjustment) => {
    try {
      const response = await API.post(`/products/${productId}/inventory-adjustments`, adjustment);
      set((state) => ({ products: state.products.map((product) => product._id === productId ? response.data.product : product) }));
      return { success: true, data: response.data.product };
    } catch (error) {
      return { success: false, error: messageFrom(error, "Unable to adjust inventory.") };
    }
  },

  fetchInventoryAdjustments: async (productId) => {
    try {
      const response = await API.get("/products/admin/inventory-adjustments", { params: productId ? { productId } : {} });
      set({ inventoryAdjustments: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: messageFrom(error, "Unable to load inventory history.") };
    }
  },

  validateProduct: async (productData) => {
    try {
      const response = await API.post("/products/admin/validate", productData);
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, errors: error.response?.data?.errors || [messageFrom(error, "Unable to validate product.")] };
    }
  },
}));

export default useAdminStore;
