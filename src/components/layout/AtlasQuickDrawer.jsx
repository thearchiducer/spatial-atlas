import { useState } from "react";

function DrawerChip({ entry, tone = "stone", onSelectEntry, onRemove }) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-300 bg-sky-50 text-sky-950"
      : "border-amber-300 bg-amber-50 text-amber-950";

  const buttonToneClasses =
    tone === "sky"
      ? "border-sky-200 text-sky-800 hover:bg-sky-100"
      : "border-amber-200 text-amber-800 hover:bg-amber-100";

  return (
    <div
      className={`flex items-center gap-2 border px-3 py-2 text-sm ${toneClasses}`}
    >
      <button
        type='button'
        onClick={() => onSelectEntry(entry.id)}
        className='truncate font-medium text-left hover:underline'
      >
        {entry.term}
      </button>

      <button
        type='button'
        onClick={() => onRemove(entry.id)}
        className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] transition ${buttonToneClasses}`}
      >
        Remove
      </button>
    </div>
  );
}

function UtilityCounter({ label, value, tone = "stone" }) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-300 bg-sky-50 text-sky-950"
      : "border-amber-300 bg-amber-50 text-amber-950";

  return (
    <div className={`border px-3 py-2 ${toneClasses}`}>
      <div className='flex items-center gap-2'>
        <span className='text-[10px] font-semibold uppercase tracking-[0.16em]'>
          {label}
        </span>
        <span className='text-sm font-medium'>{value}</span>
      </div>
    </div>
  );
}

export default function AtlasQuickDrawer({
  compareEntries,
  pinnedEntries,
  onSelectEntry,
  onRemoveCompareEntry,
  onRemovePinnedEntry,
  onClearCompare,
  onClearPinned,
}) {
  const hasCompare = compareEntries.length > 0;
  const hasPinned = pinnedEntries.length > 0;

  const [isOpen, setIsOpen] = useState(false);

  if (!hasCompare && !hasPinned) {
    return null;
  }

  return (
    <section className='sticky top-20 z-10 border border-stone-300 bg-white/95 p-4 backdrop-blur'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {hasCompare ? (
            <UtilityCounter
              label='Compare'
              value={compareEntries.length}
              tone='sky'
            />
          ) : null}

          {hasPinned ? (
            <UtilityCounter
              label='Pinned'
              value={pinnedEntries.length}
              tone='amber'
            />
          ) : null}
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setIsOpen((current) => !current)}
            className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
          >
            {isOpen ? "Hide drawer" : "Open drawer"}
          </button>

          {hasCompare ? (
            <button
              type='button'
              onClick={onClearCompare}
              className='border border-sky-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-sky-900 transition hover:bg-sky-50'
            >
              Clear compare
            </button>
          ) : null}

          {hasPinned ? (
            <button
              type='button'
              onClick={onClearPinned}
              className='border border-amber-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-amber-900 transition hover:bg-amber-50'
            >
              Clear pinned
            </button>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div className='mt-4 grid gap-4 xl:grid-cols-2'>
          <div className='border border-sky-200 bg-sky-50/40 p-4'>
            <div className='border-b border-sky-200 pb-3'>
              <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-800'>
                Compare drawer
              </div>
              <p className='mt-2 text-sm leading-relaxed text-sky-900'>
                {hasCompare
                  ? `${compareEntries.length} selected for comparison`
                  : "No entries in compare"}
              </p>
            </div>

            {hasCompare ? (
              <div className='mt-3 flex flex-wrap gap-2'>
                {compareEntries.map((entry) => (
                  <DrawerChip
                    key={entry.id}
                    entry={entry}
                    tone='sky'
                    onSelectEntry={onSelectEntry}
                    onRemove={onRemoveCompareEntry}
                  />
                ))}
              </div>
            ) : (
              <p className='mt-3 text-sm text-sky-800'>
                Add entries from the cards or selected-entry panel.
              </p>
            )}
          </div>

          <div className='border border-amber-200 bg-amber-50/40 p-4'>
            <div className='border-b border-amber-200 pb-3'>
              <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800'>
                Pinned drawer
              </div>
              <p className='mt-2 text-sm leading-relaxed text-amber-900'>
                {hasPinned
                  ? `${pinnedEntries.length} saved favorites`
                  : "No pinned entries"}
              </p>
            </div>

            {hasPinned ? (
              <div className='mt-3 flex flex-wrap gap-2'>
                {pinnedEntries.map((entry) => (
                  <DrawerChip
                    key={entry.id}
                    entry={entry}
                    tone='amber'
                    onSelectEntry={onSelectEntry}
                    onRemove={onRemovePinnedEntry}
                  />
                ))}
              </div>
            ) : (
              <p className='mt-3 text-sm text-amber-800'>
                Pin entries from the cards or selected-entry panel.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
