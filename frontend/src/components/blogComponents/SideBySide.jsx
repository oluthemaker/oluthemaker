const SideBySide = ({
    block,
    index,
    updateContentBlock,
    handleFileUpload,
}) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-atelier-ink/5 pb-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-atelier-tan font-bold">
            Asymmetric Pair Layout
          </span>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left Image - Larger/Dominant (7/12 cols) */}
          <div className="col-span-7 space-y-4">
            <div className="border border-atelier-ink/10 aspect-[3/4] flex items-center justify-center bg-white overflow-hidden shadow-sm">
              {block.images[0].src ? (
                <img
                  src={block.images[0].src}
                  className="w-full h-full object-cover "
                />
              ) : (
                <div className="p-4 text-center">
                  <input
                    type="file"
                    className="text-[10px] w-full"
                    onChange={(e) =>
                      handleFileUpload(e.target.files[0], (url) => {
                        const newImgs = [...block.images];
                        newImgs[0].src = url;
                        updateContentBlock(index, {
                          images: newImgs,
                        });
                      })
                    }
                  />
                  <p className="text-[9px] mt-2 opacity-40 uppercase tracking-tighter">
                    Primary Feature (Left)
                  </p>
                </div>
              )}
            </div>
            <input
              placeholder="Primary Caption..."
              className="w-full bg-transparent border-b border-atelier-ink/10 text-[10px] py-2 italic font-serif"
              value={block.images[0].caption}
              onChange={(e) => {
                const newImgs = [...block.images];
                newImgs[0].caption = e.target.value;
                updateContentBlock(index, { images: newImgs });
              }}
            />
          </div>

          {/* Right Image - Narrower/Supportive (5/12 cols) */}
          <div className="col-span-5 space-y-4 pt-12">
            {" "}
            {/* pt-12 creates that staggered look */}
            <div className="border border-atelier-ink/10 aspect-[4/5] flex items-center justify-center bg-white overflow-hidden shadow-sm">
              {block.images[1].src ? (
                <img
                  src={block.images[1].src}
                  className="w-full h-full object-cover "
                />
              ) : (
                <div className="p-4 text-center">
                  <input
                    type="file"
                    className="text-[10px] w-full"
                    onChange={(e) =>
                      handleFileUpload(e.target.files[0], (url) => {
                        const newImgs = [...block.images];
                        newImgs[1].src = url;
                        updateContentBlock(index, {
                          images: newImgs,
                        });
                      })
                    }
                  />
                  <p className="text-[9px] mt-2 opacity-40 uppercase tracking-tighter">
                    Secondary Detail (Right)
                  </p>
                </div>
              )}
            </div>
            <input
              placeholder="Secondary Caption..."
              className="w-full bg-transparent border-b border-atelier-ink/10 text-[10px] py-2 italic font-serif"
              value={block.images[1].caption}
              onChange={(e) => {
                const newImgs = [...block.images];
                newImgs[1].caption = e.target.value;
                updateContentBlock(index, { images: newImgs });
              }}
            />
          </div>
        </div>
      </div>
    );
};

export default SideBySide;
