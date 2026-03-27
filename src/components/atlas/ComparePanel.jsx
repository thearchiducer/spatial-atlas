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
    <section className='border border-sky-300 bg-sky-50/50 p-5'>
      <div className='flex flex-col gap-4 border-b border-sky-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-800'>
            Compare mode · 1 of 2 selected
          </div>

          <h2 className='text-lg font-semibold tracking-tight text-sky-950'>
            Compare entries
          </h2>

          <p className='mt-2 text-sm leading-relaxed text-sky-900'>
            Add one more entry to open the full split-screen comparison sheet.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearCompare}
          className='border border-sky-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-sky-900 transition hover:bg-sky-100'
        >
          Clear compare
        </button>
      </div>

      <div className='mt-4 border border-sky-200 bg-white p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700'>
              Selected candidate
            </div>

            <button
              type='button'
              onClick={() => onSelectEntry(entry.id)}
              className='text-left'
            >
              <div className='truncate text-base font-semibold tracking-tight text-sky-950 hover:underline'>
                {entry.term}
              </div>
            </button>

            <p className='mt-2 text-sm leading-relaxed text-sky-900'>
              {entry.description}
            </p>

            <SemanticChips entry={entry} compact limit={4} />
          </div>

          <button
            type='button'
            onClick={() => onRemoveCompareEntry(entry.id)}
            className='border border-sky-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-sky-800 transition hover:bg-sky-100'
          >
            Remove
          </button>
        </div>
      </div>
    </section>
  );
}
