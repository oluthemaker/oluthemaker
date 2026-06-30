import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import useBlogStore from "../../store/useBlogStore";
import useUserStore from "../../store/useUserStore";
import ArticleCard from "../../components/ArticleCard";

export default function DraftsList() {
  const { blogs, loading, fetchDrafts } = useBlogStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const isAdmin = user?.user?.isAdmin;

  useEffect(() => {
    // Security check - redirect non-admins
    if (!isAdmin) {
      navigate("/journal");
      return;
    }
    // You will need to create this fetchDrafts function in your Zustand store
    fetchDrafts();
  }, [isAdmin, navigate, fetchDrafts]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-atelier-paper">
        <span className="text-[10px] tracking-[0.5em] uppercase animate-pulse text-atelier-ink">
          Loading Drafts
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-atelier-paper text-atelier-ink px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <Link
            to="/journal"
            className="flex items-center gap-2 text-[10px] tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity mb-8 w-fit"
          >
            <FiChevronLeft size={14} />
            <span>Back to Journal</span>
          </Link>
          <h1 className="text-5xl font-serif italic mb-4">
            Unpublished Drafts
          </h1>
          <p className="text-xs tracking-widest uppercase opacity-50">
            Articles in progress ({blogs.length})
          </p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {blogs.map((article) => (
              <div key={article._id} className="relative group">
                <ArticleCard article={article} />
                {/* Overlay edit button to make it obvious they are managing a draft */}
                <div className="absolute top-4 right-4 z-10">
                  <Link
                    to={`/journal/edit/${article.slug}`} // Assuming you have an edit route
                    className="bg-atelier-paper/90 backdrop-blur-sm px-4 py-2 text-[10px] tracking-widest uppercase shadow-sm border border-atelier-ink/10 hover:bg-atelier-ink hover:text-atelier-paper transition-colors"
                  >
                    Edit Draft
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-atelier-ink/20">
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-30 italic font-serif">
              You have no saved drafts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
