import crypto from "crypto";
import mongoose from "mongoose";
import axios from "axios";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import OrderLookupOtp from "../models/orderLookupOtpModel.js";
import AbandonedCart from "../models/abandonedCartModel.js";
import { sendEmail } from "../utils/mailer.jsx";
import { calculateOrderAmounts, getOrderExchangeRate, roundMoney } from "../utils/orderPricing.js";
import { getShippingQuote } from "../utils/shipping.js";
import { validateFulfillmentUpdate } from "../utils/orderFulfillment.js";
import { normaliseRefundStatus, getReservedRefundAmount, getOrderRefundStatus, buildRevenueSummary } from "../utils/refundAccounting.js";
import { buildCustomerAnalytics } from "../utils/customerAnalytics.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const safeEqual = (left, right) => {
  if (!left || !right) return false;
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const cleanOrder = (order) => {
  const result = order.toObject ? order.toObject() : { ...order };
  delete result.guestAccessTokenHash;
  delete result.guestOrderAccessTokens;
  return result;
};

const sendOrderConfirmation = async (order) => {
  try {
    let email = order.customer?.email;
    if (!email && order.user) {
      const user = await User.findById(order.user).select("email");
      email = user?.email;
    }
    if (!email) return;

    await sendEmail("ORDER_CONFIRMED", email, {
      orderId: order._id.toString(),
      totalPrice: order.totalPrice,
      currency: order.currency || (order.paymentReference ? "NGN" : "USD"),
      manualReview: order.fulfillmentStatus === "manual_review",
      items: order.orderItems,
      shippingPrice: order.shippingPrice,
      shippingZone: order.shippingZone,
    });
  } catch (error) {
    console.error("Order confirmation email failed:", error.message);
  }
};


const sendFulfillmentUpdate = async (order) => {
  try {
    let email = order.customer?.email;
    if (!email && order.user) {
      const user = await User.findById(order.user).select("email");
      email = user?.email;
    }
    if (!email) return;
    await sendEmail("ORDER_STATUS_UPDATE", email, {
      orderId: order._id.toString(),
      customerName: order.customer?.name || "there",
      status: order.fulfillmentStatus,
      note: order.fulfillmentNote,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
    });
  } catch (error) {
    console.error("Order status email failed:", error.message);
  }
};

