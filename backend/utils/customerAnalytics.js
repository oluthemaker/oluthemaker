const dateKey = (value) => new Date(value).toISOString().slice(0, 10);

export const buildCustomerAnalytics = (customers = [], from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  const activeCustomers = customers.length;
  const newCustomers = customers.filter((customer) => new Date(customer.firstPaidAt) >= start).length;
  const returningCustomers = activeCustomers - newCustomers;
  const repeatCustomers = customers.filter((customer) => Number(customer.lifetimeOrderCount || 0) > 1).length;
  const periodOrders = customers.reduce((sum, customer) => sum + Number(customer.periodOrders || 0), 0);

  const trendMap = new Map();
  const countryMap = new Map();
  const stateMap = new Map();
  for (const customer of customers) {
    if (new Date(customer.firstPaidAt) >= start && new Date(customer.firstPaidAt) <= end) {
      const key = dateKey(customer.firstPaidAt);
      trendMap.set(key, (trendMap.get(key) || 0) + 1);
    }
    const country = String(customer.country || "Unknown").trim() || "Unknown";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
    const state = String(customer.state || "").trim();
    if (state) {
      const key = `${state}, ${country}`;
      stateMap.set(key, (stateMap.get(key) || 0) + 1);
    }
  }

  const rank = (map) => [...map.entries()]
    .map(([name, count]) => ({ name, customers: count }))
    .sort((a, b) => b.customers - a.customers || a.name.localeCompare(b.name))
    .slice(0, 8);

  return {
    activeCustomers,
    newCustomers,
    returningCustomers,
    repeatCustomers,
    repeatCustomerRate: activeCustomers ? Number(((repeatCustomers / activeCustomers) * 100).toFixed(1)) : 0,
    periodOrders,
    averageOrdersPerCustomer: activeCustomers ? Number((periodOrders / activeCustomers).toFixed(2)) : 0,
    acquisitionTrend: [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, customers: count })),
    topCountries: rank(countryMap),
    topStates: rank(stateMap),
  };
};
