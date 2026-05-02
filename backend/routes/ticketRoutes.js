import express from "express";
import {
  createTicket,
  replyToTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  closeTicket,
} from "../controllers/ticketController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Routes
router.route("/").post(protect, createTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/:id", protect, getTicketById);

// Admin Routes
router.get("/admin/all", protect, admin, getAllTickets);
router.put("/:id/close", protect, admin, closeTicket);

// Shared Reply Route (Both can reply)
router.post("/:id/reply", protect, replyToTicket);

export default router;