const validateCustomer = (input, authenticatedUser) => {
  const customer = {
    name: String(input?.name || authenticatedUser?.name || "").trim(),
    email: String(input?.email || authenticatedUser?.email || "").trim().toLowerCase(),
    phoneNumber: String(input?.phoneNumber || authenticatedUser?.phoneNumber || "").trim(),
  };
  if (customer.name.length < 2) throw Object.assign(new Error("Please provide the customer's full name."), { statusCode: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw Object.assign(new Error("Please provide a valid email address."), { statusCode: 400 });
  if (customer.phoneNumber && customer.phoneNumber.length < 7) throw Object.assign(new Error("Please provide a valid phone number."), { statusCode: 400 });
  if (!authenticatedUser && customer.phoneNumber.length < 7) throw Object.assign(new Error("Please provide a valid phone number."), { statusCode: 400 });
  return customer;
};

const validateShippingAddress = (input) => {
  const address = {
    addressLine1: String(input?.addressLine1 || "").trim(),
    city: String(input?.city || "").trim(),
    state: String(input?.state || "").trim(),
    postalCode: String(input?.postalCode || "").trim(),
    country: String(input?.country || "").trim(),
    deliveryInstructions: String(input?.deliveryInstructions || "").trim(),
  };
  if (!address.addressLine1 || !address.city || !address.country) {
    throw Object.assign(new Error("A delivery address, city and country are required."), { statusCode: 400 });
  }
  return address;
};

const getRequestedProductId = (item) => item?.product || item?.id || item?._id;

// @desc Create a pending order from server-verified catalogue data.
// @route POST /api/orders (guest or authenticated customer)
export const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, customer: customerInput, currency = "NGN", abandonedCartId } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
    if (orderItems.length > 40) return res.status(400).json({ message: "Too many different items in one order." });

    const customer = validateCustomer(customerInput, req.user);
    const address = validateShippingAddress(shippingAddress);
    const selectedCurrency = String(currency).toUpperCase();
    const exchangeRate = getOrderExchangeRate(selectedCurrency);

    const requested = orderItems.map((item) => {
      const productId = getRequestedProductId(item);
      const qty = Number(item?.qty);
      if (!mongoose.isValidObjectId(productId)) throw Object.assign(new Error("One of the cart products is invalid. Please refresh your cart."), { statusCode: 400 });
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw Object.assign(new Error("Each item quantity must be between 1 and 50."), { statusCode: 400 });
      return { productId: String(productId), qty, input: item };
    });

    const uniqueProductIds = [...new Set(requested.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: uniqueProductIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const requestedItems = requested.map(({ productId, qty, input }) => {
      const product = productMap.get(productId);
      if (!product || product.publicationStatus === "Draft" || product.publicationStatus === "Archived") throw Object.assign(new Error("A product in your cart is no longer available."), { statusCode: 409 });
      if (product.isAuction || product.status === "Auction") throw Object.assign(new Error(`${product.name} cannot be purchased through standard checkout.`), { statusCode: 409 });
      if (["Archived", "Sold Out"].includes(product.status)) throw Object.assign(new Error(`${product.name} is currently unavailable.`), { statusCode: 409 });

      const isDigitalMagazine = product.category === "Magazine" && product.magazineDetails?.isDigital === true && input.format === "digital";
      const isPreOrder = product.status === "Pre-Order";
      const stockTracked = !isDigitalMagazine && !isPreOrder;
      let selectedVariant = null;
      if (Array.isArray(product.variants) && product.variants.length && stockTracked) {
        selectedVariant = product.variants.find((variant) => variant.isActive !== false && (
          (input.variantSku && variant.sku === String(input.variantSku).trim().toUpperCase()) ||
          (!input.variantSku && String(variant.size || "") === String(input.size || "") && String(variant.color || "").toLowerCase() === String(input.color || "").toLowerCase())
        ));
        if (!selectedVariant) throw Object.assign(new Error(`Please select an available size/colour variant for ${product.name}.`), { statusCode: 409, code: "VARIANT_REQUIRED" });
        if (Number(selectedVariant.stock || 0) < qty) {
          throw Object.assign(new Error(`Only ${Math.max(0, Number(selectedVariant.stock || 0))} unit(s) of the selected ${product.name} variant are available.`), { statusCode: 409, code: "INSUFFICIENT_STOCK" });
        }
      } else if (stockTracked && Number(product.stock || 0) < qty) {
        throw Object.assign(new Error(`Only ${Math.max(0, Number(product.stock || 0))} unit(s) of ${product.name} are currently available.`), { statusCode: 409, code: "INSUFFICIENT_STOCK" });
      }

      if (!selectedVariant && product.category === "Shoe" && input.size != null && Array.isArray(product.shoeDetails?.sizes) && product.shoeDetails.sizes.length) {
        const requestedSize = Number(input.size);
        if (!product.shoeDetails.sizes.some((size) => Number(size) === requestedSize)) {
          throw Object.assign(new Error(`The selected size for ${product.name} is unavailable.`), { statusCode: 409 });
        }
      }

      const basePriceNGN = Number(selectedVariant?.price ?? product.price);
      if (!Number.isFinite(basePriceNGN) || basePriceNGN < 0) throw Object.assign(new Error(`${product.name} has an invalid catalogue price. Please contact the store.`), { statusCode: 409 });
      return {
        name: product.name,
        qty,
        image: product.images?.[0] || product.magazineDetails?.coverImage || "",
        price: roundMoney(selectedCurrency === "NGN" ? basePriceNGN : basePriceNGN / exchangeRate, selectedCurrency),
        basePriceNGN,
        product: product._id,
        stockTracked,
        configuration: {
          size: input.size ? String(input.size) : undefined,
          color: input.color ? String(input.color) : undefined,
          width: input.width ? String(input.width) : undefined,
          last: input.last ? String(input.last) : undefined,
          material: input.material ? String(input.material) : undefined,
          sole: input.sole ? String(input.sole) : undefined,
          format: input.format ? String(input.format) : undefined,
          variantSku: selectedVariant?.sku || (input.variantSku ? String(input.variantSku).trim().toUpperCase() : undefined),
        },
      };
    });

    const itemsPriceNGN = requestedItems.reduce((sum, item) => sum + item.basePriceNGN * item.qty, 0);
    const shippingQuote = await getShippingQuote({ address, currency: selectedCurrency, exchangeRate });
    const amounts = calculateOrderAmounts({ itemsPriceNGN, currency: selectedCurrency, exchangeRate, shippingPriceNGN: shippingQuote.shippingPriceNGN });
    // Keep the visible line-item sum aligned with the order subtotal after each
    // USD unit price is rounded to cents.
    if (selectedCurrency === "USD") {
      amounts.itemsPrice = roundMoney(
        requestedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
        "USD",
      );
      amounts.totalPrice = roundMoney(
        amounts.itemsPrice + amounts.taxPrice + amounts.shippingPrice,
        "USD",
      );
    }
    const checkoutToken = crypto.randomBytes(32).toString("hex");
    const paymentReference = `OTM-${crypto.randomUUID()}`;

    const order = await Order.create({
      user: req.user?._id || null,
      customer,
      guestAccessTokenHash: hashToken(checkoutToken),
      paymentReference,
      orderItems: requestedItems,
      shippingAddress: address,
      shippingZone: { zoneId: shippingQuote.zone.id, name: shippingQuote.zone.name, country: shippingQuote.zone.country, rateNGN: shippingQuote.shippingPriceNGN },
      paymentMethod: "Flutterwave",
      currency: selectedCurrency,
      baseCurrency: "NGN",
      exchangeRateNGNPerUSD: exchangeRate,
      ...amounts,
    });

    if (mongoose.isValidObjectId(abandonedCartId)) {
      try {
        await AbandonedCart.updateOne(
          { _id: abandonedCartId, email: customer.email, status: "active" },
          { $set: { order: order._id, lastActivityAt: new Date(), processingUntil: null } },
        );
      } catch (linkError) {
        console.error("Could not link abandoned cart to order:", linkError.message);
      }
    }

    return res.status(201).json({
      ...cleanOrder(order),
      checkoutToken,
      payment: {
        provider: "flutterwave",
        tx_ref: paymentReference,
        amount: order.totalPrice,
        currency: order.currency,
        paymentOptions: order.currency === "USD" ? "card" : "card,banktransfer,ussd,account,opay,nqr",
      },
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to create your order.", code: error.code });
  }
};

const getAccessibleOrder = async (req, order) => {
  if (req.user) {
    const orderUserId = order.user?._id?.toString?.() || order.user?.toString?.();
    const isOwner = orderUserId && orderUserId === req.user._id.toString();
    if (isOwner || req.user.isAdmin) return true;
  }
  const token = req.headers["x-order-access-token"] || req.body?.checkoutToken || req.query?.checkoutToken;
  if (typeof token !== "string" || token.length < 32) return false;
  if (order.guestAccessTokenHash && safeEqual(hashToken(token), order.guestAccessTokenHash)) return true;
  const now = Date.now();
  return (order.guestOrderAccessTokens || []).some((entry) =>
    entry.expiresAt && new Date(entry.expiresAt).getTime() > now && safeEqual(hashToken(token), entry.tokenHash),
  );
};

const verifyFlutterwaveTransaction = async (transactionId) => {
  if (!process.env.FLW_SECRET_KEY) throw Object.assign(new Error("Payment verification is temporarily unavailable."), { statusCode: 503 });
  if (!/^\d+$/.test(String(transactionId))) throw Object.assign(new Error("A valid Flutterwave transaction ID is required."), { statusCode: 400 });
  const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    timeout: 15000,
  });
  if (response.data?.status !== "success" || !response.data?.data) {
    throw Object.assign(new Error("Flutterwave could not verify this transaction."), { statusCode: 502 });
  }
  return response.data.data;
};

class InsufficientInventoryError extends Error {}

const persistVerifiedPayment = async (order, transaction) => {
  const transactionId = String(transaction.id);
  if (order.isPaid) return { order, alreadyPaid: true };

  const orderCurrency = order.currency || "USD"; // Historical orders were initialized in USD.
  const expectedAmount = roundMoney(order.totalPrice, orderCurrency);
  const receivedAmount = roundMoney(Number(transaction.amount), orderCurrency);
  const transactionRef = transaction.tx_ref || transaction.txRef;
  const expectedReference = order.paymentReference || order._id.toString();
  if (transaction.status !== "successful" || transactionRef !== expectedReference || transaction.currency !== orderCurrency || receivedAmount !== expectedAmount) {
    throw Object.assign(new Error("Payment verification failed: transaction reference, amount, currency or status did not match the order."), {
      statusCode: 400,
      details: { expectedAmount, receivedAmount, expectedCurrency: orderCurrency, receivedCurrency: transaction.currency },
    });
  }

  const paymentResult = {
    id: transactionId,
    tx_ref: transactionRef,
    status: transaction.status,
    currency: transaction.currency,
    amount: Number(transaction.amount),
    payment_type: transaction.payment_type,
    update_time: new Date().toISOString(),
    email_address: transaction.customer?.email || order.customer?.email,
  };

  const isLegacyOrder = !order.paymentReference;
  const session = await mongoose.startSession();
  let updatedOrder;
  let alreadyPaidDuringTransaction = false;
  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(order._id).session(session);
      if (!currentOrder) throw Object.assign(new Error("Order not found."), { statusCode: 404 });
      if (currentOrder.isPaid) {
        updatedOrder = currentOrder;
        alreadyPaidDuringTransaction = true;
        return;
      }

      const stockRequirements = new Map();
      for (const item of (isLegacyOrder ? [] : currentOrder.orderItems)) {
        if (!item.stockTracked) continue;
        const productId = item.product.toString();
        const variantSku = item.configuration?.variantSku || null;
        const key = `${productId}:${variantSku || "__product__"}`;
        const current = stockRequirements.get(key) || { productId, variantSku, qty: 0 };
        current.qty += item.qty;
        stockRequirements.set(key, current);
      }

      for (const { productId, variantSku, qty } of stockRequirements.values()) {
        const filter = variantSku
          ? { _id: productId, variants: { $elemMatch: { sku: variantSku, isActive: true, stock: { $gte: qty } } } }
          : { _id: productId, stock: { $gte: qty } };
        const update = variantSku
          ? { $inc: { "variants.$.stock": -qty, stock: -qty } }
          : { $inc: { stock: -qty } };
        const result = await Product.updateOne(filter, update, { session });
        if (result.modifiedCount !== 1) throw new InsufficientInventoryError("Inventory changed before payment completed.");
      }

      currentOrder.isPaid = true;
      currentOrder.paymentStatus = "paid";
      currentOrder.fulfillmentStatus = "processing";
      currentOrder.stockDeducted = !isLegacyOrder;
      currentOrder.paidAt = new Date();
      currentOrder.paymentResult = paymentResult;
      await currentOrder.save({ session });
      updatedOrder = currentOrder;
    });
  } catch (error) {
    if (error instanceof InsufficientInventoryError) {
      // The payment is real, but stock was consumed by another checkout first.
      // Record the payment and flag the order for staff intervention rather than
      // allowing another charge or silently overselling the item.
      updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id, isPaid: false },
        {
          $set: {
            isPaid: true,
            paymentStatus: "paid_review",
            fulfillmentStatus: "manual_review",
            stockDeducted: false,
            paidAt: new Date(),
            paymentResult,
          },
        },
        { new: true },
      );
      if (updatedOrder) return { order: updatedOrder, alreadyPaid: false, inventoryReviewRequired: true };
      const latest = await Order.findById(order._id);
      if (latest?.isPaid) return { order: latest, alreadyPaid: true };
    } else {
      throw error;
    }
  } finally {
    await session.endSession();
  }

  return { order: updatedOrder, alreadyPaid: alreadyPaidDuringTransaction };
};

