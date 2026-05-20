import { useState } from "react";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import useBlogStore from "../../store/useBlogStore";
import { useNavigate, Link } from "react-router-dom";

const BlogAdminActions = ({ slug, onDeleteSuccess }) => {
  const { deleteBlog } = useBlogStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Custom confirm for a cleaner feel, though window.confirm works for MVP
    if (
      window.confirm(
        "This article will be permanently removed from the Atelier archives. Proceed?",
      )
    ) {
      setIsDeleting(true);
      try {
        const success = await deleteBlog(slug);
        if (success && onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (error) {
        console.error("Archive removal failed:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-12 py-8 border-t border-atelier-ink/10">
      {/* Edit Button - Matches the "ElegantButton" aesthetic */}
      <Link
        to={`/journal/edit/${slug}`}
        className="flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-sans border border-atelier-ink text-atelier-ink hover:bg-atelier-ink hover:text-atelier-paper transition-all duration-300"
      >
        <FiEdit3 className="w-3 h-3" />
        Modify Entry
      </Link>

      {/* Delete Button - Sophisticated Warning */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.2em] uppercase font-sans border transition-all duration-300 ${
          isDeleting
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-red-800/30 text-red-800 hover:bg-red-800 hover:text-white hover:border-red-800"
        }`}
      >
        <FiTrash2 className="w-3 h-3" />
        {isDeleting ? "Removing..." : "Delete Archive"}
      </button>
    </div>
  );
};

export default BlogAdminActions;
