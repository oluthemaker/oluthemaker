import React, { useState } from "react";
import AddProductForm from "../../components/admin/AdminProductForm";
import {
  Package,
  Users,
  BarChart3,
  ClipboardList,
  ConciergeBell,
} from "lucide-react";
import AdminOrderList from "../../components/admin/AdminOrderList";
import AdminUserList from "../../components/admin/AdminUserList";
import AdminTicketList from "../../components/admin/AdminTicketList";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <main className="min-h-screen bg-atelier-paper flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-atelier-ink/10 pt-32 p-8 space-y-12">
        <h1 className="font-serif italic text-2xl px-4">Management</h1>
        <nav className="space-y-2">
          {[
            {
              id: "orders",
              label: "Commissions",
              icon: <ClipboardList size={16} />,
            },
            { id: "products", label: "Inventory", icon: <Package size={16} /> },
            {
              id: "activity",
              label: "User Activity",
              icon: <Users size={16} />,
            },
            {
              id: "analytics",
              label: "Revenue",
              icon: <BarChart3 size={16} />,
            },
            {
              id: "tickets",
              label: "Concierge",
              icon: <ConciergeBell size={16} />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-bold transition-all ${
                activeTab === item.id
                  ? "bg-atelier-ink text-white"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <section className="flex-1 pt-32 p-12 overflow-y-auto">
        {/* 1. COMMISSIONS (ORDERS) TAB */}
        {activeTab === "orders" && (
          <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-serif italic mb-2 text-atelier-ink">
                Active Commissions
              </h2>
              <p className="text-[10px] tracking-widest uppercase opacity-40">
                Review and manage client orders
              </p>
            </header>
            <AdminOrderList />
          </div>
        )}

        {/* 2. INVENTORY (PRODUCTS) TAB */}
        {activeTab === "products" && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-serif italic mb-2 text-atelier-ink">
                Inventory Management
              </h2>
              <p className="text-[10px] tracking-widest uppercase opacity-40">
                Add or edit bespoke commissions
              </p>
            </header>
            <AddProductForm />
          </div>
        )}

        {/* 3. USER ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-serif italic mb-2 text-atelier-ink">
                Client Registry
              </h2>
              <p className="text-[10px] tracking-widest uppercase opacity-40">
                Monitor user growth and details
              </p>
            </header>
            <AdminUserList />
          </div>
        )}

        {/* 4. REVENUE (ANALYTICS) TAB - Blank for now */}
        {activeTab === "analytics" && (
          <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-serif italic mb-2 text-atelier-ink">
                Revenue Analytics
              </h2>
              <p className="text-[10px] tracking-widest uppercase opacity-40">
                Financial performance overview
              </p>
            </header>
            <div className="h-64 border border-dashed border-atelier-ink/10 flex items-center justify-center">
              <p className="font-serif italic opacity-30">
                Financial modeling in progress...
              </p>
            </div>
          </div>
        )}

        {/* 5. TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl font-serif italic mb-2 text-atelier-ink">
                Client Correspondence
              </h2>
              <p className="text-[10px] tracking-widest uppercase opacity-40">
                Manage support inquiries and bespoke requests
              </p>
            </header>
            <AdminTicketList />
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
