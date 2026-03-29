function UtilityTag({
  label,
  value,
  tone = "stone",
  actionLabel = "Clear",
  onAction,
  children = null,
}) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "var(--tone-info-border)",
          background: "var(--tone-info-bg)",
          color: "var(--tone-info-text)",
          actionBorder: "var(--tone-info-border)",
          actionBackground: "var(--bg-muted)",
          actionColor: "var(--text-primary)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
            actionBorder: "var(--tone-warning-border)",
            actionBackground: "var(--bg-muted)",
            actionColor: "var(--text-primary)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
            actionBorder: "var(--border-color)",
            actionBackground: "var(--bg-subtle)",
            actionColor: "var(--text-secondary)",
          };

  return (
    <div
      className='border px-3 py-2'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
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
          className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: toneStyles.actionBorder,
            background: toneStyles.actionBackground,
            color: toneStyles.actionColor,
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function QuickReferenceButton({ tone = "stone", children, onClick }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "var(--tone-info-border)",
          background: "var(--tone-info-bg)",
          color: "var(--tone-info-text)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          };

  return (
    <button
      type='button'
      onClick={onClick}
      className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      {children}
    </button>
  );
}

export default function AtlasUtilityBar({
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
      className='sticky top-20 z-10 border p-4 backdrop-blur'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {hasActiveBoard && (
            <div
              className='border px-3 py-2'
              style={{
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }}
            >
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-[10px] font-semibold uppercase tracking-[0.16em]'>
                  Active board
                </span>
                <span className='text-sm font-medium'>{activeBoard.name}</span>
              </div>

              <div
                className='mt-2 border px-3 py-2 text-xs'
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }}
              >
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
                style={{ color: "inherit" }}
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
