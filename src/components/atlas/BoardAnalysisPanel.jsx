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

function MetricChip({ label, value, tone = "neutral" }) {
  let style = {
    borderColor: "var(--border-color)",
    background: "var(--bg-muted)",
    color: "var(--text-secondary)",
  };

  if (tone === "danger") {
    style = {
      borderColor: "var(--tone-danger-border)",
      background: "var(--tone-danger-bg)",
      color: "var(--tone-danger-text)",
    };
  } else if (tone === "warning") {
    style = {
      borderColor: "var(--tone-warning-border)",
      background: "var(--tone-warning-bg)",
      color: "var(--tone-warning-text)",
    };
  } else if (tone === "good") {
    style = {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      color: "var(--tone-success-text)",
    };
  }

  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={style}
    >
      {label} · {value}
    </span>
  );
}

function AnalysisCard({ title, description, tone = "neutral" }) {
  let style = {
    borderColor: "var(--border-color)",
    background: "var(--bg-muted)",
    titleColor: "var(--text-primary)",
    bodyColor: "var(--text-secondary)",
  };

  if (tone === "danger") {
    style = {
      borderColor: "var(--tone-danger-border)",
      background: "var(--tone-danger-bg)",
      titleColor: "var(--tone-danger-text)",
      bodyColor: "var(--tone-danger-text)",
    };
  } else if (tone === "warning") {
    style = {
      borderColor: "var(--tone-warning-border)",
      background: "var(--tone-warning-bg)",
      titleColor: "var(--tone-warning-text)",
      bodyColor: "var(--tone-warning-text)",
    };
  } else if (tone === "good") {
    style = {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      titleColor: "var(--tone-success-text)",
      bodyColor: "var(--tone-success-text)",
    };
  } else if (tone === "info") {
    style = {
      borderColor: "var(--tone-info-border)",
      background: "var(--tone-info-bg)",
      titleColor: "var(--tone-info-text)",
      bodyColor: "var(--tone-info-text)",
    };
  }

  return (
    <div
      className='border p-4'
      style={{
        borderColor: style.borderColor,
        background: style.background,
      }}
    >
      <h4 className='text-sm font-semibold' style={{ color: style.titleColor }}>
        {title}
      </h4>
      <p
        className='mt-2 text-sm leading-relaxed'
        style={{ color: style.bodyColor }}
      >
        {description}
      </p>
    </div>
  );
}