const verifyAndSettleOrder = async (order, transactionId) => {
  if (order.isPaid) return { order, alreadyPaid: true };
  const transaction = await verifyFlutterwaveTransaction(transactionId);
  const result = await persistVerifiedPayment(order, transaction);
  if (result.order?.isPaid) {
    await AbandonedCart.updateMany({ email: String(result.order.customer?.email || "").toLowerCase(), status: "active" }, { $set: { status: "converted" }, $unset: { processingUntil: 1 } });
  }
  if (!result.alreadyPaid) await sendOrderConfirmation(result.order);
  return result;
};

// @desc Verify payment using Flutterwave's server-to-server verification API.
// @route POST /api/orders/:id/verify-payment
export const verifyOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("+guestAccessTokenHash");
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!(await getAccessibleOrder(req, order))) return res.status(403).json({ message: "You are not authorised to access this order." });
    if (order.isPaid) return res.json({ ...cleanOrder(order), alreadyPaid: true });

    const transactionId = req.body.transaction_id || req.body.id;
    const result = await verifyAndSettleOrder(order, transactionId);
    return res.json({ ...cleanOrder(result.order), alreadyPaid: result.alreadyPaid, inventoryReviewRequired: Boolean(result.inventoryReviewRequired) });
  } catch (error) {
    console.error("Flutterwave verification error:", error.response?.data || error.message);
    return res.status(error.statusCode || 502).json({ message: error.message || "Unable to verify payment.", details: error.details });
  }
};

