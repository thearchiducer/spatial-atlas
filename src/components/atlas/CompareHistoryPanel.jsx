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
    <section className='border border-violet-300 bg-violet-50/40 p-5'>
      <div className='flex flex-col gap-4 border-b border-violet-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-800'>
            Compare history · {compareHistory.length}
          </div>

          <h2 className='text-lg font-semibold tracking-tight text-violet-950'>
            Recent comparisons
          </h2>

          <p className='mt-2 text-sm leading-relaxed text-violet-900'>
            Reopen earlier comparison states without rebuilding them manually.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearCompareHistory}
          className='border border-violet-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-violet-900 transition hover:bg-violet-100'
        >
          Clear history
        </button>
      </div>

      <div className='mt-4 grid gap-3'>
        {compareHistory.map((item) => (
          <div key={item.key} className='border border-violet-200 bg-white p-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div>
                <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700'>
                  Saved comparison
                </div>

                <button
                  type='button'
                  onClick={() => onOpenCompareHistoryItem(item.ids)}
                  className='text-left'
                >
                  <h3 className='text-base font-semibold tracking-tight text-stone-900 hover:underline'>
                    {item.terms.join(" vs ")}
                  </h3>
                </button>

                <p className='mt-2 text-sm text-stone-700'>
                  {item.label} · Similarity {item.score}/100
                </p>

                <p className='mt-1 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
                  Saved {item.savedAtLabel}
                </p>
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => onOpenCompareHistoryItem(item.ids)}
                  className='border border-violet-300 bg-violet-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-violet-900 transition hover:bg-violet-100'
                >
                  Open compare
                </button>

                <button
                  type='button'
                  onClick={() => onRemoveCompareHistoryItem(item.key)}
                  className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
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
