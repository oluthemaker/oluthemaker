import React, { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, ReceiptText, RotateCcw, Wallet } from "lucide-react";
import API from "../../api/axios";
import { atelierToast } from "../../utils/Toaster";

const dateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const money = (amount, currency) => new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
  style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2,
}).format(Number(amount || 0));

const AdminRevenueAnalytics = () => {
  const [to, setTo] = useState(dateInput(new Date()));
  const [from, setFrom] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 29); return dateInput(date); });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await API.get("/orders/analytics/revenue", { params: { from, to } });
      setData(response.data);
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to load revenue analytics.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const currencies = ["NGN", "USD"];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3 bg-white border border-atelier-ink/10 p-5">
        <label className="text-[9px] tracking-widest uppercase">From<input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="block mt-2 border border-atelier-ink/15 bg-atelier-paper p-3 text-xs" /></label>
        <label className="text-[9px] tracking-widest uppercase">To<input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="block mt-2 border border-atelier-ink/15 bg-atelier-paper p-3 text-xs" /></label>
        <button type="button" onClick={fetchAnalytics} disabled={loading} className="flex items-center gap-2 bg-atelier-ink text-white px-5 py-3 text-[9px] tracking-widest uppercase disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Update report</button>
      </div>

      {loading && !data ? <div className="py-16 text-center font-serif italic opacity-50">Preparing the financial records…</div> : (
        <>
          <div className="flex flex-wrap justify-between gap-3"><p className="text-[9px] tracking-[0.25em] uppercase opacity-50">{data?.orderCount || 0} paid orders in selected period</p><p className="text-[9px] opacity-40">Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "—"}</p></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {currencies.map((currency) => {
              const row = data?.currencies?.[currency] || {};
              const cards = [
                { label: "Gross captured", value: row.grossCaptured, icon: <TrendingUp size={16} /> },
                { label: "Refunds initiated", value: row.refundsInitiated, icon: <RotateCcw size={16} /> },
                { label: "Net after initiated refunds", value: row.netAfterInitiatedRefunds, icon: <Wallet size={16} /> },
              ];
              return <section key={currency} className="border border-atelier-ink/10 bg-white p-6 md:p-8">
                <div className="flex justify-between items-center mb-7"><h3 className="font-serif italic text-2xl">{currency} performance</h3><span className="text-[9px] tracking-widest uppercase opacity-40">{row.paidOrders || 0} orders</span></div>
                <div className="space-y-5">{cards.map((card) => <div key={card.label} className="flex justify-between items-center gap-4 border-b border-atelier-ink/10 pb-4"><div className="flex items-center gap-3"><span className="opacity-50">{card.icon}</span><span className="text-[9px] tracking-widest uppercase opacity-60">{card.label}</span></div><strong className="font-serif text-xl">{money(card.value, currency)}</strong></div>)}</div>
                <div className="grid grid-cols-2 gap-4 mt-6"><div><p className="text-[8px] tracking-widest uppercase opacity-40 mb-2">Refunds completed</p><p className="font-serif text-lg">{money(row.refundsCompleted, currency)}</p></div><div><p className="text-[8px] tracking-widest uppercase opacity-40 mb-2">Failed refund attempts</p><p className="font-serif text-lg">{money(row.refundsFailed, currency)}</p></div></div>
              </section>;
            })}
          </div>
          <div className="bg-atelier-ink/[0.04] p-5 text-[10px] leading-6 opacity-60"><div className="flex items-center gap-2 font-bold uppercase tracking-widest mb-2"><ReceiptText size={14} /> Accounting notes</div>NGN and USD are reported separately and are not converted or combined. Gross captured is based on orders marked paid after server-side Flutterwave verification. Refunds initiated includes processing and completed refunds; net after initiated refunds subtracts both to avoid overstating available revenue. This is an operational sales view, not a settlement or profit statement: gateway fees, chargebacks, shipping costs and tax liabilities are not deducted.</div>
        </>
      )}
    </div>
  );
};

export default AdminRevenueAnalytics;
