import crypto from "crypto";
import mongoose from "mongoose";
import AbandonedCart from "../models/abandonedCartModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import { hashAbandonedCartToken, safeTokenEqual, encryptAbandonedCartToken, decryptAbandonedCartToken } from "../utils/abandonedCartTokens.js";
import { sendEmail } from "../utils/mailer.jsx";

const safeConfiguration = (item = {}) => ({
  size: item.size ? String(item.size).slice(0, 40) : undefined,
  color: item.color ? String(item.color).slice(0, 60) : undefined,
  width: item.width ? String(item.width).slice(0, 40) : undefined,
  last: item.last ? String(item.last).slice(0, 60) : undefined,
  material: item.material ? String(item.material).slice(0, 60) : undefined,
  sole: item.sole ? String(item.sole).slice(0, 60) : undefined,
  format: item.format ? String(item.format).slice(0, 30) : undefined,
  variantSku: item.variantSku ? String(item.variantSku).trim().toUpperCase().slice(0, 60) : undefined,
});

// Capture only after the customer has explicitly opted in at checkout.
export const captureAbandonedCart = async (req, res) => {
  try {
    const { customer, items, currency = "NGN", consent, abandonedCartId } = req.body || {};
    if (consent !== true) return res.status(400).json({ message: "Explicit reminder consent is required." });
    const name = String(customer?.name || "").trim();
    const email = String(customer?.email || "").trim().toLowerCase();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please provide a valid name and email address." });
    if (!Array.isArray(items) || !items.length || items.length > 40) return res.status(400).json({ message: "Your selection is empty or contains too many items." });
    const selectedCurrency = String(currency).toUpperCase();
    if (!["NGN", "USD"].includes(selectedCurrency)) return res.status(400).json({ message: "Unsupported checkout currency." });

    const cleanItems = items.map((item) => {
      const productId = String(item?.productId || item?.product || "");
      const qty = Number(item?.qty);
      if (!mongoose.isValidObjectId(productId) || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        throw Object.assign(new Error("One of the selected items is invalid."), { statusCode: 400 });
      }
      return { product: productId, qty, configuration: safeConfiguration(item) };
    });
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    let cart = null;
    if (mongoose.isValidObjectId(abandonedCartId)) {
      cart = await AbandonedCart.findOneAndUpdate(
        { _id: abandonedCartId, email, status: "active" },
        { $set: { customerName: name, currency: selectedCurrency, items: cleanItems, lastActivityAt: now, expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), processingUntil: null } },
        { new: true, runValidators: true },
      );
    }
    if (!cart) {
      cart = await AbandonedCart.create({
        customerName: name, email, currency: selectedCurrency, items: cleanItems,
        recoveryTokenHash: hashAbandonedCartToken(token), tokenCiphertext: encryptAbandonedCartToken(token), consentedAt: now, lastActivityAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
    }
    return res.status(201).json({ abandonedCartId: cart._id.toString() });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to save your checkout selection." });
  }
};

// Resolve current catalogue data on restore; browser-submitted prices are never used.
export const recoverAbandonedCart = async (req, res) => {
  try {
    const token = String(req.params.token || "");
    if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(404).json({ message: "This checkout recovery link is invalid or expired." });
    const cart = await AbandonedCart.findOne({ recoveryTokenHash: hashAbandonedCartToken(token), status: "active", expiresAt: { $gt: new Date() } }).select("+recoveryTokenHash");
    if (!cart || !safeTokenEqual(cart.recoveryTokenHash, hashAbandonedCartToken(token))) return res.status(404).json({ message: "This checkout recovery link is invalid or expired." });

    const ids = cart.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: ids }, publicationStatus: "Published", status: { $nin: ["Archived", "Sold Out", "Auction"] }, isAuction: { $ne: true } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const restoredItems = cart.items.map((saved) => {
      const product = productMap.get(saved.product.toString());
      if (!product) return { productId: saved.product.toString(), qty: saved.qty, isAvailable: false, availabilityMessage: "This product is no longer available." };
      const config = saved.configuration?.toObject ? saved.configuration.toObject() : saved.configuration || {};
      const variant = config.variantSku
        ? product.variants.find((entry) => entry.sku === config.variantSku && entry.isActive !== false)
        : product.variants.find((entry) => entry.isActive !== false && String(entry.size || "") === String(config.size || "") && String(entry.color || "").toLowerCase() === String(config.color || "").toLowerCase());
      const variantRequired = product.variants.length > 0 && product.category !== "Magazine" && product.status !== "Pre-Order";
      const digital = product.category === "Magazine" && product.magazineDetails?.isDigital && config.format === "digital";
      const stockTracked = !digital && product.status !== "Pre-Order";
      const stock = variant ? Number(variant.stock || 0) : Number(product.stock || 0);
      const available = (!variantRequired || Boolean(variant)) && (!stockTracked || stock >= saved.qty);
      return {
        productId: product._id.toString(), id: product._id.toString(), _id: product._id.toString(),
        name: product.name, slug: product.slug, category: product.category,
        image: product.images?.[0] || product.magazineDetails?.coverImage || "",
        price: Number(variant?.price ?? product.price), basePrice: Number(product.price), qty: saved.qty,
        ...config, variantSku: variant?.sku || config.variantSku || "",
        availableStock: stockTracked ? stock : null, stockTracked, isAvailable: available,
        availabilityMessage: available ? "" : "The saved size, colour or quantity is no longer available.",
      };
    });
    cart.lastActivityAt = new Date();
    cart.processingUntil = null;
    await cart.save();
    return res.json({ abandonedCartId: cart._id.toString(), currency: cart.currency, items: restoredItems, customer: { name: cart.customerName, email: cart.email } });
  } catch (error) {
    console.error("Abandoned cart recovery failed:", error.message);
    return res.status(500).json({ message: "Unable to restore this checkout. Please return to the store." });
  }
};

