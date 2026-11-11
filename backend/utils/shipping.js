import ShippingZone from "../models/shippingZoneModel.js";
import { roundMoney } from "./orderPricing.js";
import { zoneMatchesAddress } from "./shippingMatching.js";

export { zoneMatchesAddress };

export const resolveShippingZone = async (address) => {
  const zones = await ShippingZone.find({ active: true }).sort({ priority: -1, createdAt: 1 }).lean();
  return zones.find((zone) => zoneMatchesAddress(zone, address)) || null;
};

export const getShippingQuote = async ({ address, currency, exchangeRate }) => {
  const zone = await resolveShippingZone(address);
  if (!zone) {
    const error = new Error("We do not currently deliver to this location. Please contact the store for assistance.");
    error.statusCode = 422;
    error.code = "SHIPPING_UNAVAILABLE";
    throw error;
  }
  const shippingPriceNGN = roundMoney(Number(zone.priceNGN), "NGN");
  return {
    zone: { id: zone._id, name: zone.name, country: zone.country, states: zone.states, cities: zone.cities },
    shippingPriceNGN,
    shippingPrice: roundMoney(currency === "USD" ? shippingPriceNGN / exchangeRate : shippingPriceNGN, currency),
    currency,
  };
};
