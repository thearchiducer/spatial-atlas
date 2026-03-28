export default function CompareHistoryPanel({
  compareHistory,
  onOpenCompareHistoryItem,
  onRemoveCompareHistoryItem,
  onClearCompareHistory,
}) {
  if (!compareHistory || compareHistory.length === 0) {
    return null;
  }

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "rgba(168,85,247,0.35)",
        background: "rgba(168,85,247,0.08)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "rgba(168,85,247,0.25)" }}
      >
        <div>
          <div
            className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "#d8b4fe" }}
          >
            Compare history · {compareHistory.length}
          </div>

          <h2
            className='text-lg font-semibold tracking-tight'
            style={{ color: "#f3e8ff" }}
          >
            Recent comparisons
          </h2>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "#e9d5ff" }}
          >
            Reopen earlier comparison states without rebuilding them manually.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearCompareHistory}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(168,85,247,0.35)",
            background: "rgba(168,85,247,0.10)",
            color: "#e9d5ff",
          }}
        >
          Clear history
        </button>
      </div>

      <div className='mt-4 grid gap-3'>
        {compareHistory.map((item) => (
          <div
            key={item.key}
            className='border p-4'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-surface)",
            }}
          >
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div>
                <div
                  className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
                  style={{ color: "var(--text-muted)" }}
                >
                  Saved comparison
                </div>

                <button
                  type='button'
                  onClick={() => onOpenCompareHistoryItem(item.ids)}
                  className='text-left'
                >
                  <h3
                    className='text-base font-semibold tracking-tight hover:underline'
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.terms.join(" vs ")}
                  </h3>
                </button>

                <p
                  className='mt-2 text-sm'
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.label} · Similarity {item.score}/100
                </p>

                <p
                  className='mt-1 text-[11px] uppercase tracking-[0.08em]'
                  style={{ color: "var(--text-muted)" }}
                >
                  Saved {item.savedAtLabel}
                </p>
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => onOpenCompareHistoryItem(item.ids)}
                  className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
                  style={{
                    borderColor: "rgba(168,85,247,0.35)",
                    background: "rgba(168,85,247,0.10)",
                    color: "#d8b4fe",
                  }}
                >
                  Open compare
                </button>

                <button
                  type='button'
                  onClick={() => onRemoveCompareHistoryItem(item.key)}
                  className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
