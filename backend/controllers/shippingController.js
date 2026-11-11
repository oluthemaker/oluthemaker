import mongoose from "mongoose";
import ShippingZone from "../models/shippingZoneModel.js";
import { getOrderExchangeRate } from "../utils/orderPricing.js";
import { getShippingQuote } from "../utils/shipping.js";

const cleanList = (value, field) => {
  if (value == null || value === "") return [];
  const values = Array.isArray(value) ? value : String(value).split(",");
  const cleaned = [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
  if (cleaned.some((item) => item.length > 80)) throw Object.assign(new Error(`${field} entries must be 80 characters or fewer.`), { statusCode: 400 });
  return cleaned;
};

const validateZone = (input) => {
  const name = String(input?.name || "").trim();
  const country = String(input?.country || "").trim();
  const priceNGN = Number(input?.priceNGN);
  const priority = Number(input?.priority ?? 0);
  if (name.length < 2 || name.length > 100) throw Object.assign(new Error("Zone name must be between 2 and 100 characters."), { statusCode: 400 });
  if (!country || country.length > 80) throw Object.assign(new Error("A valid country is required."), { statusCode: 400 });
  if (!Number.isFinite(priceNGN) || priceNGN < 0 || priceNGN > 100000000) throw Object.assign(new Error("Enter a valid shipping price in NGN."), { statusCode: 400 });
  if (!Number.isInteger(priority) || priority < 0 || priority > 10000) throw Object.assign(new Error("Priority must be a whole number from 0 to 10000."), { statusCode: 400 });
  return { name, country, states: cleanList(input.states, "State"), cities: cleanList(input.cities, "City"), priceNGN, priority, active: input.active !== false };
};

export const quoteShipping = async (req, res) => {
  try {
    const address = req.body?.address || {};
    if (!address.country || !address.city) return res.status(400).json({ message: "Country and city are required to calculate delivery." });
    const currency = String(req.body?.currency || "NGN").toUpperCase();
    const exchangeRate = getOrderExchangeRate(currency);
    const quote = await getShippingQuote({ address, currency, exchangeRate });
    return res.json(quote);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to calculate delivery.", code: error.code });
  }
};

export const listShippingZones = async (_req, res) => {
  const zones = await ShippingZone.find({}).sort({ priority: -1, createdAt: 1 }).lean();
  res.json(zones);
};

export const createShippingZone = async (req, res) => {
  try {
    const zone = await ShippingZone.create(validateZone(req.body));
    return res.status(201).json(zone);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to create shipping zone." });
  }
};

export const updateShippingZone = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid shipping zone." });
    const zone = await ShippingZone.findByIdAndUpdate(req.params.id, validateZone(req.body), { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ message: "Shipping zone not found." });
    return res.json(zone);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Unable to update shipping zone." });
  }
};

export const deleteShippingZone = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid shipping zone." });
  const zone = await ShippingZone.findByIdAndDelete(req.params.id);
  if (!zone) return res.status(404).json({ message: "Shipping zone not found." });
  return res.json({ message: "Shipping zone deleted." });
};
