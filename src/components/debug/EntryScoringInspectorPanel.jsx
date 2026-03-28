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

function toneForPoints(points) {
  if (points >= 8) {
    return {
      borderColor: "rgba(16,185,129,0.35)",
      background: "rgba(16,185,129,0.10)",
      color: "#d1fae5",
      badgeBackground: "rgba(16,185,129,0.14)",
      badgeColor: "#a7f3d0",
    };
  }

  if (points >= 4) {
    return {
      borderColor: "rgba(251,191,36,0.30)",
      background: "rgba(251,191,36,0.10)",
      color: "#fef3c7",
      badgeBackground: "rgba(251,191,36,0.14)",
      badgeColor: "#fde68a",
    };
  }

  return {
    borderColor: "var(--border-color)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
    badgeBackground: "rgba(255,255,255,0.06)",
    badgeColor: "var(--text-primary)",
  };
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
        {annotationLabel("Debug · scoring inspector")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Entry scoring inspector
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Inspect how the semantic scoring logic reads the currently selected
          entry against a comparison target.
        </p>
      </div>

      <div className='mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]'>
        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              {annotationLabel("Base entry")}
              <div
                className='mt-2 text-base font-semibold'
                style={{ color: "var(--text-primary)" }}
              >
                {selectedEntry.term}
              </div>
              <div
                className='mt-2 text-sm'
                style={{ color: "var(--text-secondary)" }}
              >
                {selectedEntry.type} · {selectedEntry.domain} ·{" "}
                {selectedEntry.scale}
              </div>
            </div>

            <div>
              {annotationLabel("Comparison target")}
              <div
                className='mt-2 text-base font-semibold'
                style={{ color: "var(--text-primary)" }}
              >
                {compareTarget ? compareTarget.term : "No target available"}
              </div>
              <div
                className='mt-2 text-sm'
                style={{ color: "var(--text-secondary)" }}
              >
                {compareTarget
                  ? `${compareTarget.type} · ${compareTarget.domain} · ${compareTarget.scale}`
                  : "Select 2 compare entries or keep a selected entry with recommendations."}
              </div>
            </div>
          </div>
        </div>

        <div
          className='border p-4 text-center'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Raw inspector score")}
          <div
            className='mt-3 text-4xl font-semibold leading-none'
            style={{ color: "var(--text-primary)" }}
          >
            {compareTarget ? totalScore : "—"}
          </div>
          <div
            className='mt-2 text-[11px] uppercase tracking-[0.08em]'
            style={{ color: "var(--text-muted)" }}
          >
            Debug approximation
          </div>
        </div>
      </div>

      <div className='mt-5 space-y-3'>
        {compareTarget ? (
          scoreItems.length ? (
            scoreItems.map((item) => {
              const tone = toneForPoints(item.points);

              return (
                <div
                  key={`${item.label}-${item.points}`}
                  className='border p-4'
                  style={{
                    borderColor: tone.borderColor,
                    background: tone.background,
                    color: tone.color,
                  }}
                >
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div>
                      <div className='text-sm font-semibold'>{item.label}</div>
                      <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-80'>
                        {String(item.leftValue || "—")} ↔{" "}
                        {String(item.rightValue || "—")}
                      </div>
                    </div>

                    <div
                      className='border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'
                      style={{
                        borderColor: "rgba(255,255,255,0.16)",
                        background: tone.badgeBackground,
                        color: tone.badgeColor,
                      }}
                    >
                      +{item.points}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className='border border-dashed p-4 text-sm'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              No direct exact-match factors were detected in this debug view.
            </div>
          )
        ) : (
          <div
            className='border border-dashed p-4 text-sm'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            No comparison target is available yet.
          </div>
        )}
      </div>
    </section>
  );
}
