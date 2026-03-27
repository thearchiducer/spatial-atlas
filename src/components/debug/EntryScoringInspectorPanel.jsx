function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function toneForPoints(points) {
  if (points >= 8) {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (points >= 4) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-stone-200 bg-stone-50 text-stone-700";
}

function scorePair(leftValue, rightValue, points, label) {
  const same =
    String(leftValue || "")
      .trim()
      .toLowerCase() ===
    String(rightValue || "")
      .trim()
      .toLowerCase();

  return same
    ? {
        label,
        points,
        leftValue,
        rightValue,
      }
    : null;
}

export default function EntryScoringInspectorPanel({
  selectedEntry,
  compareEntries,
  recommendedEntries,
}) {
  const compareTarget =
    compareEntries && compareEntries.length >= 2
      ? compareEntries[1]
      : recommendedEntries?.sameType?.[0] ||
        recommendedEntries?.sameDomain?.[0] ||
        recommendedEntries?.sameRegion?.[0] ||
        null;

  if (!selectedEntry) {
    return null;
  }

  const scoreItems = [
    scorePair(selectedEntry.type, compareTarget?.type, 10, "same type"),
    scorePair(selectedEntry.domain, compareTarget?.domain, 8, "same domain"),
    scorePair(selectedEntry.region, compareTarget?.region, 6, "same region"),
    scorePair(selectedEntry.section, compareTarget?.section, 4, "same section"),
    scorePair(selectedEntry.scale, compareTarget?.scale, 4, "same scale"),
    scorePair(selectedEntry.status, compareTarget?.status, 2, "same status"),
    scorePair(
      selectedEntry.sourceCategory,
      compareTarget?.sourceCategory,
      3,
      "same source category",
    ),
    scorePair(
      selectedEntry.privacyLevel,
      compareTarget?.privacyLevel,
      8,
      "privacy alignment",
    ),
    scorePair(
      selectedEntry.enclosureType,
      compareTarget?.enclosureType,
      7,
      "enclosure alignment",
    ),
    scorePair(
      selectedEntry.circulationRole,
      compareTarget?.circulationRole,
      7,
      "circulation compatibility",
    ),
    scorePair(
      selectedEntry.socialRole,
      compareTarget?.socialRole,
      8,
      "social role alignment",
    ),
    scorePair(
      selectedEntry.spatialLogic,
      compareTarget?.spatialLogic,
      7,
      "spatial logic alignment",
    ),
    scorePair(
      selectedEntry.culturalSpecificity,
      compareTarget?.culturalSpecificity,
      5,
      "cultural specificity alignment",
    ),
    scorePair(
      selectedEntry.ritualWeight,
      compareTarget?.ritualWeight,
      5,
      "ritual alignment",
    ),
    scorePair(
      selectedEntry.climateResponse,
      compareTarget?.climateResponse,
      5,
      "climate alignment",
    ),
  ].filter(Boolean);

  const totalScore = scoreItems.reduce((sum, item) => sum + item.points, 0);

  return (
    <section className='border border-stone-300 bg-white p-5'>
      <div className='border-b border-stone-200 pb-4'>
        {annotationLabel("Debug · scoring inspector")}
        <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
          Entry scoring inspector
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Inspect how the semantic scoring logic reads the currently selected
          entry against a comparison target.
        </p>
      </div>

      <div className='mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]'>
        <div className='border border-stone-200 bg-stone-50/60 p-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              {annotationLabel("Base entry")}
              <div className='mt-2 text-base font-semibold text-stone-900'>
                {selectedEntry.term}
              </div>
              <div className='mt-2 text-sm text-stone-600'>
                {selectedEntry.type} · {selectedEntry.domain} ·{" "}
                {selectedEntry.scale}
              </div>
            </div>

            <div>
              {annotationLabel("Comparison target")}
              <div className='mt-2 text-base font-semibold text-stone-900'>
                {compareTarget ? compareTarget.term : "No target available"}
              </div>
              <div className='mt-2 text-sm text-stone-600'>
                {compareTarget
                  ? `${compareTarget.type} · ${compareTarget.domain} · ${compareTarget.scale}`
                  : "Select 2 compare entries or keep a selected entry with recommendations."}
              </div>
            </div>
          </div>
        </div>

        <div className='border border-stone-200 bg-stone-50/60 p-4 text-center'>
          {annotationLabel("Raw inspector score")}
          <div className='mt-3 text-4xl font-semibold leading-none text-stone-900'>
            {compareTarget ? totalScore : "—"}
          </div>
          <div className='mt-2 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
            Debug approximation
          </div>
        </div>
      </div>

      <div className='mt-5 space-y-3'>
        {compareTarget ? (
          scoreItems.length ? (
            scoreItems.map((item) => (
              <div
                key={`${item.label}-${item.points}`}
                className={`border p-4 ${toneForPoints(item.points)}`}
              >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <div className='text-sm font-semibold'>{item.label}</div>
                    <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-80'>
                      {String(item.leftValue || "—")} ↔{" "}
                      {String(item.rightValue || "—")}
                    </div>
                  </div>

                  <div className='border border-current/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'>
                    +{item.points}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600'>
              No direct exact-match factors were detected in this debug view.
            </div>
          )
        ) : (
          <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600'>
            No comparison target is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
