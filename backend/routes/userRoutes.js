import express from "express";
import crypto from "crypto";
const router = express.Router();
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  manageWishlist,
  getUsers,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/mailer.jsx";
import Order from "../models/orderModel.js";

router.post("/", registerUser);
router.post("/login", authUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

// Profile & Update
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist
router.route("/wishlist").post(protect, manageWishlist);

// Admin Routes
router.route("/").get(protect, admin, getUsers);

router.post("/orders/:id/remind", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.isPaid) return res.status(409).json({ message: "This order has already been paid." });

    const recipientEmail = order.customer?.email || order.user?.email;
    if (!recipientEmail) return res.status(400).json({ message: "This order has no customer email address." });

    // Rotate a fresh one-time guest access token for the emailed payment link.
    const checkoutToken = crypto.randomBytes(32).toString("hex");
    order.guestAccessTokenHash = crypto.createHash("sha256").update(checkoutToken).digest("hex");
    await order.save();

    const paymentLink = `${process.env.FRONTEND_URL}/payment?orderId=${order._id}&checkoutToken=${checkoutToken}`;
    await sendEmail("PAYMENT_REMINDER", recipientEmail, {
      name: order.customer?.name || order.user?.name || "Client",
      orderId: order._id.toString(),
      totalPrice: order.totalPrice,
      currency: order.currency || (order.paymentReference ? "NGN" : "USD"),
      paymentLink,
    });

    return res.json({ message: "Reminder sent to client." });
  } catch (error) {
    console.error("Payment reminder failed:", error.message);
    return res.status(500).json({ message: "Unable to send payment reminder." });
  }
});

export default router;
