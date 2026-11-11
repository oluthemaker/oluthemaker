import test from "node:test";
import assert from "node:assert/strict";
import { validateProduct } from "../utils/productValidation.js";

const validProduct = {
  name: "Atelier Oxford",
  description: "Hand-finished leather oxford.",
  category: "Shoe",
  price: 250000,
  stock: 4,
  images: ["https://res.cloudinary.com/demo/image/upload/product.jpg"],
  variants: [],
  isAuction: false,
};

test("publication validation accepts a complete product", () => {
  assert.deepEqual(validateProduct(validProduct, { publishing: true }), []);
});

test("publication validation requires a product image", () => {
  const errors = validateProduct({ ...validProduct, images: [] }, { publishing: true });
  assert.ok(errors.includes("At least one product image is required."));
});

test("draft validation allows a product to be saved before images are ready", () => {
  assert.deepEqual(validateProduct({ ...validProduct, images: [] }, { publishing: false }), []);
});

test("variant validation requires unique SKUs, a size or colour, and whole-number stock", () => {
  const errors = validateProduct({
    ...validProduct,
    variants: [
      { sku: "OTM-42", size: "42", color: "Black", stock: 3 },
      { sku: "OTM-42", size: "43", color: "Black", stock: 1.5 },
      { sku: "OTM-44", size: "", color: "", stock: 2 },
    ],
  }, { publishing: true });
  assert.ok(errors.includes("Variant SKUs must be unique within a product."));
  assert.ok(errors.includes("Variant 2 stock must be a whole number of zero or more."));
  assert.ok(errors.includes("Variant 3 needs a size or colour."));
});

test("auction validation requires a valid chronological window", () => {
  const errors = validateProduct({
    ...validProduct,
    isAuction: true,
    auctionDetails: { startTime: "2026-11-12T12:00", endTime: "2026-11-11T12:00" },
  }, { publishing: true });
  assert.ok(errors.includes("Auction end must be after its start."));
});
