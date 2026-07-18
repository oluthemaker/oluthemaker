const TableBlock = ({ block, index, updateContentBlock }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-atelier-ink/5 pb-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-atelier-tan font-bold">
          Editorial Table
        </span>
      </div>

      {/* Table Interface */}
      <div className="overflow-x-auto border border-atelier-ink/10 bg-white/50 p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-atelier-ink/20">
              {block.headers.map((header, hIdx) => (
                <th key={hIdx} className="p-2">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => {
                      const newHeaders = [...block.headers];
                      newHeaders[hIdx] = e.target.value;
                      updateContentBlock(index, { headers: newHeaders });
                    }}
                    className="w-full bg-transparent font-serif italic text-xs border-b border-transparent focus:border-atelier-ink/20 outline-none pb-1"
                    placeholder={`Header ${hIdx + 1}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-atelier-ink/5 hover:bg-atelier-ink/[0.02]">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => {
                        const newRows = block.rows.map((r, ri) =>
                          ri === rIdx
                            ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                            : r
                        );
                        updateContentBlock(index, { rows: newRows });
                      }}
                      className="w-full bg-transparent text-xs outline-none py-1"
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Layout Controls */}
      <div className="flex flex-wrap gap-4 text-[10px] tracking-wider uppercase">
        {/* Row Controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const newRow = Array(block.headers.length).fill("");
              updateContentBlock(index, { rows: [...block.rows, newRow] });
            }}
            className="px-3 py-1.5 border border-atelier-ink/10 hover:border-atelier-ink hover:bg-white transition-all"
          >
            + Add Row
          </button>
          <button
            type="button"
            disabled={block.rows.length <= 1}
            onClick={() => {
              if (block.rows.length > 1) {
                updateContentBlock(index, { rows: block.rows.slice(0, -1) });
              }
            }}
            className="px-3 py-1.5 border border-atelier-ink/10 hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            - Remove Row
          </button>
        </div>

        {/* Column Controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const newHeaders = [...block.headers, `Col ${block.headers.length + 1}`];
              const newRows = block.rows.map((row) => [...row, ""]);
              updateContentBlock(index, { headers: newHeaders, rows: newRows });
            }}
            className="px-3 py-1.5 border border-atelier-ink/10 hover:border-atelier-ink hover:bg-white transition-all"
          >
            + Add Column
          </button>
          <button
            type="button"
            disabled={block.headers.length <= 1}
            onClick={() => {
              if (block.headers.length > 1) {
                const newHeaders = block.headers.slice(0, -1);
                const newRows = block.rows.map((row) => row.slice(0, -1));
                updateContentBlock(index, { headers: newHeaders, rows: newRows });
              }
            }}
            className="px-3 py-1.5 border border-atelier-ink/10 hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            - Remove Column
          </button>
        </div>
      </div>

      {/* Table Caption */}
      <input
        placeholder="Table Caption or Citation..."
        className="w-full bg-transparent border-b border-atelier-ink/10 text-[10px] py-2 italic font-serif"
        value={block.caption || ""}
        onChange={(e) =>
          updateContentBlock(index, { caption: e.target.value })
        }
      />
    </div>
  );
};

export default TableBlock;
