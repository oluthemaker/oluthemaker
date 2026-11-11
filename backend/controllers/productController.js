import mongoose from "mongoose";
import slugify from "slugify";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import InventoryAdjustment from "../models/inventoryAdjustmentModel.js";
import { validateProduct } from "../utils/productValidation.js";
import { buildPublicBrowseQuery, getBrowseSort, parseBrowseParams } from "../utils/productBrowse.js";


const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSlug = async (name, excludeId = null) => {
  const base = slugify(String(name || ""), { lower: true, strict: true }) || `product-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (await Product.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
};

const findSkuConflicts = async (data, excludeId = null) => {
  const productSku = data.sku ? String(data.sku).trim().toUpperCase() : null;
  const variantSkus = (data.variants || []).map((variant) => String(variant.sku || "").trim().toUpperCase()).filter(Boolean);
  const allSkus = [productSku, ...variantSkus].filter(Boolean);
  if (new Set(allSkus).size !== allSkus.length) return true;
  if (!allSkus.length) return false;
  return Boolean(await Product.exists({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    $or: [{ sku: { $in: allSkus } }, { "variants.sku": { $in: allSkus } }],
  }));
};

const publicProductFilter = { $and: [
  { $or: [{ publicationStatus: "Published" }, { publicationStatus: { $exists: false } }] },
  { status: { $ne: "Archived" } },
] };

// Public catalogue: legacy products without publicationStatus remain visible.
export const browseProducts = async (req, res) => {
  try {
    const filters = parseBrowseParams(req.query);
    const query = buildPublicBrowseQuery(filters);
    const skip = (filters.page - 1) * filters.limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort(getBrowseSort(filters.sort)).skip(skip).limit(filters.limit).lean({ virtuals: true }),
      Product.countDocuments(query),
    ]);
    return res.json({
      products,
      pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit), hasMore: skip + products.length < total },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to browse products.", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, type } = req.query;
    const query = { ...publicProductFilter };
    if (category) query.category = category;
    if (type) query["shoeDetails.type"] = type;
    const products = await Product.find(query).populate("magazineDetails.articles");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ...publicProductFilter });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: "Invalid product reference." });
  }
};

// Admin-only catalogue includes drafts and archived products.
export const getAdminProducts = async (req, res) => {
  try {
    const { search, category, publicationStatus, stockStatus } = req.query;
    const query = {};
    if (category) query.category = category;
    if (publicationStatus) query.publicationStatus = publicationStatus;
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { sku: { $regex: safeSearch, $options: "i" } },
        { slug: { $regex: safeSearch, $options: "i" } },
      ];
    }
    let products = await Product.find(query).sort({ updatedAt: -1 }).lean({ virtuals: true });
    if (stockStatus === "low") products = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5);
    if (stockStatus === "out") products = products.filter((product) => Number(product.stock || 0) === 0);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load inventory.", error: error.message });
  }
};

const normaliseProductInput = (body, existing = {}) => {
  const data = { ...existing, ...body };
  data.name = String(data.name || "").trim();
  data.description = String(data.description || "").trim();
  data.price = Number(data.price);
  data.stock = Number(data.stock || 0);
  data.images = Array.isArray(data.images) ? data.images.filter((image) => typeof image === "string" && image.trim()) : [];
  data.sku = data.sku ? String(data.sku).trim().toUpperCase() : undefined;
  data.variants = Array.isArray(data.variants) ? data.variants.map((variant) => ({
    _id: variant._id,
    sku: String(variant.sku || "").trim().toUpperCase(),
    size: String(variant.size || "").trim(),
    color: String(variant.color || "").trim(),
    price: variant.price === "" || variant.price == null ? undefined : Number(variant.price),
    stock: Number(variant.stock || 0),
    isActive: variant.isActive !== false,
  })) : [];
  if (data.variants.length) {
    data.stock = data.variants.reduce((sum, variant) => sum + (variant.isActive ? variant.stock : 0), 0);
    if (data.category === "Shoe") {
      data.shoeDetails = { ...(data.shoeDetails || {}),
        sizes: [...new Set(data.variants.filter((variant) => String(variant.size || "").trim() !== "").map((variant) => Number(variant.size)).filter(Number.isFinite))],
        color: [...new Set(data.variants.map((variant) => variant.color).filter(Boolean))],
      };
    }
  }
  data.subCategory = data.subCategory || null;
  data.isAuction = Boolean(data.isAuction);
  if (data.isAuction) {
    const startingBid = Number(data.auctionDetails?.startingBid || data.price);
    data.auctionDetails = {
      ...(data.auctionDetails || {}),
      startingBid,
      currentBid: Number(data.auctionDetails?.currentBid || startingBid),
      minBidIncrement: Number(data.auctionDetails?.minBidIncrement || 5000),
      startTime: data.auctionDetails?.startTime ? new Date(data.auctionDetails.startTime) : undefined,
      endTime: data.auctionDetails?.endTime ? new Date(data.auctionDetails.endTime) : undefined,
      reservePrice: data.auctionDetails?.reservePrice ? Number(data.auctionDetails.reservePrice) : undefined,
    };
  }
  return data;
};

export const createProduct = async (req, res) => {
  try {
    const publicationStatus = req.body.publicationStatus === "Draft" ? "Draft" : "Published";
    const productData = normaliseProductInput(req.body);
    const errors = validateProduct(productData, { publishing: publicationStatus === "Published" });
    if (errors.length) return res.status(400).json({ message: "Product validation failed.", errors });
    if (await findSkuConflicts(productData)) return res.status(409).json({ message: "A product or variant SKU is already in use. SKUs must be unique across the catalogue." });
    productData.slug = await buildSlug(productData.name);
    productData.publicationStatus = publicationStatus;
    productData.status = productData.isAuction ? "Auction" : (productData.status || "Available");
    productData.admin = req.user._id;
    if (productData.isAuction) productData.stock = 1;
    const createdProduct = await Product.create(productData);
    return res.status(201).json(createdProduct);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to create product." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product reference." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    const merged = normaliseProductInput(req.body, product.toObject());
    const publicationStatus = req.body.publicationStatus || product.publicationStatus || "Published";
    if (!["Draft", "Published", "Archived"].includes(publicationStatus)) return res.status(400).json({ message: "Invalid publication status." });
    const errors = validateProduct(merged, { publishing: publicationStatus === "Published" });
    if (errors.length && publicationStatus === "Published") return res.status(400).json({ message: "Product validation failed.", errors });
    if (await findSkuConflicts(merged, product._id)) return res.status(409).json({ message: "A product or variant SKU is already in use. SKUs must be unique across the catalogue." });
    if (merged.name !== product.name) merged.slug = await buildSlug(merged.name, product._id);
    const editableFields = ["name", "slug", "description", "price", "sku", "images", "category", "subCategory", "status", "publicationStatus", "archivedAt", "isAuction", "auctionDetails", "shoeDetails", "magazineDetails", "stock", "variants"];
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(merged, field)) product[field] = merged[field];
    }
    product.publicationStatus = publicationStatus;
    product.archivedAt = publicationStatus === "Archived" ? (product.archivedAt || new Date()) : null;
    if (product.isAuction) product.status = "Auction";
    await product.save();
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to update product." });
  }
};

export const archiveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    product.publicationStatus = "Archived";
    product.archivedAt = new Date();
    product.status = "Archived";
    await product.save();
    return res.json({ message: "Product archived.", product });
  } catch (error) {
    return res.status(500).json({ message: "Unable to archive product." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const hasOrderHistory = await Order.exists({ "orderItems.product": product._id });
    if (hasOrderHistory) return res.status(409).json({ message: "This product appears in order history. Archive it instead to preserve records." });
    await product.deleteOne();
    return res.json({ message: "Product removed" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete product." });
  }
};

export const adjustInventory = async (req, res) => {
  try {
    const { change, reason, variantSku } = req.body;
    const delta = Number(change);
    const cleanReason = String(reason || "").trim();
    if (!Number.isInteger(delta) || delta === 0) return res.status(400).json({ message: "Enter a non-zero whole-number stock adjustment." });
    if (cleanReason.length < 3) return res.status(400).json({ message: "Please provide a reason for this adjustment." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    let previousStock;
    let updated;
    const sku = variantSku ? String(variantSku).trim().toUpperCase() : null;
    if (sku) {
      const variant = product.variants.find((entry) => entry.sku === sku);
      if (!variant) return res.status(404).json({ message: "Variant SKU not found." });
      previousStock = variant.stock;
      if (previousStock + delta < 0) return res.status(409).json({ message: "Adjustment would make variant stock negative." });
      updated = await Product.findOneAndUpdate(
        { _id: product._id, variants: { $elemMatch: { sku, stock: { $gte: Math.max(0, -delta) } } } },
        { $inc: { "variants.$.stock": delta, stock: delta } },
        { new: true, runValidators: true },
      );
    } else {
      if (product.variants.length) return res.status(400).json({ message: "This product uses variant-level stock. Select a variant SKU." });
      previousStock = product.stock;
      if (previousStock + delta < 0) return res.status(409).json({ message: "Adjustment would make stock negative." });
      updated = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: Math.max(0, -delta) } },
        { $inc: { stock: delta } },
        { new: true, runValidators: true },
      );
    }
    if (!updated) return res.status(409).json({ message: "Stock changed during this adjustment. Refresh inventory and try again." });
    const newStock = sku ? updated.variants.find((entry) => entry.sku === sku)?.stock : updated.stock;
    await InventoryAdjustment.create({ product: product._id, variantSku: sku, change: delta, previousStock, newStock, reason: cleanReason, adjustedBy: req.user._id });
    return res.json({ message: "Inventory adjusted.", product: updated });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to adjust inventory." });
  }
};

export const getInventoryAdjustments = async (req, res) => {
  try {
    const filter = req.query.productId ? { product: req.query.productId } : {};
    const adjustments = await InventoryAdjustment.find(filter)
      .populate("product", "name sku")
      .populate("adjustedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(adjustments);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load inventory history." });
  }
};

export const validateProductForPublication = async (req, res) => {
  const errors = validateProduct(req.body, { publishing: true });
  if (await findSkuConflicts(req.body, req.body.productId || null)) errors.push("A product or variant SKU is already in use. SKUs must be unique across the catalogue.");
  return res.json({ valid: errors.length === 0, errors });
};
