import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiImage,
  FiType,
  FiBookOpen,
  FiColumns,
  FiTable
} from "react-icons/fi";

import useBlogStore from "../../store/useBlogStore";
import useUserStore from "../../store/useUserStore";
import { slugify } from "../../utils/slugify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import BlockToolbar from "./BlockToolbar";
import TextBlock from "./TextBlock";
import ImageBlock from "./ImageBlock";
import SideBySide from "./SideBySide";
import PullQuoteBlock from "./PullQuoteBlock";
import TableBlock from "./TableBlock";
import SortableBlock from "./SortableBlock";


import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";


const CreateBlog = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { slug } = useParams(); // Check if we are editing
  const { fetchBlogBySlug, currentBlog, createBlog, updateBlog } =
    useBlogStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState("published"); // Add this near your other state

  const categories = [
    "all",
    "news",
    "masters-of-the-craft",
    "moving-hands",
    "our-advice",
    "tools-of-the-trade",
    "reports",
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "", // Added for grid excerpt
    magazineIssue: "",
    headerImageUrl: "",
    innerImageForFeaturedUrl: "",
    featured: false,
    credits: [],
    author: "Olu THE MAKER", // Editable default
    category: "news",
    contentBlocks: [],
    tags: [],
  });

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (slug && currentBlog) {
      setFormData({
        ...formData, // Spread existing defaults to keep all fields (like credits, tags, etc.)
        title: currentBlog.title || "",
        contentBlocks: currentBlog.contentBlocks || [],
        category: currentBlog.category || "news",
        headerImageUrl: currentBlog.headerImage || "", // Map backend naming to your frontend state
        description: currentBlog.description || "",
        credits: currentBlog.credits || [], // Ensure this is explicitly set to an array
        author: currentBlog.author || "Olu THE MAKER",
      });
    }
  }, [currentBlog, slug]);

  const addCredit = () => {
    setFormData((p) => ({
      ...p,
      credits: [...p.credits, { role: "", name: "" }],
    }));
  };

  const updateCredit = (index, field, value) => {
    const newCredits = [...formData.credits];
    // Clone the specific credit object before modifying
    newCredits[index] = { ...newCredits[index], [field]: value };
    setFormData((p) => ({ ...p, credits: newCredits }));
  };

  const removeCredit = (index) => {
    setFormData((p) => ({
      ...p,
      credits: p.credits.filter((_, i) => i !== index),
    }));
  };

  const duplicateBlock = (index) => {
    setFormData(prev => {

      const blocks = [...prev.contentBlocks];

      const copy = structuredClone(blocks[index]);

      copy.id = crypto.randomUUID();

      blocks.splice(index + 1, 0, copy);

      return {
        ...prev,
        contentBlocks: blocks,
      };
    });
  };

  const moveBlock = (index, direction) => {
      setFormData(prev => {
          const blocks = [...prev.contentBlocks];
          const newIndex = index + direction;
          if (
              newIndex < 0 ||
              newIndex >= blocks.length
          )
              return prev;
          [blocks[index], blocks[newIndex]] =
              [blocks[newIndex], blocks[index]];
          return {
              ...prev,
              contentBlocks: blocks,
          };
      });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setFormData(prev => {
      const oldIndex = prev.contentBlocks.findIndex(
        block => block.id === active.id
      );

      const newIndex = prev.contentBlocks.findIndex(
        block => block.id === over.id
      );

      return {
        ...prev,
        contentBlocks: arrayMove(
          prev.contentBlocks,
          oldIndex,
          newIndex
        ),
      };
    });
  };
  // Cloudinary Upload Logic
  const handleFileUpload = async (file, callback) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append(
      "upload_preset",
      import.meta.env.VITE_PRESET_NAME || "your_preset",
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadFormData },
      );
      const data = await response.json();
      callback(data.secure_url);
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      alert("Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.headerImageUrl || !formData.description)
        throw new Error(
          "Missing required fields (Title, Header, or Description)",
        );

      if (slug) {
        await updateBlog(currentBlog._id, {
          ...formData,
          status: submitAction,
        });
      } else {
        const blogData = {
          ...formData,
          status: submitAction,
          headerImage: formData.headerImageUrl,
          innerImageForFeatured: formData.innerImageForFeaturedUrl,
          slug: slugify(formData.title),
          publishedAt: new Date().toISOString(),
        };
        await createBlog(blogData, user.token);
      }
      navigate(submitAction === "draft" ? `/journal/drafts` : `/journal`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContentBlock = (index, updates) => {
    setFormData((prev) => {
      const updatedBlocks = [...prev.contentBlocks];
      updatedBlocks[index] = { ...updatedBlocks[index], ...updates };
      return { ...prev, contentBlocks: updatedBlocks };
    });
  };

  const createBlock = (block) => ({
      id: crypto.randomUUID(),
      ...block,
  });

  const addBlock = (type) => {
    const defaults = {
      text: createBlock({
             type: "text",
             content: "",
         }),
      image: createBlock({
        type: "image",
        src: "",
        externalLink: "",
        alt: "",
        layout: "default",
        caption: "",
      }),
      "pull-quote": createBlock({ type: "pull-quote", content: "", author: "" }),
      "side-by-side-images": createBlock({
        type: "side-by-side-images",
        images: [
          { src: "", alt: "", caption: "", externalLink: "" },
          { src: "", alt: "", caption: "", externalLink: "" },
        ],
      }),
      table: createBlock({
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [
          ["", ""],
          ["", ""],
        ],
        caption: "",
      }),
    };
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, defaults[type]],
    }));
  };

  return (
    <div className="min-h-screen bg-atelier-paper text-atelier-ink py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-atelier-ink/10 pb-6">
          <h1 className="text-4xl font-serif italic mb-2">Draft Entry</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-atelier-ink/60 underline decoration-atelier-tan">
            Atelier Content Management System
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Main Info */}
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Article Title..."
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full bg-transparent text-3xl font-serif italic outline-none border-none"
              required
            />

            {/* Description / Excerpt Field */}
            <textarea
              placeholder="Enter brief description (Excerpt for the grid)..."
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-transparent border-b border-atelier-ink/10 outline-none text-sm font-serif italic py-2 resize-none h-20"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-atelier-tan/10 p-6 border border-atelier-tan/30 flex items-center gap-6">
                <FiBookOpen className="text-atelier-tan w-6 h-6" />
                <div className="flex-1">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-atelier-tan mb-1">
                    Magazine Connection
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Issue No. 04"
                    value={formData.magazineIssue}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        magazineIssue: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent border-b border-atelier-tan/50 outline-none text-sm py-1"
                  />
                </div>
              </div>
              {/* Credits Section */}
              <div className="space-y-4 border-t border-atelier-ink/5 pt-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] tracking-[0.3em] uppercase opacity-40">
                    Production Credits
                  </label>
                  <button
                    type="button"
                    onClick={addCredit}
                    className="text-[10px] uppercase tracking-widest text-atelier-tan hover:underline"
                  >
                    + Add Credit
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {formData?.credits?.map((credit, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-end bg-white/30 p-4 border border-atelier-ink/5"
                    >
                      <div className="flex-1">
                        <input
                          placeholder="Role (e.g. Photography)"
                          className="w-full bg-transparent border-b border-atelier-ink/10 text-[10px] uppercase outline-none"
                          value={credit.role}
                          onChange={(e) =>
                            updateCredit(idx, "role", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          placeholder="Name"
                          className="w-full bg-transparent border-b border-atelier-ink/10 text-sm italic font-serif outline-none"
                          value={credit.name}
                          onChange={(e) =>
                            updateCredit(idx, "name", e.target.value)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCredit(idx)}
                        className="text-atelier-ink/30 hover:text-red-500"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Field */}
              <div className="bg-atelier-ink/5 p-6 border border-atelier-ink/10 flex items-center gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-atelier-ink/40 mb-1">
                    Author Credit
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, author: e.target.value }))
                    }
                    className="w-full bg-transparent border-b border-atelier-ink/20 outline-none text-sm py-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-[10px] tracking-[0.3em] uppercase opacity-40">
              Editorial Category
            </label>
            <div className="flex flex-wrap gap-3">
              {categories
                .filter((cat) => cat !== "all")
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, category: cat }))
                    }
                    className={`px-4 py-2 text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                      formData.category === cat
                        ? "bg-atelier-ink text-white border-atelier-ink"
                        : "border-atelier-ink/10 text-atelier-ink/60 hover:border-atelier-ink"
                    }`}
                  >
                    {cat.replace("-", " ")}
                  </button>
                ))}
            </div>
          </div>

          {/* Featured Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase">
                Header Image (Main)
              </label>
              <div className="relative border border-atelier-ink/20 aspect-video flex items-center justify-center bg-white/50 overflow-hidden">
                {formData.headerImageUrl ? (
                  <img
                    src={formData.headerImageUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload(e.target.files[0], (url) =>
                        setFormData((p) => ({ ...p, headerImageUrl: url })),
                      )
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Content Blocks */}
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-atelier-ink/10 pb-2">
              <h2 className="text-[10px] tracking-widest uppercase font-bold">
                Editorial Composition
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  title="Text Block"
                  onClick={() => addBlock("text")}
                  className="p-2 border border-atelier-ink/20 hover:bg-atelier-ink hover:text-white transition-all"
                >
                  <FiType />
                </button>
                <button
                  type="button"
                  title="Table Block"
                  onClick={() => addBlock("table")}
                  className="p-2 border border-atelier-ink/20 hover:bg-atelier-ink hover:text-white transition-all"
                >
                  <FiTable />
                </button>
                <button
                  type="button"
                  title="Single Image"
                  onClick={() => addBlock("image")}
                  className="p-2 border border-atelier-ink/20 hover:bg-atelier-ink hover:text-white transition-all"
                >
                  <FiImage />
                </button>
                <button
                  type="button"
                  title="Side-by-Side Images"
                  onClick={() => addBlock("side-by-side-images")}
                  className="p-2 border border-atelier-ink/20 hover:bg-atelier-ink hover:text-white transition-all"
                >
                  <FiColumns />
                </button>
                <button
                  type="button"
                  title="Pull Quote"
                  onClick={() => addBlock("pull-quote")}
                  className="p-2 border border-atelier-ink/20 hover:bg-atelier-ink hover:text-white transition-all"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            <DndContext
                   collisionDetection={closestCenter}
                   onDragEnd={handleDragEnd}
            >
              <SortableContext
                       items={formData.contentBlocks.map(
                           block => block.id
                       )}
                       strategy={verticalListSortingStrategy}
            >
          {formData.contentBlocks.map((block, index) => (
          <SortableBlock
                 key={block.id}
                 id={block.id}
             >
              {({ listeners, attributes }) => (
                <div
                  key={block.id ?? index}
                  className="group relative border border-atelier-ink/10 p-8 bg-white/30"
                >
                  <BlockToolbar
                    dragListeners={listeners}
                    dragAttributes={attributes}
                   title={block.type.replace("-", " ")}
                   onMoveUp={() => moveBlock(index, -1)}
                   onMoveDown={() => moveBlock(index, 1)}
                   onDelete={() =>
                       setFormData(prev => ({
                           ...prev,
                           contentBlocks: prev.contentBlocks.filter(
                               (_, i) => i !== index
                           )
                       }))
                   }
                   onDuplicate={() => duplicateBlock(index)}
               />
               {block.type === "text" && (
                   <TextBlock
                       block={block}
                       index={index}
                       updateContentBlock={updateContentBlock}
                   />
               )}
                {block.type === "image" && (
                  <ImageBlock
                    block={block}
                    index={index}
                    updateContentBlock={updateContentBlock}
                    handleFileUpload={handleFileUpload}
                  />
                )}
                {block.type === "side-by-side-images" && (
                  <SideBySide
                    block={block}
                    index={index}
                    updateContentBlock={updateContentBlock}
                    handleFileUpload={handleFileUpload}
                  />
                )}

                {block.type === "pull-quote" && (
                  <PullQuoteBlock
                    block={block}
                    index={index}
                    updateContentBlock={updateContentBlock}
                  />
                )}
                {/* --- TABLE BLOCK RENDERER --- */}
                {block.type === "table" && (
                  <TableBlock
                    block={block}
                    index={index}
                    updateContentBlock={updateContentBlock}
                  />
                )}
              </div>
                  )}
             </SortableBlock>

            ))}
              </SortableContext>
            </DndContext>
          </div>



          <div className="flex justify-end gap-6 pt-12 border-t border-atelier-ink/10">
            <button
              type="submit"
              onClick={() => setSubmitAction("draft")}
              disabled={isSubmitting}
              className="px-10 py-4 border border-atelier-ink text-atelier-ink text-[10px] tracking-[0.3em] uppercase hover:bg-atelier-ink hover:text-white transition-all"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => setSubmitAction("published")}
              disabled={isSubmitting}
              className="px-10 py-4 bg-atelier-ink text-white text-[10px] tracking-[0.3em] uppercase hover:bg-atelier-ink/90 transition-all"
            >
              {isSubmitting ? "Processing..." : "Publish to Archive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
