import SemanticChips from "./SemanticChips";

export default function ComparePanel({
  compareEntries,
  onRemoveCompareEntry,
  onClearCompare,
  onSelectEntry,
}) {
  if (!compareEntries || compareEntries.length === 0) {
    return null;
  }

  if (compareEntries.length >= 2) {
    return null;
  }

  const entry = compareEntries[0];

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--tone-info-border)" }}
      >
        <div>
          <div
            className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--tone-info-text)" }}
          >
            Compare mode · 1 of 2 selected
          </div>

          <h2
            className='text-lg font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Compare entries
          </h2>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--tone-info-text)" }}
          >
            Add one more entry to open the full split-screen comparison sheet.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearCompare}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--tone-info-border)",
            background: "var(--tone-info-bg)",
            color: "var(--tone-info-text)",
          }}
        >
          Clear compare
        </button>
      </div>

      <div
        className='mt-4 border p-4'
        style={{
          borderColor: "var(--tone-info-border)",
          background: "var(--bg-muted)",
        }}
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div
              className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
              style={{ color: "var(--tone-info-text)" }}
            >
              Selected candidate
            </div>

            <button
              type='button'
              onClick={() => onSelectEntry(entry.id)}
              className='text-left'
            >
              <div
                className='truncate text-base font-semibold tracking-tight hover:underline'
                style={{ color: "var(--text-primary)" }}
              >
                {entry.term}
              </div>
            </button>

            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {entry.description}
            </p>

            <SemanticChips entry={entry} compact limit={4} />
          </div>

          <button
            type='button'
            onClick={() => onRemoveCompareEntry(entry.id)}
            className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
              color: "var(--tone-info-text)",
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </section>
  );
}
