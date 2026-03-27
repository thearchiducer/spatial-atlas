import EntryCard from "./EntryCard";

function formatSectionIndex(index) {
  return String(index + 1).padStart(2, "0");
}

export default function SectionList({
  groupedSections,
  onRelatedClick,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
  onAddToBoard,
  onRemoveFromBoard,
  highlightedEntryId,
  searchQuery = "",
  compareEntryIds = [],
  pinnedEntryIds = [],
  activeBoardEntryIds = [],
  activeBoardName = "",
}) {
  const visibleSections = groupedSections.filter(
    (section) => section.entries.length > 0,
  );
  function getBoardEntryCount(entryId) {
    return activeBoardEntryIds.filter((id) => id === entryId).length;
  }
  if (!visibleSections.length) {
    return (
      <div className='border border-stone-300 bg-white p-8 text-center text-sm text-stone-500'>
        No entries match the current filters.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {visibleSections.map((section, index) => (
        <section key={section.id} id={section.id} className='space-y-3'>
          <div className='border-t border-stone-300 pt-4'>
            <div className='grid gap-3 md:grid-cols-[88px_minmax(0,1fr)_auto] md:items-end'>
              <div className='text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500'>
                {formatSectionIndex(index)}
              </div>

              <div>
                <h2 className='text-base font-semibold tracking-tight text-stone-900 md:text-lg'>
                  {section.title}
                </h2>
                <p className='mt-1 max-w-3xl text-sm leading-relaxed text-stone-600'>
                  {section.description}
                </p>
              </div>

              <div className='text-[11px] uppercase tracking-[0.14em] text-stone-500 md:text-right'>
                {section.entries.length} entries
              </div>
            </div>
          </div>

          <div className='grid gap-3 lg:grid-cols-2'>
            {section.entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onRelatedClick={onRelatedClick}
                onSelectEntry={onSelectEntry}
                onCompareEntry={onCompareEntry}
                onTogglePinEntry={onTogglePinEntry}
                onAddToBoard={onAddToBoard}
                onRemoveFromBoard={onRemoveFromBoard}
                isHighlighted={highlightedEntryId === entry.id}
                isCompared={compareEntryIds.includes(entry.id)}
                isPinned={pinnedEntryIds.includes(entry.id)}
                isInActiveBoard={activeBoardEntryIds.includes(entry.id)}
                boardEntryCount={getBoardEntryCount(entry.id)}
                activeBoardName={activeBoardName}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
