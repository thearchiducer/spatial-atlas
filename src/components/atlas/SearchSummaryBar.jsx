function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}

function ReasonChip({ children }) {
  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
        color: "var(--tone-info-text)",
      }}
    >
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
      <section
        className='border px-4 py-3'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        {annotationLabel("Dataset output")}

        <div
          className='mt-1 text-sm'
          style={{ color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "var(--text-primary)" }}>
            {visibleCount}
          </strong>{" "}
          entries visible after filtering.
        </div>
      </section>
    );
  }

  return (
    <section
      className='border px-4 py-3'
      style={{
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
      }}
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Search output")}

          <div
            className='mt-1 text-sm'
            style={{ color: "var(--tone-info-text)" }}
          >
            <strong style={{ color: "var(--text-primary)" }}>
              {visibleCount}
            </strong>{" "}
            result{visibleCount === 1 ? "" : "s"} for{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              “{filters.query}”
            </strong>
            . Sorted by <strong>relevance</strong>.
          </div>
        </div>

        {topReasons.length > 0 ? (
          <div className='md:text-right'>
            <div
              className='text-[10px] font-semibold uppercase tracking-[0.16em]'
              style={{ color: "var(--tone-info-text)" }}
            >
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
