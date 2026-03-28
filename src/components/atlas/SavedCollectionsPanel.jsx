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

function CollectionChip({ children }) {
  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </span>
  );
}

function CollectionCard({ collection, onOpenCollection, onDeleteCollection }) {
  return (
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex items-start justify-between gap-3 border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          <h3
            className='text-base font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {collection.name}
          </h3>

          {collection.description ? (
            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {collection.description}
            </p>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => onDeleteCollection?.(collection.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Delete
        </button>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        <CollectionChip>{collection.entryIds.length} entries</CollectionChip>
        <CollectionChip>{collection.createdAtLabel}</CollectionChip>
      </div>

      {collection.entryTerms?.length ? (
        <div className='mt-4 flex flex-wrap gap-2'>
          {collection.entryTerms.slice(0, 8).map((term) => (
            <CollectionChip key={term}>{term}</CollectionChip>
          ))}
          {collection.entryTerms.length > 8 ? (
            <CollectionChip>
              +{collection.entryTerms.length - 8} more
            </CollectionChip>
          ) : null}
        </div>
      ) : null}

      <div
        className='mt-4 border-t pt-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={() => onOpenCollection?.(collection)}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(56,189,248,0.35)",
            background: "rgba(56,189,248,0.10)",
            color: "#bae6fd",
          }}
        >
          Open collection
        </button>
      </div>
    </div>
  );
}

export default function SavedCollectionsPanel({
  collections = [],
  selectedEntry = null,
  pinnedEntries = [],
  compareEntries = [],
  onCreateFromPinned,
  onCreateFromCompare,
  onCreateFromSelectedAndPinned,
  onOpenCollection,
  onDeleteCollection,
}) {
  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        {annotationLabel("Saved collections")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Boards / collections
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Save reusable research sets from pinned entries, compare mode, or the
          current selected entry.
        </p>
      </div>

      <div className='mt-5 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={onCreateFromPinned}
          disabled={pinnedEntries.length === 0}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }}
        >
          Save pinned as collection
        </button>

        <button
          type='button'
          onClick={onCreateFromCompare}
          disabled={compareEntries.length === 0}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Save compare set
        </button>

        <button
          type='button'
          onClick={onCreateFromSelectedAndPinned}
          disabled={!selectedEntry && pinnedEntries.length === 0}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Save selected + pinned
        </button>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        <CollectionChip>Pinned · {pinnedEntries.length}</CollectionChip>
        <CollectionChip>Compare · {compareEntries.length}</CollectionChip>
        <CollectionChip>Collections · {collections.length}</CollectionChip>
      </div>

      <div className='mt-6 space-y-4'>
        {collections.length ? (
          collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onOpenCollection={onOpenCollection}
              onDeleteCollection={onDeleteCollection}
            />
          ))
        ) : (
          <div
            className='border border-dashed p-4 text-sm'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-muted)",
            }}
          >
            No saved collections yet.
          </div>
        )}
      </div>
    </section>
  );
}
