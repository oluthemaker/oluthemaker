const PRODUCT_CATEGORIES = ["Shoe", "Magazine", "Leather Goods", "Merchandise", "Auction"];
const validStock = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

export const validateProduct = (input = {}, { publishing = false } = {}) => {
  const errors = [];
  if (!String(input.name || "").trim()) errors.push("Product name is required.");
  if (!String(input.description || "").trim()) errors.push("Product description is required.");
  if (!PRODUCT_CATEGORIES.includes(input.category)) errors.push("Select a valid product category.");
  if (!Number.isFinite(Number(input.price)) || Number(input.price) <= 0) errors.push("Price must be greater than zero.");
  if (publishing && (!Array.isArray(input.images) || input.images.length === 0)) errors.push("At least one product image is required.");
  if (publishing && Array.isArray(input.images)) {
    input.images.forEach((image, index) => {
      try {
        const parsed = new URL(image);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
      } catch {
        errors.push(`Product image ${index + 1} must be a valid HTTP or HTTPS URL.`);
      }
    });
  }
  if (input.sku && !/^[A-Z0-9][A-Z0-9._-]{1,39}$/i.test(String(input.sku).trim())) errors.push("SKU must be 2–40 characters and contain only letters, numbers, dots, underscores or hyphens.");
  if (Array.isArray(input.variants)) {
    const skus = input.variants.map((variant) => String(variant.sku || "").trim().toUpperCase()).filter(Boolean);
    if (new Set(skus).size !== skus.length) errors.push("Variant SKUs must be unique within a product.");
    input.variants.forEach((variant, index) => {
      if (!variant.sku) errors.push(`Variant ${index + 1} needs an SKU.`);
      if (!validStock(variant.stock)) errors.push(`Variant ${index + 1} stock must be a whole number of zero or more.`);
      if (variant.price != null && variant.price !== "" && (!Number.isFinite(Number(variant.price)) || Number(variant.price) <= 0)) errors.push(`Variant ${index + 1} price must be greater than zero.`);
      if (!variant.size && !variant.color) errors.push(`Variant ${index + 1} needs a size or colour.`);
    });
  }
  if (!input.isAuction && (!Array.isArray(input.variants) || input.variants.length === 0) && !validStock(input.stock ?? 0)) errors.push("Stock must be a whole number of zero or more.");
  if (input.isAuction) {
    if (!Number.isFinite(Number(input.auctionDetails?.startingBid || input.price)) || Number(input.auctionDetails?.startingBid || input.price) <= 0) errors.push("Auction starting bid must be greater than zero.");
    if (!Number.isFinite(Number(input.auctionDetails?.minBidIncrement || 5000)) || Number(input.auctionDetails?.minBidIncrement || 5000) <= 0) errors.push("Auction minimum bid increment must be greater than zero.");
    const start = new Date(input.auctionDetails?.startTime);
    const end = new Date(input.auctionDetails?.endTime);
    if (!input.auctionDetails?.startTime || Number.isNaN(start.getTime())) errors.push("Auction start date is required.");
    if (!input.auctionDetails?.endTime || Number.isNaN(end.getTime())) errors.push("Auction end date is required.");
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) errors.push("Auction end must be after its start.");
  }
  if (publishing && input.category === "Magazine" && input.magazineDetails?.isDigital && !input.magazineDetails?.fileUrl) {
    errors.push("Digital magazines need a downloadable file URL before publication.");
  }
  return errors;
};
