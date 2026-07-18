const PullQuoteBlock = ({ block, index, updateContentBlock }) => {
  return (
    <textarea
      placeholder="Enter the pull quote..."
      className="w-full bg-transparent text-xl font-serif italic text-center outline-none border-none resize-none"
      value={block.content}
      onChange={(e) =>
        updateContentBlock(index, { content: e.target.value })
      }
    />
  );
};

export default PullQuoteBlock;
