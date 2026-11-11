import test from "node:test";
import assert from "node:assert/strict";
import { buildPublicBrowseQuery, getBrowseSort, parseBrowseParams } from "../utils/productBrowse.js";

test("browse parameters are bounded and safe", () => {
  const filters = parseBrowseParams({ page: "-4", limit: "500", search: "  Oxford  ", sort: "DROP TABLE" });
  assert.equal(filters.page, 1);
  assert.equal(filters.limit, 48);
  assert.equal(filters.search, "Oxford");
  assert.equal(filters.sort, "standard");
});

test("browse query supports category, subcategory and escaped search", () => {
  const query = buildPublicBrowseQuery(parseBrowseParams({ category: "Shoe", subCategory: "Oxford", search: "A.*" }));
  assert.equal(query.$and[2].category, "Shoe");
  assert.equal(query.$and[3].subCategory, "Oxford");
  assert.equal(query.$and[4].$or[0].name.source, "A\\.\\*");
});

test("browse query supports size, colour and price bounds", () => {
  const query = buildPublicBrowseQuery(parseBrowseParams({ size: "42", color: "Black", minPrice: "100", maxPrice: "500" }));
  assert.ok(query.$and.some((part) => part.$or?.some((match) => match["shoeDetails.sizes"] === 42)));
  assert.ok(query.$and.some((part) => part.$or?.some((match) => match["shoeDetails.color"])));
  assert.ok(query.$and.some((part) => part.$or?.some((match) => match.price?.$gte === 100 && match.price?.$lte === 500)));
});

test("sort options are restricted to supported sort orders", () => {
  assert.deepEqual(getBrowseSort("price_asc"), { price: 1, _id: 1 });
  assert.deepEqual(getBrowseSort("newest"), { createdAt: -1, _id: -1 });
});
