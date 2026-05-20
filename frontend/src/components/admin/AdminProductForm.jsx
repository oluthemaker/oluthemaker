import React, { useState, useEffect } from "react";
import useAdminStore from "../../store/useAdminStore";
import { atelierToast } from "../../utils/Toaster";
import { ATELIER_MASTER_MENU } from "../../utils/MasterMenu";

const AdminProductForm = () => {
  const { createProduct, isLoading } = useAdminStore();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initialFormState = {
    name: "",
    description: "",
    price: "",
    stock: 0,
    category: "Shoe",
    images: [],
    shoeDetails: {
      style: ["Oxford"], // Now Arrays
      material: ["Museum Calf"],
      last: ["Lagos (Chiseled)"],
      construction: ["Hand-Welted"],
      soles: ["Single Leather"],
      width: ["D (Standard)"],
      sizes: [40, 41, 42, 43, 44, 45],
      isBespoke: true,
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
      document.body.removeChild(script); // Cleanup on unmount
    };
  }, []);

  // --- LOGIC: MULTI-SELECT TOGGLE ---
  const toggleOption = (section, field, value) => {
    setFormData((prev) => {
      const currentValues = prev[section][field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value) // Remove
        : [...currentValues, value]; // Add

      return {
        ...prev,
        [section]: { ...prev[section], [field]: newValues },
      };
    });
  };

  const selectAllOptions = (field, allOptions) => {
    setFormData((prev) => ({
      ...prev,
      shoeDetails: {
        ...prev.shoeDetails,
        [field]:
          prev.shoeDetails[field].length === allOptions.length
            ? []
            : allOptions,
      },
    }));
  };

  // --- CLOUDINARY LOGIC ---
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
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F1EA", // atelier-paper
            windowBorder: "#1A1A1A", // atelier-ink
            tabIcon: "#1A1A1A",
            inactiveTabIcon: "#8E8E8E",
            menuIcons: "#1A1A1A",
            link: "#1A1A1A",
            action: "#1A1A1A",
            inProgress: "#0078FF",
            complete: "#20B832",
            error: "#E01919",
            textDark: "#1A1A1A",
            textLight: "#FFFFFF",
          },
          fonts: {
            default: null,
            "'Helvetica Neue', Helvetica, Arial, sans-serif": {
              url: null,
              active: true,
            },
          },
        },
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
          atelierToast("Image added to gallery");
        }
      },
    );
  };

  // 2. Generic change handler for nested objects
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

  // 3. Updated Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      // Clean up payload based on category
      shoeDetails:
        formData.category === "Shoe" ? formData.shoeDetails : undefined,
      magazineDetails:
        formData.category === "Magazine"
          ? {
              ...formData.magazineDetails,
              issueNumber: Number(formData.magazineDetails.issueNumber),
              pages: Number(formData.magazineDetails.pages),
              year: Number(formData.magazineDetails.year),
            }
          : undefined,
    };

    const result = await createProduct(payload);
    if (result.success) {
      atelierToast(`${formData.category} published.`);
      setFormData(initialFormState);
    }
  };

  return (
    <section className="p-8 md:p-12 bg-atelier-paper border border-atelier-ink/10">
      <header className="flex justify-between items-end mb-12 border-b border-atelier-ink/10 pb-6">
        <h2 className="text-2xl font-serif italic">New Commission</h2>
        <div className="flex gap-4">
          {["Shoe", "Magazine"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat })}
              className={`text-[10px] tracking-[0.2em] uppercase font-bold pb-1 transition-all ${
                formData.category === cat
                  ? "border-b border-atelier-ink opacity-100"
                  : "opacity-40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
      >
        {/* --- LEFT COLUMN: GENERAL INFO --- */}
        <div className="space-y-8">
          <div>
            <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
              Product Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={
                formData.category === "Shoe"
                  ? "The Lagos Oxford"
                  : "Issue No. 04 - The Autumn Dossier"
              }
              className="w-full bg-transparent border-b border-atelier-ink/20 py-2 focus:border-atelier-ink outline-none font-serif italic text-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase opacity-50 block mb-2 font-bold">
                Price (₦)
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

          {/* Image Upload Area */}
          <div className="p-8 border border-dashed border-atelier-ink/20 text-center hover:bg-atelier-ink/5 transition-colors cursor-pointer">
            <div
              onClick={handleUpload}
              className="p-8 border border-dashed border-atelier-ink/20 text-center hover:bg-atelier-ink/5 transition-colors cursor-pointer"
            >
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="preview"
                      className="w-full h-20 object-cover border border-atelier-ink/10"
                    />
                  ))}
                  <div className="flex items-center justify-center text-[10px] uppercase font-bold opacity-50">
                    + Add More
                  </div>
                </div>
              ) : (
                <p className="text-[10px] tracking-widest uppercase font-bold opacity-50">
                  Click to Upload Media via Cloudinary
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: CONDITIONAL DETAILS --- */}
        <div className="space-y-8">
          {/* SHOE SPECIFICS */}
          {formData.category === "Shoe" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold border-b border-atelier-ink/10 pb-2">
                Bespoke Configuration Matrix
              </h3>

              {[
                {
                  label: "Styles",
                  key: "style",
                  options: ATELIER_MASTER_MENU.styles,
                },
                {
                  label: "Lasts",
                  key: "last",
                  options: ATELIER_MASTER_MENU.lasts,
                },
                {
                  label: "Materials",
                  key: "material",
                  options: ATELIER_MASTER_MENU.materials,
                },
                {
                  label: "Construction",
                  key: "construction",
                  options: ATELIER_MASTER_MENU.constructions,
                },
                {
                  label: "Soles",
                  key: "soles",
                  options: ATELIER_MASTER_MENU.soles,
                },
                {
                  label: "Widths",
                  key: "width",
                  options: ATELIER_MASTER_MENU.widths,
                },
                {
                  label: "Sizes",
                  key: "sizes",
                  options: ATELIER_MASTER_MENU.sizes,
                },
              ].map((field) => (
                <div key={field.key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => selectAllOptions(field.key, field.options)}
                      className="text-[8px] uppercase underline opacity-40 hover:opacity-100"
                    >
                      {formData.shoeDetails[field.key].length ===
                      field.options.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {field.options.map((opt) => {
                      const isActive =
                        formData.shoeDetails[field.key].includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            toggleOption("shoeDetails", field.key, opt)
                          }
                          className={`px-3 py-1.5 text-[10px] border transition-all duration-300 ${
                            isActive
                              ? "bg-atelier-ink text-atelier-paper border-atelier-ink"
                              : "border-atelier-ink/10 opacity-60 hover:opacity-100"
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

          {/* MAGAZINE SPECIFICS */}
          {formData.category === "Magazine" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-[11px] tracking-[0.3em] uppercase font-bold border-b border-atelier-ink/10 pb-2">
                Editorial Specifications
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 block mb-1 font-bold">
                    Issue Number
                  </label>
                  <input
                    type="number"
                    name="issueNumber"
                    value={formData.magazineDetails.issueNumber}
                    onChange={(e) => handleChange(e, "magazineDetails")}
                    className="w-full bg-transparent border-b border-atelier-ink/20 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 block mb-1 font-bold">
                    Page Count
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.magazineDetails.pages}
                    onChange={(e) => handleChange(e, "magazineDetails")}
                    className="w-full bg-transparent border-b border-atelier-ink/20 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 block mb-1 font-bold">
                    Publication Month
                  </label>
                  <select
                    name="month"
                    value={formData.magazineDetails.month}
                    onChange={(e) => handleChange(e, "magazineDetails")}
                    className="w-full bg-transparent border-b border-atelier-ink/20 py-2 text-sm outline-none"
                  >
                    <option value="">Select Month...</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] tracking-[0.2em] uppercase opacity-50 block mb-1 font-bold">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.magazineDetails.year}
                    onChange={(e) => handleChange(e, "magazineDetails")}
                    className="w-full bg-transparent border-b border-atelier-ink/20 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isDigital"
                  id="isDigital"
                  checked={formData.magazineDetails.isDigital}
                  onChange={(e) => handleChange(e, "magazineDetails")}
                  className="accent-atelier-ink w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isDigital"
                  className="text-[10px] tracking-widest uppercase cursor-pointer"
                >
                  Digital Release (PDF)
                </label>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-8 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-atelier-ink text-white py-4 text-[10px] tracking-widest uppercase font-bold hover:bg-atelier-tan transition-all col-span-2 disabled:opacity-50"
            >
              {isLoading ? "Validating with Atelier..." : "Confirm Publication"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default AdminProductForm;
