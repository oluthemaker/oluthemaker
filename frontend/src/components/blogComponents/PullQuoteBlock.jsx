const PullQuoteBlock = ({ block, index, updateContentBlock }) => {
  return (
    <div className="space-y-4">
      <textarea
        placeholder="Enter the pull quote..."
        className="w-full bg-transparent text-xl font-serif italic text-center outline-none resize-none"
        value={block.content}
        onChange={(e) =>
          updateContentBlock(index, {
            content: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Author / Source"
        className="w-full text-center bg-transparent border-b border-gray-300 outline-none py-2 font-sans text-sm tracking-wide uppercase"
        value={block.author || ""}
        onChange={(e) =>
          updateContentBlock(index, {
            author: e.target.value,
          })
        }
      />
    </div>
  );
};

export default PullQuoteBlock;
