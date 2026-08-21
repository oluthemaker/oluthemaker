import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true }, // For clean SEO URLs
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // Array of URLs (Cloudinary/S3)
    category: {
      type: String,
      enum: ["Shoe", "Magazine", "Leather Goods", "Merchandise"],
      required: true,
    },
    // NEW: Subcategory field
        subCategory: {
          type: String,
          trim: true,
          default: null,
        },

    // NEW: Status for "Limited Edition" or "Archive" labels
    status: {
          type: String,
          enum: ["Available", "Pre-Order", "Sold Out", "Archived", "Auction"],
          default: "Available",
    },
    // NEW: Auction Specifications
        isAuction: { type: Boolean, default: false },
        auctionDetails: {
          startingBid: { type: Number },
          currentBid: { type: Number },
          minBidIncrement: { type: Number, default: 5000 },
          startTime: { type: Date },
          endTime: { type: Date },
          reservePrice: { type: Number },
          winningBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },

    // Shoe Specifics
    shoeDetails: {
      style: [{ type: String }], // Changed to Array
      material: [{ type: String }], // Changed to Array
      color: [{ type: String }], // Changed to Array
      sizes: [Number],
    },

    // Magazine Specifics
    magazineDetails: {
      issueNumber: { type: Number },
      pages: { type: Number }, // New
      month: { type: String }, // New (e.g., "September")
      year: { type: Number }, // New (e.g., 2026)
      isDigital: { type: Boolean, default: false },
      fileUrl: { type: String },
      coverImage: { type: String },
      excerpt: { type: String },

      // Linked to your Blog model
      articles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
      ],
    },

    stock: { type: Number, default: 0 },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    // This allows the frontend to easily check if it's a magazine or shoe
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual to check availability
productSchema.virtual("isAvailable").get(function () {
  if (this.isAuction) {
    const now = new Date();
    return now >= this.auctionDetails?.startTime && now <= this.auctionDetails?.endTime;
  }
  return this.stock > 0;
});

// Virtual for remaining auction time in milliseconds
productSchema.virtual("auctionTimeRemaining").get(function () {
  if (!this.isAuction || !this.auctionDetails?.endTime) return 0;
  const remaining = new Date(this.auctionDetails.endTime) - new Date();
  return remaining > 0 ? remaining : 0;
});

const Product = mongoose.model("Product", productSchema);
export default Product;
