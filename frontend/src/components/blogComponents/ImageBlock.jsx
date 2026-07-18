const ImageBlock = ({
    block,
    index,
    updateContentBlock,
    handleFileUpload,
}) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-dashed border-atelier-ink/20 p-4 text-center">
          {block.src ? (
            <img
              src={block.src}
              className="h-32 mx-auto object-cover"
            />
          ) : (
            <input
              type="file"
              onChange={(e) =>
                handleFileUpload(e.target.files[0], (url) =>
                  updateContentBlock(index, { src: url }),
                )
              }
            />
          )}
        </div>
        <div className="space-y-4">
          <select
            className="w-full bg-transparent border-b border-atelier-ink/20 text-xs py-2"
            value={block.layout}
            onChange={(e) =>
              updateContentBlock(index, { layout: e.target.value })
            }
          >
            <option value="default">Default</option>
            <option value="wide">Wide</option>
            <option value="fullBleed">Full Bleed</option>
          </select>
          <input
            placeholder="External Link (Optional)..."
            className="w-full bg-transparent border-b border-atelier-ink/20 text-xs py-2"
            value={block.externalLink || ""}
            onChange={(e) =>
              updateContentBlock(index, {
                externalLink: e.target.value,
              })
            }
          />
          <input
            placeholder="Caption..."
            className="w-full bg-transparent border-b border-atelier-ink/20 text-xs py-2 italic font-serif"
            value={block.caption}
            onChange={(e) =>
              updateContentBlock(index, { caption: e.target.value })
            }
          />
        </div>
      </div>
    );
};

export default ImageBlock;
