import express from "express";
import rateLimit from "express-rate-limit";
import {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderToPaid,
  verifyOrderPayment,
  flutterwaveWebhook,
  updateOrderFulfillment,
  requestOrderLookupCode,
  verifyOrderLookupCode,
  initiateOrderRefund,
  refreshOrderRefund,
  getRevenueAnalytics,
  getCustomerAnalytics,
} from "../controllers/orderController.js";
import { protect, optionalProtect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many checkout attempts. Please wait and try again." },
});

const orderLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many order access attempts. Please wait before trying again." },
});

const refundLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many refund actions. Please wait before trying again." },
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment verification attempts. Please try again shortly." },
});

// Public guest checkout; a valid customer token is optional for backwards compatibility.
router.route("/").post(checkoutLimiter, optionalProtect, addOrderItems);

// Public guest order lookup uses an emailed one-time code; all responses are rate limited.
router.post("/lookup/request-code", orderLookupLimiter, requestOrderLookupCode);
router.post("/lookup/verify-code", orderLookupLimiter, verifyOrderLookupCode);

// Admin-only reporting, refunds, order listing and fulfilment management.
router.get("/analytics/revenue", protect, admin, getRevenueAnalytics);
router.get("/analytics/customers", protect, admin, getCustomerAnalytics);
router.route("/").get(protect, admin, getOrders);
router.route("/:id/fulfillment").patch(protect, admin, updateOrderFulfillment);
router.post("/:id/refunds", refundLimiter, protect, admin, initiateOrderRefund);
router.post("/:id/refunds/:refundId/refresh", refundLimiter, protect, admin, refreshOrderRefund);

// Public access requires the guest checkout token; registered users/admins may use their JWT.
router.route("/:id").get(optionalProtect, getOrderById);
router.route("/:id/verify-payment").post(verificationLimiter, optionalProtect, verifyOrderPayment);
router.route("/:id/pay").put(verificationLimiter, optionalProtect, updateOrderToPaid);

// Flutterwave verifies this endpoint using the configured webhook secret hash.
router.post("/webhook/flutterwave", flutterwaveWebhook);

export default router;
