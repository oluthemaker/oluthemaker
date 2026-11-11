import mongoose from "mongoose";

const shippingZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  country: { type: String, required: true, trim: true, maxlength: 80 },
  states: { type: [String], default: [] },
  cities: { type: [String], default: [] },
  priceNGN: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

shippingZoneSchema.index({ active: 1, priority: -1, country: 1 });
export default mongoose.model("ShippingZone", shippingZoneSchema);