// Backward-compatible handler for the previous /:id/pay route.
export const updateOrderToPaid = verifyOrderPayment;

// @desc Retrieve one order for its owner, an admin, or a guest with its checkout token.
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("+guestAccessTokenHash").populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!(await getAccessibleOrder(req, order))) return res.status(403).json({ message: "You are not authorised to access this order." });
    return res.json(cleanOrder(order));
  } catch (error) {
    return res.status(400).json({ message: "Invalid order reference." });
  }
};

// @desc Get all orders (admin only).
export const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders.map(cleanOrder));
};

// @desc Flutterwave webhook. Verify the transaction with Flutterwave before changing order state.
export const flutterwaveWebhook = async (req, res) => {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];
  if (!secretHash || !safeEqual(signature, secretHash)) return res.status(401).json({ message: "Invalid webhook signature." });

  const payload = req.body?.data || req.body;
  const transactionId = payload?.id;
  const transactionRef = payload?.tx_ref;
  if (!transactionId || !transactionRef) return res.status(400).json({ message: "Webhook transaction reference is missing." });
  if (payload.status && payload.status !== "successful") return res.status(200).json({ received: true });

  try {
    const order = await Order.findOne({ paymentReference: transactionRef }) || (mongoose.isValidObjectId(transactionRef) ? await Order.findById(transactionRef) : null);
    if (!order) return res.status(200).json({ received: true, matched: false });
    await verifyAndSettleOrder(order, transactionId);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook processing error:", error.response?.data || error.message);
    // Non-2xx tells Flutterwave to retry temporary verification/database failures.
    return res.status(500).json({ message: "Webhook processing failed; retry is safe." });
  }
};


