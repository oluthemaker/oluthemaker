import React, { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";
import { Search, RefreshCw, ChevronDown, ChevronUp, ExternalLink, PackageCheck } from "lucide-react";
import { atelierToast } from "../../utils/Toaster";

const STATUS_OPTIONS = [
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["ready_for_dispatch", "Ready for dispatch"],
  ["shipped", "Shipped"],
  ["completed", "Completed / delivered"],
  ["manual_review", "Manual review"],
  ["cancelled", "Cancelled"],
];

const money = (amount, currency = "NGN") => new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
  style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2,
}).format(Number(amount || 0));

const statusLabel = (status) => STATUS_OPTIONS.find(([value]) => value === status)?.[1] || status || "Pending";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [edits, setEdits] = useState({});
  const [refundEdits, setRefundEdits] = useState({});
  const [refundSavingId, setRefundSavingId] = useState(null);
  const [refundRefreshingId, setRefundRefreshingId] = useState(null);
  const [refundProviderIds, setRefundProviderIds] = useState({});

  const fetchOrders = async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await API.get("/orders");
      setOrders(Array.isArray(data) ? data : []);
      setEdits(Object.fromEntries((data || []).map((order) => [order._id, {
        status: order.fulfillmentStatus || "pending",
        note: order.fulfillmentNote || "",
        trackingNumber: order.trackingNumber || "",
        trackingUrl: order.trackingUrl || "",
      }])));
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to retrieve orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const customerName = order.customer?.name || order.user?.name || "Guest";
      const email = order.customer?.email || order.user?.email || "";
      const matchesQuery = !query || [order._id, customerName, email, order.paymentReference]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || (statusFilter === "unpaid"
        ? !order.isPaid
        : statusFilter === "paid"
          ? order.isPaid
          : order.fulfillmentStatus === statusFilter);
      return matchesQuery && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const updateEdit = (id, field, value) => setEdits((current) => ({
    ...current,
    [id]: { ...(current[id] || {}), [field]: value },
  }));

  const updateRefundEdit = (id, field, value) => setRefundEdits((current) => ({
    ...current,
    [id]: { ...(current[id] || {}), [field]: value },
  }));

  const initiateRefund = async (order) => {
    const edit = refundEdits[order._id] || {};
    const amount = Number(edit.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      atelierToast("Enter a valid refund amount.");
      return;
    }
    if (!window.confirm(`Initiate a ${money(amount, order.currency)} refund for this order through Flutterwave?`)) return;
    setRefundSavingId(order._id);
    try {
      const { data } = await API.post(`/orders/${order._id}/refunds`, {
        amount,
        reason: edit.reason || "Customer refund",
        requestKey: crypto.randomUUID(),
      });
      setOrders((current) => current.map((item) => item._id === order._id ? data.order : item));
      setRefundEdits((current) => ({ ...current, [order._id]: { amount: "", reason: "" } }));
      atelierToast(`Refund request recorded: ${data.refund?.status || "processing"}.`);
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to initiate refund.");
    } finally { setRefundSavingId(null); }
  };

  const refreshRefund = async (order, refund) => {
    setRefundRefreshingId(refund._id);
    try {
      const { data } = await API.post(`/orders/${order._id}/refunds/${refund._id}/refresh`, {
        flutterwaveRefundId: refundProviderIds[refund._id] || "",
      });
      setOrders((current) => current.map((item) => item._id === order._id ? data.order : item));
      atelierToast(`Refund status: ${data.refund.status}.`);
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to refresh refund status.");
    } finally { setRefundRefreshingId(null); }
  };

  const saveFulfillment = async (order) => {
    const edit = edits[order._id] || {};
    if (edit.status === "completed" && !order.isPaid) {
      atelierToast("An unpaid order cannot be marked as completed.");
      return;
    }
    if (edit.status === "cancelled" && order.isPaid && order.refundStatus !== "refunded") {
      atelierToast("Complete the refund before cancelling a paid order.");
      return;
    }
    setSavingId(order._id);
    try {
      const { data } = await API.patch(`/orders/${order._id}/fulfillment`, edit);
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, ...data } : item));
      atelierToast("Order fulfilment details updated.");
    } catch (error) {
      atelierToast(error.response?.data?.message || "Unable to update this order.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="font-serif italic opacity-50 text-center py-12">Consulting archives…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input type="search" placeholder="Search reference, client or email…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-atelier-ink/5 border-none py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase outline-none focus:ring-1 focus:ring-atelier-ink/20" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-atelier-ink/5 border-none px-4 py-3 text-[10px] tracking-widest uppercase outline-none">
          <option value="all">All orders</option>
          <option value="unpaid">Awaiting payment</option>
          <option value="paid">Paid orders</option>
          {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={() => fetchOrders(true)} disabled={refreshing} className="flex items-center justify-center gap-2 border border-atelier-ink/20 px-5 py-3 text-[10px] tracking-widest uppercase disabled:opacity-50"><RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-3 text-[9px] tracking-widest uppercase opacity-60">
        <span>{orders.length} total orders</span><span>·</span>
        <span>{orders.filter((order) => order.isPaid).length} paid</span><span>·</span>
        <span>{orders.filter((order) => !order.isPaid).length} awaiting payment</span>
      </div>

      <div className="overflow-x-auto border border-atelier-ink/10 bg-white/50">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead><tr className="border-b border-atelier-ink/20 text-[8px] tracking-[0.3em] uppercase opacity-50 bg-atelier-ink/[0.02]">
            <th className="py-4 px-5">Order reference</th><th className="py-4 px-5">Customer</th><th className="py-4 px-5">Date</th><th className="py-4 px-5">Items</th><th className="py-4 px-5 text-right">Total</th><th className="py-4 px-5">Payment</th><th className="py-4 px-5">Fulfilment</th><th className="py-4 px-5"></th>
          </tr></thead>
          <tbody className="text-xs font-sans">
            {filteredOrders.map((order) => {
              const customerName = order.customer?.name || order.user?.name || "Guest customer";
              const customerEmail = order.customer?.email || order.user?.email || "No email recorded";
              const edit = edits[order._id] || {};
              const expanded = expandedId === order._id;
              return <React.Fragment key={order._id}>
                <tr className="border-b border-atelier-ink/5 hover:bg-atelier-ink/[0.02]">
                  <td className="py-4 px-5 font-mono text-[10px]">{order._id.slice(-10).toUpperCase()}</td>
                  <td className="py-4 px-5"><div className="font-serif italic text-sm">{customerName}</div><div className="text-[10px] opacity-50">{customerEmail}</div></td>
                  <td className="py-4 px-5 text-[10px] opacity-60">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-5 text-[10px]">{order.orderItems?.length || 0} line item(s)</td>
                  <td className="py-4 px-5 text-right font-medium">{money(order.totalPrice, order.currency || "USD")}</td>
                  <td className="py-4 px-5"><span className={`px-2 py-1 text-[8px] tracking-widest uppercase font-bold ${order.isPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{order.isPaid ? "Paid" : "Pending"}{order.refundStatus && order.refundStatus !== "none" ? ` · ${order.refundStatus.replaceAll("_", " ")}` : ""}</span></td>
                  <td className="py-4 px-5"><span className="text-[9px] tracking-wider uppercase">{statusLabel(order.fulfillmentStatus)}</span></td>
                  <td className="py-4 px-5"><button type="button" onClick={() => setExpandedId(expanded ? null : order._id)} className="flex items-center gap-2 text-[9px] tracking-widest uppercase">{expanded ? "Close" : "Manage"}{expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button></td>
                </tr>
                {expanded && <tr className="border-b border-atelier-ink/10 bg-atelier-paper/70"><td colSpan={8} className="p-5 md:p-7">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div><h4 className="text-[9px] tracking-[0.3em] uppercase font-bold mb-3">Order contents</h4>{order.orderItems?.map((item, index) => <div key={item._id || index} className="flex justify-between gap-4 py-2 border-b border-atelier-ink/10 text-xs"><span>{item.name} × {item.qty}{item.configuration?.size ? ` · ${item.configuration.size}` : ""}{item.configuration?.color ? ` · ${item.configuration.color}` : ""}</span><span>{money(item.price * item.qty, order.currency || "USD")}</span></div>)}</div>
                      <div className="text-[10px] leading-6 opacity-70"><strong className="uppercase tracking-widest">Order totals</strong><br />Items: {money(order.itemsPrice, order.currency || "USD")}<br />Delivery: {money(order.shippingPrice, order.currency || "USD")}<br />Tax: {money(order.taxPrice, order.currency || "USD")}<br />Total: {money(order.totalPrice, order.currency || "USD")}</div>
                      <div className="text-[10px] leading-6 opacity-70"><strong className="uppercase tracking-widest">Delivery address</strong><br />{order.shippingAddress?.addressLine1}<br />{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}<br />{order.shippingAddress?.country}<br />{order.shippingZone?.name && `Delivery zone: ${order.shippingZone.name}`}<br />{order.shippingAddress?.deliveryInstructions && `Instructions: ${order.shippingAddress.deliveryInstructions}`}</div>
                      <div className="text-[10px] leading-5 opacity-70"><strong className="uppercase tracking-widest">Contact</strong><br />{customerName}<br />{customerEmail}<br />{order.customer?.phoneNumber || "No phone recorded"}</div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[9px] tracking-[0.3em] uppercase font-bold">Fulfilment management</h4>
                      <div><label className="block text-[9px] tracking-widest uppercase mb-2">Order status</label><select value={edit.status || "pending"} onChange={(event) => updateEdit(order._id, "status", event.target.value)} className="w-full bg-white border border-atelier-ink/15 p-3 text-xs">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                      <div><label className="block text-[9px] tracking-widest uppercase mb-2">Tracking number</label><input value={edit.trackingNumber || ""} onChange={(event) => updateEdit(order._id, "trackingNumber", event.target.value)} className="w-full bg-white border border-atelier-ink/15 p-3 text-xs" placeholder="Courier tracking reference" /></div>
                      <div><label className="block text-[9px] tracking-widest uppercase mb-2">Tracking URL (HTTPS)</label><input type="url" value={edit.trackingUrl || ""} onChange={(event) => updateEdit(order._id, "trackingUrl", event.target.value)} className="w-full bg-white border border-atelier-ink/15 p-3 text-xs" placeholder="https://courier.example/track/…" /></div>
                      <div><label className="block text-[9px] tracking-widest uppercase mb-2">Customer note</label><textarea rows={3} value={edit.note || ""} onChange={(event) => updateEdit(order._id, "note", event.target.value)} className="w-full bg-white border border-atelier-ink/15 p-3 text-xs resize-y" placeholder="Optional update to include in the email" /></div>
                      <button type="button" disabled={savingId === order._id} onClick={() => saveFulfillment(order)} className="w-full flex items-center justify-center gap-2 bg-atelier-ink text-white py-3 px-5 text-[9px] tracking-[0.25em] uppercase font-bold disabled:opacity-50"><PackageCheck size={14} />{savingId === order._id ? "Saving…" : "Save & notify customer"}</button>
                      {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest underline">Open current tracking link <ExternalLink size={12} /></a>}
                      <p className="text-[9px] opacity-50 leading-5">Customers receive an email when fulfilment details are saved. Payment status is controlled separately by verified payment records.</p>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-atelier-ink/10 pt-7">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4"><div><h4 className="text-[9px] tracking-[0.3em] uppercase font-bold">Refund management</h4><p className="text-[10px] opacity-50 mt-2">Refunds are initiated through Flutterwave and may take several business days to settle.</p></div><div className="text-right text-[10px] opacity-60">{money(Math.max(0, order.totalPrice - (order.refunds || []).filter((refund) => refund.status !== "failed").reduce((sum, refund) => sum + Number(refund.amount || 0), 0)), order.currency || "USD")} remaining</div></div>
                    {order.refunds?.length > 0 && <div className="space-y-2 mb-6">{order.refunds.map((refund) => <div key={refund._id} className="flex flex-wrap items-center justify-between gap-3 border border-atelier-ink/10 bg-white p-3 text-xs"><div><strong>{money(refund.amount, refund.currency)}</strong><span className="ml-3 text-[9px] tracking-widest uppercase opacity-60">{refund.status}</span><p className="text-[9px] opacity-50 mt-1">{refund.reason || "No reason recorded"}{refund.flutterwaveReference ? ` · ${refund.flutterwaveReference}` : ""}</p></div>{refund.status === "unknown" && <input aria-label="Flutterwave refund ID" value={refundProviderIds[refund._id] ?? refund.flutterwaveRefundId ?? ""} onChange={(event) => setRefundProviderIds((current) => ({ ...current, [refund._id]: event.target.value }))} className="border border-atelier-ink/15 p-2 text-[10px]" placeholder="Flutterwave refund ID" />}{(refund.flutterwaveRefundId || refund.status === "unknown") && <button type="button" disabled={refundRefreshingId === refund._id} onClick={() => refreshRefund(order, refund)} className="flex items-center gap-2 text-[9px] uppercase tracking-widest underline disabled:opacity-50"><RefreshCw size={12} className={refundRefreshingId === refund._id ? "animate-spin" : ""} /> {refund.status === "unknown" ? "Reconcile" : "Refresh status"}</button>}</div>)}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3 items-end">
                      <label className="block text-[9px] tracking-widest uppercase">Refund amount<input type="number" min="0.01" step="0.01" value={refundEdits[order._id]?.amount ?? ""} onChange={(event) => updateRefundEdit(order._id, "amount", event.target.value)} className="mt-2 w-full bg-white border border-atelier-ink/15 p-3 text-xs" placeholder={`Amount (${order.currency})`} /></label>
                      <label className="block text-[9px] tracking-widest uppercase">Reason<textarea rows={1} value={refundEdits[order._id]?.reason || ""} onChange={(event) => updateRefundEdit(order._id, "reason", event.target.value)} className="mt-2 w-full bg-white border border-atelier-ink/15 p-3 text-xs resize-y" placeholder="Customer request, unavailable item…" /></label>
                      <button type="button" disabled={!order.isPaid || order.refundInProgress || refundSavingId === order._id || Number(order.totalPrice) <= (order.refunds || []).filter((refund) => refund.status !== "failed").reduce((sum, refund) => sum + Number(refund.amount || 0), 0)} onClick={() => initiateRefund(order)} className="bg-atelier-ink text-white px-5 py-3 text-[9px] tracking-widest uppercase disabled:opacity-40">{refundSavingId === order._id ? "Submitting…" : order.refundInProgress ? "Reconciliation required" : "Initiate refund"}</button>
                    </div>
                    <p className="text-[9px] opacity-50 mt-3">Only verified paid transactions can be refunded. Failed refunds do not reduce the remaining refundable balance. An uncertain provider response reserves its amount and pauses additional refunds until reconciled.</p>
                  </div>
                </td></tr>}
              </React.Fragment>;
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="p-16 text-center font-serif italic opacity-40">No matching orders found.</div>}
      </div>
    </div>
  );
};

export default AdminOrderList;
