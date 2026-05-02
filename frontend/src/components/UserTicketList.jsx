import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { MessageSquare, Plus, Send, X } from "lucide-react";
import { atelierToast } from "../utils/Toaster";

const UserTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const fetchUserTickets = async () => {
    try {
      const { data } = await API.get("/tickets/my-tickets");
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets");
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tickets", { subject, message });
      setShowCreate(false);
      setSubject("");
      setMessage("");
      fetchUserTickets();
      atelierToast("Inquiry sent to the atelier.");
    } catch (err) {
      atelierToast("Could not send inquiry.");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tickets/${selectedTicket._id}/reply`, {
        message: reply,
      });
      setReply("");
      // Refresh selected ticket data
      const { data } = await API.get(`/tickets/${selectedTicket._id}`);
      setSelectedTicket(data);
      fetchUserTickets();
    } catch (err) {
      atelierToast("Failed to send reply.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif italic mb-2">Concierge</h2>
          <p className="text-[10px] tracking-widest uppercase opacity-40">
            Direct correspondence with Olú THE MAKER
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase font-bold border-b border-atelier-ink/20 pb-1 hover:border-atelier-ink transition-all"
          >
            <Plus size={14} /> New Inquiry
          </button>
        )}
      </header>

      {/* CREATE NEW TICKET FORM */}
      {showCreate && (
        <div className="bg-white border border-atelier-ink/10 p-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between mb-6">
            <h3 className="font-serif italic text-xl">New Correspondence</h3>
            <button onClick={() => setShowCreate(false)}>
              <X size={18} className="opacity-40" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-6">
            <input
              type="text"
              placeholder="Subject (e.g., Sizing Query, Custom Request)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-transparent border-b border-atelier-ink/10 py-3 outline-none font-serif italic focus:border-atelier-ink"
              required
            />
            <textarea
              placeholder="How can we assist you today?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border border-atelier-ink/10 p-4 outline-none font-serif italic min-h-[150px] focus:border-atelier-ink"
              required
            />
            <button
              type="submit"
              className="bg-atelier-ink text-white px-8 py-3 text-[9px] tracking-[0.3em] uppercase font-bold"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      {/* TICKET LIST & CHAT VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <p className="font-serif italic opacity-30 py-12">
              No active threads.
            </p>
          ) : (
            tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className={`p-6 border transition-all cursor-pointer bg-white ${selectedTicket?._id === t._id ? "border-atelier-ink" : "border-atelier-ink/5 hover:border-atelier-ink/20"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[7px] tracking-[0.3em] uppercase px-2 py-1 ${t.status === "open" ? "bg-green-50 text-green-700" : "bg-atelier-ink/5 text-atelier-ink/40"}`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[8px] opacity-30 font-sans">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-serif italic text-lg">{t.subject}</h4>
              </div>
            ))
          )}
        </div>

        {/* Chat Thread */}
        <div className="bg-white border border-atelier-ink/10 p-6 min-h-[400px] flex flex-col">
          {selectedTicket ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto mb-6 max-h-[300px] pr-2">
                {selectedTicket.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.isAdmin ? "items-start" : "items-end"}`}
                  >
                    <p className="text-[7px] uppercase tracking-widest opacity-30 mb-1">
                      {m.isAdmin ? "The Atelier" : "You"} —{" "}
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div
                      className={`p-3 text-xs font-serif italic max-w-[90%] ${m.isAdmin ? "bg-atelier-paper border border-atelier-ink/5" : "bg-atelier-ink text-white"}`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status === "open" && (
                <form
                  onSubmit={handleReply}
                  className="relative mt-auto pt-4 border-t border-atelier-ink/5"
                >
                  <input
                    type="text"
                    placeholder="Reply to thread..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="w-full bg-atelier-paper py-3 pl-4 pr-12 outline-none text-xs font-serif italic"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-7 text-atelier-ink opacity-50 hover:opacity-100"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="m-auto text-center opacity-20 italic font-serif">
              <MessageSquare size={32} className="mx-auto mb-4 stroke-1" />
              <p>Select a thread to view correspondence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTicketList;
