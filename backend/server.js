// server.js
import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
app.set("trust proxy", 1);
// --- MIDDLEWARE ---

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global limiter: Max 100 requests per 15 mins
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: "Too many requests, please try again later." },
  standardHeaders: true, // Returns RateLimit-Limit headers
  legacyHeaders: false,
});

// Stricter limiter for Auth (Signups/OTP): Max 5 attempts per hour
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { msg: "Too many auth attempts. Please wait an hour." },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api/", apiLimiter);

// --- ROUTES ---
app.use("/api", globalLimiter);
app.get("/", (req, res) => {
  res.send("Olu The Maker API is running...");
});

app.use("/api/products", productRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
