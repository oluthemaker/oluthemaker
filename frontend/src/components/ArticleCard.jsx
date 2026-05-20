// src/components/ArticleCard.jsx
import { Link } from "react-router-dom";

const ArticleCard = ({ article }) => {
  if (!article) return null;

  return (
    <Link to={`/journal/${article.slug}`} className="group flex flex-col">
      <div className="aspect-[4/6] overflow-hidden mb-6 bg-atelier-ink/5 relative">
        <img
          src={article.headerImage}
          alt={article.title}
          className="w-full h-full object-cover  group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
        />
        {/* Subtle category overlay */}
        <div className="absolute top-4 left-4">
          <span className="bg-atelier-paper/90 px-3 py-1 text-[8px] tracking-[0.2em] uppercase text-atelier-ink">
            {article.category?.replace("-", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-serif italic leading-tight group-hover:text-atelier-tan transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-atelier-ink/60 font-serif line-clamp-2 italic">
          {article.description}
        </p>

        <div className="pt-4 border-t border-atelier-ink/10 flex justify-between items-center">
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold">
            {article.author || "Olu THE MAKER"}
          </span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-atelier-ink/40">
            {new Date(article.publishedAt).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
