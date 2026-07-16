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
          // This is your RENDER code (not the editor)
          case "text":
            return (
              <TextWrapper key={index}>
                <div
                  className={`prose prose-atelier max-w-none font-serif text-lg leading-relaxed text-atelier-ink/90 break-words
                    ${
                      index === 0 // Only apply to the first text block in the article
                        ? "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:-mt-1"
                        : ""
                    }
                  `}
                  dangerouslySetInnerHTML={{
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
            case "table":
                        return (
                          <TextWrapper key={index}>
                            <div className="my-8 w-full">
                              <div className="overflow-x-auto border-y border-atelier-ink/10 py-2">
                                <table className="w-full border-collapse text-left text-sm">
                                  <thead>
                                    <tr className="border-b border-atelier-ink/20">
                                      {block.headers?.map((header, hIdx) => (
                                        <th
                                          key={hIdx}
                                          className="pb-3 pt-2 font-serif italic text-xs text-atelier-ink/60 uppercase tracking-wider font-semibold"
                                        >
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-atelier-ink/5 text-atelier-ink/80 font-sans">
                                    {block.rows?.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-atelier-ink/[0.01] transition-colors">
                                        {row.map((cell, cIdx) => (
                                          <td key={cIdx} className="py-3 pr-4 align-top leading-relaxed">
                                            {cell || <span className="text-atelier-ink/20">—</span>}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {block.caption && (
                                <p className="mt-3 text-[10px] tracking-wider uppercase text-atelier-ink/40 text-center font-sans font-medium">
                                  {block.caption}
                                </p>
                              )}
                            </div>
                          </TextWrapper>
                        );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlogContentRenderer;
