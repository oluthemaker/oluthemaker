export const PullQuote = ({ text, author }) => (

  <aside className="my-24 py-12 border-y border-atelier-ink/10 max-w-4xl mx-auto text-center px-6">
    <blockquote className="text-3xl md:text-5xl font-serif italic text-atelier-ink leading-[1.1] tracking-tight">
      &ldquo;{text}&rdquo;
    </blockquote>

    {author && (
      <cite className="mt-8 block font-sans not-italic text-xs uppercase tracking-[0.3em] text-atelier-ink/50">
        — {author}
      </cite>
    )}

    <div className="mt-8 flex justify-center">
      <div className="w-12 h-[1px] bg-atelier-tan/40" />
    </div>
  </aside>
);
