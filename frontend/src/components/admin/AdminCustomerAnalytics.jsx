import React, { useEffect, useState } from "react";
import { RefreshCw, Users, UserPlus, Repeat2, ShoppingBag, MapPin, TrendingUp } from "lucide-react";
import API from "../../api/axios";
import { atelierToast } from "../../utils/Toaster";

const dateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const number = (value) => new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(Number(value || 0));
const labelDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const AdminCustomerAnalytics = () => {
  const [to, setTo] = useState(dateInput(new Date()));
  const [from, setFrom] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 29); return dateInput(date); });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await API.get("/orders/analytics/customers", { params: { from, to } });
      setData(response.data);
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to load customer analytics.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const metrics = [
    { label: "Active customers", value: number(data?.activeCustomers), detail: "Customers with a paid order in this period", icon: <Users size={17} /> },
    { label: "First-time customers", value: number(data?.newCustomers), detail: "First paid purchase in this period", icon: <UserPlus size={17} /> },
    { label: "Returning customers", value: number(data?.returningCustomers), detail: "Purchased before this period", icon: <Repeat2 size={17} /> },
    { label: "Repeat customer rate", value: `${number(data?.repeatCustomerRate)}%`, detail: "Active customers with more than one paid order ever", icon: <TrendingUp size={17} /> },
    { label: "Paid orders", value: number(data?.periodOrders), detail: "Orders from active customers in this period", icon: <ShoppingBag size={17} /> },
    { label: "Orders per customer", value: number(data?.averageOrdersPerCustomer), detail: "Average paid orders per active customer", icon: <Repeat2 size={17} /> },
  ];

  const maxTrend = Math.max(1, ...(data?.acquisitionTrend || []).map((item) => item.customers));
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end gap-3 border border-atelier-ink/10 bg-white p-5">
        <label className="text-[9px] tracking-widest uppercase">From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="block mt-2 border border-atelier-ink/15 bg-atelier-paper p-3 text-xs" /></label>
        <label className="text-[9px] tracking-widest uppercase">To<input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="block mt-2 border border-atelier-ink/15 bg-atelier-paper p-3 text-xs" /></label>
        <button type="button" onClick={fetchAnalytics} disabled={loading} className="flex items-center gap-2 bg-atelier-ink px-5 py-3 text-[9px] uppercase tracking-widest text-white disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Update report</button>
      </div>

      {loading && !data ? <div className="py-16 text-center font-serif italic opacity-50">Preparing customer records…</div> : data && <>
        <div className="flex flex-wrap justify-between gap-3"><p className="text-[9px] uppercase tracking-[0.25em] opacity-50">Customer activity · {data.period?.from} to {data.period?.to}</p><p className="text-[9px] opacity-40">Generated {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}</p></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => <section key={metric.label} className="border border-atelier-ink/10 bg-white p-5">
            <div className="mb-5 flex items-center justify-between"><span className="text-[9px] uppercase tracking-widest opacity-55">{metric.label}</span><span className="opacity-45">{metric.icon}</span></div>
            <p className="font-serif text-3xl">{metric.value}</p><p className="mt-2 text-[10px] leading-5 opacity-45">{metric.detail}</p>
          </section>)}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="border border-atelier-ink/10 bg-white p-6">
            <div className="mb-6 flex items-center gap-3"><TrendingUp size={16} className="opacity-50" /><h3 className="font-serif text-xl italic">New customer acquisition</h3></div>
            {data.acquisitionTrend?.length ? <div className="space-y-3">{data.acquisitionTrend.map((item) => <div key={item.date} className="grid grid-cols-[72px_1fr_30px] items-center gap-3"><span className="text-[10px] opacity-50">{labelDate(item.date)}</span><div className="h-2 bg-atelier-ink/5"><div className="h-full bg-atelier-ink" style={{ width: `${(item.customers / maxTrend) * 100}%` }} /></div><span className="text-right text-xs tabular-nums">{item.customers}</span></div>)}</div> : <p className="py-8 text-center text-xs opacity-45">No first-time customers in this period.</p>}
          </section>

          <section className="border border-atelier-ink/10 bg-white p-6">
            <div className="mb-6 flex items-center gap-3"><MapPin size={16} className="opacity-50" /><h3 className="font-serif text-xl italic">Customer locations</h3></div>
            {data.topCountries?.length ? <div className="space-y-4">{data.topCountries.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 border-b border-atelier-ink/10 pb-3"><span className="text-xs">{item.name}</span><strong className="font-serif text-lg">{number(item.customers)}</strong></div>)}</div> : <p className="py-8 text-center text-xs opacity-45">No location data available.</p>}
          </section>
        </div>

        <section className="border border-atelier-ink/10 bg-white p-6">
          <h3 className="mb-5 font-serif text-xl italic">Top states / regions</h3>
          {data.topStates?.length ? <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">{data.topStates.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 border-b border-atelier-ink/10 py-3"><span className="text-xs">{item.name}</span><strong className="font-serif text-lg">{number(item.customers)}</strong></div>)}</div> : <p className="text-xs opacity-45">No state or region data available.</p>}
        </section>
        <p className="bg-atelier-ink/[0.04] p-5 text-[10px] leading-6 opacity-60">Customer counts are based on unique checkout email addresses across guest and registered orders. Only paid orders are included. A first-time customer is someone whose first recorded paid order falls within the selected period; a returning customer first purchased before it. Repeat customer rate uses all paid-order history through the end of the selected period. NGN and USD orders count equally as purchases and are not converted or combined here.</p>
      </>}
    </div>
  );
};

export default AdminCustomerAnalytics;
