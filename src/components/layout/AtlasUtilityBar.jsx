function UtilityTag({
  label,
  value,
  tone = "stone",
  actionLabel = "Clear",
  onAction,
  children = null,
}) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-300 bg-sky-50 text-sky-950"
      : tone === "amber"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : "border-stone-300 bg-white text-stone-900";

  const actionToneClasses =
    tone === "sky"
      ? "border-sky-200 text-sky-800 hover:bg-sky-100"
      : tone === "amber"
        ? "border-amber-200 text-amber-800 hover:bg-amber-100"
        : "border-stone-200 text-stone-700 hover:bg-stone-100";

  return (
    <div className={`border px-3 py-2 ${toneClasses}`}>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-[10px] font-semibold uppercase tracking-[0.16em]'>
          {label}
        </span>

        {children ? (
          children
        ) : (
          <span className='text-sm font-medium'>{value}</span>
        )}

        <button
          type='button'
          onClick={onAction}
          className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] transition ${actionToneClasses}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function QuickReferenceButton({ tone = "stone", children, onClick }) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-300 bg-white text-sky-900 hover:bg-sky-50"
      : tone === "amber"
        ? "border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100";

  return (
    <button
      type='button'
      onClick={onClick}
      className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition ${toneClasses}`}
    >
      {children}
    </button>
  );
}

export default function AtlasUtilityBar({
  theme = "light",
  activeBoard,
  selectedEntry,
  compareEntries,
  pinnedEntries,
  onSelectEntry,
  onClearSelection,
  onClearCompare,
  onClearPinned,
}) {
  const hasActiveBoard = Boolean(activeBoard);
  const hasSelected = Boolean(selectedEntry);
  const hasCompare = Boolean(compareEntries && compareEntries.length > 0);
  const hasPinned = Boolean(pinnedEntries && pinnedEntries.length > 0);

  if (!hasActiveBoard && !hasSelected && !hasCompare && !hasPinned) {
    return null;
  }

  return (
    <section
      className={
        "sticky top-20 z-10 border p-4 backdrop-blur " +
        (theme === "dark"
          ? "border-stone-700 bg-stone-900/95"
          : "border-stone-300 bg-white/95")
      }
    >
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {hasActiveBoard && (
            <div
              className={
                "border px-3 py-2 " +
                (theme === "dark"
                  ? "border-violet-700 bg-violet-950 text-violet-100"
                  : "border-violet-300 bg-violet-50 text-violet-950")
              }
            >
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-[10px] font-semibold uppercase tracking-[0.16em]'>
                  Active board
                </span>
                <span className='text-sm font-medium'>{activeBoard.name}</span>
              </div>
              <div className='border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700'>
                Flow: Select → Add to board → Compare → Transform
              </div>
            </div>
          )}
          {hasSelected && (
            <UtilityTag
              label='Selected'
              tone='amber'
              onAction={onClearSelection}
            >
              <button
                type='button'
                onClick={() => onSelectEntry(selectedEntry.id)}
                className='text-sm font-medium hover:underline'
              >
                {selectedEntry.term}
              </button>
            </UtilityTag>
          )}

          {hasCompare && (
            <UtilityTag
              label='Compare'
              value={`${compareEntries.length} selected`}
              tone='sky'
              onAction={onClearCompare}
            />
          )}

          {hasPinned && (
            <UtilityTag
              label='Pinned'
              value={`${pinnedEntries.length} saved`}
              tone='amber'
              onAction={onClearPinned}
            />
          )}
        </div>

        <div className='flex flex-wrap gap-2'>
          {hasCompare &&
            compareEntries.map((entry) => (
              <QuickReferenceButton
                key={entry.id}
                tone='sky'
                onClick={() => onSelectEntry(entry.id)}
              >
                {entry.term}
              </QuickReferenceButton>
            ))}

          {!hasCompare &&
            hasPinned &&
            pinnedEntries.slice(0, 4).map((entry) => (
              <QuickReferenceButton
                key={entry.id}
                tone='amber'
                onClick={() => onSelectEntry(entry.id)}
              >
                {entry.term}
              </QuickReferenceButton>
            ))}
        </div>
      </div>
    </section>
  );
}
