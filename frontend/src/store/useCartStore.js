import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const getProductId = (product) => String(product?.productId || product?._id || product?.id || "");

const buildCartItemId = (product) => {
  const productId = getProductId(product);
  const configuration = product.variantSku || [
    product.size || "", product.color || "", product.width || "",
    product.last || "", product.sole || "", product.material || "", product.format || "",
  ].join("|");
  return `${productId}::${configuration || "standard"}`;
};

const normaliseCartItem = (product, qty = 1) => {
  const productId = getProductId(product);
  if (!productId) throw new Error("This product is missing its catalogue ID. Refresh the page and try again.");
  const safeQty = Math.max(1, Math.min(50, Math.floor(Number(qty) || 1)));
  const image = typeof product.image === "string" ? product.image : (Array.isArray(product.images) ? product.images[0] : "");
  const item = {
    productId, id: productId, _id: productId,
    name: String(product.name || "Untitled product"), slug: product.slug || "",
    category: product.category || "", image: image || "",
    price: Number(product.selectedPrice ?? product.price ?? 0),
    basePrice: Number(product.price ?? 0), qty: safeQty,
    size: product.size ? String(product.size) : "", color: product.color ? String(product.color) : "",
    width: product.width ? String(product.width) : "", last: product.last ? String(product.last) : "",
    sole: product.sole ? String(product.sole) : "", material: product.material ? String(product.material) : "",
    format: product.format ? String(product.format) : "",
    variantSku: product.variantSku ? String(product.variantSku).trim().toUpperCase() : "",
    availableStock: product.availableStock != null && Number.isFinite(Number(product.availableStock)) ? Math.max(0, Number(product.availableStock)) : null,
    stockTracked: product.stockTracked !== false, isAvailable: product.isAvailable !== false,
  };
  item.cartItemId = buildCartItemId(item);
  return item;
};

const useCartStore = create(persist((set, get) => ({
  cartItems: [],
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setIsCartOpen: (isOpen) => set({ isCartOpen: Boolean(isOpen) }),

  addToCart: (product, qty = 1) => {
    const incoming = normaliseCartItem(product, qty);
    if (!incoming.isAvailable || incoming.availableStock === 0) throw new Error("This item is currently unavailable.");
    set((state) => {
      const index = state.cartItems.findIndex((item) => item.cartItemId === incoming.cartItemId);
      if (index >= 0) {
        const updated = [...state.cartItems];
        const nextQty = updated[index].qty + incoming.qty;
        if (incoming.availableStock != null && nextQty > incoming.availableStock) throw new Error(`Only ${incoming.availableStock} unit(s) are currently available.`);
        updated[index] = { ...updated[index], ...incoming, qty: nextQty };
        return { cartItems: updated, isCartOpen: true };
      }
      if (incoming.availableStock != null && incoming.qty > incoming.availableStock) throw new Error(`Only ${incoming.availableStock} unit(s) are currently available.`);
      return { cartItems: [...state.cartItems, incoming], isCartOpen: true };
    });
  },

  removeFromCart: (cartItemId) => set((state) => ({ cartItems: state.cartItems.filter((item) => item.cartItemId !== cartItemId) })),
  updateQuantity: (cartItemId, newQty) => set((state) => ({
    cartItems: state.cartItems.map((item) => {
      if (item.cartItemId !== cartItemId) return item;
      const quantity = Math.max(1, Math.min(50, Math.floor(Number(newQty) || 1)));
      return { ...item, qty: item.availableStock == null ? quantity : Math.min(quantity, Math.max(1, item.availableStock)) };
    }),
  })),

  syncWithCatalogue: (products = []) => {
    const catalogue = new Map(products.map((product) => [String(product._id || product.id), product]));
    set((state) => ({ cartItems: state.cartItems.map((item) => {
      const product = catalogue.get(String(item.productId || item._id || item.id));
      if (!product) return { ...item, isAvailable: false, availabilityMessage: "This product is no longer listed." };
      let variant = null;
      if (item.variantSku && Array.isArray(product.variants)) {
        variant = product.variants.find((entry) => String(entry.sku || "").toUpperCase() === item.variantSku && entry.isActive !== false);
      } else if (Array.isArray(product.variants) && product.variants.length && (item.size || item.color)) {
        variant = product.variants.find((entry) => String(entry.size || "") === String(item.size || "") && String(entry.color || "").toLowerCase() === String(item.color || "").toLowerCase() && entry.isActive !== false);
      }
      const variantRequired = Array.isArray(product.variants) && product.variants.length > 0 && product.category !== "Magazine" && product.status !== "Pre-Order";
      const digitalMagazine = product.category === "Magazine" && product.magazineDetails?.isDigital && item.format === "digital";
      const stockTracked = !digitalMagazine && product.status !== "Pre-Order";
      const stock = variant ? Number(variant.stock || 0) : Number(product.stock || 0);
      const available = product.publicationStatus !== "Draft" && product.publicationStatus !== "Archived" && product.status !== "Archived" && product.status !== "Sold Out" && !product.isAuction && (!variantRequired || Boolean(variant)) && (!stockTracked || stock > 0);
      return {
        ...item,
        name: product.name || item.name,
        slug: product.slug || item.slug,
        category: product.category || item.category,
        image: product.images?.[0] || product.magazineDetails?.coverImage || item.image,
        basePrice: Number(product.price ?? item.basePrice),
        price: item.format ? item.price : Number(variant?.price ?? product.price ?? item.price),
        availableStock: stockTracked ? stock : null,
        stockTracked,
        isAvailable: available,
        availabilityMessage: !available ? (variantRequired && !variant ? "Please reselect an available variant." : "This product is currently unavailable.") : "",
      };
    }) }));
  },

  getItemCount: () => get().cartItems.reduce((total, item) => total + item.qty, 0),
  getSubtotal: () => get().cartItems.reduce((total, item) => total + Number(item.price || 0) * item.qty, 0),
  clearCart: () => set({ cartItems: [] }),
}), {
  name: "atelier-cart-storage",
  version: 2,
  storage: createJSONStorage(() => localStorage),
  migrate: (persistedState) => ({
    ...persistedState,
    isCartOpen: false,
    cartItems: (Array.isArray(persistedState?.cartItems) ? persistedState.cartItems : []).map((item) => {
      const productId = getProductId(item);
      const migrated = { ...item, productId, id: productId, _id: productId, price: Number(item.price || 0), qty: Math.max(1, Math.floor(Number(item.qty || 1))), availableStock: null, isAvailable: true };
      migrated.cartItemId = buildCartItemId(migrated);
      return migrated;
    }).filter((item) => item.productId),
  }),
  partialize: (state) => ({ cartItems: state.cartItems }),
}));

export default useCartStore;
