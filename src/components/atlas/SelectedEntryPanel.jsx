import SemanticChips from "./SemanticChips";

function annotationLabel(label) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {label}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className='grid gap-2 border-t border-stone-200 py-3 md:grid-cols-[140px_minmax(0,1fr)]'>
      <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {label}
      </div>
      <div className='text-sm leading-relaxed text-stone-800'>
        {value || <span className='text-stone-400'>—</span>}
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
      className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
    >
      {relatedLabel}
    </button>
  );
}

function BreakdownChip({ item }) {
  return (
    <div className='inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700'>
      <span>{item.label}</span>
      <span className='border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-700'>
        +{item.points}
      </span>
    </div>
  );
}

function RecommendationCard({ title, tone, entries, onRelatedClick }) {
  let toneClasses = "border-stone-300 bg-white";
  let titleClasses = "text-stone-900";
  let textClasses = "text-stone-600";
  let buttonClasses =
    "border-stone-300 bg-white text-stone-700 hover:bg-stone-100";

  if (tone === "sky") {
    toneClasses = "border-sky-200 bg-sky-50/40";
    titleClasses = "text-sky-950";
    textClasses = "text-sky-900";
    buttonClasses = "border-sky-200 bg-white text-sky-900 hover:bg-sky-100";
  } else if (tone === "emerald") {
    toneClasses = "border-emerald-200 bg-emerald-50/40";
    titleClasses = "text-emerald-950";
    textClasses = "text-emerald-900";
    buttonClasses =
      "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-100";
  } else if (tone === "violet") {
    toneClasses = "border-violet-200 bg-violet-50/40";
    titleClasses = "text-violet-950";
    textClasses = "text-violet-900";
    buttonClasses =
      "border-violet-200 bg-white text-violet-900 hover:bg-violet-100";
  }

  return (
    <section className={`border p-4 ${toneClasses}`}>
      <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        Recommendation set
      </div>

      <h3 className={`text-base font-semibold tracking-tight ${titleClasses}`}>
        {title}
      </h3>

      <div className='mt-4 flex flex-wrap gap-2'>
        {entries?.length ? (
          entries.map((entry) => (
            <button
              key={entry.id}
              type='button'
              onClick={() => onRelatedClick(entry.id)}
              className={`border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition ${buttonClasses}`}
            >
              {entry.term}
            </button>
          ))
        ) : (
          <span className={`text-sm ${textClasses}`}>None</span>
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
      <section className='border border-stone-300 bg-white p-5'>
        <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
          Entry reference
        </div>

        <h2 className='mt-2 text-lg font-semibold tracking-tight text-stone-900'>
          Entry detail
        </h2>

        <p className='mt-2 text-sm text-stone-600'>
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
    <section className='border border-stone-300 bg-white p-5'>
      <div className='flex flex-col gap-4 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
            Selected entry
          </div>

          <h2 className='text-2xl font-semibold tracking-tight text-stone-900'>
            {selectedEntry.term}
          </h2>

          <p className='mt-2 max-w-3xl text-sm leading-relaxed text-stone-700'>
            {selectedEntry.description}
          </p>

          {searchQuery ? (
            <p className='mt-3 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
              Opened from search ·{" "}
              <span className='font-medium text-stone-700'>{searchQuery}</span>
            </p>
          ) : null}

          {isInActiveBoard ? (
            <p className='mt-2 text-[11px] uppercase tracking-[0.08em] text-fuchsia-700'>
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
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition ${
              isCompared
                ? "border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            {isCompared ? "Remove compare" : "Add compare"}
          </button>

          <button
            type='button'
            onClick={() => onTogglePinEntry?.(selectedEntry.id)}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition ${
              isPinned
                ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            {isPinned ? "Unpin" : "Pin"}
          </button>

          <button
            type='button'
            onClick={() => onAddToBoard?.(selectedEntry.id)}
            disabled={!onAddToBoard || isInActiveBoard}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition ${
              isInActiveBoard
                ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isInActiveBoard ? "In board" : "Add board"}
          </button>

          <button
            type='button'
            onClick={onPrintEntrySheet}
            className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
          >
            Print sheet
          </button>

          <button
            type='button'
            onClick={() => onEditEntry?.(selectedEntry.id)}
            className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
          >
            Edit
          </button>

          <button
            type='button'
            onClick={onClear}
            className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
          >
            Clear
          </button>
        </div>
      </div>

      <div className='mt-4 border border-stone-200 bg-stone-50/50 p-4'>
        {annotationLabel("Semantic profile")}
        <div className='mt-3'>
          <SemanticChips entry={selectedEntry} compact />
        </div>
      </div>

      <div className='mt-6 border border-stone-200 bg-white p-4'>
        <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
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
        <section className='border border-stone-200 bg-white p-4'>
          {annotationLabel("Synonyms")}

          <div className='mt-4 flex flex-wrap gap-2'>
            {selectedEntry.synonyms?.length ? (
              selectedEntry.synonyms.map((item) => (
                <span
                  key={item}
                  className='border border-stone-300 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'
                >
                  {item}
                </span>
              ))
            ) : (
              <span className='text-sm text-stone-500'>
                No synonyms listed.
              </span>
            )}
          </div>
        </section>

        <section className='border border-stone-200 bg-white p-4'>
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
              <span className='text-sm text-stone-500'>
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
        <section className='mt-6 border border-stone-200 bg-white p-4'>
          <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
            Recommendation explanation
          </div>

          <p className='mt-2 text-sm text-stone-600'>
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
                  className='border border-stone-200 bg-stone-50/50 p-4'
                >
                  <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                    <div>
                      <div className='text-sm font-semibold text-stone-900'>
                        {entry.term}
                      </div>
                      <div className='mt-1 text-[10px] uppercase tracking-[0.12em] text-stone-500'>
                        {entry.recommendationReason || "semantic match"} · score{" "}
                        {entry.__score || 0}
                      </div>
                    </div>

                    <button
                      type='button'
                      onClick={() => onRelatedClick(entry.id)}
                      className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
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
                      <span className='text-sm text-stone-500'>
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
