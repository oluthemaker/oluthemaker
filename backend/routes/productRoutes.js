import express from "express";
import {
  getProducts,
  browseProducts,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct,
  adjustInventory,
  getInventoryAdjustments,
  validateProductForPublication,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public catalogue routes. Keep /browse before /:id.
router.get("/browse", browseProducts);
router.route("/").get(getProducts);

// Admin routes must be declared before the generic /:id routes.
router.get("/admin", protect, admin, getAdminProducts);
router.get("/admin/inventory-adjustments", protect, admin, getInventoryAdjustments);
router.post("/admin/validate", protect, admin, validateProductForPublication);
router.post("/:id/inventory-adjustments", protect, admin, adjustInventory);
router.patch("/:id/archive", protect, admin, archiveProduct);
router.route("/").post(protect, admin, createProduct);
router.route("/:id").put(protect, admin, updateProduct).patch(protect, admin, updateProduct).delete(protect, admin, deleteProduct).get(getProductById);

export default router;
