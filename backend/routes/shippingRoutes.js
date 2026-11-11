import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { quoteShipping, listShippingZones, createShippingZone, updateShippingZone, deleteShippingZone } from "../controllers/shippingController.js";

const router = express.Router();
router.post("/quote", quoteShipping);
router.get("/admin/zones", protect, admin, listShippingZones);
router.post("/admin/zones", protect, admin, createShippingZone);
router.put("/admin/zones/:id", protect, admin, updateShippingZone);
router.delete("/admin/zones/:id", protect, admin, deleteShippingZone);
export default router;
