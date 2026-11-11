export const normaliseRefundStatus = (status = "") => {
  const value = String(status).toLowerCase();
  if (["completed-bank-transfer", "completed-momo", "completed-mpgs", "completed-offline", "completed-preauth", "succeeded", "successful"].includes(value)) return "succeeded";
  if (value.includes("failed")) return "failed";
  return "processing";
};

export const getReservedRefundAmount = (refunds = []) => refunds
  .filter((refund) => refund.status !== "failed")
  .reduce((sum, refund) => sum + Number(refund.amount || 0), 0);

export const getOrderRefundStatus = (refunds = [], totalPrice = 0) => {
  const active = refunds.filter((refund) => refund.status !== "failed");
  if (!active.length) return refunds.some((refund) => refund.status === "failed") ? "failed" : "none";
  if (active.some((refund) => ["processing", "unknown"].includes(refund.status))) return "processing";
  const refunded = active.reduce((sum, refund) => sum + Number(refund.amount || 0), 0);
  return refunded >= Number(totalPrice) - 0.000001 ? "refunded" : "partially_refunded";
};

export const buildRevenueSummary = (orders = []) => {
  const totals = {
    NGN: { paidOrders: 0, grossCaptured: 0, refundsInitiated: 0, refundsCompleted: 0, refundsFailed: 0 },
    USD: { paidOrders: 0, grossCaptured: 0, refundsInitiated: 0, refundsCompleted: 0, refundsFailed: 0 },
  };
  for (const order of orders) {
    const currency = order.currency === "NGN" ? "NGN" : "USD";
    const row = totals[currency];
    row.paidOrders += 1;
    row.grossCaptured += Number(order.totalPrice || 0);
    for (const refund of order.refunds || []) {
      if (refund.status === "failed") row.refundsFailed += Number(refund.amount || 0);
      else if (refund.status === "succeeded") {
        row.refundsInitiated += Number(refund.amount || 0);
        row.refundsCompleted += Number(refund.amount || 0);
      } else if (["processing", "unknown"].includes(refund.status)) row.refundsInitiated += Number(refund.amount || 0);
    }
  }
  return totals;
};
