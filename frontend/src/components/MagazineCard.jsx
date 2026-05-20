import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MagazineCard = ({ issue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <Link to={`/magazine/${issue.slug}`}>
        {/* THE COVER */}
        <div className="relative aspect-[4/6] overflow-hidden bg-atelier-ink/5 mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            src={issue.images[0]}
            alt={issue.name}
            className="w-full h-full object-cover"
          />
          {/* Subtle Spine Shadow to mimic a book */}
          <div className="absolute inset-y-0 left-0 w-2 bg-black/10 blur-[1px]" />
        </div>

        {/* METADATA */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] tracking-[0.3em] uppercase font-sans font-bold opacity-40">
            <span>Issue No. {issue?.magazineDetails?.issueNumber}</span>
            <span>
              {issue?.magazineDetails?.month} * {issue?.magazineDetails?.year}
            </span>
          </div>
          <h3 className="text-2xl font-serif italic tracking-tight group-hover:text-atelier-tan transition-colors">
            {issue.name}
          </h3>
          <div className="h-[1px] w-0 group-hover:w-full bg-atelier-tan transition-all duration-700" />
        </div>
      </Link>
    </motion.div>
  );
};

export default MagazineCard;
