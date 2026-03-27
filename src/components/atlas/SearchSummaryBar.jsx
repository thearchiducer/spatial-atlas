function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function ReasonChip({ children }) {
  return (
    <span className='border border-sky-200 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-sky-800'>
      {children}
    </span>
  );
}

export default function SearchSummaryBar({
  filters,
  visibleCount,
  topReasons = [],
}) {
  const hasQuery = Boolean(filters.query && filters.query.trim());

  if (!hasQuery) {
    return (
      <section className='border border-stone-300 bg-white px-4 py-3'>
        {annotationLabel("Dataset output")}
        <div className='mt-1 text-sm text-stone-800'>
          <strong className='text-stone-900'>{visibleCount}</strong> entries
          visible after filtering.
        </div>
      </section>
    );
  }

  return (
    <section className='border border-sky-200 bg-sky-50/40 px-4 py-3'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Search output")}
          <div className='mt-1 text-sm text-sky-900'>
            <strong>{visibleCount}</strong> result
            {visibleCount === 1 ? "" : "s"} for{" "}
            <strong>“{filters.query}”</strong>. Sorted by{" "}
            <strong>relevance</strong>.
          </div>
        </div>

        {topReasons.length > 0 ? (
          <div className='md:text-right'>
            <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700'>
              Top match reasons
            </div>

            <div className='mt-2 flex flex-wrap gap-2 md:justify-end'>
              {topReasons.map((reason) => (
                <ReasonChip key={reason}>{reason}</ReasonChip>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
