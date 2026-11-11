import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const readBearerToken = (req) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
};

// Optional authentication: public guest checkout can proceed without a token,
// while a supplied invalid token is still rejected rather than silently ignored.
export const optionalProtect = async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized, user not found" });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// @desc Verify JWT and attach user to request
export const protect = async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Not authorized, user not found" });
    return next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// @desc Check if user is an admin
export const admin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ message: "Access denied. Admin privileges required." });
};
