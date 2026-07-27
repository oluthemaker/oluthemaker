import Order from "../models/orderModel.js";
import axios from "axios";
import { sendEmail } from "../utils/mailer.jsx";

// @desc    Create new order
// @route   POST /api/orders
// @desc    Create new order
// @route   POST /api/orders
export const addOrderItems = async (req, res) => {
  const {
    orderItems, // This now includes the  details from our Zustand store
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  const order = new Order({
    orderItems: orderItems.map((x) => ({
      ...x,
      product: x.id, // mapping frontend 'id' to backend 'product'
      configuration: {
        size: x.size,
        width: x.width,
        last: x.last,
        material: x.material,
        sole: x.sole,
        format: x.format,
      },
      _id: undefined, // clean up id so mongo creates a fresh one for the subdoc
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Update order to paid (The Flutterwave Verification)
// @route   PUT /api/orders/:id/pay
export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // 1. Check if already paid to avoid duplicate logic/emails
  if (order.isPaid) {
    return res.status(400).json({ message: "Order is already marked as paid" });
  }

  const { transaction_id } = req.body;

  try {
    // 2. Verify with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      },
    );

    const { status, amount, currency, customer } = response.data.data;

    // 3. Precision-safe check & Currency match
    // Using Math.floor to avoid 0.0000001 cent mismatches
    const isAmountValid = Math.floor(amount) >= Math.floor(order.totalPrice);
    const isMatch =
      status === "successful" && isAmountValid && currency === "USD";

    if (isMatch) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: transaction_id,
        status: status,
        update_time: Date.now().toString(),
        email_address: customer.email,
      };

      const updatedOrder = await order.save();

      // 4. Send response first for UI speed
      res.json(updatedOrder);

      // 5. Fire email in background (Fire and Forget)
      sendEmail("ORDER_CONFIRMED", req.user.email, {
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
        items: order.orderItems,
      }).catch((err) => console.error("Order Email Failed:", err));
    } else {
      res.status(400).json({
        message: "Payment verification failed: Data mismatch.",
        details: { expected: order.totalPrice, received: amount, currency },
      });
    }
  } catch (error) {
    console.error(
      "Flutterwave Verification Error:",
      error.response?.data || error.message,
    );
    res
      .status(500)
      .json({ message: "Internal server error during payment verification." });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  // We 'populate' the 'user' field and select only 'name' and 'email'
  // We exclude the password and other sensitive data for security.
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 }); // Optional: shows newest orders first

  res.json(orders);
};

export const flutterwaveWebhook = async (req, res) => {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];

  if (!signature || signature !== secretHash) {
    return res.status(401).end();
  }

  // Flutterwave sends the payload in req.body
  const { status, tx_ref, id, amount } = req.body;

  try {
    if (status === "successful") {
      const order = await Order.findById(tx_ref);

      if (order && !order.isPaid) {
        // Double check amount to be safe (optional but recommended)
        if (Math.floor(amount) >= Math.floor(order.totalPrice)) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: id,
            status: status,
            update_time: Date.now().toString(),
          };

          await order.save();

          // Trigger the email in the background
          sendEmail("ORDER_CONFIRMED", order.user.email, {
            orderId: order._id.toString(),
            totalPrice: order.totalPrice,
            items: order.orderItems,
          }).catch((err) => console.error("Webhook Email Error:", err));
        }
      }
    }
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    // Still return 200 so FLW stops retrying, but log the error for yourself
  }

  res.status(200).end();
};
