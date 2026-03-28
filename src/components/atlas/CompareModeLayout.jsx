import SemanticChips from "./SemanticChips";
import SemanticExplanationChips from "../semantic/SemanticExplanationChips";

function normalizeList(values = []) {
  return values.map((value) => String(value).trim()).filter(Boolean);
}

function getSharedAndUnique(leftValues = [], rightValues = []) {
  const left = normalizeList(leftValues);
  const right = normalizeList(rightValues);

  const leftLower = left.map((item) => item.toLowerCase());
  const rightLower = right.map((item) => item.toLowerCase());

  const shared = left.filter((item, index) =>
    rightLower.includes(leftLower[index]),
  );

  const uniqueLeft = left.filter(
    (item, index) => !rightLower.includes(leftLower[index]),
  );

  const uniqueRight = right.filter(
    (item, index) => !leftLower.includes(rightLower[index]),
  );

  return {
    shared,
    uniqueLeft,
    uniqueRight,
  };
}

function classifyDifferenceSeverity(label) {
  if (
    label === "type" ||
    label === "domain" ||
    label === "privacy" ||
    label === "social role"
  ) {
    return "high";
  }

  if (
    label === "scale" ||
    label === "region" ||
    label === "section" ||
    label === "enclosure" ||
    label === "spatial logic" ||
    label === "cultural specificity"
  ) {
    return "medium";
  }

  return "low";
}

function humanizeSemanticValue(value) {
  if (!value) return "—";
  return String(value).replace(/-/g, " ");
}

function getSemanticComparison(leftEntry, rightEntry) {
  let score = 0;
  const breakdown = [];

  function addPoints(condition, points, label) {
    if (!condition) return;
    score += points;
    breakdown.push({ label, points });
  }

  addPoints(leftEntry.type === rightEntry.type, 18, "same type");
  addPoints(leftEntry.scale === rightEntry.scale, 10, "same scale");
  addPoints(leftEntry.domain === rightEntry.domain, 14, "same domain");
  addPoints(leftEntry.region === rightEntry.region, 10, "same region");
  addPoints(leftEntry.section === rightEntry.section, 8, "same section");
  addPoints(
    leftEntry.sourceCategory === rightEntry.sourceCategory,
    6,
    "same source category",
  );

  addPoints(
    leftEntry.privacyLevel === rightEntry.privacyLevel,
    8,
    "same privacy level",
  );
  addPoints(
    leftEntry.enclosureType === rightEntry.enclosureType,
    7,
    "same enclosure type",
  );
  addPoints(
    leftEntry.circulationRole === rightEntry.circulationRole,
    6,
    "same circulation role",
  );
  addPoints(
    leftEntry.socialRole === rightEntry.socialRole,
    8,
    "same social role",
  );
  addPoints(
    leftEntry.spatialLogic === rightEntry.spatialLogic,
    7,
    "same spatial logic",
  );
  addPoints(
    leftEntry.culturalSpecificity === rightEntry.culturalSpecificity,
    6,
    "same cultural specificity",
  );
  addPoints(
    leftEntry.ritualWeight === rightEntry.ritualWeight,
    5,
    "same ritual weight",
  );
  addPoints(
    leftEntry.climateResponse === rightEntry.climateResponse,
    5,
    "same climate response",
  );

  const synonymDiff = getSharedAndUnique(
    leftEntry.synonyms || [],
    rightEntry.synonyms || [],
  );

  const relatedDiff = getSharedAndUnique(
    (leftEntry.related || []).map((item) => item.id || item.label),
    (rightEntry.related || []).map((item) => item.id || item.label),
  );

  const synonymPoints = Math.min(synonymDiff.shared.length * 4, 8);
  const relatedPoints = Math.min(relatedDiff.shared.length * 3, 6);

  if (synonymPoints > 0) {
    score += synonymPoints;
    breakdown.push({
      label: `shared synonyms (${synonymDiff.shared.length})`,
      points: synonymPoints,
    });
  }

  if (relatedPoints > 0) {
    score += relatedPoints;
    breakdown.push({
      label: `shared related entries (${relatedDiff.shared.length})`,
      points: relatedPoints,
    });
  }

  const normalizedScore = Math.min(score, 100);

  let label = "Distinct concepts";
  if (normalizedScore >= 72) label = "Same family";
  else if (normalizedScore >= 46) label = "Adjacent family";

  return {
    score: normalizedScore,
    label,
    synonymDiff,
    relatedDiff,
    breakdown,
  };
}

