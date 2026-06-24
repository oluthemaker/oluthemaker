import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeaturedBlogCard = ({ post }) => {
  if (!post) return null;

  return (
    <div className="w-full bg-atelier-paper pt-16 pb-24 px-6 border-t border-atelier-ink/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* IMAGE BLOCK */}
          <div className="md:col-span-7 overflow-hidden relative group aspect-[16/9]">
            <motion.img
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
              src={post.headerImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-atelier-ink/5 group-hover:bg-transparent transition-colors duration-500" />
          </div>

          {/* TEXT BLOCK */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold text-atelier-tan">
                The Journal
              </span>
              <div className="h-[1px] w-8 bg-atelier-tan/30" />
            </div>

            <h2 className="text-3xl md:text-5xl font-serif italic tracking-tighter leading-tight">
              {post.title}
            </h2>

            <p className="font-serif text-lg opacity-70 leading-relaxed italic">
              {post.excerpt}
            </p>

            <Link
              to={`/journal/${post.slug}`}
              className="inline-block pt-4 text-[10px] tracking-[0.3em] uppercase font-sans font-bold border-b border-atelier-ink pb-1 hover:text-atelier-tan hover:border-atelier-tan transition-all"
            >
              Read the Full Entry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlogCard;
