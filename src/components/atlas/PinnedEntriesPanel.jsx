function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800'>
      {children}
    </div>
  );
}

function PinnedEntryRow({ entry, onSelectEntry, onRemovePinnedEntry }) {
  return (
    <div className='flex items-center gap-3 border border-amber-200 bg-white px-3 py-3'>
      <button
        type='button'
        onClick={() => onSelectEntry(entry.id)}
        className='min-w-0 flex-1 truncate text-left text-sm font-semibold text-stone-900 hover:underline'
      >
        {entry.term}
      </button>

      <button
        type='button'
        onClick={() => onRemovePinnedEntry(entry.id)}
        className='border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-amber-800 transition hover:bg-amber-100'
      >
        Remove
      </button>
    </div>
  );
}

export default function PinnedEntriesPanel({
  pinnedEntries,
  onSelectEntry,
  onRemovePinnedEntry,
  onClearPinned,
}) {
  if (!pinnedEntries || pinnedEntries.length === 0) {
    return null;
  }

  return (
    <section className='border border-amber-300 bg-amber-50/40 p-5'>
      <div className='flex flex-col gap-4 border-b border-amber-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel(`Pinned entries · ${pinnedEntries.length}`)}

          <h2 className='mt-2 text-lg font-semibold tracking-tight text-amber-950'>
            Favorites
          </h2>

          <p className='mt-2 text-sm leading-relaxed text-amber-900'>
            Keep frequently used atlas terms pinned for quick access.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearPinned}
          className='border border-amber-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-amber-900 transition hover:bg-amber-100'
        >
          Clear pinned
        </button>
      </div>

      <div className='mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
        {pinnedEntries.map((entry) => (
          <PinnedEntryRow
            key={entry.id}
            entry={entry}
            onSelectEntry={onSelectEntry}
            onRemovePinnedEntry={onRemovePinnedEntry}
          />
        ))}
      </div>
    </section>
  );
}
