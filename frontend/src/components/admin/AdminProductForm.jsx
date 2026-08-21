import React, { useState, useEffect } from "react";
import useAdminStore from "../../store/useAdminStore";
import { atelierToast } from "../../utils/Toaster";
import { ATELIER_MASTER_MENU } from "../../utils/MasterMenu";

const SUBCATEGORY_MAP = {
  "Leather Goods": ["Wallets", "Belts", "Bags", "Cardholders", "Briefcases"],
  Merchandise: ["T-Shirts", "Caps", "Totes", "Socks", "Accessories", "Mugs", "Pottery", "Painting"],
  Shoe: ["Oxfords", "Loafers", "Derbies", "Boots", "Monkstraps"],
  Magazine: ["Physical", "Digital", "Special Edition"],
};

const AdminProductForm = () => {
  const { createProduct, isLoading } = useAdminStore();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    stock: 0,
    category: "Shoe",
    subCategory: "",
    isAuction: false,
    images: [],
    auctionDetails: {
      startingBid: "",
      minBidIncrement: 5000,
      startTime: "",
      endTime: "",
      reservePrice: "",
    },
    shoeDetails: {
      style: ["Oxford"],
      material: ["Museum Calf"],
      last: ["Lagos (Chiseled)"],
    },
    magazineDetails: {
      issueNumber: "",
      month: "",
      year: new Date().getFullYear(),
      pages: "",
      isDigital: false,
      excerpt: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: finalValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const toggleOption = (section, field, value) => {
    setFormData((prev) => {
      const currentValues = prev[section][field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [section]: { ...prev[section], [field]: newValues },
      };
    });
  };

  // Image manipulation handlers
  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.images.length) return;

    setFormData((prev) => {
      const updatedImages = [...prev.images];
      const [movedImage] = updatedImages.splice(index, 1);
      updatedImages.splice(targetIndex, 0, movedImage);
      return { ...prev, images: updatedImages };
    });
  };

  const handleUpload = () => {
    if (!scriptLoaded || !window.cloudinary) {
      atelierToast("Cloudinary script is still loading...");
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_PRESET_NAME,
        sources: ["local", "url"],
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
          atelierToast("Image added to gallery");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: formData.isAuction ? 1 : Number(formData.stock),
      shoeDetails: formData.category === "Shoe" ? formData.shoeDetails : undefined,
      magazineDetails:
        formData.category === "Magazine"
          ? {
              ...formData.magazineDetails,
              issueNumber: Number(formData.magazineDetails.issueNumber),
              pages: Number(formData.magazineDetails.pages),
              year: Number(formData.magazineDetails.year),
            }
          : undefined,
      auctionDetails: formData.isAuction ? formData.auctionDetails : undefined,
    };

    const result = await createProduct(payload);
    if (result.success) {
      atelierToast(`${formData.category} published successfully.`);
      setFormData(initialFormState);
    } else {
      atelierToast(result.error || "Failed to publish commission", "error");
    }
  };

  return (
    <section className="p-8 md:p-12 bg-atelier-paper border border-atelier-ink/10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-atelier-ink/10 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-serif italic">New Commission</h2>
          <span className="text-[9px] tracking-[0.3em] uppercase opacity-40 font-bold">
            Catalog & Reserve System
          </span>
        </div>

        <div className="flex flex-wrap gap-4">
          {["Shoe", "Magazine", "Leather Goods", "Merchandise"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat, subCategory: "" })}
              className={`text-[10px] tracking-[0.2em] uppercase font-bold pb-1 transition-all ${
                formData.category === cat
                  ? "border-b-2 border-atelier-ink opacity-100"
                  : "opacity-40 hover:opacity-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
              Product Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="The Atelier Piece"
              className="w-full bg-transparent border-b border-atelier-ink/20 py-2 focus:border-atelier-ink outline-none font-serif italic text-lg"
              required
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
              Sub Category
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-atelier-ink/20 py-2 outline-none font-sans text-sm"
            >
              <option value="">Select Subcategory...</option>
              {SUBCATEGORY_MAP[formData.category]?.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
                {formData.isAuction ? "Starting Price (₦)" : "Price (₦)"}
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-atelier-ink/20 py-2 focus:border-atelier-ink outline-none font-sans"
                required
              />
            </div>
            {!formData.isAuction && (
              <div>
                <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
                  Initial Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-atelier-ink/20 py-2 focus:border-atelier-ink outline-none font-sans"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-transparent border border-atelier-ink/20 p-4 focus:border-atelier-ink outline-none h-32 text-sm leading-relaxed"
              required
            />
          </div>

          {/* INTERACTIVE MEDIA GALLERY */}
          <div className="space-y-4">
            <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block font-bold">
              Gallery Media ({formData.images.length})
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group border border-atelier-ink/10 bg-atelier-ink/5 p-1"
                  >
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />

                    {/* Cover Image Indicator */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-atelier-ink text-white text-[8px] tracking-widest uppercase px-1.5 py-0.5 font-bold">
                        Cover
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-atelier-ink/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-white hover:text-red-400 text-xs font-bold px-1"
                          title="Remove Image"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-white">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          className="disabled:opacity-20 hover:text-atelier-tan text-xs font-bold px-1"
                          title="Move Left"
                        >
                          ←
                        </button>
                        <span className="text-[9px] font-mono">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === formData.images.length - 1}
                          className="disabled:opacity-20 hover:text-atelier-tan text-xs font-bold px-1"
                          title="Move Right"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              className="w-full p-4 border border-dashed border-atelier-ink/20 text-center hover:bg-atelier-ink/5 transition-colors text-[10px] tracking-widest uppercase font-bold opacity-70 hover:opacity-100"
            >
              + Upload {formData.images.length > 0 ? "More Media" : "Gallery Media"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 border border-atelier-ink/10 bg-atelier-ink/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase font-bold">
                  Auction Mode
                </h3>
                <p className="text-[10px] opacity-60 font-serif italic">
                  List this piece as a timed bidding event.
                </p>
              </div>
              <input
                type="checkbox"
                name="isAuction"
                id="isAuction"
                checked={formData.isAuction}
                onChange={handleChange}
                className="w-5 h-5 accent-atelier-ink cursor-pointer"
              />
            </div>

            {formData.isAuction && (
              <div className="space-y-4 pt-4 border-t border-atelier-ink/10 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] tracking-[0.2em] uppercase opacity-60 block mb-1 font-bold">
                      Auction Start
                    </label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.auctionDetails.startTime}
                      onChange={(e) => handleChange(e, "auctionDetails")}
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-1 text-xs outline-none"
                      required={formData.isAuction}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] tracking-[0.2em] uppercase opacity-60 block mb-1 font-bold">
                      Auction End
                    </label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.auctionDetails.endTime}
                      onChange={(e) => handleChange(e, "auctionDetails")}
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-1 text-xs outline-none"
                      required={formData.isAuction}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] tracking-[0.2em] uppercase opacity-60 block mb-1 font-bold">
                      Min Increment (₦)
                    </label>
                    <input
                      type="number"
                      name="minBidIncrement"
                      value={formData.auctionDetails.minBidIncrement}
                      onChange={(e) => handleChange(e, "auctionDetails")}
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-1 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] tracking-[0.2em] uppercase opacity-60 block mb-1 font-bold">
                      Reserve Price (₦)
                    </label>
                    <input
                      type="number"
                      name="reservePrice"
                      value={formData.auctionDetails.reservePrice}
                      onChange={(e) => handleChange(e, "auctionDetails")}
                      className="w-full bg-transparent border-b border-atelier-ink/20 py-1 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {formData.category === "Shoe" && (
            <div className="space-y-6">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold border-b border-atelier-ink/10 pb-2">
                Shoe Specifications
              </h3>
              {[
                { label: "Styles", key: "style", options: ATELIER_MASTER_MENU.styles },
                { label: "Sizes", key: "sizes", options: ATELIER_MASTER_MENU.sizes },
                { label: "Colors", key: "color", options: ATELIER_MASTER_MENU.colors },
                { label: "Materials", key: "material", options: ATELIER_MASTER_MENU.materials },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold block">
                    {field.label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((opt) => {
                      const isActive = formData.shoeDetails[field.key]?.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleOption("shoeDetails", field.key, opt)}
                          className={`px-3 py-1 text-[10px] border transition-all ${
                            isActive
                              ? "bg-atelier-ink text-white border-atelier-ink"
                              : "border-atelier-ink/10 opacity-60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.category === "Magazine" && (
            <div className="space-y-4">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold border-b border-atelier-ink/10 pb-2">
                Editorial Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Issue Number"
                  name="issueNumber"
                  value={formData.magazineDetails.issueNumber}
                  onChange={(e) => handleChange(e, "magazineDetails")}
                  className="bg-transparent border-b border-atelier-ink/20 py-2 text-xs outline-none"
                />
                <input
                  type="number"
                  placeholder="Page Count"
                  name="pages"
                  value={formData.magazineDetails.pages}
                  onChange={(e) => handleChange(e, "magazineDetails")}
                  className="bg-transparent border-b border-atelier-ink/20 py-2 text-xs outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-widest uppercase font-bold hover:bg-atelier-tan transition-all disabled:opacity-50 mt-8"
          >
            {isLoading ? "Publishing Piece..." : "Confirm & Publish Piece"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminProductForm;
