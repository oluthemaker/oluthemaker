import mongoose from "mongoose";

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "pull-quote", "side-by-side-images"],
    },
    content: { type: String }, // For text and quotes
    src: { type: String }, // For single images
    externalLink: { type: String },
    alt: { type: String },
    caption: { type: String },
    layout: { type: String, enum: ["default", "wide", "fullBleed"] },
    images: [
      {
        // For side-by-side images
        src: { type: String },
        alt: { type: String },
        caption: { type: String },
        externalLink: { type: String },
      },
    ],
    author: { type: String }, // For quote citations
  },
  { _id: false },
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String }, // Excerpt
    headerImage: { type: String }, // Full-width Hero
    innerImageForFeatured: { type: String },
    featured: { type: Boolean, default: false },
    featuredPost: { type: Boolean, default: false },
    category: { type: String, required: true }, // e.g., "Atelier Notes"
    contentBlocks: [contentBlockSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    credits: [
      {
        role: { type: String }, // e.g., "Photography"
        name: { type: String }, // e.g., "Julian Master"
      },
    ],
    author: { type: String, default: "Olu THE MAKER" },
    publishedAt: { type: Date, default: Date.now },
    tags: [String],
    magazineRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Blog", blogSchema);