function buildCompareSummary(leftEntry, rightEntry, semantic) {
  const similarities = [];
  const differences = [];
  const nuance = [];

  if (leftEntry.type === rightEntry.type) {
    similarities.push(
      `both are classified as ${leftEntry.type.toLowerCase()} spaces`,
    );
  } else {
    differences.push(
      `${leftEntry.term} is classified as ${leftEntry.type.toLowerCase()}, while ${rightEntry.term} is classified as ${rightEntry.type.toLowerCase()}`,
    );
  }

  if (leftEntry.domain === rightEntry.domain) {
    similarities.push(
      `both sit within the ${leftEntry.domain.toLowerCase()} domain`,
    );
  } else {
    differences.push(
      `${leftEntry.term} belongs to the ${leftEntry.domain.toLowerCase()} domain, while ${rightEntry.term} belongs to the ${rightEntry.domain.toLowerCase()} domain`,
    );
  }

  if (leftEntry.privacyLevel === rightEntry.privacyLevel) {
    similarities.push(
      `both carry a ${humanizeSemanticValue(leftEntry.privacyLevel)} privacy tendency`,
    );
  } else {
    differences.push(
      `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.privacyLevel)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.privacyLevel)}`,
    );
  }

  if (leftEntry.enclosureType === rightEntry.enclosureType) {
    similarities.push(
      `both use a ${humanizeSemanticValue(leftEntry.enclosureType)} enclosure condition`,
    );
  } else {
    differences.push(
      `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.enclosureType)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.enclosureType)}`,
    );
  }

  if (leftEntry.socialRole === rightEntry.socialRole) {
    similarities.push(
      `both primarily support ${humanizeSemanticValue(leftEntry.socialRole)}`,
    );
  } else {
    differences.push(
      `${leftEntry.term} supports ${humanizeSemanticValue(leftEntry.socialRole)}, while ${rightEntry.term} supports ${humanizeSemanticValue(rightEntry.socialRole)}`,
    );
  }

  if (leftEntry.spatialLogic === rightEntry.spatialLogic) {
    similarities.push(
      `both follow a ${humanizeSemanticValue(leftEntry.spatialLogic)} spatial logic`,
    );
  } else {
    differences.push(
      `${leftEntry.term} follows ${humanizeSemanticValue(leftEntry.spatialLogic)}, while ${rightEntry.term} follows ${humanizeSemanticValue(rightEntry.spatialLogic)}`,
    );
  }

  if (
    leftEntry.culturalSpecificity === rightEntry.culturalSpecificity &&
    leftEntry.culturalSpecificity
  ) {
    similarities.push(
      `both have ${humanizeSemanticValue(leftEntry.culturalSpecificity)} cultural specificity`,
    );
  } else {
    differences.push(
      `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.culturalSpecificity)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.culturalSpecificity)}`,
    );
  }

  if (semantic.synonymDiff.shared.length > 0) {
    nuance.push(
      `they share ${semantic.synonymDiff.shared.length} synonym${
        semantic.synonymDiff.shared.length === 1 ? "" : "s"
      }, which suggests overlapping search language`,
    );
  }

  if (semantic.relatedDiff.shared.length > 0) {
    nuance.push(
      `they also connect to ${semantic.relatedDiff.shared.length} shared related entr${
        semantic.relatedDiff.shared.length === 1 ? "y" : "ies"
      }, which reinforces their conceptual proximity`,
    );
  }

  if (leftEntry.climateResponse === rightEntry.climateResponse) {
    nuance.push(
      `both respond climatically through ${humanizeSemanticValue(leftEntry.climateResponse)}`,
    );
  }

  if (leftEntry.ritualWeight === rightEntry.ritualWeight) {
    nuance.push(
      `both carry ${humanizeSemanticValue(leftEntry.ritualWeight)} ritual weight`,
    );
  }

  if (semantic.label === "Same family") {
    nuance.unshift(
      "Overall, these entries are closely aligned across both taxonomy fields and explicit semantic attributes",
    );
  } else if (semantic.label === "Adjacent family") {
    nuance.unshift(
      "Overall, these entries are near each other conceptually, but their semantic roles are not identical",
    );
  } else {
    nuance.unshift(
      "Overall, these entries diverge across several core semantic fields, so they should not be treated as substitutes",
    );
  }

  return {
    similarities,
    differences,
    nuance,
  };
}

