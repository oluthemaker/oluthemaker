import mongoose from "mongoose";

const abandonedCartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, min: 1, max: 50 },
  configuration: {
    size: String, color: String, width: String, last: String,
    material: String, sole: String, format: String, variantSku: String,
  },
}, { _id: false });

const abandonedCartSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  currency: { type: String, enum: ["NGN", "USD"], default: "NGN" },
  items: { type: [abandonedCartItemSchema], required: true, validate: (items) => items.length > 0 && items.length <= 40 },
  recoveryTokenHash: { type: String, required: true, unique: true, select: false },
  tokenCiphertext: { type: String, required: true, select: false },
  consentedAt: { type: Date, required: true },
  lastActivityAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ["active", "converted", "expired", "unsubscribed"], default: "active", index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  firstReminderSentAt: { type: Date, default: null },
  secondReminderSentAt: { type: Date, default: null },
  processingUntil: { type: Date, default: null },
}, { timestamps: true });

abandonedCartSchema.index({ status:  1, expiresAt: 1, firstReminderSentAt: 1, secondReminderSentAt: 1 });

const AbandonedCart = mongoose.model("AbandonedCart", abandonedCartSchema);
export default AbandonedCart;
