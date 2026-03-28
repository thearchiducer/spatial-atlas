import { useState } from "react";

function DrawerChip({ entry, tone = "stone", onSelectEntry, onRemove }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "rgba(56,189,248,0.35)",
          background: "rgba(56,189,248,0.10)",
          color: "#bae6fd",
        }
      : {
          borderColor: "rgba(251,191,36,0.30)",
          background: "rgba(251,191,36,0.10)",
          color: "#fde68a",
        };

  return (
    <div
      className='flex items-center gap-2 border px-3 py-2 text-sm'
      style={toneStyles}
    >
      <button
        type='button'
        onClick={() => onSelectEntry(entry.id)}
        className='truncate text-left font-medium hover:underline'
      >
        {entry.term}
      </button>

      <button
        type='button'
        onClick={() => onRemove(entry.id)}
        className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] transition'
        style={{
          borderColor: "rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.06)",
          color: "var(--text-secondary)",
        }}
      >
        Remove
      </button>
    </div>
  );
}

function UtilityCounter({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "rgba(56,189,248,0.35)",
          background: "rgba(56,189,248,0.10)",
          color: "#bae6fd",
        }
      : {
          borderColor: "rgba(251,191,36,0.30)",
          background: "rgba(251,191,36,0.10)",
          color: "#fde68a",
        };

  return (
    <div className='border px-3 py-2' style={toneStyles}>
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
    <section
      className='sticky top-20 z-10 border p-4 backdrop-blur'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {hasCompare && (
            <UtilityCounter
              label='Compare'
              value={compareEntries.length}
              tone='sky'
            />
          )}

          {hasPinned && (
            <UtilityCounter
              label='Pinned'
              value={pinnedEntries.length}
              tone='amber'
            />
          )}
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setIsOpen((current) => !current)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            {isOpen ? "Hide drawer" : "Open drawer"}
          </button>

          {hasCompare && (
            <button
              type='button'
              onClick={onClearCompare}
              className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
              style={{
                borderColor: "rgba(56,189,248,0.35)",
                background: "rgba(56,189,248,0.10)",
                color: "#bae6fd",
              }}
            >
              Clear compare
            </button>
          )}

          {hasPinned && (
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
          )}
        </div>
      </div>

      {isOpen && (
        <div className='mt-4 grid gap-4 xl:grid-cols-2'>
          {/* Compare */}
          <div
            className='border p-4'
            style={{
              borderColor: "rgba(56,189,248,0.35)",
              background: "rgba(56,189,248,0.08)",
            }}
          >
            <div
              className='border-b pb-3'
              style={{ borderColor: "rgba(56,189,248,0.25)" }}
            >
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "#bae6fd" }}
              >
                Compare drawer
              </div>

              <p
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "#e0f2fe" }}
              >
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
              <p className='mt-3 text-sm' style={{ color: "#bae6fd" }}>
                Add entries from the cards or selected-entry panel.
              </p>
            )}
          </div>

          {/* Pinned */}
          <div
            className='border p-4'
            style={{
              borderColor: "rgba(251,191,36,0.30)",
              background: "rgba(251,191,36,0.08)",
            }}
          >
            <div
              className='border-b pb-3'
              style={{ borderColor: "rgba(251,191,36,0.25)" }}
            >
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "#fde68a" }}
              >
                Pinned drawer
              </div>

              <p
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "#fef3c7" }}
              >
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
              <p className='mt-3 text-sm' style={{ color: "#fde68a" }}>
                Pin entries from the cards or selected-entry panel.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
