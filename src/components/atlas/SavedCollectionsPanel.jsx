function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function CollectionChip({ children }) {
  return (
    <span className='border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
      {children}
    </span>
  );
}

function CollectionCard({ collection, onOpenCollection, onDeleteCollection }) {
  return (
    <div className='border border-stone-200 bg-white p-4'>
      <div className='flex items-start justify-between gap-3 border-b border-stone-200 pb-4'>
        <div>
          <h3 className='text-base font-semibold tracking-tight text-stone-900'>
            {collection.name}
          </h3>

          {collection.description ? (
            <p className='mt-2 text-sm leading-relaxed text-stone-600'>
              {collection.description}
            </p>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => onDeleteCollection?.(collection.id)}
          className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
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

      <div className='mt-4 border-t border-stone-200 pt-4'>
        <button
          type='button'
          onClick={() => onOpenCollection?.(collection)}
          className='border border-stone-900 bg-stone-900 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-white transition hover:bg-stone-800'
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
    <section className='border border-stone-300 bg-white p-5'>
      <div className='border-b border-stone-200 pb-4'>
        {annotationLabel("Saved collections")}
        <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
          Boards / collections
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Save reusable research sets from pinned entries, compare mode, or the
          current selected entry.
        </p>
      </div>

      <div className='mt-5 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={onCreateFromPinned}
          disabled={pinnedEntries.length === 0}
          className='border border-stone-900 bg-stone-900 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Save pinned as collection
        </button>

        <button
          type='button'
          onClick={onCreateFromCompare}
          disabled={compareEntries.length === 0}
          className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Save compare set
        </button>

        <button
          type='button'
          onClick={onCreateFromSelectedAndPinned}
          disabled={!selectedEntry && pinnedEntries.length === 0}
          className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
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
          <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600'>
            No saved collections yet.
          </div>
        )}
      </div>
    </section>
  );
}