function buildSemanticDiffInsights(leftEntry, rightEntry) {
  const insights = [];

  if (leftEntry.type !== rightEntry.type) {
    insights.push({
      label: "type",
      severity: classifyDifferenceSeverity("type"),
      title: "Different taxonomic role",
      description: `${leftEntry.term} and ${rightEntry.term} are not classified under the same type, so they belong to different atlas families at the top level.`,
    });
  }

  if (leftEntry.domain !== rightEntry.domain) {
    insights.push({
      label: "domain",
      severity: classifyDifferenceSeverity("domain"),
      title: "Different design domain",
      description: `${leftEntry.term} belongs to the ${leftEntry.domain.toLowerCase()} domain, while ${rightEntry.term} belongs to the ${rightEntry.domain.toLowerCase()} domain.`,
    });
  }

  if (leftEntry.scale !== rightEntry.scale) {
    insights.push({
      label: "scale",
      severity: classifyDifferenceSeverity("scale"),
      title: "Different operational scale",
      description: `${leftEntry.term} works at the ${leftEntry.scale.toLowerCase()} scale, while ${rightEntry.term} works at the ${rightEntry.scale.toLowerCase()} scale.`,
    });
  }

  if (leftEntry.privacyLevel !== rightEntry.privacyLevel) {
    insights.push({
      label: "privacy",
      severity: classifyDifferenceSeverity("privacy"),
      title: "Different privacy structure",
      description: `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.privacyLevel)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.privacyLevel)}.`,
    });
  }

  if (leftEntry.enclosureType !== rightEntry.enclosureType) {
    insights.push({
      label: "enclosure",
      severity: classifyDifferenceSeverity("enclosure"),
      title: "Different enclosure condition",
      description: `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.enclosureType)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.enclosureType)}.`,
    });
  }

  if (leftEntry.circulationRole !== rightEntry.circulationRole) {
    insights.push({
      label: "circulation role",
      severity: classifyDifferenceSeverity("circulation role"),
      title: "Different circulation role",
      description: `${leftEntry.term} functions as ${humanizeSemanticValue(leftEntry.circulationRole)}, while ${rightEntry.term} functions as ${humanizeSemanticValue(rightEntry.circulationRole)}.`,
    });
  }

  if (leftEntry.socialRole !== rightEntry.socialRole) {
    insights.push({
      label: "social role",
      severity: classifyDifferenceSeverity("social role"),
      title: "Different social role",
      description: `${leftEntry.term} supports ${humanizeSemanticValue(leftEntry.socialRole)}, while ${rightEntry.term} supports ${humanizeSemanticValue(rightEntry.socialRole)}.`,
    });
  }

  if (leftEntry.spatialLogic !== rightEntry.spatialLogic) {
    insights.push({
      label: "spatial logic",
      severity: classifyDifferenceSeverity("spatial logic"),
      title: "Different spatial logic",
      description: `${leftEntry.term} follows ${humanizeSemanticValue(leftEntry.spatialLogic)}, while ${rightEntry.term} follows ${humanizeSemanticValue(rightEntry.spatialLogic)}.`,
    });
  }

  if (leftEntry.culturalSpecificity !== rightEntry.culturalSpecificity) {
    insights.push({
      label: "cultural specificity",
      severity: classifyDifferenceSeverity("cultural specificity"),
      title: "Different cultural specificity",
      description: `${leftEntry.term} is ${humanizeSemanticValue(leftEntry.culturalSpecificity)}, while ${rightEntry.term} is ${humanizeSemanticValue(rightEntry.culturalSpecificity)}.`,
    });
  }

  if (leftEntry.ritualWeight !== rightEntry.ritualWeight) {
    insights.push({
      label: "ritual weight",
      severity: classifyDifferenceSeverity("ritual weight"),
      title: "Different ritual weight",
      description: `${leftEntry.term} carries ${humanizeSemanticValue(leftEntry.ritualWeight)} ritual weight, while ${rightEntry.term} carries ${humanizeSemanticValue(rightEntry.ritualWeight)} ritual weight.`,
    });
  }

  if (leftEntry.climateResponse !== rightEntry.climateResponse) {
    insights.push({
      label: "climate response",
      severity: classifyDifferenceSeverity("climate response"),
      title: "Different climate response",
      description: `${leftEntry.term} responds climatically through ${humanizeSemanticValue(leftEntry.climateResponse)}, while ${rightEntry.term} responds through ${humanizeSemanticValue(rightEntry.climateResponse)}.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      label: "alignment",
      severity: "low",
      title: "Mostly aligned",
      description: `The main structural and semantic fields between ${leftEntry.term} and ${rightEntry.term} are closely aligned, so the distinction is more nuanced than categorical.`,
    });
  }

  return insights;
}

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

function DiffBadge({ same }) {
  return (
    <span
      className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
      style={
        same
          ? {
              borderColor: "rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.10)",
              color: "#a7f3d0",
            }
          : {
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }
      }
    >
      {same ? "Match" : "Different"}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const style =
    severity === "high"
      ? {
          borderColor: "rgba(248,113,113,0.35)",
          background: "rgba(248,113,113,0.10)",
          color: "#fecaca",
        }
      : severity === "medium"
        ? {
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.10)",
            color: "#fde68a",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          };

  return (
    <span
      className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
      style={style}
    >
      {severity}
    </span>
  );
}

function SemanticScoreCard({ score, label, breakdown }) {
  const toneStyles =
    score >= 72
      ? {
          borderColor: "rgba(16,185,129,0.35)",
          background: "rgba(16,185,129,0.08)",
          color: "#d1fae5",
        }
      : score >= 46
        ? {
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.08)",
            color: "#fde68a",
          }
        : {
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.02)",
            color: "var(--text-primary)",
          };

  return (
    <section
      className='border p-5'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_140px] lg:items-start'>
        <div>
          {annotationLabel("Semantic relationship")}
          <h3 className='mt-2 text-xl font-semibold tracking-tight'>{label}</h3>
          <p className='mt-2 text-sm leading-relaxed opacity-80'>
            The score uses explicit semantic attributes from the data model, not
            text guessing.
          </p>
        </div>

        <div
          className='border px-4 py-3 text-center'
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div className='text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70'>
            Similarity
          </div>
          <div className='mt-1 text-3xl font-semibold leading-none'>
            {score}
          </div>
          <div className='mt-1 text-[10px] uppercase tracking-[0.12em] opacity-70'>
            out of 100
          </div>
        </div>
      </div>

      <div
        className='mt-4 border p-4'
        style={{
          borderColor: "rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {annotationLabel("Score breakdown")}
        <div className='mt-3'>
          {breakdown.length ? (
            <SemanticExplanationChips breakdown={breakdown} />
          ) : (
            <span className='text-sm opacity-70'>
              No meaningful overlap detected.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function NaturalLanguageSummary({ leftEntry, rightEntry, summary }) {
  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <h3
        className='text-lg font-semibold tracking-tight'
        style={{ color: "var(--text-primary)" }}
      >
        Natural-language reading
      </h3>

      <div
        className='mt-4 space-y-3 text-sm'
        style={{ color: "var(--text-secondary)" }}
      >
        <div
          className='border p-4'
          style={{
            borderColor: "rgba(16,185,129,0.30)",
            background: "rgba(16,185,129,0.08)",
          }}
        >
          {annotationLabel("Similarities")}
          {summary.similarities.length ? (
            <ul className='mt-3 space-y-2 leading-relaxed'>
              {summary.similarities.map((item) => (
                <li key={item}>
                  {leftEntry.term} and {rightEntry.term} share the fact that{" "}
                  {item}.
                </li>
              ))}
            </ul>
          ) : (
            <p className='mt-3'>
              There are no major structural similarities in the core taxonomy
              and semantic fields.
            </p>
          )}
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {annotationLabel("Differences")}
          {summary.differences.length ? (
            <ul className='mt-3 space-y-2 leading-relaxed'>
              {summary.differences.map((item) => (
                <li key={item}>{item}.</li>
              ))}
            </ul>
          ) : (
            <p className='mt-3'>
              Their main taxonomy and semantic fields align closely, so the
              distinction is mostly nuanced.
            </p>
          )}
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "rgba(56,189,248,0.30)",
            background: "rgba(56,189,248,0.08)",
          }}
        >
          {annotationLabel("Interpretation")}
          <div className='mt-3 space-y-2 leading-relaxed'>
            {summary.nuance.map((item) => (
              <p key={item}>{item}.</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SemanticDiffInsights({ insights }) {
  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <h3
        className='text-lg font-semibold tracking-tight'
        style={{ color: "var(--text-primary)" }}
      >
        Why they differ
      </h3>

      <div className='mt-4 space-y-3'>
        {insights.map((item) => (
          <div
            key={`${item.label}-${item.title}`}
            className='border p-4'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className='flex flex-wrap items-center gap-2'>
              <h4
                className='text-sm font-semibold'
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </h4>
              <SeverityBadge severity={item.severity} />
            </div>

            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompareAttributeRow({ label, left, right }) {
  const same =
    String(left ?? "")
      .trim()
      .toLowerCase() ===
    String(right ?? "")
      .trim()
      .toLowerCase();

  return (
    <div
      className='grid gap-3 border-t py-3 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_auto]'
      style={{ borderColor: "var(--border-color)" }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>

      <div
        className='border px-3 py-2 text-sm'
        style={
          same
            ? {
                borderColor: "rgba(16,185,129,0.30)",
                background: "rgba(16,185,129,0.08)",
                color: "#d1fae5",
              }
            : {
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }
        }
      >
        {left || <span style={{ color: "var(--text-muted)" }}>—</span>}
      </div>

      <div
        className='border px-3 py-2 text-sm'
        style={
          same
            ? {
                borderColor: "rgba(16,185,129,0.30)",
                background: "rgba(16,185,129,0.08)",
                color: "#d1fae5",
              }
            : {
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }
        }
      >
        {right || <span style={{ color: "var(--text-muted)" }}>—</span>}
      </div>

      <div className='flex items-start justify-end md:justify-center'>
        <DiffBadge same={same} />
      </div>
    </div>
  );
}

function CompareEntryHeader({
  entry,
  tone,
  onSelectEntry,
  onRemoveCompareEntry,
}) {
  const toneStyles =
    tone === "left"
      ? {
          borderColor: "rgba(56,189,248,0.30)",
          background: "rgba(56,189,248,0.06)",
        }
      : {
          borderColor: "rgba(99,102,241,0.30)",
          background: "rgba(99,102,241,0.06)",
        };

  return (
    <section
      className='border p-5'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
      }}
    >
      <div
        className='flex items-start justify-between gap-3 border-b pb-4'
        style={{ borderColor: "rgba(255,255,255,0.10)" }}
      >
        <div className='min-w-0 flex-1'>
          {annotationLabel(tone === "left" ? "Left entry" : "Right entry")}

          <button
            type='button'
            onClick={() => onSelectEntry(entry.id)}
            className='mt-2 text-left'
          >
            <h3
              className='text-xl font-semibold tracking-tight hover:underline'
              style={{ color: "var(--text-primary)" }}
            >
              {entry.term}
            </h3>
          </button>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {entry.description}
          </p>

          <SemanticChips entry={entry} compact />
        </div>

        <button
          type='button'
          onClick={() => onRemoveCompareEntry(entry.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-secondary)",
          }}
        >
          Remove
        </button>
      </div>

      <div
        className='mt-4 grid gap-2 text-sm md:grid-cols-2'
        style={{ color: "var(--text-secondary)" }}
      >
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Type
          </strong>
          {entry.type}
        </div>
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Scale
          </strong>
          {entry.scale}
        </div>
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Domain
          </strong>
          {entry.domain}
        </div>
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Status
          </strong>
          {entry.status}
        </div>
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Region
          </strong>
          {entry.region}
        </div>
        <div>
          <strong className='mr-2' style={{ color: "var(--text-primary)" }}>
            Source
          </strong>
          {entry.sourceCategory}
        </div>
      </div>
    </section>
  );
}

function CompareListBlock({ title, shared, leftOnly, rightOnly }) {
  function renderItems(items, tone, emptyText) {
    if (!items.length) {
      return (
        <span className='text-sm' style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </span>
      );
    }

    const toneStyles =
      tone === "shared"
        ? {
            borderColor: "rgba(16,185,129,0.30)",
            background: "rgba(16,185,129,0.10)",
            color: "#d1fae5",
          }
        : tone === "left"
          ? {
              borderColor: "rgba(56,189,248,0.30)",
              background: "rgba(56,189,248,0.10)",
              color: "#bae6fd",
            }
          : {
              borderColor: "rgba(99,102,241,0.30)",
              background: "rgba(99,102,241,0.10)",
              color: "#c7d2fe",
            };

    return items.map((item) => (
      <span
        key={item}
        className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
        style={toneStyles}
      >
        {item}
      </span>
    ));
  }

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <h3
        className='text-lg font-semibold tracking-tight'
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>

      <div className='mt-4 grid gap-4 lg:grid-cols-3'>
        <div
          className='border p-4'
          style={{
            borderColor: "rgba(16,185,129,0.30)",
            background: "rgba(16,185,129,0.08)",
          }}
        >
          {annotationLabel("Shared")}
          <div className='mt-3 flex flex-wrap gap-2'>
            {renderItems(shared, "shared", "None")}
          </div>
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "rgba(56,189,248,0.30)",
            background: "rgba(56,189,248,0.08)",
          }}
        >
          {annotationLabel("Left only")}
          <div className='mt-3 flex flex-wrap gap-2'>
            {renderItems(leftOnly, "left", "None")}
          </div>
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "rgba(99,102,241,0.30)",
            background: "rgba(99,102,241,0.08)",
          }}
        >
          {annotationLabel("Right only")}
          <div className='mt-3 flex flex-wrap gap-2'>
            {renderItems(rightOnly, "right", "None")}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CompareModeLayout({
  compareEntries,
  onSelectEntry,
  onRemoveCompareEntry,
  onClearCompare,
  onCopyCompareLink,
  compareLinkCopied = false,
}) {
  if (!compareEntries || compareEntries.length < 2) {
    return null;
  }

  const [leftEntry, rightEntry] = compareEntries;

  const semantic = getSemanticComparison(leftEntry, rightEntry);
  const summary = buildCompareSummary(leftEntry, rightEntry, semantic);
  const insights = buildSemanticDiffInsights(leftEntry, rightEntry);

  function handlePrintCompareSheet() {
    const printWindow = window.open("", "_blank", "width=1000,height=900");

    if (!printWindow) return;

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const fieldRows = [
      ["Type", leftEntry.type, rightEntry.type],
      ["Scale", leftEntry.scale, rightEntry.scale],
      ["Domain", leftEntry.domain, rightEntry.domain],
      ["Status", leftEntry.status, rightEntry.status],
      ["Region", leftEntry.region, rightEntry.region],
      ["Source", leftEntry.sourceCategory, rightEntry.sourceCategory],
      ["Privacy", leftEntry.privacyLevel, rightEntry.privacyLevel],
      ["Enclosure", leftEntry.enclosureType, rightEntry.enclosureType],
      [
        "Circulation Role",
        leftEntry.circulationRole,
        rightEntry.circulationRole,
      ],
      ["Social Role", leftEntry.socialRole, rightEntry.socialRole],
      ["Spatial Logic", leftEntry.spatialLogic, rightEntry.spatialLogic],
      [
        "Cultural Specificity",
        leftEntry.culturalSpecificity,
        rightEntry.culturalSpecificity,
      ],
      ["Ritual Weight", leftEntry.ritualWeight, rightEntry.ritualWeight],
      [
        "Climate Response",
        leftEntry.climateResponse,
        rightEntry.climateResponse,
      ],
      ["Note", leftEntry.notes, rightEntry.notes],
    ]
      .map(
        ([label, left, right]) => `
          <tr>
            <td class="label-cell">${escapeHtml(label)}</td>
            <td>${escapeHtml(humanizeSemanticValue(left || "—"))}</td>
            <td>${escapeHtml(humanizeSemanticValue(right || "—"))}</td>
          </tr>
        `,
      )
      .join("");

    const similaritiesHtml = summary.similarities.length
      ? `<ul>${summary.similarities
          .map(
            (item) =>
              `<li>${escapeHtml(leftEntry.term)} and ${escapeHtml(
                rightEntry.term,
              )} share the fact that ${escapeHtml(item)}.</li>`,
          )
          .join("")}</ul>`
      : `<p>There are no major structural similarities in the core taxonomy and semantic fields.</p>`;

    const differencesHtml = summary.differences.length
      ? `<ul>${summary.differences
          .map((item) => `<li>${escapeHtml(item)}.</li>`)
          .join("")}</ul>`
      : `<p>Their main taxonomy and semantic fields align closely, so the comparison is mostly about nuance rather than category difference.</p>`;

    const interpretationHtml = summary.nuance.length
      ? summary.nuance.map((item) => `<p>${escapeHtml(item)}.</p>`).join("")
      : `<p>No additional interpretation available.</p>`;

    const insightsHtml = insights.length
      ? `<ul>${insights
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(
                item.description,
              )}</li>`,
          )
          .join("")}</ul>`
      : `<p>No major semantic differences detected.</p>`;

    const synonymShared = semantic.synonymDiff.shared.length
      ? semantic.synonymDiff.shared.map((item) => escapeHtml(item)).join(", ")
      : "None";

    const synonymLeft = semantic.synonymDiff.uniqueLeft.length
      ? semantic.synonymDiff.uniqueLeft
          .map((item) => escapeHtml(item))
          .join(", ")
      : "None";

    const synonymRight = semantic.synonymDiff.uniqueRight.length
      ? semantic.synonymDiff.uniqueRight
          .map((item) => escapeHtml(item))
          .join(", ")
      : "None";

    const relatedShared = semantic.relatedDiff.shared.length
      ? semantic.relatedDiff.shared.map((item) => escapeHtml(item)).join(", ")
      : "None";

    const relatedLeft = semantic.relatedDiff.uniqueLeft.length
      ? semantic.relatedDiff.uniqueLeft
          .map((item) => escapeHtml(item))
          .join(", ")
      : "None";

    const relatedRight = semantic.relatedDiff.uniqueRight.length
      ? semantic.relatedDiff.uniqueRight
          .map((item) => escapeHtml(item))
          .join(", ")
      : "None";

    const breakdownHtml = semantic.breakdown.length
      ? semantic.breakdown
          .map(
            (item) =>
              `<span class="chip">${escapeHtml(item.label)} (+${escapeHtml(
                item.points,
              )})</span>`,
          )
          .join("")
      : `<span>No meaningful overlap detected.</span>`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Compare Sheet - ${escapeHtml(leftEntry.term)} vs ${escapeHtml(
            rightEntry.term,
          )}</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; margin: 0; padding: 0; }
            .sheet { max-width: 190mm; margin: 0 auto; padding: 0; }
            .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }
            h1 { font-size: 30px; margin: 0 0 8px; }
            h2 { font-size: 18px; margin: 0 0 10px; }
            h3 { font-size: 15px; margin: 0 0 8px; }
            p, li { font-size: 12px; line-height: 1.45; }
            section { margin-bottom: 18px; page-break-inside: avoid; }
            .header { border-bottom: 1px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            .meta { font-size: 12px; margin-top: 6px; }
            .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
            .chip { border: 1px solid #999; border-radius: 999px; padding: 4px 8px; font-size: 11px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            th, td { border: 1px solid #111; padding: 6px; vertical-align: top; font-size: 12px; text-align: left; word-wrap: break-word; }
            .label-cell { width: 22%; font-weight: bold; }
            .block { border: 1px solid #aaa; padding: 10px; margin-top: 8px; }
            ul { margin: 8px 0 0 18px; padding: 0; }
            .print-actions { margin: 12px 0 18px; }
            .print-actions button { padding: 8px 12px; margin-right: 8px; border: 1px solid #111; background: #fff; cursor: pointer; }
            @media print { .print-actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="print-actions">
              <button onclick="window.print()">Print / Save PDF</button>
              <button onclick="window.close()">Close</button>
            </div>

            <section class="header">
              <div class="eyebrow">Spatial Atlas</div>
              <h1>Compare Sheet</h1>
              <p class="meta">${escapeHtml(leftEntry.term)} vs ${escapeHtml(
                rightEntry.term,
              )}</p>
            </section>

            <section>
              <div class="grid-2">
                <div>
                  <h2>${escapeHtml(leftEntry.term)}</h2>
                  <p>${escapeHtml(leftEntry.description)}</p>
                </div>
                <div>
                  <h2>${escapeHtml(rightEntry.term)}</h2>
                  <p>${escapeHtml(rightEntry.description)}</p>
                </div>
              </div>
            </section>

            <section>
              <h2>Semantic relationship</h2>
              <p><strong>${escapeHtml(semantic.label)}</strong> · Similarity score ${escapeHtml(semantic.score)}/100</p>
              <div class="chips">${breakdownHtml}</div>
            </section>

            <section>
              <h2>Natural-language reading</h2>
              <div class="block">
                <h3>Similarities</h3>
                ${similaritiesHtml}
              </div>
              <div class="block">
                <h3>Differences</h3>
                ${differencesHtml}
              </div>
              <div class="block">
                <h3>Interpretation</h3>
                ${interpretationHtml}
              </div>
            </section>

            <section>
              <h2>Why they differ</h2>
              ${insightsHtml}
            </section>

            <section>
              <h2>Attribute comparison</h2>
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>${escapeHtml(leftEntry.term)}</th>
                    <th>${escapeHtml(rightEntry.term)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${fieldRows}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Synonym overlap</h2>
              <p><strong>Shared:</strong> ${synonymShared}</p>
              <p><strong>${escapeHtml(leftEntry.term)} only:</strong> ${synonymLeft}</p>
              <p><strong>${escapeHtml(rightEntry.term)} only:</strong> ${synonymRight}</p>
            </section>

            <section>
              <h2>Related-entry overlap</h2>
              <p><strong>Shared:</strong> ${relatedShared}</p>
              <p><strong>${escapeHtml(leftEntry.term)} only:</strong> ${relatedLeft}</p>
              <p><strong>${escapeHtml(rightEntry.term)} only:</strong> ${relatedRight}</p>
            </section>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }

  return (
    <section
      className='border p-6'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Compare mode layout")}
          <h2
            className='mt-2 text-2xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Side-by-side comparison
          </h2>
          <p
            className='mt-2 max-w-3xl text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Review the structural similarities and conceptual differences
            between two atlas entries in one screen.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={handlePrintCompareSheet}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            Print / Save PDF
          </button>

          <button
            type='button'
            onClick={onCopyCompareLink}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            {compareLinkCopied ? "Compare link copied" : "Copy compare link"}
          </button>

          <button
            type='button'
            onClick={onClearCompare}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            Exit compare mode
          </button>
        </div>
      </div>

      <div className='mt-6'>
        <SemanticScoreCard
          score={semantic.score}
          label={semantic.label}
          breakdown={semantic.breakdown}
        />
      </div>

      <div className='mt-6'>
        <NaturalLanguageSummary
          leftEntry={leftEntry}
          rightEntry={rightEntry}
          summary={summary}
        />
      </div>

      <div className='mt-6'>
        <SemanticDiffInsights insights={insights} />
      </div>

      <div className='mt-6 grid gap-4 xl:grid-cols-2'>
        <CompareEntryHeader
          entry={leftEntry}
          tone='left'
          onSelectEntry={onSelectEntry}
          onRemoveCompareEntry={onRemoveCompareEntry}
        />

        <CompareEntryHeader
          entry={rightEntry}
          tone='right'
          onSelectEntry={onSelectEntry}
          onRemoveCompareEntry={onRemoveCompareEntry}
        />
      </div>

      <section
        className='mt-6 border p-5'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <h3
          className='text-lg font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Attribute diff
        </h3>

        <div className='mt-4'>
          <CompareAttributeRow
            label='Type'
            left={leftEntry.type}
            right={rightEntry.type}
          />
          <CompareAttributeRow
            label='Scale'
            left={leftEntry.scale}
            right={rightEntry.scale}
          />
          <CompareAttributeRow
            label='Domain'
            left={leftEntry.domain}
            right={rightEntry.domain}
          />
          <CompareAttributeRow
            label='Status'
            left={leftEntry.status}
            right={rightEntry.status}
          />
          <CompareAttributeRow
            label='Region'
            left={leftEntry.region}
            right={rightEntry.region}
          />
          <CompareAttributeRow
            label='Source'
            left={leftEntry.sourceCategory}
            right={rightEntry.sourceCategory}
          />
          <CompareAttributeRow
            label='Privacy'
            left={humanizeSemanticValue(leftEntry.privacyLevel)}
            right={humanizeSemanticValue(rightEntry.privacyLevel)}
          />
          <CompareAttributeRow
            label='Enclosure'
            left={humanizeSemanticValue(leftEntry.enclosureType)}
            right={humanizeSemanticValue(rightEntry.enclosureType)}
          />
          <CompareAttributeRow
            label='Circulation Role'
            left={humanizeSemanticValue(leftEntry.circulationRole)}
            right={humanizeSemanticValue(rightEntry.circulationRole)}
          />
          <CompareAttributeRow
            label='Social Role'
            left={humanizeSemanticValue(leftEntry.socialRole)}
            right={humanizeSemanticValue(rightEntry.socialRole)}
          />
          <CompareAttributeRow
            label='Spatial Logic'
            left={humanizeSemanticValue(leftEntry.spatialLogic)}
            right={humanizeSemanticValue(rightEntry.spatialLogic)}
          />
          <CompareAttributeRow
            label='Cultural Specificity'
            left={humanizeSemanticValue(leftEntry.culturalSpecificity)}
            right={humanizeSemanticValue(rightEntry.culturalSpecificity)}
          />
          <CompareAttributeRow
            label='Ritual Weight'
            left={humanizeSemanticValue(leftEntry.ritualWeight)}
            right={humanizeSemanticValue(rightEntry.ritualWeight)}
          />
          <CompareAttributeRow
            label='Climate Response'
            left={humanizeSemanticValue(leftEntry.climateResponse)}
            right={humanizeSemanticValue(rightEntry.climateResponse)}
          />
          <CompareAttributeRow
            label='Note'
            left={leftEntry.notes}
            right={rightEntry.notes}
          />
        </div>
      </section>

      <div className='mt-6 grid gap-6'>
        <CompareListBlock
          title='Synonym overlap'
          shared={semantic.synonymDiff.shared}
          leftOnly={semantic.synonymDiff.uniqueLeft}
          rightOnly={semantic.synonymDiff.uniqueRight}
        />

        <CompareListBlock
          title='Related-entry overlap'
          shared={semantic.relatedDiff.shared}
          leftOnly={semantic.relatedDiff.uniqueLeft}
          rightOnly={semantic.relatedDiff.uniqueRight}
        />
      </div>
    </section>
  );
}
