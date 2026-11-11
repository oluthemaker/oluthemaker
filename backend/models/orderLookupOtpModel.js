import mongoose from "mongoose";

const orderLookupOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  consumedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("OrderLookupOtp", orderLookupOtpSchema);
