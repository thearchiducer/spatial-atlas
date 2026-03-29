import SemanticChips from "./SemanticChips";

function annotationLabel(label) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--text-muted)" }}
    >
      {label}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      className='grid gap-2 border-t py-3 md:grid-cols-[140px_minmax(0,1fr)]'
      style={{ borderColor: "var(--border-color)" }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      <div
        className='text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        {value || <span style={{ color: "var(--text-muted)" }}>—</span>}
      </div>
    </div>
  );
}

function RelatedPill({ item, onRelatedClick }) {
  const relatedId = typeof item === "string" ? item : item.id;
  const relatedLabel = typeof item === "string" ? item : item.label || item.id;

  return (
    <button
      type='button'
      onClick={() => onRelatedClick(relatedId)}
      className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
      {relatedLabel}
    </button>
  );
}

function BreakdownChip({ item }) {
  return (
    <div
      className='inline-flex items-center gap-2 border px-3 py-1.5 text-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
      }}
    >
      <span>{item.label}</span>
      <span
        className='border px-2 py-0.5 text-[11px] font-semibold'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-primary)",
        }}
      >
        +{item.points}
      </span>
    </div>
  );
}

function RecommendationCard({ title, tone, entries, onRelatedClick }) {
  let toneStyles = {
    borderColor: "var(--border-color)",
    background: "var(--bg-surface)",
    titleColor: "var(--text-primary)",
    textColor: "var(--text-secondary)",
    buttonBorder: "var(--border-color)",
    buttonBg: "var(--bg-muted)",
    buttonText: "var(--text-secondary)",
  };

  if (tone === "sky") {
    toneStyles = {
      borderColor: "var(--tone-info-border)",
      background: "var(--tone-info-bg)",
      titleColor: "var(--tone-info-text)",
      textColor: "var(--tone-info-text)",
      buttonBorder: "var(--tone-info-border)",
      buttonBg: "var(--tone-info-bg)",
      buttonText: "var(--tone-info-text)",
    };
  } else if (tone === "emerald") {
    toneStyles = {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      titleColor: "var(--tone-success-text)",
      textColor: "var(--tone-success-text)",
      buttonBorder: "var(--tone-success-border)",
      buttonBg: "var(--tone-success-bg)",
      buttonText: "var(--tone-success-text)",
    };
  } else if (tone === "violet") {
    toneStyles = {
      borderColor: "var(--tone-violet-border)",
      background: "var(--tone-violet-bg)",
      titleColor: "var(--tone-violet-text)",
      textColor: "var(--tone-violet-text)",
      buttonBorder: "var(--tone-violet-border)",
      buttonBg: "var(--tone-violet-bg)",
      buttonText: "var(--tone-violet-text)",
    };
  }

  return (
    <section
      className='border p-4'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
      }}
    >
      <div
        className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        Recommendation set
      </div>

      <h3
        className='text-base font-semibold tracking-tight'
        style={{ color: toneStyles.titleColor }}
      >
        {title}
      </h3>

      <div className='mt-4 flex flex-wrap gap-2'>
        {entries?.length ? (
          entries.map((entry) => (
            <button
              key={entry.id}
              type='button'
              onClick={() => onRelatedClick(entry.id)}
              className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
              style={{
                borderColor: toneStyles.buttonBorder,
                background: toneStyles.buttonBg,
                color: toneStyles.buttonText,
              }}
            >
              {entry.term}
            </button>
          ))
        ) : (
          <span className='text-sm' style={{ color: toneStyles.textColor }}>
            None
          </span>
        )}
      </div>
    </section>
  );
}

