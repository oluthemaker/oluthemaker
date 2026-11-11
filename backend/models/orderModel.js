import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    // `price` is the frozen unit price in the order currency.
    price: { type: Number, required: true, min: 0 },
    // Original catalogue price in NGN, retained for audit/accounting.
    basePriceNGN: { type: Number, default: 0, min: 0 },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    stockTracked: { type: Boolean, default: true },
    configuration: {
      size: String,
      color: String,
      width: String,
      last: String,
      material: String,
      sole: String,
      format: String,
      variantSku: String,
    },
  },
  { _id: true },
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true },
  },
  { _id: false },
);

const refundSchema = new mongoose.Schema({
  requestKey: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["NGN", "USD"], required: true },
  reason: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["processing", "succeeded", "failed", "unknown"], default: "processing" },
  providerStatus: { type: String, default: "" },
  flutterwaveRefundId: { type: String, default: "" },
  flutterwaveReference: { type: String, default: "" },
  transactionId: { type: String, default: "" },
  initiatedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { _id: true });

const orderSchema = new mongoose.Schema(
  {
    // Optional for new guest orders; retained for historical account orders.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    customer: { type: customerSchema, default: () => ({}) },
    // Only the hash is stored. The raw checkout token is returned once at order creation.
    guestAccessTokenHash: { type: String, select: false },
    guestOrderAccessTokens: [{ tokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
    paymentReference: { type: String },
    orderItems: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "An order must contain at least one item"] },
    shippingAddress: {
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, required: true },
      deliveryInstructions: { type: String, default: "" },
    },
    paymentMethod: { type: String, required: true, default: "Flutterwave" },
    currency: { type: String, enum: ["NGN", "USD"] },
    baseCurrency: { type: String, enum: ["NGN"], default: "NGN" },
    // Number of NGN per 1 USD. 1 for NGN orders.
    exchangeRateNGNPerUSD: { type: Number, default: 1, min: 0 },
    itemsPrice: { type: Number, default: 0, min: 0 },
    taxPrice: { type: Number, default: 0, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    shippingZone: {
      zoneId: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      rateNGN: { type: Number, min: 0, default: 0 },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    // Base-currency amounts provide a stable audit trail if FX rates change later.
    baseItemsPriceNGN: { type: Number, min: 0 },
    baseTaxPriceNGN: { type: Number, min: 0 },
    baseShippingPriceNGN: { type: Number, min: 0 },
    baseTotalPriceNGN: { type: Number, min: 0 },
    paymentResult: {
      id: String,
      tx_ref: String,
      status: String,
      currency: String,
      amount: Number,
      payment_type: String,
      update_time: String,
      email_address: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "paid_review", "failed"],
      default: "pending",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "ready_for_dispatch", "shipped", "completed", "cancelled", "manual_review"],
      default: "pending",
    },
    fulfillmentNote: { type: String, trim: true, maxlength: 1000, default: "" },
    trackingNumber: { type: String, trim: true, maxlength: 120, default: "" },
    trackingUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    fulfillmentUpdatedAt: { type: Date },
    stockDeducted: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    refunds: { type: [refundSchema], default: [] },
    refundInProgress: { type: Boolean, default: false },
    refundStatus: { type: String, enum: ["none", "processing", "partially_refunded", "refunded", "failed"], default: "none" },
  },
  { timestamps: true },
);

// Legacy orders do not have a paymentReference. A partial unique index avoids
// collisions between those records while guaranteeing unique refs for new orders.
orderSchema.index(
  { paymentReference: 1 },
  { unique: true, partialFilterExpression: { paymentReference: { $type: "string" } } },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
