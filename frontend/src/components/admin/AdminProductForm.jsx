import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import useAdminStore from "../../store/useAdminStore";
import { atelierToast } from "../../utils/Toaster";

const CATEGORIES = ["Shoe", "Magazine", "Leather Goods", "Merchandise"];
const SUBCATEGORY_MAP = {
  "Leather Goods": ["Wallets", "Belts", "Bags", "Cardholders", "Briefcases"],
  Merchandise: ["T-Shirts", "Caps", "Totes", "Socks", "Accessories", "Mugs", "Pottery", "Painting"],
  Shoe: ["Oxfords", "Loafers", "Derbies", "Boots", "Monkstraps"],
  Magazine: ["Physical", "Digital", "Special Edition"],
};
const emptyProduct = {
  name: "", description: "", price: "", sku: "", stock: 0, category: "Shoe", subCategory: "",
  isAuction: false, images: [], variants: [], publicationStatus: "Draft", status: "Available",
  auctionDetails: { startingBid: "", minBidIncrement: 5000, startTime: "", endTime: "", reservePrice: "" },
  shoeDetails: { style: [], material: [], color: [], sizes: [] },
  magazineDetails: { issueNumber: "", month: "", year: new Date().getFullYear(), pages: "", isDigital: false, fileUrl: "", excerpt: "" },
};

