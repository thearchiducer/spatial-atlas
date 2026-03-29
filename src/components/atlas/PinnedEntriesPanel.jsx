function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--tone-warning-text)" }}
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
        borderColor: "var(--tone-warning-border)",
        background: "var(--bg-muted)",
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
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
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
        borderColor: "var(--tone-warning-border)",
        background: "var(--tone-warning-bg)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--tone-warning-border)" }}
      >
        <div>
          {annotationLabel(`Pinned entries · ${pinnedEntries.length}`)}

          <h2
            className='mt-2 text-lg font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Favorites
          </h2>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--tone-warning-text)" }}
          >
            Keep frequently used atlas terms pinned for quick access.
          </p>
        </div>

        <button
          type='button'
          onClick={onClearPinned}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
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