// @desc Update fulfilment progress and delivery tracking (admin only).
// @route PATCH /api/orders/:id/fulfillment
export const updateOrderFulfillment = async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const previousStatus = order.fulfillmentStatus;
    const note = req.body.note == null ? order.fulfillmentNote : String(req.body.note).trim();
    const trackingNumber = req.body.trackingNumber == null ? order.trackingNumber : String(req.body.trackingNumber).trim();
    const trackingUrl = req.body.trackingUrl == null ? order.trackingUrl : String(req.body.trackingUrl).trim();
    const validationMessage = validateFulfillmentUpdate({ status, isPaid: order.isPaid, refundStatus: order.refundStatus, note, trackingNumber, trackingUrl });
    if (validationMessage) return res.status(400).json({ message: validationMessage });
    const shouldNotify = previousStatus !== status || note !== order.fulfillmentNote || trackingNumber !== order.trackingNumber || trackingUrl !== order.trackingUrl;

    order.fulfillmentStatus = status;
    order.fulfillmentNote = note;
    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    order.fulfillmentUpdatedAt = new Date();
    if (status === "completed") {
      order.isDelivered = true;
      order.deliveredAt = order.deliveredAt || new Date();
    } else if (previousStatus === "completed") {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }
    await order.save();
    if (shouldNotify) await sendFulfillmentUpdate(order);
    return res.json(cleanOrder(order));
  } catch (error) {
    console.error("Order fulfilment update failed:", error.message);
    return res.status(500).json({ message: "Unable to update this order." });
  }
};


const lookupOtpHash = (email, code) => {
  const secret = process.env.ORDER_LOOKUP_OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("ORDER_LOOKUP_OTP_SECRET or JWT_SECRET must be configured.");
  return crypto.createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
};

const genericLookupMessage = "If this email is associated with orders, a verification code will be sent shortly.";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOrdersForCustomerEmail = async (email) => {
  const emailPattern = new RegExp(`^${escapeRegex(email)}$`, "i");
  const users = await User.find({ email: emailPattern }).select("_id").lean();
  const ownership = [{ "customer.email": email }];
  if (users.length) ownership.push({ user: { $in: users.map((user) => user._id) } });
  return Order.find({ $or: ownership }).sort({ createdAt: -1 });
};

