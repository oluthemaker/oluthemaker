import test from "node:test";
import assert from "node:assert/strict";
import { zoneMatchesAddress } from "../utils/shippingMatching.js";
import { calculateOrderAmounts } from "../utils/orderPricing.js";

const lagosZone = { country: "Nigeria", states: ["Lagos"], cities: ["Ikeja", "Lekki"] };

test("shipping zone matching is case-insensitive and trims customer input", () => {
  assert.equal(zoneMatchesAddress(lagosZone, { country: " nigeria ", state: "LAGOS STATE", city: "ikeja " }), true);
});

test("shipping zone rejects a city outside its configured city list", () => {
  assert.equal(zoneMatchesAddress(lagosZone, { country: "Nigeria", state: "Lagos", city: "Epe" }), false);
});

test("shipping zone rejects a different state or country", () => {
  assert.equal(zoneMatchesAddress(lagosZone, { country: "Nigeria", state: "Ogun", city: "Ikeja" }), false);
  assert.equal(zoneMatchesAddress(lagosZone, { country: "Ghana", state: "Lagos", city: "Ikeja" }), false);
});

test("empty state and city lists match all locations inside the country", () => {
  assert.equal(zoneMatchesAddress({ country: "Nigeria", states: [], cities: [] }, { country: "Nigeria", state: "Kano", city: "Kano" }), true);
});

test("configured shipping rate is converted to USD using the frozen order rate", () => {
  const result = calculateOrderAmounts({ itemsPriceNGN: 150000, currency: "USD", exchangeRate: 1500, shippingPriceNGN: 3000 });
  assert.equal(result.shippingPrice, 2);
  assert.equal(result.baseShippingPriceNGN, 3000);
  assert.equal(result.totalPrice, 102);
});
