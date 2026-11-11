import test from "node:test";
import assert from "node:assert/strict";
import { optimizedImageUrl } from "../src/utils/optimizedImage.js";

test("Cloudinary assets receive automatic format, quality and bounded width transformations", () => {
  const source = "https://res.cloudinary.com/demo/image/upload/v1234567890/products/shoe.jpg";
  assert.equal(
    optimizedImageUrl(source, 720),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_720,c_limit/v1234567890/products/shoe.jpg",
  );
});

test("non-Cloudinary URLs are returned unchanged", () => {
  const source = "https://images.example.com/shoe.jpg";
  assert.equal(optimizedImageUrl(source, 720), source);
});

test("already transformed Cloudinary URLs are not transformed twice", () => {
  const source = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600,c_limit/v123/shoe.jpg";
  assert.equal(optimizedImageUrl(source, 1200), source);
});

test("requested width is kept within safe transformation bounds", () => {
  const source = "https://res.cloudinary.com/demo/image/upload/v123/shoe.jpg";
  assert.match(optimizedImageUrl(source, 99999), /w_2400,c_limit/);
  assert.match(optimizedImageUrl(source, 1), /w_160,c_limit/);
});
