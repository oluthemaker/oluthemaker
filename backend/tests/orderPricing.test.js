import test from "node:test";
import assert from "node:assert/strict";
import { calculateOrderAmounts, getOrderExchangeRate } from "../utils/orderPricing.js";

const originalEnv = {
  NGN_PER_USD: process.env.NGN_PER_USD,
  ORDER_TAX_RATE: process.env.ORDER_TAX_RATE,
};

test.after(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("NGN checkout uses catalogue NGN prices without FX conversion", () => {
  delete process.env.NGN_PER_USD;
  process.env.ORDER_TAX_RATE = "0.075";
  const result = calculateOrderAmounts({
    itemsPriceNGN: 100000,
    currency: "NGN",
    exchangeRate: getOrderExchangeRate("NGN"),
    shippingPriceNGN: 2500,
  });
  assert.equal(result.itemsPrice, 100000);
  assert.equal(result.shippingPrice, 2500);
  assert.equal(result.taxPrice, 7500);
  assert.equal(result.totalPrice, 110000);
});

test("USD checkout converts server-side using the configured NGN-per-USD rate", () => {
  process.env.NGN_PER_USD = "1500";
  process.env.ORDER_TAX_RATE = "0";
  const rate = getOrderExchangeRate("USD");
  const result = calculateOrderAmounts({ itemsPriceNGN: 150000, currency: "USD", exchangeRate: rate });
  assert.equal(rate, 1500);
  assert.equal(result.itemsPrice, 100);
  assert.equal(result.totalPrice, 100);
  assert.equal(result.baseTotalPriceNGN, 150000);
});

test("USD checkout fails closed when the exchange rate is not configured", () => {
  delete process.env.NGN_PER_USD;
  assert.throws(() => getOrderExchangeRate("USD"), { code: "USD_EXCHANGE_RATE_NOT_CONFIGURED", statusCode: 503 });
});

test("unsupported currencies are rejected", () => {
  assert.throws(() => getOrderExchangeRate("EUR"), { statusCode: 400 });
});
