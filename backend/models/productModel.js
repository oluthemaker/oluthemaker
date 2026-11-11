import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, trim: true, uppercase: true },
    size: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "" },
    price: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    images: [{ type: String }],
    category: {
      type: String,
      enum: ["Shoe", "Magazine", "Leather Goods", "Merchandise", "Auction"],
      required: true,
    },
    subCategory: { type: String, trim: true, default: null },
    status: {
      type: String,
      enum: ["Available", "Pre-Order", "Sold Out", "Archived", "Auction"],
      default: "Available",
    },
    publicationStatus: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
      index: true,
    },
    archivedAt: { type: Date, default: null },
    isAuction: { type: Boolean, default: false },
    auctionDetails: {
      startingBid: Number,
      currentBid: Number,
      minBidIncrement: { type: Number, default: 5000 },
      startTime: Date,
      endTime: Date,
      reservePrice: Number,
      winningBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    shoeDetails: {
      style: [{ type: String }],
      material: [{ type: String }],
      color: [{ type: String }],
      sizes: [Number],
    },
    magazineDetails: {
      issueNumber: Number,
      pages: Number,
      month: String,
      year: Number,
      isDigital: { type: Boolean, default: false },
      fileUrl: String,
      coverImage: String,
      excerpt: String,
      articles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: "Stock quantity must be a whole number." },
    },
    variants: { type: [variantSchema], default: [] },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.virtual("isAvailable").get(function () {
  if (this.publicationStatus === "Archived" || this.status === "Archived") return false;
  if (this.isAuction) {
    const now = new Date();
    return now >= this.auctionDetails?.startTime && now <= this.auctionDetails?.endTime;
  }
  return this.stock > 0 || this.status === "Pre-Order" ||
    (this.category === "Magazine" && this.magazineDetails?.isDigital === true);
});

productSchema.virtual("auctionTimeRemaining").get(function () {
  if (!this.isAuction || !this.auctionDetails?.endTime) return 0;
  const remaining = new Date(this.auctionDetails.endTime) - new Date();
  return remaining > 0 ? remaining : 0;
});

productSchema.index({ "variants.sku": 1 }, { unique: true, partialFilterExpression: { "variants.sku": { $type: "string" } } });

productSchema.pre("validate", function () {
  if (Array.isArray(this.variants) && this.variants.length) {
    this.stock = this.variants.reduce((total, variant) => total + (variant.isActive ? Number(variant.stock || 0) : 0), 0);
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
