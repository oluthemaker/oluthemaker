import { useState, useEffect } from "react";
import {
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiLink,
  FiArrowLeft,
} from "react-icons/fi";
import useBlogStore from "../../store/useBlogStore";
import useUserStore from "../../store/useUserStore";
import BlogContentRenderer from "./BlogContentRenderer";
import BlogAdminActions from "./BlogAdminActions";
import { useNavigate, useParams, Link } from "react-router-dom";
import useSEO from "../../hooks/useSEO";

const SingleBlogPost = () => {
  const navigate = useNavigate();
  const { currentBlog, loading, error, fetchBlogBySlug } = useBlogStore();
  const { user, checkingAuth } = useUserStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug);
    }
    // Scroll to top on load for that fresh page feel
    window.scrollTo(0, 0);
  }, [slug, fetchBlogBySlug]);

  useEffect(() => {
    setIsAdmin(user?.user?.isAdmin);
  }, [user]);

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const title = currentBlog?.title || "";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        alert("Archive link copied to clipboard.");
        break;
      default:
        break;
    }
  };

  const handleDeleteSuccess = () => {
    navigate("/journal");
  };

  useSEO({
    title: currentBlog?.title,
    description: currentBlog?.excerpt,
    ogImage: currentBlog?.headerImage,
  });

  if (checkingAuth || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-atelier-paper">
        <span className="text-[10px] tracking-[0.5em] uppercase animate-pulse text-atelier-ink">
          Loading Entry
        </span>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-800 font-serif italic">
        Error retrieving archive: {error}
      </div>
    );

  if (!currentBlog)
    return (
      <div className="text-center py-20 font-serif italic">
        Archive entry not found.
      </div>
    );

  return (
    <div className="bg-atelier-paper text-atelier-ink min-h-screen overflow-x-hidden pb-24">
      {/* 1. Minimalist Top Navigation */}
      <nav className="w-full px-6 py-8 flex justify-between items-center bg-atelier-paper border-b border-atelier-ink/5">
        <button
          onClick={() => navigate("/journal")}
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase hover:text-atelier-tan transition-colors group"
        >
          <FiArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Return to Archive
        </button>
      </nav>

      {/* 2. HERO IMAGE - Now starts exactly after the Journal Nav */}
      <div className="w-full h-[80vh] md:h-[130vh] lg:h-[200vh]  relative overflow-hidden bg-atelier-ink">
        <img
          src={currentBlog.headerImage}
          alt={currentBlog.title}
          className="w-full h-full object-cover transition-all duration-[2000ms]"
        />
        {/* Subtle gradient to fade into the paper color below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-atelier-paper to-transparent" />
      </div>
      {/* 3. Title & Meta Section (Centered, constrained width) */}
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        {" "}
        {currentBlog.category && (
          <span className="text-[10px] tracking-[0.4em] uppercase text-atelier-tan mb-6 inline-block">
            {currentBlog.category.replace("-", " ")}
          </span>
        )}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic leading-tight mb-8">
          {currentBlog.title}
        </h1>
        <p className="text-xl md:text-2xl font-serif text-atelier-ink/70 leading-relaxed mb-12 max-w-2xl mx-auto">
          {currentBlog.description}
        </p>
        {/* Meta & Share Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-y border-atelier-ink/10 gap-6">
          <div className="flex flex-wrap justify-center gap-y-2 gap-x-4 md:gap-x-8 text-[10px] tracking-[0.2em] uppercase font-sans text-atelier-ink/60">
            <span>
              By{" "}
              <span className="text-atelier-ink font-bold">
                {currentBlog?.author || "Atelier"}
              </span>
            </span>

            {/* Map through the dynamic credits */}
            {currentBlog.credits?.map((credit, i) => (
              <span key={i}>
                {credit.role}{" "}
                <span className="text-atelier-ink font-bold">
                  {credit.name}
                </span>
              </span>
            ))}

            <span>
              {new Date(currentBlog.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex gap-4 text-atelier-ink/40">
            <button
              onClick={() => handleShare("twitter")}
              className="hover:text-atelier-ink transition-colors"
              aria-label="Share on Twitter"
            >
              <FiTwitter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="hover:text-atelier-ink transition-colors"
              aria-label="Share on Facebook"
            >
              <FiFacebook className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="hover:text-atelier-ink transition-colors"
              aria-label="Share on LinkedIn"
            >
              <FiLinkedin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="hover:text-atelier-ink transition-colors"
              aria-label="Copy link"
            >
              <FiLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {/* 4. Blog Content (W-full so it can handle fullBleed images) */}
      <main className="w-full">
        <BlogContentRenderer contentBlocks={currentBlog.contentBlocks} />
      </main>
      {/* 5. Admin Actions */}
      {isAdmin && (
        <div className="max-w-3xl mx-auto px-6">
          <BlogAdminActions
            slug={currentBlog.slug}
            onDeleteSuccess={handleDeleteSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default SingleBlogPost;
