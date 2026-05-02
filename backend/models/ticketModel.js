// models/ticketModel.js
import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ticketSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    messages: [messageSchema],
  },
  { timestamps: true },
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