const publicOrderSummary = (order) => ({
  _id: order._id,
  paymentReference: order.paymentReference || String(order._id),
  createdAt: order.createdAt,
  currency: order.currency || "USD",
  totalPrice: order.totalPrice,
  isPaid: Boolean(order.isPaid),
  paymentStatus: order.paymentStatus || (order.isPaid ? "paid" : "pending"),
  fulfillmentStatus: order.fulfillmentStatus || "pending",
  refundStatus: order.refundStatus || "none",
  trackingNumber: order.trackingNumber || "",
  trackingUrl: order.trackingUrl || "",
  fulfillmentNote: order.fulfillmentNote || "",
  orderItems: (order.orderItems || []).map((item) => ({ name: item.name, qty: item.qty, price: item.price, image: item.image, configuration: item.configuration })),
});

// @route POST /api/orders/lookup/request-code
export const requestOrderLookupCode = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(200).json({ message: genericLookupMessage });
  }
  try {
    const matchingUser = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") }).select("_id").lean();
    const hasOrders = await Order.exists({ $or: [{ "customer.email": email }, ...(matchingUser ? [{ user: matchingUser._id }] : [])] });
    if (hasOrders) {
      await OrderLookupOtp.deleteMany({ email, consumedAt: null });
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
      await OrderLookupOtp.create({
        email,
        codeHash: lookupOtpHash(email, code),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendEmail("ORDER_LOOKUP_CODE", email, { customerName: "there", orderReference: "your order history", code });
    }
    return res.json({ message: genericLookupMessage });
  } catch (error) {
    console.error("Order lookup code request failed:", error.message);
    return res.status(200).json({ message: genericLookupMessage });
  }
};

// @route POST /api/orders/lookup/verify-code
export const verifyOrderLookupCode = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const code = String(req.body.code || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "Enter your checkout email and six-digit code." });
  }
  try {
    const challenge = await OrderLookupOtp.findOne({ email, consumedAt: null, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } }).sort({ createdAt: -1 });
    if (!challenge || !safeEqual(lookupOtpHash(email, code), challenge.codeHash)) {
      if (challenge) { challenge.attempts += 1; await challenge.save(); }
      return res.status(400).json({ message: "The code is invalid or has expired. Request a new one." });
    }
    const orders = await findOrdersForCustomerEmail(email);
    const consumed = await OrderLookupOtp.updateOne({ _id: challenge._id, consumedAt: null, attempts: { $lt: 5 } }, { $set: { consumedAt: new Date() } });
    if (consumed.modifiedCount !== 1) return res.status(400).json({ message: "The code has already been used. Request a new one." });
    if (!orders.length) return res.status(400).json({ message: "No orders were found for this email address." });

    const accessToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(accessToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    for (const order of orders) {
      order.guestOrderAccessTokens = (order.guestOrderAccessTokens || [])
        .filter((entry) => new Date(entry.expiresAt).getTime() > Date.now());
      order.guestOrderAccessTokens.push({ tokenHash, expiresAt });
      await order.save();
    }
    return res.json({ orders: orders.map(publicOrderSummary), accessToken, expiresIn: 1800 });
  } catch (error) {
    console.error("Order lookup verification failed:", error.message);
    return res.status(500).json({ message: "Unable to verify the code right now. Please try again." });
  }
};

