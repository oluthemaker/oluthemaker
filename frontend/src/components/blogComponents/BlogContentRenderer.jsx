import { BlogImage } from "./BlogImage";
import { PullQuote } from "./PullQuote";

const BlogContentRenderer = ({ contentBlocks }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="text-atelier-ink/40 font-sans text-xs uppercase tracking-widest py-20 text-center">
        End of Archive
      </div>
    );
  }

  return (
    <div className="blog-content w-full">
      {contentBlocks.map((block, index) => {
        // Shared wrapper for text-based content to keep the 3xl width
        const TextWrapper = ({ children }) => (
          <div className="max-w-3xl mx-auto px-6 mb-12">{children}</div>
        );

        switch (block.type) {
          case "text":
            return (
              <TextWrapper key={index}>
                <div
                  // You can also consider removing overflow-wrap-anywhere if you don't have extremely long URLs
                  className="prose prose-atelier max-w-none font-serif text-lg leading-relaxed text-atelier-ink/90
                                   break-words"
                  dangerouslySetInnerHTML={{
                    // Replace non-breaking spaces with regular spaces so the browser wraps text naturally
                    __html: (block.content || "").replace(/&nbsp;/g, " "),
                  }}
                />
              </TextWrapper>
            );
          case "image":
            return (
              <BlogImage
                key={index}
                src={block.src}
                externalLink={block.externalLink}
                alt={block.alt || ""}
                layout={block.layout || "default"} // handles 'default', 'wide', 'fullBleed'
                caption={block.caption}
              />
            );

          case "pull-quote":
            return <PullQuote key={index} text={block.content || ""} />;

          case "side-by-side-images":
            return (
              <BlogImage
                key={index}
                layout="sideBySide" // Match this to the 'if' statement in BlogImage.jsx
                src={block.images[0].src}
                externalLink={block.images[0].externalLink}
                leftCaption={block.images[0].caption}
                pairWith={{
                  src: block.images[1].src,
                  caption: block.images[1].caption,
                  externalLink: block.images[1].externalLink,
                }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlogContentRenderer;
