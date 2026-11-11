import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Archive, Trash2, Boxes, History, X, RefreshCw } from "lucide-react";
import AdminProductForm from "./AdminProductForm";
import useAdminStore from "../../store/useAdminStore";
import { atelierToast } from "../../utils/Toaster";

const AdminInventoryManager = () => {
  const { products, isLoading, fetchAdminProducts, archiveProduct, deleteProduct, adjustInventory, fetchInventoryAdjustments, inventoryAdjustments, updateProduct } = useAdminStore();
  const [mode, setMode] = useState("list");
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustment, setAdjustment] = useState({ variantSku: "", change: "", reason: "" });
  const [historyTarget, setHistoryTarget] = useState(null);

  useEffect(() => { fetchAdminProducts(); }, [fetchAdminProducts]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [product.name, product.sku, product.slug].some((value) => String(value || "").toLowerCase().includes(term));
    const matchesCategory = category === "all" || product.category === category;
    const matchesStatus = status === "all" || (product.publicationStatus || "Published") === status;
    const stock = Number(product.stock || 0);
    const matchesStock = stockFilter === "all" || (stockFilter === "low" && stock > 0 && stock <= 5) || (stockFilter === "out" && stock === 0);
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  }), [products, search, category, status, stockFilter]);

  const openCreate = () => { setEditingProduct(null); setMode("form"); };
  const openEdit = (product) => { setEditingProduct(product); setMode("form"); };
  const onSaved = async () => { setMode("list"); setEditingProduct(null); await fetchAdminProducts(); };

  const handleArchive = async (product) => {
    if (!window.confirm(`Archive “${product.name}”? It will be removed from the public catalogue but retained in admin.`)) return;
    const result = await archiveProduct(product._id);
    atelierToast(result.success ? "Product archived." : result.error, result.success ? "success" : "error");
  };
  const handleDelete = async (product) => {
    if (!window.confirm(`Permanently delete “${product.name}”? Products in order history cannot be deleted.`)) return;
    const result = await deleteProduct(product._id);
    atelierToast(result.success ? "Product deleted." : result.error, result.success ? "success" : "error");
  };
  const handleAdjustment = async (event) => {
    event.preventDefault();
    const result = await adjustInventory(adjustTarget._id, adjustment);
    if (!result.success) return atelierToast(result.error, "error");
    atelierToast("Inventory updated.");
    setAdjustTarget(null);
    setAdjustment({ variantSku: "", change: "", reason: "" });
  };
  const openHistory = async (product) => {
    setHistoryTarget(product);
    await fetchInventoryAdjustments(product._id);
  };
  const restoreProduct = async (product) => {
    const result = await updateProduct(product._id, { ...product, publicationStatus: "Draft", status: "Available", archivedAt: null });
    atelierToast(result.success ? "Product restored as a draft." : result.error, result.success ? "success" : "error");
  };

  if (mode === "form") return <AdminProductForm product={editingProduct} onSaved={onSaved} onCancel={() => setMode("list")}/>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h2 className="font-serif italic text-2xl">Product catalogue</h2><p className="text-[9px] uppercase tracking-[0.2em] opacity-40 mt-1">{products.length} products across all publication states</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => fetchAdminProducts()} className="border border-atelier-ink/15 p-3" title="Refresh"><RefreshCw size={15}/></button><button type="button" onClick={openCreate} className="bg-atelier-ink text-white px-5 py-3 flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold"><Plus size={14}/> Add product</button></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-atelier-ink/10 p-4"><span className="text-[9px] uppercase tracking-widest opacity-50">Products</span><p className="font-serif text-2xl mt-1">{products.length}</p></div>
        <div className="border border-atelier-ink/10 p-4"><span className="text-[9px] uppercase tracking-widest opacity-50">Published</span><p className="font-serif text-2xl mt-1">{products.filter((p) => (p.publicationStatus || "Published") === "Published").length}</p></div>
        <div className="border border-atelier-ink/10 p-4"><span className="text-[9px] uppercase tracking-widest opacity-50">Low stock (1–5)</span><p className="font-serif text-2xl mt-1">{products.filter((p) => p.stock > 0 && p.stock <= 5).length}</p></div>
        <div className="border border-atelier-ink/10 p-4"><span className="text-[9px] uppercase tracking-widest opacity-50">Out of stock</span><p className="font-serif text-2xl mt-1">{products.filter((p) => p.stock === 0 && !p.isAuction).length}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, SKU or slug" className="w-full bg-transparent border border-atelier-ink/15 py-3 pl-9 pr-3 text-xs outline-none"/></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-transparent border border-atelier-ink/15 p-3 text-xs"><option value="all">All categories</option>{["Shoe", "Magazine", "Leather Goods", "Merchandise", "Auction"].map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent border border-atelier-ink/15 p-3 text-xs"><option value="all">All publication states</option>{["Draft", "Published", "Archived"].map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="flex flex-wrap gap-2">{[{ value: "all", label: "All stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Out of stock" }].map((item) => <button key={item.value} onClick={() => setStockFilter(item.value)} className={`px-3 py-2 border text-[9px] uppercase tracking-widest ${stockFilter === item.value ? "bg-atelier-ink text-white border-atelier-ink" : "border-atelier-ink/15 opacity-60"}`}>{item.label}</button>)}</div>

      <div className="border border-atelier-ink/10 overflow-hidden">
        <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-atelier-ink/5 text-[9px] uppercase tracking-widest font-bold opacity-60"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Actions</span></div>
        {isLoading && products.length === 0 ? <p className="p-8 text-center text-xs opacity-50">Loading inventory…</p> : filteredProducts.length === 0 ? <p className="p-8 text-center text-xs opacity-50">No products match these filters.</p> : filteredProducts.map((product) => <div key={product._id} className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-3 md:gap-4 items-center p-4 border-t border-atelier-ink/10">
          <div className="flex items-center gap-3 min-w-0"><div className="w-14 h-16 bg-atelier-ink/5 shrink-0">{product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover"/>}</div><div className="min-w-0"><p className="font-serif italic text-base truncate">{product.name}</p><p className="text-[9px] opacity-40 truncate">{product.sku || product.slug}</p><span className={`inline-block mt-1 text-[8px] uppercase tracking-widest px-2 py-1 ${product.publicationStatus === "Archived" ? "bg-gray-200" : product.publicationStatus === "Draft" ? "bg-amber-100" : "bg-green-100"}`}>{product.publicationStatus || "Published"}</span></div></div>
          <span className="text-xs opacity-70">{product.category}</span><span className="text-xs">₦{Number(product.price || 0).toLocaleString("en-NG")}</span><span className={`text-xs font-bold ${product.stock <= 5 ? "text-amber-700" : ""}`}>{product.stock ?? 0} units{product.variants?.length ? ` · ${product.variants.length} variants` : ""}</span>
          <div className="flex flex-wrap gap-1"><button type="button" onClick={() => openEdit(product)} className="p-2 border border-atelier-ink/10" title="Edit"><Pencil size={13}/></button><button type="button" onClick={() => { setAdjustTarget(product); setAdjustment({ variantSku: "", change: "", reason: "" }); }} className="p-2 border border-atelier-ink/10" title="Adjust stock"><Boxes size={13}/></button><button type="button" onClick={() => openHistory(product)} className="p-2 border border-atelier-ink/10" title="Inventory history"><History size={13}/></button>{product.publicationStatus === "Archived" ? <button type="button" onClick={() => restoreProduct(product)} className="p-2 border border-atelier-ink/10 text-xs" title="Restore as draft">↺</button> : <button type="button" onClick={() => handleArchive(product)} className="p-2 border border-atelier-ink/10" title="Archive"><Archive size={13}/></button>}<button type="button" onClick={() => handleDelete(product)} className="p-2 border border-atelier-ink/10 text-red-700" title="Delete"><Trash2 size={13}/></button></div>
        </div>)}
      </div>

      {adjustTarget && <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><form onSubmit={handleAdjustment} className="bg-atelier-paper w-full max-w-md p-6 space-y-5"><div className="flex justify-between"><div><h3 className="font-serif italic text-xl">Adjust inventory</h3><p className="text-xs opacity-50 mt-1">{adjustTarget.name} · {adjustTarget.stock} total units</p></div><button type="button" onClick={() => setAdjustTarget(null)}><X size={18}/></button></div>{adjustTarget.variants?.length > 0 && <label className="block text-xs">Variant<select required value={adjustment.variantSku} onChange={(e) => setAdjustment({ ...adjustment, variantSku: e.target.value })} className="w-full mt-2 bg-transparent border border-atelier-ink/20 p-3"><option value="">Select a variant</option>{adjustTarget.variants.map((variant) => <option key={variant.sku} value={variant.sku}>{variant.sku} · {variant.size} {variant.color} · {variant.stock} in stock</option>)}</select></label>}<label className="block text-xs">Stock change (+ receive stock, − remove stock)<input required type="number" step="1" value={adjustment.change} onChange={(e) => setAdjustment({ ...adjustment, change: e.target.value })} className="w-full mt-2 bg-transparent border border-atelier-ink/20 p-3" placeholder="e.g. 5 or -2"/></label><label className="block text-xs">Reason<input required minLength="3" value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className="w-full mt-2 bg-transparent border border-atelier-ink/20 p-3" placeholder="Restock, damaged item, correction…"/></label><button className="w-full bg-atelier-ink text-white py-3 text-[9px] uppercase tracking-widest font-bold">Save adjustment</button></form></div>}

      {historyTarget && <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div className="bg-atelier-paper w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"><div className="flex justify-between mb-5"><div><h3 className="font-serif italic text-xl">Inventory history</h3><p className="text-xs opacity-50">{historyTarget.name}</p></div><button onClick={() => setHistoryTarget(null)}><X size={18}/></button></div>{inventoryAdjustments.length === 0 ? <p className="text-xs opacity-50 py-8 text-center">No manual stock adjustments recorded yet.</p> : <div className="space-y-3">{inventoryAdjustments.map((entry) => <div key={entry._id} className="border-t border-atelier-ink/10 pt-3 flex flex-wrap justify-between gap-3 text-xs"><div><p className="font-bold">{entry.reason}</p><p className="opacity-50 mt-1">{entry.variantSku || "Product stock"} · {entry.adjustedBy?.name || "Admin"}</p><p className="opacity-40 mt-1">{new Date(entry.createdAt).toLocaleString()}</p></div><div className="text-right"><p className={entry.change > 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{entry.change > 0 ? "+" : ""}{entry.change}</p><p className="opacity-50">{entry.previousStock} → {entry.newStock}</p></div></div>)}</div>}</div></div>}
    </div>
  );
};

export default AdminInventoryManager;
