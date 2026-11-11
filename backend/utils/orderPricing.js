const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

export const roundMoney = (value, currency) =>
  roundTo(value, currency === "NGN" ? 0 : 2);

export const getOrderExchangeRate = (currency) => {
  if (currency === "NGN") return 1;
  if (currency !== "USD") {
    const error = new Error("Unsupported checkout currency. Choose NGN or USD.");
    error.statusCode = 400;
    throw error;
  }

  const rate = Number(process.env.NGN_PER_USD);
  if (!Number.isFinite(rate) || rate <= 0) {
    const error = new Error("USD checkout is not configured yet. Please choose NGN or contact the store.");
    error.statusCode = 503;
    error.code = "USD_EXCHANGE_RATE_NOT_CONFIGURED";
    throw error;
  }
  return rate;
};

export const calculateOrderAmounts = ({ itemsPriceNGN, currency, exchangeRate, shippingPriceNGN = 0 }) => {
  shippingPriceNGN = Number(shippingPriceNGN);
  if (!Number.isFinite(shippingPriceNGN) || shippingPriceNGN < 0) {
    const error = new Error("Shipping price must be a non-negative number.");
    error.statusCode = 500;
    throw error;
  }
  const taxRate = Number(process.env.ORDER_TAX_RATE || 0);

  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    const error = new Error("ORDER_TAX_RATE must be a decimal between 0 and 1.");
    error.statusCode = 500;
    throw error;
  }

  const taxPriceNGN = roundMoney(itemsPriceNGN * taxRate, "NGN");
  const baseItemsPriceNGN = roundMoney(itemsPriceNGN, "NGN");
  const baseShippingPriceNGN = roundMoney(shippingPriceNGN, "NGN");
  const baseTotalPriceNGN = baseItemsPriceNGN + taxPriceNGN + baseShippingPriceNGN;

  if (currency === "NGN") {
    return {
      itemsPrice: baseItemsPriceNGN,
      taxPrice: taxPriceNGN,
      shippingPrice: baseShippingPriceNGN,
      totalPrice: baseTotalPriceNGN,
      baseItemsPriceNGN,
      baseTaxPriceNGN: taxPriceNGN,
      baseShippingPriceNGN,
      baseTotalPriceNGN,
    };
  }

  const itemsPrice = roundMoney(baseItemsPriceNGN / exchangeRate, "USD");
  const taxPrice = roundMoney(taxPriceNGN / exchangeRate, "USD");
  const shippingPrice = roundMoney(baseShippingPriceNGN / exchangeRate, "USD");

  return {
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice: roundMoney(itemsPrice + taxPrice + shippingPrice, "USD"),
    baseItemsPriceNGN,
    baseTaxPriceNGN: taxPriceNGN,
    baseShippingPriceNGN,
    baseTotalPriceNGN,
  };
};
