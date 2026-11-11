import test from "node:test";
import assert from "node:assert/strict";
import { buildCustomerAnalytics } from "../utils/customerAnalytics.js";

const from = new Date("2026-10-01T00:00:00.000Z");
const to = new Date("2026-10-31T23:59:59.999Z");

test("customer analytics distinguishes first-time and returning buyers", () => {
  const result = buildCustomerAnalytics([
    { firstPaidAt: "2026-10-04T10:00:00.000Z", lifetimeOrderCount: 1, periodOrders: 1, country: "Nigeria", state: "Lagos" },
    { firstPaidAt: "2026-08-04T10:00:00.000Z", lifetimeOrderCount: 3, periodOrders: 2, country: "Nigeria", state: "Ogun" },
  ], from, to);
  assert.equal(result.activeCustomers, 2);
  assert.equal(result.newCustomers, 1);
  assert.equal(result.returningCustomers, 1);
  assert.equal(result.repeatCustomers, 1);
  assert.equal(result.repeatCustomerRate, 50);
  assert.equal(result.periodOrders, 3);
  assert.equal(result.averageOrdersPerCustomer, 1.5);
});

test("customer analytics builds acquisition and location breakdowns", () => {
  const result = buildCustomerAnalytics([
    { firstPaidAt: "2026-10-04T10:00:00.000Z", lifetimeOrderCount: 1, periodOrders: 1, country: "Nigeria", state: "Lagos" },
    { firstPaidAt: "2026-10-04T18:00:00.000Z", lifetimeOrderCount: 2, periodOrders: 2, country: "Nigeria", state: "Lagos" },
    { firstPaidAt: "2026-10-08T10:00:00.000Z", lifetimeOrderCount: 1, periodOrders: 1, country: "Ghana", state: "Greater Accra" },
  ], from, to);
  assert.deepEqual(result.acquisitionTrend, [
    { date: "2026-10-04", customers: 2 },
    { date: "2026-10-08", customers: 1 },
  ]);
  assert.equal(result.topCountries[0].name, "Nigeria");
  assert.equal(result.topCountries[0].customers, 2);
  assert.equal(result.topStates[0].name, "Lagos, Nigeria");
});

test("empty customer periods return safe zero values", () => {
  const result = buildCustomerAnalytics([], from, to);
  assert.equal(result.activeCustomers, 0);
  assert.equal(result.repeatCustomerRate, 0);
  assert.equal(result.averageOrdersPerCustomer, 0);
  assert.deepEqual(result.acquisitionTrend, []);
});
