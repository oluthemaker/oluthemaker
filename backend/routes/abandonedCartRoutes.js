import express from "express";
import rateLimit from "express-rate-limit";
import { captureAbandonedCart, recoverAbandonedCart, unsubscribeAbandonedCart, withdrawAbandonedCartConsent, processAbandonedCarts } from "../controllers/abandonedCartController.js";

const router = express.Router();
const captureLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false });
const recoveryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.post("/", captureLimiter, captureAbandonedCart);
router.get("/recover/:token", recoveryLimiter, recoverAbandonedCart);
router.get("/unsubscribe/:token", recoveryLimiter, unsubscribeAbandonedCart);
router.post("/:id/withdraw", recoveryLimiter, withdrawAbandonedCartConsent);
// Optional protected manual run for diagnostics; normal processing is in-process.
router.post("/process", processAbandonedCarts);
export default router;
