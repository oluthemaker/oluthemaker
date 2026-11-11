import test from "node:test";
import assert from "node:assert/strict";
import { validateFulfillmentUpdate, ORDER_FULFILLMENT_STATUSES } from "../utils/orderFulfillment.js";

test("fulfilment statuses include the full dispatch lifecycle", () => {
  assert.deepEqual(ORDER_FULFILLMENT_STATUSES, ["pending", "processing", "ready_for_dispatch", "shipped", "completed", "cancelled", "manual_review"]);
});

test("an unpaid order cannot be marked completed", () => {
  assert.match(validateFulfillmentUpdate({ status: "completed", isPaid: false }), /unpaid/);
});

test("a paid order cannot be cancelled before its refund is complete", () => {
  assert.match(validateFulfillmentUpdate({ status: "cancelled", isPaid: true, refundStatus: "processing" }), /refund/);
  assert.equal(validateFulfillmentUpdate({ status: "cancelled", isPaid: true, refundStatus: "refunded" }), null);
});

test("tracking links must use HTTPS", () => {
  assert.match(validateFulfillmentUpdate({ status: "shipped", isPaid: true, trackingUrl: "http://example.com/track" }), /HTTPS/);
  assert.equal(validateFulfillmentUpdate({ status: "shipped", isPaid: true, trackingUrl: "https://example.com/track" }), null);
});

test("valid paid order fulfilment updates pass", () => {
  assert.equal(validateFulfillmentUpdate({ status: "ready_for_dispatch", isPaid: true, note: "Packed" }), null);
});
