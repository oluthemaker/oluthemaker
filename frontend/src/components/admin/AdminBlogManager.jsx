import React, { useEffect } from "react";
import { Star, StarOff, Loader2 } from "lucide-react";
import useBlogStore from "../../store/useBlogStore";

const AdminBlogManager = () => {
  const { blogs, fetchBlogs, updateBlog, loading } = useBlogStore();

  useEffect(() => {
    fetchBlogs(1, "", 20); // Fetch recent blogs
  }, [fetchBlogs]);

  const handleToggleFeatured = async (blog) => {
    try {
      // Toggle the featured status
      await updateBlog(blog._id, { featured: !blog.featured });
      // Refresh to ensure state is synced
      await fetchBlogs(1, "", 20);
    } catch (err) {
      console.error("Failed to update featured status", err);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <Loader2 className="animate-spin opacity-20" />}

      <div className="grid gap-4">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="flex items-center justify-between p-6 bg-white border border-atelier-ink/5 group hover:border-atelier-ink/20 transition-all"
          >
            <div className="flex items-center gap-6">
              {blog.headerImage && (
                <img
                  src={blog.headerImage}
                  alt=""
                  className="w-16 h-16 object-cover grayscale group-hover:grayscale-0 transition-all"
                />
              )}
              <div>
                <h4 className="font-serif italic text-lg text-atelier-ink">
                  {blog.title}
                </h4>
                <p className="text-[10px] tracking-widest uppercase opacity-40">
                  {blog.category}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggleFeatured(blog)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all ${
                blog.featured
                  ? "text-atelier-ink border border-atelier-ink"
                  : "opacity-30 hover:opacity-100"
              }`}
            >
              {blog.featured ? (
                <>
                  <Star size={14} fill="currentColor" /> Featured
                </>
              ) : (
                <>
                  <StarOff size={14} /> Make Featured
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlogManager;
