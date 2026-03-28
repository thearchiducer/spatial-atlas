function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "#fde68a" }}
    >
      {children}
    </div>
  );
}

function PinnedEntryRow({ entry, onSelectEntry, onRemovePinnedEntry }) {
  return (
    <div
      className='flex items-center gap-3 border px-3 py-3'
      style={{
        borderColor: "rgba(251,191,36,0.25)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <button
        type='button'
        onClick={() => onSelectEntry(entry.id)}
        className='min-w-0 flex-1 truncate text-left text-sm font-semibold hover:underline'
        style={{ color: "var(--text-primary)" }}
      >
        {entry.term}
      </button>

      <button
        type='button'
        onClick={() => onRemovePinnedEntry(entry.id)}
        className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
        style={{
          borderColor: "rgba(251,191,36,0.30)",
          background: "rgba(251,191,36,0.10)",
          color: "#fde68a",
        }}
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
    <section
      className='border p-5'
      style={{
        borderColor: "rgba(251,191,36,0.35)",
        background: "rgba(251,191,36,0.08)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "rgba(251,191,36,0.25)" }}
      >
        <div>
          {annotationLabel(`Pinned entries · ${pinnedEntries.length}`)}

          <h2
            className='mt-2 text-lg font-semibold tracking-tight'
            style={{ color: "#fef3c7" }}
          >
            Favorites
          </h2>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "#fde68a" }}
          >
            Keep frequently used atlas terms pinned for quick access.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearPinned}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.10)",
            color: "#fde68a",
          }}
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
