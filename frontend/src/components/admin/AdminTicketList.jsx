import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { CheckCircle, MessageSquare, Archive } from "lucide-react";
import { atelierToast } from "../../utils/Toaster"; // Assuming you have your custom toast

const AdminTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");

  const fetchTickets = async () => {
    try {
      const { data } = await API.get("/tickets/admin/all");
      setTickets(data);
      // Update selected ticket data if it's currently open to reflect new messages/status
      if (selectedTicket) {
        const updated = data.find((t) => t._id === selectedTicket._id);
        setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (id) => {
    if (!reply.trim()) return;
    try {
      await API.post(`/tickets/${id}/reply`, { message: reply });
      setReply("");
      fetchTickets();
      atelierToast("Response dispatched.");
    } catch (err) {
      atelierToast("Failed to send response.");
    }
  };

  // NEW: Handle Closing Ticket
  const handleClose = async (id) => {
    try {
      await API.put(`/tickets/${id}/close`);
      fetchTickets();
      atelierToast("Correspondence archived.");
    } catch (err) {
      atelierToast("Error closing ticket.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Ticket List */}
      <div className="lg:col-span-1 space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            onClick={() => setSelectedTicket(ticket)}
            className={`p-6 border cursor-pointer transition-all ${
              selectedTicket?._id === ticket._id
                ? "border-atelier-ink bg-white shadow-sm"
                : "border-atelier-ink/5 opacity-60 hover:opacity-100"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <p
                className={`text-[7px] tracking-[0.3em] uppercase px-2 py-1 ${
                  ticket.status === "open"
                    ? "bg-green-50 text-green-700"
                    : "bg-atelier-ink/5 text-atelier-ink/40"
                }`}
              >
                {ticket.status}
              </p>
              <p className="text-[8px] opacity-30 italic">
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <h3 className="font-serif italic text-lg">{ticket.subject}</h3>
            <p className="text-[10px] opacity-40 mt-2 uppercase tracking-tighter">
              Client: {ticket.user?.name || "Unknown"}
            </p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 border border-atelier-ink/10 bg-white p-8 min-h-[600px] flex flex-col shadow-sm">
        {selectedTicket ? (
          <>
            <div className="flex justify-between items-start border-b border-atelier-ink/10 pb-6 mb-6">
              <div>
                <h3 className="font-serif italic text-2xl text-atelier-ink">
                  {selectedTicket.subject}
                </h3>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">
                  Thread ID: {selectedTicket._id.slice(-6)}
                </p>
              </div>

              {/* Functional Mark Closed Button */}
              {selectedTicket.status === "open" ? (
                <button
                  onClick={() => handleClose(selectedTicket._id)}
                  className="text-[9px] tracking-widest uppercase flex items-center gap-2 opacity-40 hover:opacity-100 hover:text-green-700 transition-all border border-atelier-ink/10 px-3 py-2 rounded-sm"
                >
                  <CheckCircle size={14} /> Mark Resolved
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase opacity-30">
                  <Archive size={14} /> Archived
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-4 custom-scrollbar">
              {selectedTicket.messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] ${m.isAdmin ? "ml-auto text-right" : "mr-auto text-left"}`}
                >
                  <p className="text-[8px] uppercase tracking-widest opacity-30 mb-2">
                    {m.isAdmin ? "The Atelier" : selectedTicket.user?.name} —{" "}
                    {new Date(m.createdAt).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p
                    className={`p-5 text-sm font-serif italic leading-relaxed ${
                      m.isAdmin
                        ? "bg-atelier-ink text-white"
                        : "bg-atelier-paper border border-atelier-ink/5 text-atelier-ink"
                    }`}
                  >
                    {m.message}
                  </p>
                </div>
              ))}
            </div>

            {selectedTicket.status === "open" && (
              <div className="mt-auto pt-6 border-t border-atelier-ink/10">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Compose your response..."
                  className="w-full bg-transparent outline-none font-serif italic text-sm mb-4 min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleReply(selectedTicket._id)}
                    className="bg-atelier-ink text-white px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-opacity-90 transition-all"
                  >
                    Send Correspondence
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="m-auto text-center font-serif italic opacity-30">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
            <p className="tracking-widest uppercase text-[10px]">
              Select a thread to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTicketList;