export default function SelectedEntryPanel({
  selectedEntry,
  recommendedEntries,
  onRelatedClick,
  onClear,
  onCompareEntry,
  onTogglePinEntry,
  onPrintEntrySheet,
  onEditEntry,
  onAddToBoard,
  isCompared = false,
  isPinned = false,
  isInActiveBoard = false,
  activeBoardName = "",
  searchQuery = "",
}) {
  if (!selectedEntry) {
    return (
      <section
        className='border p-5'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Entry reference
        </div>

        <h2
          className='mt-2 text-lg font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Entry detail
        </h2>

        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          Select an entry or use search to inspect it here.
        </p>
      </section>
    );
  }

  const hasRecommendations =
    recommendedEntries &&
    (recommendedEntries.sameType?.length ||
      recommendedEntries.sameDomain?.length ||
      recommendedEntries.sameRegion?.length);

  const hasBreakdown =
    recommendedEntries?.sameType?.some(
      (entry) => entry.__semanticBreakdown?.length,
    ) ||
    recommendedEntries?.sameDomain?.some(
      (entry) => entry.__semanticBreakdown?.length,
    ) ||
    recommendedEntries?.sameRegion?.some(
      (entry) => entry.__semanticBreakdown?.length,
    );

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          <div
            className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Selected entry
          </div>

          <h2
            className='text-2xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {selectedEntry.term}
          </h2>

          <p
            className='mt-2 max-w-3xl text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {selectedEntry.description}
          </p>

          {searchQuery ? (
            <p
              className='mt-3 text-[11px] uppercase tracking-[0.08em]'
              style={{ color: "var(--text-muted)" }}
            >
              Opened from search ·{" "}
              <span
                className='font-medium'
                style={{ color: "var(--text-secondary)" }}
              >
                {searchQuery}
              </span>
            </p>
          ) : null}

          {isInActiveBoard ? (
            <p
              className='mt-2 text-[11px] uppercase tracking-[0.08em]'
              style={{ color: "var(--tone-violet-text)" }}
            >
              {activeBoardName
                ? `Active board · ${activeBoardName}`
                : "Already in active board"}
            </p>
          ) : null}
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => onCompareEntry?.(selectedEntry.id)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={
              isCompared
                ? {
                    borderColor: "var(--tone-info-border)",
                    background: "var(--tone-info-bg)",
                    color: "var(--tone-info-text)",
                  }
                : {
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {isCompared ? "Remove compare" : "Add compare"}
          </button>

          <button
            type='button'
            onClick={() => onTogglePinEntry?.(selectedEntry.id)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={
              isPinned
                ? {
                    borderColor: "var(--tone-warning-border)",
                    background: "var(--tone-warning-bg)",
                    color: "var(--tone-warning-text)",
                  }
                : {
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {isPinned ? "Unpin" : "Pin"}
          </button>

          <button
            type='button'
            onClick={() => onAddToBoard?.(selectedEntry.id)}
            disabled={!onAddToBoard || isInActiveBoard}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60'
            style={
              isInActiveBoard
                ? {
                    borderColor: "var(--tone-violet-border)",
                    background: "var(--tone-violet-bg)",
                    color: "var(--tone-violet-text)",
                  }
                : {
                    borderColor: "var(--tone-success-border)",
                    background: "var(--tone-success-bg)",
                    color: "var(--tone-success-text)",
                  }
            }
          >
            {isInActiveBoard ? "In board" : "Add board"}
          </button>

          <button
            type='button'
            onClick={onPrintEntrySheet}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }}
          >
            Print sheet
          </button>

          <button
            type='button'
            onClick={() => onEditEntry?.(selectedEntry.id)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }}
          >
            Edit
          </button>

          <button
            type='button'
            onClick={onClear}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div
        className='mt-4 border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
        }}
      >
        {annotationLabel("Semantic profile")}
        <div className='mt-3'>
          <SemanticChips entry={selectedEntry} compact />
        </div>
      </div>

      <div
        className='mt-6 border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Taxonomy fields
        </div>

        <div className='mt-3'>
          <DetailRow label='Type' value={selectedEntry.type} />
          <DetailRow label='Scale' value={selectedEntry.scale} />
          <DetailRow label='Domain' value={selectedEntry.domain} />
          <DetailRow label='Status' value={selectedEntry.status} />
          <DetailRow label='Region' value={selectedEntry.region} />
          <DetailRow label='Section' value={selectedEntry.section} />
          <DetailRow label='Source' value={selectedEntry.sourceCategory} />
          <DetailRow label='Note' value={selectedEntry.notes} />
        </div>
      </div>

      <div className='mt-6 grid gap-4 xl:grid-cols-2'>
        <section
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          {annotationLabel("Synonyms")}

          <div className='mt-4 flex flex-wrap gap-2'>
            {selectedEntry.synonyms?.length ? (
              selectedEntry.synonyms.map((item) => (
                <span
                  key={item}
                  className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {item}
                </span>
              ))
            ) : (
              <span className='text-sm' style={{ color: "var(--text-muted)" }}>
                No synonyms listed.
              </span>
            )}
          </div>
        </section>

        <section
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          {annotationLabel("Related entries")}

          <div className='mt-4 flex flex-wrap gap-2'>
            {selectedEntry.related?.length ? (
              selectedEntry.related.map((item) => {
                const key =
                  typeof item === "string"
                    ? item
                    : `${item.id || item.label}-${item.label || item.id}`;

                return (
                  <RelatedPill
                    key={key}
                    item={item}
                    onRelatedClick={onRelatedClick}
                  />
                );
              })
            ) : (
              <span className='text-sm' style={{ color: "var(--text-muted)" }}>
                No related entries listed.
              </span>
            )}
          </div>
        </section>
      </div>

      {hasRecommendations ? (
        <div className='mt-6 grid gap-4 xl:grid-cols-3'>
          <RecommendationCard
            title='Same type'
            tone='sky'
            entries={recommendedEntries.sameType}
            onRelatedClick={onRelatedClick}
          />

          <RecommendationCard
            title='Same domain'
            tone='emerald'
            entries={recommendedEntries.sameDomain}
            onRelatedClick={onRelatedClick}
          />

          <RecommendationCard
            title='Same region'
            tone='violet'
            entries={recommendedEntries.sameRegion}
            onRelatedClick={onRelatedClick}
          />
        </div>
      ) : null}

      {hasBreakdown ? (
        <section
          className='mt-6 border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Recommendation explanation
          </div>

          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            Ranked candidates are explained using explicit semantic alignment
            rather than text guessing.
          </p>

          <div className='mt-4 space-y-3'>
            {[
              ...(recommendedEntries?.sameType || []),
              ...(recommendedEntries?.sameDomain || []),
              ...(recommendedEntries?.sameRegion || []),
            ]
              .filter(
                (entry, index, array) =>
                  array.findIndex((item) => item.id === entry.id) === index,
              )
              .slice(0, 6)
              .map((entry) => (
                <div
                  key={entry.id}
                  className='border p-4'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                  }}
                >
                  <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                    <div>
                      <div
                        className='text-sm font-semibold'
                        style={{ color: "var(--text-primary)" }}
                      >
                        {entry.term}
                      </div>
                      <div
                        className='mt-1 text-[10px] uppercase tracking-[0.12em]'
                        style={{ color: "var(--text-muted)" }}
                      >
                        {entry.recommendationReason || "semantic match"} · score{" "}
                        {entry.__score || 0}
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => onRelatedClick(entry.id)}
                      className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
                      style={{
                        borderColor: "var(--border-color)",
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Open
                    </button>
                  </div>

                  <div className='mt-3 flex flex-wrap gap-2'>
                    {entry.__semanticBreakdown?.length ? (
                      entry.__semanticBreakdown.map((item) => (
                        <BreakdownChip
                          key={`${entry.id}-${item.label}-${item.points}`}
                          item={item}
                        />
                      ))
                    ) : (
                      <span
                        className='text-sm'
                        style={{ color: "var(--text-muted)" }}
                      >
                        No semantic breakdown available.
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
