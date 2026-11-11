import test from "node:test";
import assert from "node:assert/strict";
import {
  createWishlistSnapshot,
  getWishlistAvailability,
  getWishlistProductId,
  normaliseWishlistItems,
} from "../src/utils/wishlist.js";

test("wishlist product ids accept Mongo and legacy id fields", () => {
  assert.equal(getWishlistProductId({ _id: "mongo-id", id: "legacy-id" }), "mongo-id");
  assert.equal(getWishlistProductId({ id: "legacy-id" }), "legacy-id");
  assert.equal(getWishlistProductId({}), "");
});

test("wishlist snapshot stores a minimal product fallback", () => {
  const snapshot = createWishlistSnapshot({
    _id: "p1", slug: "handmade-shoe", name: "Handmade Shoe", category: "Shoe",
    price: "85000", images: ["https://example.com/shoe.jpg"],
  }, "2026-11-11T10:00:00.000Z");
  assert.deepEqual(snapshot, {
    productId: "p1", slug: "handmade-shoe", name: "Handmade Shoe", category: "Shoe",
    price: 85000, image: "https://example.com/shoe.jpg", savedAt: "2026-11-11T10:00:00.000Z",
  });
});

test("wishlist migration removes invalid entries and normalises saved data", () => {
  const items = normaliseWishlistItems([
    { productId: "p1", name: "Piece", price: "12000" },
    { name: "Invalid without id" },
    null,
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].productId, "p1");
  assert.equal(items[0].price, 12000);
  assert.equal(items[0].image, "");
});

test("wishlist availability handles deleted, archived, sold-out and available products", () => {
  assert.equal(getWishlistAvailability(null).available, false);
  assert.equal(getWishlistAvailability({ status: "Archived" }).available, false);
  assert.equal(getWishlistAvailability({ stock: 0 }).available, false);
  assert.equal(getWishlistAvailability({ stock: 3 }).available, true);
  assert.equal(getWishlistAvailability({ status: "Pre-Order", stock: 0 }).available, true);
});

test("variant availability requires at least one active in-stock variant", () => {
  assert.equal(getWishlistAvailability({ variants: [{ stock: 4, isActive: false }] }).available, false);
  assert.equal(getWishlistAvailability({ variants: [{ stock: 0 }, { stock: 2 }] }).available, true);
});