const AdminProductForm = ({ product = null, onSaved, onCancel }) => {
  const { createProduct, updateProduct, validateProduct, isLoading } = useAdminStore();
  const [scriptLoaded, setScriptLoaded] = useState(Boolean(window.cloudinary));
  const [formData, setFormData] = useState(emptyProduct);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationChecked, setValidationChecked] = useState(false);

  useEffect(() => {
    if (!product) {
      setFormData(emptyProduct);
      return;
    }
    setFormData({
      ...emptyProduct,
      ...product,
      price: String(product.price ?? ""),
      stock: Number(product.stock || 0),
      images: product.images || [],
      variants: (product.variants || []).map((variant) => ({ ...variant, stock: Number(variant.stock || 0) })),
      shoeDetails: { ...emptyProduct.shoeDetails, ...(product.shoeDetails || {}) },
      magazineDetails: { ...emptyProduct.magazineDetails, ...(product.magazineDetails || {}) },
      auctionDetails: { ...emptyProduct.auctionDetails, ...(product.auctionDetails || {}) },
    });
    setValidationErrors([]);
    setValidationChecked(false);
  }, [product]);

  useEffect(() => {
    if (window.cloudinary) {
      setScriptLoaded(true);
      return undefined;
    }
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const setField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setValidationChecked(false);
  };
  const setNested = (section, name, value) => {
    setFormData((current) => ({ ...current, [section]: { ...current[section], [name]: value } }));
    setValidationChecked(false);
  };
  const addVariant = () => setField("variants", [...formData.variants, { sku: "", size: "", color: "", stock: 0, isActive: true }]);
  const updateVariant = (index, name, value) => setField("variants", formData.variants.map((variant, i) => i === index ? { ...variant, [name]: value } : variant));
  const removeVariant = (index) => setField("variants", formData.variants.filter((_, i) => i !== index));

  const handleUpload = () => {
    if (!scriptLoaded || !window.cloudinary) return atelierToast("Cloudinary uploader is still loading.", "error");
    window.cloudinary.openUploadWidget({
      cloudName: import.meta.env.VITE_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_PRESET_NAME,
      sources: ["local", "url"], multiple: true, maxFiles: 20,
    }, (error, result) => {
      if (error) return atelierToast(error.message || "Image upload failed.", "error");
      if (result?.event === "success") setFormData((current) => ({ ...current, images: [...current.images, result.info.secure_url] }));
    });
  };

  const payload = useMemo(() => ({
    ...formData,
    price: Number(formData.price),
    stock: formData.variants.length ? formData.variants.reduce((sum, variant) => sum + (variant.isActive ? Number(variant.stock || 0) : 0), 0) : Number(formData.stock || 0),
    variants: formData.variants.map((variant) => ({ ...variant, stock: Number(variant.stock || 0), price: variant.price === "" ? undefined : (variant.price == null ? undefined : Number(variant.price)) })),
    shoeDetails: formData.category === "Shoe" ? formData.shoeDetails : undefined,
    magazineDetails: formData.category === "Magazine" ? formData.magazineDetails : undefined,
    auctionDetails: formData.isAuction ? formData.auctionDetails : undefined,
  }), [formData]);

  const save = async (publicationStatus) => {
    setValidationErrors([]);
    if (publicationStatus === "Published") {
      const validation = await validateProduct({ ...payload, productId: product?._id, publicationStatus });
      setValidationErrors(validation.errors || []);
      setValidationChecked(true);
      if (!validation.valid) {
        atelierToast("Product needs attention before it can be published.", "error");
        return;
      }
    }
    const result = product?._id
      ? await updateProduct(product._id, { ...payload, publicationStatus })
      : await createProduct({ ...payload, publicationStatus });
    if (!result.success) {
      setValidationErrors(result.errors?.length ? result.errors : [result.error]);
      setValidationChecked(true);
      atelierToast(result.error || "Unable to save product.", "error");
      return;
    }
    atelierToast(publicationStatus === "Draft" ? "Draft saved." : "Product published successfully.");
    onSaved?.(result.data);
  };

  const inputClass = "w-full bg-transparent border-b border-atelier-ink/20 py-2 outline-none focus:border-atelier-ink text-sm";
  const labelClass = "block mb-2 text-[9px] tracking-[0.2em] uppercase font-bold opacity-50";

  return (
    <section className="border border-atelier-ink/10 bg-atelier-paper p-6 md:p-10 space-y-8">
      <header className="flex items-start justify-between gap-4 border-b border-atelier-ink/10 pb-5">
        <div>
          <h2 className="font-serif italic text-2xl">{product ? "Edit Product" : "Add Product"}</h2>
          <p className="text-[9px] uppercase tracking-[0.25em] opacity-40 mt-1">Catalogue & inventory</p>
        </div>
        {onCancel && <button type="button" onClick={onCancel} className="p-2 border border-atelier-ink/10" aria-label="Close"><X size={16}/></button>}
      </header>

      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setField("category", category)} className={`px-3 py-2 text-[9px] uppercase tracking-widest border ${formData.category === category ? "bg-atelier-ink text-white border-atelier-ink" : "border-atelier-ink/15 opacity-60"}`}>{category}</button>)}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div><label className={labelClass}>Product name *</label><input className={inputClass} value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Product name" /></div>
          <div><label className={labelClass}>Product SKU</label><input className={inputClass} value={formData.sku || ""} onChange={(e) => setField("sku", e.target.value.toUpperCase())} placeholder="OTM-PRODUCT-001" /></div>
          <div><label className={labelClass}>Subcategory</label><select className={inputClass} value={formData.subCategory || ""} onChange={(e) => setField("subCategory", e.target.value)}><option value="">Select subcategory</option>{(SUBCATEGORY_MAP[formData.category] || []).map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className={labelClass}>Price (NGN) *</label><input type="number" min="0" step="1" className={inputClass} value={formData.price} onChange={(e) => setField("price", e.target.value)} /></div>
            <div><label className={labelClass}>{formData.variants.length ? "Total variant stock" : "Stock quantity"}</label><input type="number" min="0" step="1" disabled={formData.variants.length > 0} className={`${inputClass} disabled:opacity-40`} value={formData.variants.length ? formData.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0) : formData.stock} onChange={(e) => setField("stock", e.target.value)} /></div>
          </div>
          <div><label className={labelClass}>Description *</label><textarea className="w-full min-h-36 border border-atelier-ink/15 bg-transparent p-3 text-sm outline-none" value={formData.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the product..." /></div>
        </div>

        <div className="space-y-6">
          <div className="border border-atelier-ink/10 p-4 space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span><span className="block text-xs uppercase tracking-widest font-bold">Auction mode</span><span className="block text-[10px] opacity-50 mt-1">List this piece as a timed bidding event.</span></span>
              <input type="checkbox" checked={Boolean(formData.isAuction)} onChange={(e) => setField("isAuction", e.target.checked)} className="w-4 h-4 accent-atelier-ink" />
            </label>
            {formData.isAuction && <div className="grid grid-cols-2 gap-3 border-t border-atelier-ink/10 pt-3">
              <label className="text-[9px] uppercase tracking-widest">Starting bid<input type="number" min="1" value={formData.auctionDetails.startingBid} onChange={(e) => setNested("auctionDetails", "startingBid", e.target.value)} className={inputClass}/></label>
              <label className="text-[9px] uppercase tracking-widest">Minimum increment<input type="number" min="1" value={formData.auctionDetails.minBidIncrement} onChange={(e) => setNested("auctionDetails", "minBidIncrement", e.target.value)} className={inputClass}/></label>
              <label className="text-[9px] uppercase tracking-widest">Auction starts<input type="datetime-local" value={formData.auctionDetails.startTime ? String(formData.auctionDetails.startTime).slice(0, 16) : ""} onChange={(e) => setNested("auctionDetails", "startTime", e.target.value)} className={inputClass}/></label>
              <label className="text-[9px] uppercase tracking-widest">Auction ends<input type="datetime-local" value={formData.auctionDetails.endTime ? String(formData.auctionDetails.endTime).slice(0, 16) : ""} onChange={(e) => setNested("auctionDetails", "endTime", e.target.value)} className={inputClass}/></label>
              <label className="text-[9px] uppercase tracking-widest col-span-2">Reserve price (optional)<input type="number" min="0" value={formData.auctionDetails.reservePrice} onChange={(e) => setNested("auctionDetails", "reservePrice", e.target.value)} className={inputClass}/></label>
            </div>}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><label className={labelClass}>Product gallery * ({formData.images.length})</label><button type="button" onClick={handleUpload} className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold"><Upload size={13}/> Upload</button></div>
            {formData.images.length ? <div className="grid grid-cols-3 gap-2">{formData.images.map((image, index) => <div key={`${image}-${index}`} className="relative aspect-square border border-atelier-ink/10"><img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover"/><button type="button" onClick={() => setField("images", formData.images.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-white text-black p-1"><X size={12}/></button>{index === 0 && <span className="absolute bottom-1 left-1 bg-black text-white px-1 text-[8px] uppercase">Cover</span>}</div>)}</div> : <div className="border border-dashed border-atelier-ink/20 p-8 text-center text-xs opacity-50">No product images uploaded.</div>}
          </div>

          <div className="border border-atelier-ink/10 p-4 space-y-4">
            <div className="flex justify-between items-center"><div><h3 className="text-xs uppercase tracking-widest font-bold">Variants & stock</h3><p className="text-[10px] opacity-50 mt-1">Use variants when size or colour stock differs.</p></div><button type="button" onClick={addVariant} className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold"><Plus size={14}/> Add</button></div>
            {formData.variants.length === 0 && <p className="text-xs opacity-50">No variants. Product-level stock will be used.</p>}
            {formData.variants.map((variant, index) => <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-atelier-ink/10 pt-3">
              <input aria-label="Variant SKU" placeholder="SKU" className={`${inputClass} text-xs`} value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value.toUpperCase())}/>
              <input aria-label="Variant size" placeholder="Size" className={`${inputClass} text-xs`} value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)}/>
              <input aria-label="Variant colour" placeholder="Colour" className={`${inputClass} text-xs`} value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)}/>
              <div className="flex gap-1"><input aria-label="Variant stock" type="number" min="0" className={`${inputClass} text-xs`} value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)}/><input aria-label="Variant price override" type="number" min="0" placeholder="Price override" className={`${inputClass} text-xs`} value={variant.price ?? ""} onChange={(e) => updateVariant(index, "price", e.target.value)}/><button type="button" onClick={() => removeVariant(index)} className="text-red-700 px-1" aria-label="Remove variant"><Trash2 size={14}/></button></div>
            </div>)}
          </div>

          {formData.category === "Shoe" && <div className="border border-atelier-ink/10 p-4 space-y-3"><h3 className="text-xs uppercase tracking-widest font-bold">Shoe details</h3><input className={inputClass} placeholder="Styles (comma separated)" value={(formData.shoeDetails.style || []).join(", ")} onChange={(e) => setNested("shoeDetails", "style", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}/><input className={inputClass} placeholder="Materials (comma separated)" value={(formData.shoeDetails.material || []).join(", ")} onChange={(e) => setNested("shoeDetails", "material", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}/></div>}
          {formData.category === "Magazine" && <div className="border border-atelier-ink/10 p-4 space-y-3"><h3 className="text-xs uppercase tracking-widest font-bold">Magazine details</h3><div className="grid grid-cols-2 gap-3"><input type="number" className={inputClass} placeholder="Issue number" value={formData.magazineDetails.issueNumber} onChange={(e) => setNested("magazineDetails", "issueNumber", e.target.value)}/><input type="number" className={inputClass} placeholder="Pages" value={formData.magazineDetails.pages} onChange={(e) => setNested("magazineDetails", "pages", e.target.value)}/></div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(formData.magazineDetails.isDigital)} onChange={(e) => setNested("magazineDetails", "isDigital", e.target.checked)}/> Digital magazine</label><input className={inputClass} placeholder="Digital file URL (if applicable)" value={formData.magazineDetails.fileUrl || ""} onChange={(e) => setNested("magazineDetails", "fileUrl", e.target.value)}/></div>}
        </div>
      </div>

      {validationChecked && validationErrors.length > 0 && <div className="border border-red-300 bg-red-50 p-4 text-red-800"><div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-2"><AlertCircle size={15}/> Product needs attention</div><ul className="list-disc pl-5 text-xs space-y-1">{validationErrors.map((error, index) => <li key={index}>{error}</li>)}</ul></div>}
      {validationChecked && validationErrors.length === 0 && <div className="flex items-center gap-2 text-green-800 text-xs"><CheckCircle2 size={15}/> Product passed publication validation.</div>}

      <footer className="flex flex-col sm:flex-row gap-3 border-t border-atelier-ink/10 pt-5">
        <button type="button" disabled={isLoading} onClick={() => save("Draft")} className="flex-1 border border-atelier-ink/20 py-4 text-[9px] uppercase tracking-widest font-bold disabled:opacity-50">{isLoading ? "Saving..." : "Save draft"}</button>
        <button type="button" disabled={isLoading} onClick={() => save("Published")} className="flex-1 bg-atelier-ink text-white py-4 text-[9px] uppercase tracking-widest font-bold disabled:opacity-50">{isLoading ? "Saving..." : product?.publicationStatus === "Published" ? "Save & publish" : "Validate & publish"}</button>
      </footer>
    </section>
  );
};

export default AdminProductForm;