function SectionBlock({
  index,
  title,
  description,
  items,
  emptyLabel,
  tone = "neutral",
}) {
  return (
    <section
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className='grid gap-3 md:grid-cols-[72px_minmax(0,1fr)] md:items-end'>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.18em]'
            style={{ color: "var(--text-muted)" }}
          >
            {index}
          </div>

          <div>
            <h3
              className='text-base font-semibold tracking-tight'
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h3>
            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className='mt-4 grid gap-3'>
        {items.length ? (
          items.map((item) => (
            <AnalysisCard
              key={item.title + item.description}
              title={item.title}
              description={item.description}
              tone={item.tone || tone}
            />
          ))
        ) : (
          <div
            className='border p-4 text-sm'
            style={{
              borderColor: "var(--tone-success-border)",
              background: "var(--tone-success-bg)",
              color: "var(--tone-success-text)",
            }}
          >
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function uniqueValues(entries, key) {
  return [...new Set(entries.map((entry) => entry[key]).filter(Boolean))];
}

function buildRedundancySignals(entries) {
  const signals = [];
  const groups = new Map();

  entries.forEach((entry) => {
    const key = [
      normalizeValue(entry.type),
      normalizeValue(entry.domain),
      normalizeValue(entry.socialRole),
      normalizeValue(entry.privacyLevel),
    ].join("|");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(entry);
  });

  groups.forEach((group) => {
    if (group.length < 2) return;

    signals.push({
      title: "Possible redundancy cluster",
      description:
        group.map((entry) => entry.term).join(", ") +
        " occupy very similar semantic territory and may duplicate each other unless they serve clearly distinct roles.",
      tone: "warning",
    });
  });

  return signals.slice(0, 6);
}

function buildHierarchyGapSignals(entries) {
  const signals = [];
  const privacyLevels = uniqueValues(entries, "privacyLevel");

  const hasPublic = privacyLevels.includes("public");
  const hasSemiPublic = privacyLevels.includes("semi-public");
  const hasSemiPrivate = privacyLevels.includes("semi-private");
  const hasPrivate =
    privacyLevels.includes("private") || privacyLevels.includes("restricted");

  if (hasPublic && hasPrivate && !hasSemiPublic && !hasSemiPrivate) {
    signals.push({
      title: "Missing intermediate privacy transition",
      description:
        "The board jumps from public to private conditions without a clear intermediate layer. Consider adding a threshold, circulation buffer, reception layer, or semi-private transition.",
      tone: "danger",
    });
  }

  if (hasPublic && !hasSemiPublic && entries.length >= 3) {
    signals.push({
      title: "Weak public-to-internal gradient",
      description:
        "There is no explicit semi-public layer in the board. Entry, reception, or controlled gathering logic may be underdeveloped.",
      tone: "warning",
    });
  }

  if (hasSemiPrivate && !hasPrivate && entries.length >= 3) {
    signals.push({
      title: "Protected end condition is unresolved",
      description:
        "The board reaches semi-private territory but does not define a clearly protected endpoint such as private or restricted space.",
      tone: "warning",
    });
  }

  return signals;
}

function buildMissingSystemSignals(entries) {
  const signals = [];

  const types = new Set(entries.map((entry) => entry.type));
  const socialRoles = new Set(entries.map((entry) => entry.socialRole));
  const privacyLevels = new Set(entries.map((entry) => entry.privacyLevel));

  if (!types.has("Threshold")) {
    signals.push({
      title: "Threshold element missing",
      description:
        "No threshold-type entry is present. Access control, transition, and arrival sequencing may be weak.",
      tone: "warning",
    });
  }

  if (!types.has("Circulation")) {
    signals.push({
      title: "Circulation element missing",
      description:
        "No circulation-type entry is present. Movement structure may be implicit rather than designed.",
      tone: "danger",
    });
  }

  if (!socialRoles.has("gathering") && !socialRoles.has("mixed")) {
    signals.push({
      title: "Gathering capacity missing",
      description:
        "The board currently lacks a strong gathering-oriented or mixed social space.",
      tone: "warning",
    });
  }

  if (!privacyLevels.has("private") && !privacyLevels.has("restricted")) {
    signals.push({
      title: "Protected zone missing",
      description:
        "No clearly private or restricted entry is present, so the board may lack a protected destination condition.",
      tone: "warning",
    });
  }

  return signals;
}

function buildConflictSignals(entries) {
  const signals = [];
  const domains = uniqueValues(entries, "domain");
  const scales = uniqueValues(entries, "scale");
  const climateResponses = uniqueValues(entries, "climateResponse");
  const culturalSpecificity = uniqueValues(entries, "culturalSpecificity");

  if (domains.length >= 4) {
    signals.push({
      title: "Domain spread is broad",
      description:
        "This board spans many domains (" +
        domains.join(", ") +
        "). That may be intentional, but it can also indicate conceptual drift.",
      tone: "warning",
    });
  }

  if (scales.includes("Urban") && scales.includes("Interior")) {
    signals.push({
      title: "Scale span is very wide",
      description:
        "The board mixes interior and urban scales. Check whether these entries belong in one project logic or should be split into separate layers.",
      tone: "warning",
    });
  }

  if (climateResponses.length >= 4) {
    signals.push({
      title: "Climate strategy is fragmented",
      description:
        "Multiple climate responses appear without a dominant pattern. Environmental logic may need consolidation.",
      tone: "warning",
    });
  }

  if (
    culturalSpecificity.includes("highly-specific") &&
    culturalSpecificity.includes("generalized")
  ) {
    signals.push({
      title: "Cultural specificity tension",
      description:
        "The board mixes highly-specific and generalized entries. Check whether the project is aiming for universal logic, regional specificity, or a deliberate hybrid.",
      tone: "warning",
    });
  }

  return signals;
}

function buildStrengthSignals(entries) {
  const signals = [];

  const types = new Set(entries.map((entry) => entry.type));
  const privacyLevels = new Set(entries.map((entry) => entry.privacyLevel));
  const socialRoles = new Set(entries.map((entry) => entry.socialRole));

  if (
    types.has("Threshold") &&
    types.has("Circulation") &&
    (privacyLevels.has("semi-public") || privacyLevels.has("semi-private")) &&
    (privacyLevels.has("private") || privacyLevels.has("restricted"))
  ) {
    signals.push({
      title: "Privacy hierarchy is legible",
      description:
        "The board contains transition, movement, and protected conditions, which suggests a readable privacy gradient.",
      tone: "good",
    });
  }

  if (socialRoles.has("gathering") && socialRoles.has("movement")) {
    signals.push({
      title: "Social use and flow are both represented",
      description:
        "The board contains both gathering and movement roles, supporting interaction as well as circulation logic.",
      tone: "good",
    });
  }

  if (entries.length >= 4 && uniqueValues(entries, "domain").length <= 2) {
    signals.push({
      title: "Domain focus is coherent",
      description:
        "Most entries remain within one or two domains, which supports a more disciplined project logic.",
      tone: "good",
    });
  }

  return signals;
}

function buildDirectContradictionSignals(entries) {
  const signals = [];

  entries.forEach((entry) => {
    const term = entry.term || entry.id || "Entry";
    const privacy = normalizeValue(entry.privacyLevel);
    const enclosure = normalizeValue(entry.enclosureType);
    const socialRole = normalizeValue(entry.socialRole);
    const circulationRole = normalizeValue(entry.circulationRole);
    const type = normalizeValue(entry.type);
    const ritualWeight = normalizeValue(entry.ritualWeight);
    const domain = normalizeValue(entry.domain);
    const scale = normalizeValue(entry.scale);

    if (
      (privacy === "private" || privacy === "restricted") &&
      socialRole === "gathering"
    ) {
      signals.push({
        title: term + ": protected yet gathering-oriented",
        description:
          "This entry combines a highly protected privacy condition with a gathering role. That is possible, but it usually needs a clear explanation such as family-only gathering, restricted assembly, or ritual exclusivity.",
        tone: "danger",
      });
    }

    if (
      (privacy === "private" || privacy === "restricted") &&
      enclosure === "open"
    ) {
      signals.push({
        title: term + ": private but open",
        description:
          "This entry is coded as private or restricted while also being fully open. That usually weakens territorial control unless the privacy is social rather than physical.",
        tone: "danger",
      });
    }

    if (type === "circulation" && circulationRole === "none") {
      signals.push({
        title: term + ": circulation type with no circulation role",
        description:
          "This entry is classified as circulation, but its circulation role is set to none. The semantic model is internally inconsistent.",
        tone: "danger",
      });
    }

    if (type === "threshold" && circulationRole === "none") {
      signals.push({
        title: term + ": threshold type with no transition role",
        description:
          "A threshold usually mediates movement, control, or access. Setting its circulation role to none creates a contradiction in how the entry is described.",
        tone: "danger",
      });
    }

    if (type === "open space" && enclosure === "enclosed") {
      signals.push({
        title: term + ": open-space type with enclosed condition",
        description:
          "This entry is typed as open space but described as enclosed. That may indicate either a type mismatch or an enclosure field that should be revised.",
        tone: "danger",
      });
    }

    if (domain === "religious" && ritualWeight === "none") {
      signals.push({
        title: term + ": religious domain with no ritual weight",
        description:
          "An entry in the religious domain with ritual weight set to none may be semantically under-specified or conceptually inconsistent.",
        tone: "warning",
      });
    }

    if (scale === "urban" && privacy === "restricted" && enclosure === "open") {
      signals.push({
        title: term + ": urban, open, yet restricted",
        description:
          "At urban scale, an open condition paired with restricted privacy is a strong contradiction unless access control is procedural rather than spatial.",
        tone: "warning",
      });
    }
  });

  return signals.slice(0, 10);
}

function buildBoardTensionSignals(entries) {
  const signals = [];

  const privacyLevels = uniqueValues(entries, "privacyLevel");
  const enclosureTypes = uniqueValues(entries, "enclosureType");
  const socialRoles = uniqueValues(entries, "socialRole");
  const domains = uniqueValues(entries, "domain");
  const scales = uniqueValues(entries, "scale");

  if (
    privacyLevels.includes("public") &&
    privacyLevels.includes("restricted") &&
    !privacyLevels.includes("semi-public") &&
    !privacyLevels.includes("semi-private")
  ) {
    signals.push({
      title: "Privacy polarity without mediation",
      description:
        "The board contains both public and restricted conditions, but no intermediate privacy layer. This produces a hard conceptual jump rather than a controlled sequence.",
      tone: "danger",
    });
  }

  if (
    enclosureTypes.includes("open") &&
    enclosureTypes.includes("enclosed") &&
    !entries.some((entry) => normalizeValue(entry.type) === "threshold")
  ) {
    signals.push({
      title: "Open-enclosed contradiction without threshold logic",
      description:
        "The board mixes open and enclosed territorial conditions, but no threshold element is present to explain the transition between them.",
      tone: "warning",
    });
  }

  if (
    socialRoles.includes("gathering") &&
    socialRoles.includes("dwelling") &&
    !entries.some(
      (entry) => normalizeValue(entry.privacyLevel) === "semi-private",
    )
  ) {
    signals.push({
      title: "Domestic-social tension lacks semi-private buffer",
      description:
        "The board combines dwelling and gathering roles without a semi-private mediator. That can create ambiguity between intimate and collective use.",
      tone: "warning",
    });
  }

  if (domains.includes("religious") && domains.includes("commercial")) {
    signals.push({
      title: "Religious-commercial domain tension",
      description:
        "The board mixes religious and commercial domains. This can be valid, but it usually requires explicit justification around access, ritual priority, and social behavior.",
      tone: "warning",
    });
  }

  if (scales.includes("urban") && scales.includes("interior")) {
    signals.push({
      title: "Urban-interior coupling needs hierarchy",
      description:
        "The board spans urban and interior scales at once. That is powerful, but it should be structured as a layered system rather than one flat set of entries.",
      tone: "warning",
    });
  }

  return signals.slice(0, 8);
}

function buildRepairSuggestions(entries, contradictionSignals, tensionSignals) {
  const suggestions = [];
  const types = new Set(entries.map((entry) => entry.type));
  const privacyLevels = new Set(entries.map((entry) => entry.privacyLevel));
  const enclosureTypes = new Set(entries.map((entry) => entry.enclosureType));
  const socialRoles = new Set(entries.map((entry) => entry.socialRole));

  if (
    contradictionSignals.some((item) =>
      item.title.toLowerCase().includes("private but open"),
    ) ||
    tensionSignals.some((item) =>
      item.title.toLowerCase().includes("open-enclosed contradiction"),
    )
  ) {
    suggestions.push({
      title: "Add threshold or edge-conditioned mediation",
      description:
        "Introduce a threshold, vestibule, porch, veranda, engawa, or edge-conditioned layer to explain how open and protected conditions connect.",
      tone: "info",
    });
  }

  if (
    privacyLevels.has("public") &&
    privacyLevels.has("restricted") &&
    !privacyLevels.has("semi-public") &&
    !privacyLevels.has("semi-private")
  ) {
    suggestions.push({
      title: "Insert intermediate privacy layer",
      description:
        "Add a semi-public or semi-private entry to create a legible privacy gradient between exposed and protected conditions.",
      tone: "info",
    });
  }

  if (!types.has("Circulation")) {
    suggestions.push({
      title: "Add a circulation spine",
      description:
        "Introduce a corridor, passage, gallery, street, path, or similar movement element to resolve sequencing contradictions.",
      tone: "info",
    });
  }

  if (
    socialRoles.has("gathering") &&
    socialRoles.has("dwelling") &&
    !privacyLevels.has("semi-private")
  ) {
    suggestions.push({
      title: "Buffer dwelling from gathering",
      description:
        "Use semi-private transitional spaces such as lobby, salon edge, family sitting, decompression zone, or screened court to prevent abrupt overlap.",
      tone: "info",
    });
  }

  if (
    enclosureTypes.has("open") &&
    enclosureTypes.has("enclosed") &&
    !types.has("Threshold")
  ) {
    suggestions.push({
      title: "Make enclosure transition explicit",
      description:
        "Add a threshold-type or edge-conditioned entry so enclosure changes become intentional rather than contradictory.",
      tone: "info",
    });
  }

  return suggestions.slice(0, 6);
}

function buildContradictionAnalysis(entries) {
  if (!entries.length) {
    return {
      directContradictions: [],
      boardTensions: [],
      repairSuggestions: [],
    };
  }

  const directContradictions = buildDirectContradictionSignals(entries);
  const boardTensions = buildBoardTensionSignals(entries);
  const repairSuggestions = buildRepairSuggestions(
    entries,
    directContradictions,
    boardTensions,
  );

  return {
    directContradictions,
    boardTensions,
    repairSuggestions,
  };
}

function buildBoardAnalysis(entries) {
  if (!entries.length) {
    return {
      metrics: {
        entryCount: 0,
        redundancyCount: 0,
        hierarchyGapCount: 0,
        missingSystemCount: 0,
        conflictCount: 0,
        strengthCount: 0,
      },
      redundancySignals: [],
      hierarchyGapSignals: [],
      missingSystemSignals: [],
      conflictSignals: [],
      strengthSignals: [],
    };
  }

  const redundancySignals = buildRedundancySignals(entries);
  const hierarchyGapSignals = buildHierarchyGapSignals(entries);
  const missingSystemSignals = buildMissingSystemSignals(entries);
  const conflictSignals = buildConflictSignals(entries);
  const strengthSignals = buildStrengthSignals(entries);

  return {
    metrics: {
      entryCount: entries.length,
      redundancyCount: redundancySignals.length,
      hierarchyGapCount: hierarchyGapSignals.length,
      missingSystemCount: missingSystemSignals.length,
      conflictCount: conflictSignals.length,
      strengthCount: strengthSignals.length,
    },
    redundancySignals,
    hierarchyGapSignals,
    missingSystemSignals,
    conflictSignals,
    strengthSignals,
  };
}

export default function BoardAnalysisPanel({ activeBoard = null }) {
  const boardEntries =
    activeBoard && Array.isArray(activeBoard.entries)
      ? activeBoard.entries
      : [];

  const analysis = buildBoardAnalysis(boardEntries);
  const contradiction = buildContradictionAnalysis(boardEntries);

  if (!activeBoard) {
    return (
      <section
        className='border p-5'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        {annotationLabel("Board analysis · contradiction diagnostic")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Spatial logic diagnostic
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Open a board to inspect redundancy, hierarchy gaps, missing systems,
          semantic drift, and contradictions in the current spatial logic.
        </p>
      </section>
    );
  }
  const totalWarnings =
    analysis.metrics.redundancyCount +
    analysis.metrics.hierarchyGapCount +
    analysis.metrics.missingSystemCount +
    analysis.metrics.conflictCount;

  const contradictionCount =
    contradiction.directContradictions.length +
    contradiction.boardTensions.length;

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
        {annotationLabel("Board analysis · contradiction diagnostic")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Spatial logic diagnostic
        </h2>

        <p
          className='mt-2 max-w-3xl text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Diagnose the active board for redundancy, missing layers, semantic
          tension, structural strengths, and direct contradictions in the
          current spatial logic.
        </p>
      </div>

      <div className='mt-5 flex flex-wrap gap-2'>
        <MetricChip label='Entries' value={analysis.metrics.entryCount} />
        <MetricChip
          label='Warnings'
          value={totalWarnings}
          tone={totalWarnings > 0 ? "warning" : "good"}
        />
        <MetricChip
          label='Contradictions'
          value={contradictionCount}
          tone={contradictionCount > 0 ? "danger" : "good"}
        />
        <MetricChip
          label='Strengths'
          value={analysis.metrics.strengthCount}
          tone={analysis.metrics.strengthCount > 0 ? "good" : "neutral"}
        />
      </div>

      <div className='mt-6 space-y-4'>
        <SectionBlock
          index='01'
          title='Internal contradictions'
          description='Finds entries whose own semantic fields conflict internally.'
          items={contradiction.directContradictions}
          emptyLabel='No direct entry-level contradictions detected.'
          tone='danger'
        />

        <SectionBlock
          index='02'
          title='System tensions'
          description='Finds contradictions that emerge only when entries are read together as one system.'
          items={contradiction.boardTensions}
          emptyLabel='No major board-level contradiction patterns detected.'
          tone='warning'
        />

        <SectionBlock
          index='03'
          title='Repair strategies'
          description='Suggests how to resolve contradictions through added layers, mediators, or stronger hierarchy.'
          items={contradiction.repairSuggestions}
          emptyLabel='No repair strategies are needed right now.'
          tone='info'
        />

        <SectionBlock
          index='04'
          title='Hierarchy gaps'
          description='Checks whether the board contains missing transitions, weak gradients, or unresolved protected endpoints.'
          items={analysis.hierarchyGapSignals}
          emptyLabel='No major hierarchy gaps detected.'
          tone='danger'
        />

        <SectionBlock
          index='05'
          title='Missing spatial systems'
          description='Checks for absent threshold, circulation, gathering, or protected-zone logic.'
          items={analysis.missingSystemSignals}
          emptyLabel='No major missing-system warnings detected.'
          tone='warning'
        />

        <SectionBlock
          index='06'
          title='Redundancy clusters'
          description='Flags entries that may occupy nearly the same semantic role.'
          items={analysis.redundancySignals}
          emptyLabel='No major redundancy clusters detected.'
          tone='warning'
        />

        <SectionBlock
          index='07'
          title='Semantic drift'
          description='Looks for broad domain drift, scale spread, fragmented climate logic, or cultural specificity tension.'
          items={analysis.conflictSignals}
          emptyLabel='No major semantic conflicts detected.'
          tone='warning'
        />

        <SectionBlock
          index='08'
          title='Structural strengths'
          description='Highlights where the board already demonstrates good architectural structure.'
          items={analysis.strengthSignals}
          emptyLabel='No major strengths recognized yet. That usually means the board is still early and incomplete.'
          tone='good'
        />
      </div>
    </section>
  );
}
