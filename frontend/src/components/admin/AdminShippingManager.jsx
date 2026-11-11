import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, Truck, X } from "lucide-react";
import API from "../../api/axios";

const emptyForm = { name: "", country: "Nigeria", states: "", cities: "", priceNGN: "", priority: "0", active: true };
const money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));

const AdminShippingManager = () => {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/shipping/admin/zones");
      setZones(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load shipping zones.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setError(""); };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(""); setNotice("");
    const payload = { ...form, states: form.states.split(",").map((item) => item.trim()).filter(Boolean), cities: form.cities.split(",").map((item) => item.trim()).filter(Boolean), priceNGN: Number(form.priceNGN), priority: Number(form.priority) };
    try {
      if (editingId) await API.put(`/shipping/admin/zones/${editingId}`, payload);
      else await API.post("/shipping/admin/zones", payload);
      setNotice(editingId ? "Shipping zone updated." : "Shipping zone created.");
      resetForm();
      await loadZones();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save this shipping zone.");
    } finally { setSaving(false); }
  };

  const edit = (zone) => {
    setEditingId(zone._id);
    setForm({ name: zone.name || "", country: zone.country || "Nigeria", states: (zone.states || []).join(", "), cities: (zone.cities || []).join(", "), priceNGN: String(zone.priceNGN ?? ""), priority: String(zone.priority ?? 0), active: zone.active !== false });
    setNotice("");
  };

  const remove = async (zone) => {
    if (!window.confirm(`Delete the “${zone.name}” shipping zone?`)) return;
    try {
      await API.delete(`/shipping/admin/zones/${zone._id}`);
      setNotice("Shipping zone deleted.");
      if (editingId === zone._id) resetForm();
      await loadZones();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete this zone."); }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] gap-8 items-start">
        <section className="border border-atelier-ink/10 p-6 md:p-8">
          <div className="flex justify-between items-center gap-4 mb-6">
            <div><h3 className="font-serif italic text-2xl">{editingId ? "Edit Delivery Zone" : "Create Delivery Zone"}</h3><p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Rates are configured in Nigerian naira</p></div>
            {editingId ? <button type="button" onClick={resetForm} aria-label="Cancel editing" className="p-2"><X size={18} /></button> : <Truck size={22} className="opacity-50" />}
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-name">Zone name</label><input id="zone-name" name="name" required minLength={2} maxLength={100} value={form.name} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" placeholder="Lagos Mainland" /></div>
            <div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-country">Country</label><input id="zone-country" name="country" required value={form.country} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" placeholder="Nigeria" /></div>
            <div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-states">States / regions</label><input id="zone-states" name="states" value={form.states} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" placeholder="Lagos, Ogun" /><p className="text-[10px] opacity-50 mt-1">Comma-separated. Leave blank to cover every state in this country.</p></div>
            <div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-cities">Cities (optional)</label><input id="zone-cities" name="cities" value={form.cities} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" placeholder="Ikeja, Lekki, Surulere" /><p className="text-[10px] opacity-50 mt-1">If provided, the zone only matches these cities.</p></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-price">Delivery rate (NGN)</label><input id="zone-price" name="priceNGN" type="number" min="0" step="1" required value={form.priceNGN} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" placeholder="3500" /></div><div><label className="block text-[10px] uppercase tracking-widest mb-2" htmlFor="zone-priority">Priority</label><input id="zone-priority" name="priority" type="number" min="0" max="10000" step="1" value={form.priority} onChange={updateField} className="w-full border border-atelier-ink/20 bg-transparent p-3 text-sm" /></div></div>
            <label className="flex items-center gap-3 text-xs"><input type="checkbox" name="active" checked={form.active} onChange={updateField} /> Active and available at checkout</label>
            {error ? <p role="alert" className="text-xs text-red-800">{error}</p> : null}
            {notice ? <p role="status" className="text-xs text-green-800">{notice}</p> : null}
            <button disabled={saving} className="w-full bg-atelier-ink text-white py-4 text-[10px] uppercase tracking-[0.25em] font-bold disabled:opacity-50">{saving ? "Saving…" : editingId ? "Save Changes" : "Create Shipping Zone"}</button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center"><div><h3 className="font-serif italic text-2xl">Configured Zones</h3><p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">{zones.length} zone(s)</p></div><button type="button" onClick={loadZones} className="p-2 border border-atelier-ink/15" aria-label="Refresh zones"><RefreshCw size={15} /></button></div>
          {loading ? <p className="text-sm opacity-60 py-8">Loading shipping zones…</p> : zones.length === 0 ? <div className="border border-dashed border-atelier-ink/20 p-8 text-sm opacity-60">No delivery zones yet. Create your first zone to enable checkout delivery estimates.</div> : zones.map((zone) => (
            <article key={zone._id} className="border border-atelier-ink/10 p-5 space-y-3">
              <div className="flex justify-between gap-4"><div><div className="flex items-center gap-2"><h4 className="font-serif italic text-lg">{zone.name}</h4><span className={`text-[8px] uppercase tracking-widest px-2 py-1 ${zone.active ? "bg-green-900/10 text-green-900" : "bg-atelier-ink/10 opacity-60"}`}>{zone.active ? "Active" : "Inactive"}</span></div><p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">{zone.country} · Priority {zone.priority}</p></div><strong className="text-sm whitespace-nowrap">{money(zone.priceNGN)}</strong></div>
              <p className="text-xs opacity-65">{zone.states?.length ? zone.states.join(", ") : "All states"}{zone.cities?.length ? ` · ${zone.cities.join(", ")}` : " · All cities in selected states"}</p>
              <div className="flex gap-4 pt-2 border-t border-atelier-ink/10"><button type="button" onClick={() => edit(zone)} className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest"><Pencil size={13} /> Edit</button><button type="button" onClick={() => remove(zone)} className="inline-flex items-center gap-2 text-[9px] uppercase tracking-widest text-red-800"><Trash2 size={13} /> Delete</button></div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AdminShippingManager;
