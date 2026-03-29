import { useState } from "react";

function DrawerChip({ entry, tone = "stone", onSelectEntry, onRemove }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "var(--tone-info-border)",
          background: "var(--tone-info-bg)",
          color: "var(--tone-info-text)",
        }
      : {
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
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
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
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
          borderColor: "var(--tone-info-border)",
          background: "var(--tone-info-bg)",
          color: "var(--tone-info-text)",
        }
      : {
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
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
        background: "var(--bg-subtle)",
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
              background: "var(--bg-muted)",
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
                borderColor: "var(--tone-info-border)",
                background: "var(--tone-info-bg)",
                color: "var(--tone-info-text)",
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
                borderColor: "var(--tone-warning-border)",
                background: "var(--tone-warning-bg)",
                color: "var(--tone-warning-text)",
              }}
            >
              Clear pinned
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className='mt-4 grid gap-4 xl:grid-cols-2'>
          <div
            className='border p-4'
            style={{
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
            }}
          >
            <div
              className='border-b pb-3'
              style={{ borderColor: "var(--tone-info-border)" }}
            >
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--tone-info-text)" }}
              >
                Compare drawer
              </div>

              <p
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "var(--text-primary)" }}
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
              <p
                className='mt-3 text-sm'
                style={{ color: "var(--tone-info-text)" }}
              >
                Add entries from the cards or selected-entry panel.
              </p>
            )}
          </div>

          <div
            className='border p-4'
            style={{
              borderColor: "var(--tone-warning-border)",
              background: "var(--tone-warning-bg)",
            }}
          >
            <div
              className='border-b pb-3'
              style={{ borderColor: "var(--tone-warning-border)" }}
            >
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--tone-warning-text)" }}
              >
                Pinned drawer
              </div>

              <p
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "var(--text-primary)" }}
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
              <p
                className='mt-3 text-sm'
                style={{ color: "var(--tone-warning-text)" }}
              >
                Pin entries from the cards or selected-entry panel.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