// @route POST /api/orders/:id/refunds (admin only)
export const initiateOrderRefund = async (req, res) => {
  const requestKey = String(req.body.requestKey || "").trim();
  const reason = String(req.body.reason || "").trim().slice(0, 500);
  let amount = Number(req.body.amount);
  if (!requestKey || requestKey.length < 12 || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "A unique request key and a valid refund amount are required." });
  }

  let order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  const existing = order.refunds?.find((refund) => refund.requestKey === requestKey);
  if (existing) return res.json({ order: cleanOrder(order), refund: existing, duplicateRequest: true });
  if (!order.isPaid || !order.paymentResult?.id) return res.status(409).json({ message: "Only verified Flutterwave payments can be refunded here." });
  if (order.refundInProgress) return res.status(409).json({ message: "Another refund request is being reconciled for this order. Refresh its status before starting another." });
  const currency = order.currency || "USD";
  amount = roundMoney(amount, currency);
  if (amount <= 0) return res.status(400).json({ message: "The refund amount is below the minimum precision for this currency." });
  if (currency === "NGN" && amount < 100) return res.status(400).json({ message: "Flutterwave's minimum NGN refund is ₦100." });

  const lockedOrder = await Order.findOneAndUpdate(
    { _id: order._id, isPaid: true, refundInProgress: { $ne: true } },
    { $set: { refundInProgress: true } },
    { new: true },
  );
  if (!lockedOrder) return res.status(409).json({ message: "A refund is already being processed for this order. Refresh and try again." });

  const reservedAmount = getReservedRefundAmount(lockedOrder.refunds || []);
  const remaining = roundMoney(Number(lockedOrder.totalPrice) - reservedAmount, currency);
  if (amount > remaining + 0.000001) {
    lockedOrder.refundInProgress = false;
    await lockedOrder.save();
    return res.status(400).json({ message: `The maximum remaining refundable amount is ${remaining} ${currency}.` });
  }

  try {
    if (!process.env.FLW_SECRET_KEY) throw Object.assign(new Error("Flutterwave refunds are not configured on the server."), { statusCode: 503 });
    const response = await axios.post(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(lockedOrder.paymentResult.id))}/refund`,
      { amount, comments: reason || `Refund for Olú The Maker order ${lockedOrder._id}` },
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, "Content-Type": "application/json" }, timeout: 20000 },
    );
    if (response.data?.status !== "success" || !response.data?.data) {
      throw Object.assign(new Error(response.data?.message || "Flutterwave did not accept the refund request."), { statusCode: 502, providerRejected: true });
    }
    const provider = response.data.data;
    const refund = {
      requestKey,
      amount: roundMoney(Number(provider.amount_refunded ?? amount), currency),
      currency,
      reason,
      status: normaliseRefundStatus(provider.status),
      providerStatus: String(provider.status || "initiated"),
      flutterwaveRefundId: String(provider.id || ""),
      flutterwaveReference: String(provider.flw_ref || ""),
      transactionId: String(lockedOrder.paymentResult.id),
      initiatedBy: req.user?._id,
      initiatedAt: new Date(),
      updatedAt: new Date(),
    };
    lockedOrder.refunds.push(refund);
    lockedOrder.refundStatus = getOrderRefundStatus(lockedOrder.refunds, lockedOrder.totalPrice);
    lockedOrder.refundInProgress = false;
    await lockedOrder.save();
    return res.status(201).json({ order: cleanOrder(lockedOrder), refund: lockedOrder.refunds[lockedOrder.refunds.length - 1] });
  } catch (error) {
    console.error("Flutterwave refund initiation failed:", error.response?.data || error.message);
    if (error.response || error.providerRejected || error.statusCode) {
      lockedOrder.refunds.push({ requestKey, amount, currency, reason, status: "failed", providerStatus: error.response?.data?.message || error.message, transactionId: String(lockedOrder.paymentResult.id), initiatedBy: req.user?._id });
      lockedOrder.refundStatus = getOrderRefundStatus(lockedOrder.refunds, lockedOrder.totalPrice);
      lockedOrder.refundInProgress = false;
    } else {
      // A network timeout can happen after Flutterwave accepted the request. Keep the lock
      // until the merchant reconciles the provider dashboard; never risk issuing a duplicate.
      lockedOrder.refunds.push({ requestKey, amount, currency, reason, status: "unknown", providerStatus: "Provider response unavailable; manual reconciliation required", transactionId: String(lockedOrder.paymentResult.id), initiatedBy: req.user?._id });
      lockedOrder.refundStatus = getOrderRefundStatus(lockedOrder.refunds, lockedOrder.totalPrice);
    }
    await lockedOrder.save();
    return res.status(error.statusCode || 502).json({ message: error.message || "Refund result is uncertain. Reconcile it in Flutterwave before retrying." });
  }
};

// @route POST /api/orders/:id/refunds/:refundId/refresh (admin only)
export const refreshOrderRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    const refund = order.refunds.id(req.params.refundId);
    if (!refund) return res.status(404).json({ message: "Refund record not found." });
    const suppliedRefundId = String(req.body.flutterwaveRefundId || "").trim();
    if (/^\d+$/.test(suppliedRefundId) && suppliedRefundId !== refund.flutterwaveRefundId) {
      refund.flutterwaveRefundId = suppliedRefundId;
      await order.save();
    }
    if (!refund.flutterwaveRefundId) return res.status(409).json({ message: "Enter the refund ID from your Flutterwave dashboard to reconcile this request." });
    const response = await axios.get(`https://api.flutterwave.com/v3/refunds/${encodeURIComponent(refund.flutterwaveRefundId)}`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }, timeout: 15000,
    });
    if (response.data?.status !== "success" || !response.data?.data) throw new Error("Flutterwave could not retrieve this refund yet.");
    const provider = response.data.data;
    refund.providerStatus = String(provider.status || refund.providerStatus);
    refund.status = normaliseRefundStatus(provider.status);
    refund.amount = roundMoney(Number(provider.amount_refunded ?? provider.AmountRefunded ?? refund.amount), refund.currency);
    refund.flutterwaveReference = String(provider.flw_ref || provider.FlwRef || refund.flutterwaveReference);
    refund.updatedAt = new Date();
    order.refundInProgress = order.refunds.some((entry) => entry.status === "unknown");
    order.refundStatus = getOrderRefundStatus(order.refunds, order.totalPrice);
    await order.save();
    return res.json({ order: cleanOrder(order), refund });
  } catch (error) {
    console.error("Refund status refresh failed:", error.response?.data || error.message);
    return res.status(502).json({ message: error.message || "Unable to refresh refund status." });
  }
};

