import {
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiCopy,
  FiAlignJustify,
} from "react-icons/fi";

const BlockToolbar = ({
  title,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  dragListeners,
  dragAttributes,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-atelier-ink/10 pb-3 mb-6">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...dragListeners}
          {...dragAttributes}
          className="cursor-grab active:cursor-grabbing p-1 text-atelier-ink/40 hover:text-atelier-ink touch-none"
          title="Drag to reorder"
        >
          <FiAlignJustify size={18} />
        </button>

        <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-atelier-ink/60">
          {title}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMoveUp}
          className="p-2 hover:bg-atelier-ink/5 rounded transition"
          title="Move Up"
        >
          <FiChevronUp />
        </button>

        <button
          type="button"
          onClick={onMoveDown}
          className="p-2 hover:bg-atelier-ink/5 rounded transition"
          title="Move Down"
        >
          <FiChevronDown />
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="p-2 hover:bg-atelier-ink/5 rounded transition"
          title="Duplicate"
        >
          <FiCopy />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded transition"
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>

    </div>
  );
};

export default BlockToolbar;
