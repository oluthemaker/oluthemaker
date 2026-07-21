import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { Search, ExternalLink } from "lucide-react";
import { atelierToast } from "../../utils/Toaster";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingId, setSendingId] = useState(null);

  const handleRemind = async (id) => {
    setSendingId(id);
    await sendPaymentReminder(id);
    setSendingId(null);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders");

        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("Order retrieval failed", error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sendPaymentReminder = async (orderId) => {
    try {
      const { data } = await API.post(`/auth/orders/${orderId}/remind`);
      atelierToast("Olu the Maker reminder dispatched successfully.");
    } catch (error) {
      atelierToast(
        error.response?.data?.message || "Failed to dispatch reminder.",
      );
    }
  };

  if (loading)
    return (
      <div className="font-serif italic opacity-50 text-center py-12">
        Consulting archives...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20"
          size={16}
        />
        <input
          type="text"
          placeholder="Search Order ID or Client Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-atelier-ink/5 border-none py-4 pl-12 pr-4 text-[10px] tracking-widest uppercase focus:ring-1 focus:ring-atelier-ink/20 outline-none"
        />
      </div>

      <div className="overflow-x-auto border border-atelier-ink/10 bg-white/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-atelier-ink/20 text-[8px] tracking-[0.4em] uppercase opacity-50 bg-atelier-ink/[0.02]">
              <th className="py-5 px-6">Order Reference</th>
              <th className="py-5 px-6">Client</th>
              <th className="py-5 px-6">Date</th>
              <th className="py-5 px-6">Order Details</th>
              <th className="py-5 px-6 text-right">Total</th>
              <th className="py-5 px-6 text-center">Status</th>
              <th className="py-5 px-6 text-center">Remind</th>
            </tr>
          </thead>
          <tbody className="text-xs font-sans">
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-atelier-ink/5 hover:bg-atelier-ink/[0.02] transition-colors group"
              >
                <td className="py-5 px-6 font-mono text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">
                  {order._id}
                </td>
                <td className="py-5 px-6 font-serif italic text-sm">
                  {order.user?.name || "Guest"}
                </td>
                <td className="py-5 px-6 opacity-60">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-2">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="text-[10px] opacity-70">
                      {item.name} ({item.configuration?.size || "N/A"})
                    </div>
                  ))}
                </td>
                <td className="py-5 px-6 text-right font-medium">
                  ${order.totalPrice.toFixed(2)}
                </td>

                <td className="py-5 px-6 text-center">
                  <span
                    className={`px-3 py-1 text-[8px] tracking-widest uppercase font-bold ${
                      order.isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="py-4">
                  {order.isPaid ? (
                    <span className="text-[9px] px-2 py-1 bg-green-50 text-green-700 tracking-widest uppercase font-bold">
                      Authenticated
                    </span>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] px-2 py-1 bg-red-50 text-red-700 tracking-widest uppercase font-bold">
                        Pending
                      </span>
                      <button
                        disabled={sendingId === order._id}
                        onClick={() => handleRemind(order._id)}
                        className="text-[9px] tracking-[0.2em] uppercase font-bold border-b border-atelier-ink/20 hover:border-atelier-ink transition-all"
                      >
                        {sendingId === order._id
                          ? "Dispatching..."
                          : "Send Reminder"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center font-serif italic opacity-30">
            No matching archives found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;
