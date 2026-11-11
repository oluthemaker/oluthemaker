export const ORDER_FULFILLMENT_STATUSES = Object.freeze([
  "pending",
  "processing",
  "ready_for_dispatch",
  "shipped",
  "completed",
  "cancelled",
  "manual_review",
]);

export const validateFulfillmentUpdate = ({ status, isPaid, refundStatus = "none", note = "", trackingNumber = "", trackingUrl = "" }) => {
  if (!ORDER_FULFILLMENT_STATUSES.includes(status)) return "Choose a valid fulfilment status.";
  if (status === "completed" && !isPaid) return "An unpaid order cannot be marked as completed.";
  if (status === "cancelled" && isPaid && refundStatus !== "refunded") return "A paid order cannot be cancelled here. Complete the refund first, then update the order.";
  if (String(note).length > 1000 || String(trackingNumber).length > 120 || String(trackingUrl).length > 1000) {
    return "A fulfilment field exceeds its maximum length.";
  }
  if (trackingUrl && !/^https:\/\//i.test(trackingUrl)) return "Tracking links must use HTTPS.";
  return null;
};
