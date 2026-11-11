import mongoose from "mongoose";

const inventoryAdjustmentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, trim: true, uppercase: true, default: null },
    change: { type: Number, required: true, validate: Number.isInteger },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);
inventoryAdjustmentSchema.index({ product: 1, createdAt: -1 });

const InventoryAdjustment = mongoose.model("InventoryAdjustment", inventoryAdjustmentSchema);
export default InventoryAdjustment;