export const withdrawAbandonedCartConsent = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!mongoose.isValidObjectId(req.params.id) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid checkout reference and email are required." });
  }
  const cart = await AbandonedCart.findOneAndUpdate(
    { _id: req.params.id, email, status: "active" },
    { $set: { status: "unsubscribed" }, $unset: { processingUntil: 1 } },
    { new: true },
  );
  if (!cart) return res.status(404).json({ message: "The checkout reminder record was not found." });
  return res.json({ message: "Checkout reminders have been turned off." });
};

export const unsubscribeAbandonedCart = async (req, res) => {
  const token = String(req.params.token || "");
  if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(404).json({ message: "This reminder link is invalid or expired." });
  const cart = await AbandonedCart.findOneAndUpdate(
    { recoveryTokenHash: hashAbandonedCartToken(token), status: "active", expiresAt: { $gt: new Date() } },
    { $set: { status: "unsubscribed" }, $unset: { processingUntil: 1 } },
    { new: true },
  );
  if (!cart) return res.status(404).json({ message: "This reminder link is invalid or expired." });
  return res.json({ message: "You will not receive any more reminders for this checkout." });
};

const isCronAuthorized = (req) => {
  const expected = process.env.ABANDONED_CART_CRON_SECRET;
  const supplied = req.get("x-cron-secret") || "";
  return Boolean(expected) && safeTokenEqual(expected, supplied);
};

export const runAbandonedCartProcessor = async () => {
  const now = new Date();
  await AbandonedCart.updateMany({ status: "active", expiresAt: { $lte: now } }, { $set: { status: "expired" }, $unset: { processingUntil: 1 } });
  const reminderScheduleDue = [
    { firstReminderSentAt: null, lastActivityAt: { $lte: new Date(now.getTime() - 60 * 60 * 1000) } },
    { firstReminderSentAt: { $ne: null }, secondReminderSentAt: null, lastActivityAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
  ];
  const due = await AbandonedCart.find({
    status: "active", expiresAt: { $gt: now },
    $or: [{ processingUntil: null }, { processingUntil: { $lt: now } }],
    $and: [{ $or: reminderScheduleDue }],
  }).select("+tokenCiphertext").sort({ lastActivityAt: 1 }).limit(50);

  let sent = 0;
  let skipped = 0;
  for (const candidate of due) {
    const claim = await AbandonedCart.findOneAndUpdate(
      {
        _id: candidate._id,
        status: "active",
        expiresAt: { $gt: now },
        $or: [{ processingUntil: null }, { processingUntil: { $lt: now } }],
        $and: [{ $or: reminderScheduleDue }],
      },
      { $set: { processingUntil: new Date(now.getTime() + 10 * 60 * 1000) } },
      { new: true },
    ).select("+tokenCiphertext");
    if (!claim) { skipped += 1; continue; }
    try {
      if (claim.order) {
        const order = await Order.findById(claim.order).select("isPaid");
        if (order?.isPaid) {
          await AbandonedCart.updateOne({ _id: claim._id }, { $set: { status: "converted" }, $unset: { processingUntil: 1 } });
          skipped += 1;
          continue;
        }
      }
      const reminderNumber = claim.firstReminderSentAt ? 2 : 1;
      const products = await Product.find({ _id: { $in: claim.items.map((item) => item.product) } }).select("name");
      const names = new Map(products.map((product) => [product._id.toString(), product.name]));
      const rawToken = decryptAbandonedCartToken(claim.tokenCiphertext);
      if (!rawToken) throw new Error("Recovery token is unavailable for this reminder.");
      const recoveryUrl = `${process.env.FRONTEND_URL}/cart/recover/${rawToken}`;
      const result = await sendEmail("ABANDONED_CART", claim.email, {
        customerName: claim.customerName,
        reminderNumber,
        recoveryUrl,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/cart/unsubscribe/${rawToken}`,
        items: claim.items.map((item) => ({ productId: item.product.toString(), name: names.get(item.product.toString()) || "Unavailable item", qty: item.qty })),
      });
      if (!result) throw new Error("Email provider did not confirm delivery.");
      const sentAt = new Date();
      await AbandonedCart.updateOne({ _id: claim._id }, {
        $set: reminderNumber === 1 ? { firstReminderSentAt: sentAt } : { secondReminderSentAt: sentAt },
        $unset: { processingUntil: 1 },
      });
      sent += 1;
    } catch (error) {
      console.error(`Abandoned cart reminder failed (${claim._id}):`, error.message);
      await AbandonedCart.updateOne({ _id: claim._id }, { $unset: { processingUntil: 1 } });
    }
  }
  return { processed: due.length, sent, skipped };
};

// Protected manual endpoint for diagnostics; the normal worker runs in-process.
export const processAbandonedCarts = async (req, res) => {
  if (!isCronAuthorized(req)) return res.status(401).json({ message: "Unauthorized." });
  try {
    const result = await runAbandonedCartProcessor();
    return res.json(result);
  } catch (error) {
    console.error("Abandoned cart processor failed:", error.message);
    return res.status(500).json({ message: "Unable to process abandoned-cart reminders." });
  }
};

