import React, { useState, useEffect } from "react";
import useUserStore from "../store/useUserStore";
import useCartStore from "../store/useCartStore";
import {
  User,
  History,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { atelierToast } from "../utils/Toaster";
import UserTicketList from "../components/UserTicketList";

const Profile = () => {
  const { user, logout, checkAuth, updateProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  const { clearCart } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Local state for the form
  const [formData, setFormData] = useState({
    name: user?.user?.name || "",
    phoneNumber: user?.user?.phoneNumber || "",
    address: {
      street: user?.user?.addresses[0]?.addressLine1 || "",
      city: user?.user?.addresses[0]?.city || "",
      state: user?.user?.addresses[0]?.state || "",
      postalCode: user?.user?.addresses[0]?.postalCode || "",
      country: user?.user?.addresses[0]?.country || "",
    },
  });

  // Sync local state when user data is loaded from store
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.user?.name || "",
        phoneNumber: user?.user?.phoneNumber || "",
        address: {
          street: user?.user?.addresses[0]?.addressLine1 || "",
          city: user?.user?.addresses[0]?.city || "",
          state: user?.user?.addresses[0]?.state || "",
          postalCode: user?.user?.addresses[0]?.postalCode || "",
          country: user?.user?.addresses[0]?.country || "",
        },
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      atelierToast("Dossier updated successfully.");
    } else {
      atelierToast(result.error);
    }
  };

  const handleLogout = () => {
    logout();
    clearCart();
    atelierToast("Logged out successfully.");
  };

  return (
    <main className="min-h-screen bg-atelier-paper flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-atelier-ink/10 pt-12 md:pt-32 p-8 space-y-12">
        <div>
          <h1 className="font-serif italic text-2xl px-4">Client Dossier</h1>
          <p className="text-[9px] tracking-widest uppercase opacity-40 px-4 mt-2">
            Welcome, {user?.user?.name || "Patron"}
          </p>
        </div>

        <nav className="space-y-2">
          {[
            {
              id: "profile",
              label: "Personal Details",
              icon: <User size={16} strokeWidth={1.5} />,
            },
            {
              id: "orders",
              label: "Past Commissions",
              icon: <History size={16} strokeWidth={1.5} />,
            },
            {
              id: "tickets",
              label: "Concierge",
              icon: <MessageSquare size={16} strokeWidth={1.5} />,
            },
            {
              id: "wishlist",
              label: "Saved Configurations",
              icon: <Heart size={16} strokeWidth={1.5} />,
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

          <div className="pt-8 mt-8 border-t border-atelier-ink/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-bold opacity-50 hover:opacity-100 transition-all"
            >
              <LogOut size={16} strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 pt-12 md:pt-32 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* --- PROFILE FORM --- */}
          {activeTab === "profile" && (
            <div className="space-y-12">
              <header>
                <h2 className="text-3xl font-serif italic mb-2">
                  Personal Details
                </h2>
                <p className="text-[10px] tracking-widest uppercase opacity-40">
                  Manage your shipping and contact information
                </p>
              </header>

              <form className="space-y-8" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic placeholder:opacity-30"
                      placeholder="+234 ..."
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-atelier-ink/10">
                  <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold mb-6 flex items-center gap-2">
                    <MapPin size={14} /> Primary Shipping Address
                  </h3>
                  <div className="space-y-8">
                    <div>
                      <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              street: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                city: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                state: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                postalCode: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] tracking-[0.3em] uppercase block mb-2 opacity-50 font-bold">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.address.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                country: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-transparent border-b border-atelier-ink/20 py-3 focus:border-atelier-ink outline-none transition-colors font-serif italic"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-atelier-ink text-white px-8 py-4 text-[10px] tracking-[0.4em] font-bold uppercase hover:bg-atelier-tan transition-colors"
                >
                  Update Dossier
                </button>
              </form>
            </div>
          )}

          {/* --- ORDER HISTORY --- */}
          {activeTab === "orders" && (
            <div className="space-y-12">
              <header>
                <h2 className="text-3xl font-serif italic mb-2">
                  Past Commissions
                </h2>
                <p className="text-[10px] tracking-widest uppercase opacity-40">
                  Review the status of your commissioned orders
                </p>
              </header>

              <div className="space-y-8">
                {user?.orders?.map((order) => (
                  <div
                    key={order?._id}
                    className="border border-atelier-ink/10 p-6 md:p-8 bg-white"
                  >
                    <div className="flex flex-wrap justify-between items-end border-b border-atelier-ink/10 pb-4 mb-6 gap-4">
                      <div>
                        <p className="text-[9px] tracking-[0.3em] uppercase opacity-50 mb-1">
                          Order {order._id}
                        </p>
                        <p className="font-serif italic">
                          {order.updatedAt.slice(0, 10)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-atelier-tan font-bold mb-1">
                          {order?.isDelivered ? "Delivered" : "Pending"}
                        </p>
                        <p className="text-[9px] tracking-[0.3em] uppercase text-atelier-tan font-bold mb-1">
                          {order?.isPaid ? "Paid" : "Unpaid"}
                        </p>
                        <p className="font-sans">${order?.totalPrice}.00</p>
                      </div>
                    </div>

                    {order?.orderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-serif italic text-lg">
                            {item.name}
                          </h4>
                          <p className="text-[9px] tracking-widest uppercase opacity-60 mt-2">
                            Size: {item?.configuration?.size} — Width:{" "}
                            {item?.configuration?.width} — Last:{" "}
                            {item?.configuration?.last}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- WISHLIST --- */}
          {activeTab === "wishlist" && (
            <div className="space-y-12">
              <header>
                <h2 className="text-3xl font-serif italic mb-2">
                  Saved Configurations
                </h2>
                <p className="text-[10px] tracking-widest uppercase opacity-40">
                  Footwear you are considering
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user?.user?.wishlist.map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="aspect-[4/5] bg-atelier-ink/5 overflow-hidden mb-4 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="font-serif italic text-xl">
                          {item.name}
                        </h3>
                        <p className="text-sm font-sans mt-1">${item.price}</p>
                      </div>
                      <button className="text-[9px] tracking-[0.2em] uppercase border-b border-atelier-ink/20 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- CONCIERGE (TICKETS) --- */}
          {activeTab === "tickets" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <UserTicketList />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Profile;
