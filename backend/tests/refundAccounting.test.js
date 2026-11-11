import test from "node:test";
import assert from "node:assert/strict";
import { normaliseRefundStatus, getReservedRefundAmount, getOrderRefundStatus, buildRevenueSummary } from "../utils/refundAccounting.js";

test("Flutterwave initiated refund states remain processing until final settlement", () => {
  assert.equal(normaliseRefundStatus("completed"), "processing");
  assert.equal(normaliseRefundStatus("processing"), "processing");
  assert.equal(normaliseRefundStatus("completed-mpgs"), "succeeded");
  assert.equal(normaliseRefundStatus("failed"), "failed");
});

test("failed refunds do not reserve refundable balance", () => {
  assert.equal(getReservedRefundAmount([
    { amount: 150, status: "processing" },
    { amount: 50, status: "failed" },
    { amount: 100, status: "unknown" },
  ]), 250);
});

test("order refund status distinguishes pending, partial and full refunds", () => {
  assert.equal(getOrderRefundStatus([], 1000), "none");
  assert.equal(getOrderRefundStatus([{ amount: 200, status: "processing" }], 1000), "processing");
  assert.equal(getOrderRefundStatus([{ amount: 200, status: "succeeded" }], 1000), "partially_refunded");
  assert.equal(getOrderRefundStatus([{ amount: 1000, status: "succeeded" }], 1000), "refunded");
  assert.equal(getOrderRefundStatus([{ amount: 1000, status: "failed" }], 1000), "failed");
});

test("revenue summary keeps NGN and USD separate and accounts for refund stages", () => {
  const summary = buildRevenueSummary([
    { currency: "NGN", totalPrice: 10000, refunds: [{ amount: 2000, status: "processing" }, { amount: 500, status: "failed" }] },
    { currency: "USD", totalPrice: 40, refunds: [{ amount: 10, status: "succeeded" }] },
  ]);
  assert.equal(summary.NGN.grossCaptured, 10000);
  assert.equal(summary.NGN.refundsInitiated, 2000);
  assert.equal(summary.NGN.refundsFailed, 500);
  assert.equal(summary.USD.grossCaptured, 40);
  assert.equal(summary.USD.refundsCompleted, 10);
  const legacy = buildRevenueSummary([{ totalPrice: 25, refunds: [] }]);
  assert.equal(legacy.USD.grossCaptured, 25);
  assert.equal(legacy.NGN.grossCaptured, 0);
});
