export const getWishlistProductId = (product) => String(product?._id || product?.id || product?.productId || "");

export const createWishlistSnapshot = (product, savedAt = new Date().toISOString()) => ({
  productId: getWishlistProductId(product),
  slug: String(product?.slug || ""),
  name: String(product?.name || "Untitled product"),
  category: String(product?.subCategory || product?.category || "Atelier"),
  price: Number(product?.price || 0),
  image: product?.images?.[0] || product?.magazineDetails?.coverImage || "",
  savedAt,
});

export const normaliseWishlistItems = (items) => (Array.isArray(items) ? items : [])
  .filter((item) => item && typeof item.productId === "string" && item.productId)
  .map((item) => ({
    productId: item.productId,
    slug: String(item.slug || ""),
    name: String(item.name || "Untitled product"),
    category: String(item.category || "Atelier"),
    price: Number(item.price || 0),
    image: String(item.image || ""),
    savedAt: item.savedAt || new Date().toISOString(),
  }));

export const getWishlistAvailability = (product) => {
  if (!product) return { available: false, message: "This product is no longer listed." };
  if (product.publicationStatus === "Draft" || product.publicationStatus === "Archived" || product.status === "Archived" || product.status === "Sold Out" || product.isAuction) {
    return { available: false, message: product.isAuction ? "Auction items cannot be added to the cart here." : "This product is currently unavailable." };
  }
  if (product.status === "Pre-Order") return { available: true, message: "Available for pre-order." };
  if (product.category === "Magazine" && product.magazineDetails?.isDigital) return { available: true, message: "Digital edition available." };
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    return variants.some((variant) => variant.isActive !== false && Number(variant.stock || 0) > 0)
      ? { available: true, message: "Choose your size or colour to add this item." }
      : { available: false, message: "All options are currently out of stock." };
  }
  if (Number(product.stock || 0) <= 0) return { available: false, message: "Currently out of stock." };
  if ((product.shoeDetails?.sizes || []).length) return { available: true, message: "Choose your size on the product page." };
  return { available: true, message: "In stock." };
};