// @route GET /api/orders/analytics/revenue (admin only)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const filter = { isPaid: true };
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) {
        const from = new Date(`${req.query.from}T00:00:00.000Z`);
        if (Number.isNaN(from.getTime())) return res.status(400).json({ message: "Invalid start date." });
        filter.createdAt.$gte = from;
      }
      if (req.query.to) {
        const to = new Date(`${req.query.to}T23:59:59.999Z`);
        if (Number.isNaN(to.getTime())) return res.status(400).json({ message: "Invalid end date." });
        filter.createdAt.$lte = to;
      }
    }
    const orders = await Order.find(filter).select("currency totalPrice refunds createdAt").lean();
    const totals = buildRevenueSummary(orders);
    for (const currency of ["NGN", "USD"]) {
      for (const key of ["grossCaptured", "refundsInitiated", "refundsCompleted", "refundsFailed"]) totals[currency][key] = roundMoney(totals[currency][key], currency);
      totals[currency].netAfterInitiatedRefunds = roundMoney(totals[currency].grossCaptured - totals[currency].refundsInitiated, currency);
    }
    return res.json({ generatedAt: new Date().toISOString(), orderCount: orders.length, currencies: totals });
  } catch (error) {
    console.error("Revenue analytics failed:", error.message);
    return res.status(500).json({ message: "Unable to load revenue analytics." });
  }
};


// @route GET /api/orders/analytics/customers (admin only)
export const getCustomerAnalytics = async (req, res) => {
  try {
    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };
    const now = new Date();
    const toValue = req.query.to || now.toISOString().slice(0, 10);
    const defaultFrom = new Date(now);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
    const fromValue = req.query.from || defaultFrom.toISOString().slice(0, 10);
    if (!validDate(fromValue)) return res.status(400).json({ message: "Invalid start date." });
    if (!validDate(toValue)) return res.status(400).json({ message: "Invalid end date." });

    const from = new Date(`${fromValue}T00:00:00.000Z`);
    const to = new Date(`${toValue}T23:59:59.999Z`);
    if (from > to) return res.status(400).json({ message: "The start date must be before the end date." });

    // Group by normalized checkout email so guest and registered checkouts
    // using the same email are treated as one customer. Fall back to account ID
    // for legacy orders without a stored customer email.
    const customers = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $lte: to } } },
      { $addFields: {
        analyticsCustomerKey: {
          $cond: [
            { $ne: [{ $trim: { input: { $ifNull: ["$customer.email", ""] } } }, ""] },
            { $toLower: { $trim: { input: "$customer.email" } } },
            { $concat: ["account:", { $toString: { $ifNull: ["$user", "$_id"] } }] },
          ],
        },
      } },
      { $sort: { createdAt: 1 } },
      { $group: {
        _id: "$analyticsCustomerKey",
        firstPaidAt: { $min: "$createdAt" },
        lifetimeOrderCount: { $sum: 1 },
        periodOrders: { $sum: { $cond: [{ $gte: ["$createdAt", from] }, 1, 0] } },
        country: { $last: "$shippingAddress.country" },
        state: { $last: "$shippingAddress.state" },
      } },
      { $match: { periodOrders: { $gt: 0 } } },
      { $project: { _id: 0, firstPaidAt: 1, lifetimeOrderCount: 1, periodOrders: 1, country: 1, state: 1 } },
    ]);

    const analytics = buildCustomerAnalytics(customers, from, to);
    return res.json({ generatedAt: new Date().toISOString(), period: { from: fromValue, to: toValue }, ...analytics });
  } catch (error) {
    console.error("Customer analytics failed:", error.message);
    return res.status(500).json({ message: "Unable to load customer analytics." });
  }
};
