function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function countSharedValues(listA = [], listB = []) {
  const setB = new Set(listB.map((item) => String(item).toLowerCase()));
  return listA.reduce((count, item) => {
    return setB.has(String(item).toLowerCase()) ? count + 1 : count;
  }, 0);
}

function scoreOrdinalCloseness(left, right, orderedValues, pointsMap) {
  const leftIndex = orderedValues.indexOf(normalizeValue(left));
  const rightIndex = orderedValues.indexOf(normalizeValue(right));

  if (leftIndex === -1 || rightIndex === -1) return 0;

  const distance = Math.abs(leftIndex - rightIndex);
  return pointsMap[distance] || 0;
}

function scoreSetCompatibility(left, right, compatibilityMap) {
  const leftKey = normalizeValue(left);
  const rightKey = normalizeValue(right);

  if (leftKey === rightKey) {
    return compatibilityMap.exact || 0;
  }

  const forward = compatibilityMap[`${leftKey}|${rightKey}`];
  const backward = compatibilityMap[`${rightKey}|${leftKey}`];

  return forward ?? backward ?? 0;
}

function getSemanticAffinity(baseEntry, candidate) {
  let score = 0;
  const reasons = [];

  function add(points, label) {
    if (points > 0) {
      score += points;
      reasons.push(label);
    }
  }

  add(baseEntry.type === candidate.type ? 10 : 0, "same type");
  add(baseEntry.domain === candidate.domain ? 8 : 0, "same domain");
  add(baseEntry.region === candidate.region ? 6 : 0, "same region");
  add(baseEntry.section === candidate.section ? 4 : 0, "same section");
  add(baseEntry.scale === candidate.scale ? 4 : 0, "same scale");

  add(
    scoreOrdinalCloseness(
      baseEntry.privacyLevel,
      candidate.privacyLevel,
      ["public", "semi-public", "semi-private", "private", "restricted"],
      { 0: 8, 1: 5, 2: 2 },
    ),
    "privacy alignment",
  );

  add(
    scoreSetCompatibility(baseEntry.enclosureType, candidate.enclosureType, {
      exact: 7,
      "open|semi-open": 4,
      "semi-open|edge-conditioned": 4,
      "enclosed|linear-enclosed": 4,
      "enclosed|edge-conditioned": 2,
    }),
    "enclosure alignment",
  );

  add(
    scoreSetCompatibility(
      baseEntry.circulationRole,
      candidate.circulationRole,
      {
        exact: 7,
        "primary|secondary": 4,
        "threshold|nodal": 4,
        "primary|threshold": 2,
        "secondary|threshold": 2,
      },
    ),
    "circulation compatibility",
  );

  add(
    scoreSetCompatibility(baseEntry.socialRole, candidate.socialRole, {
      exact: 8,
      "reception|gathering": 4,
      "gathering|mixed": 4,
      "reception|mixed": 4,
      "movement|waiting": 3,
      "ritual|gathering": 3,
      "ritual|mixed": 2,
    }),
    "social role alignment",
  );

  add(
    scoreSetCompatibility(baseEntry.spatialLogic, candidate.spatialLogic, {
      exact: 7,
      "axial|linear": 4,
      "centralized|courtyard": 4,
      "perimeter|courtyard": 5,
      "transitional|nested": 3,
      "transitional|perimeter": 2,
      "distributed|centralized": 1,
    }),
    "spatial logic alignment",
  );

  add(
    scoreOrdinalCloseness(
      baseEntry.culturalSpecificity,
      candidate.culturalSpecificity,
      ["generalized", "regional", "highly-specific"],
      { 0: 5, 1: 3 },
    ),
    "cultural specificity alignment",
  );

  add(
    scoreOrdinalCloseness(
      baseEntry.ritualWeight,
      candidate.ritualWeight,
      ["none", "low", "medium", "high"],
      { 0: 5, 1: 3, 2: 1 },
    ),
    "ritual alignment",
  );

  add(
    scoreSetCompatibility(
      baseEntry.climateResponse,
      candidate.climateResponse,
      {
        exact: 5,
        "thermal-buffer|shade-oriented": 2,
        "thermal-buffer|ventilation-oriented": 2,
        "courtyard-tempered|shade-oriented": 3,
        "courtyard-tempered|ventilation-oriented": 3,
      },
    ),
    "climate alignment",
  );

  const synonymScore = countSharedValues(
    baseEntry.synonyms || [],
    candidate.synonyms || [],
  );
  add(Math.min(synonymScore * 2, 6), "shared synonyms");

  return {
    score,
    reasons,
  };
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function summarizeCluster(entries) {
  const privacySet = unique(entries.map((entry) => entry.privacyLevel));
  const socialSet = unique(entries.map((entry) => entry.socialRole));
  const logicSet = unique(entries.map((entry) => entry.spatialLogic));
  const domainSet = unique(entries.map((entry) => entry.domain));
  const typeSet = unique(entries.map((entry) => entry.type));
  const regionSet = unique(entries.map((entry) => entry.region));

  const summaryBits = [];

  if (typeSet.length === 1) summaryBits.push(typeSet[0]);
  if (domainSet.length === 1) summaryBits.push(domainSet[0]);
  if (privacySet.length === 1) summaryBits.push(privacySet[0]);
  if (socialSet.length === 1) summaryBits.push(socialSet[0]);
  if (logicSet.length === 1) summaryBits.push(logicSet[0]);

  return {
    summaryLabel: summaryBits.length
      ? summaryBits.join(" · ")
      : "Mixed semantic family",
    typeSet,
    domainSet,
    privacySet,
    socialSet,
    logicSet,
    regionSet,
  };
}

function buildGroupTitle(key, labelPrefix) {
  return `${labelPrefix}: ${key.replace(/-/g, " ")}`;
}

function sortEntriesWithinCluster(entries) {
  return [...entries].sort((a, b) => {
    if ((b.__clusterScore || 0) !== (a.__clusterScore || 0)) {
      return (b.__clusterScore || 0) - (a.__clusterScore || 0);
    }
    return a.term.localeCompare(b.term);
  });
}

function buildClusterEntries(entries, anchorEntries) {
  return entries.map((entry) => {
    const affinities = anchorEntries
      .filter((anchor) => anchor.id !== entry.id)
      .map((anchor) => getSemanticAffinity(entry, anchor));

    const score = average(affinities.map((item) => item.score));
    const topReasons = unique(
      affinities.flatMap((item) => item.reasons).slice(0, 12),
    ).slice(0, 4);

    return {
      ...entry,
      __clusterScore: Math.round(score),
      __clusterReasons: topReasons,
    };
  });
}

function buildClusterGroup(id, title, description, entries) {
  const summarized = summarizeCluster(entries);

  return {
    id,
    title,
    description,
    summaryLabel: summarized.summaryLabel,
    metrics: {
      count: entries.length,
      types: summarized.typeSet.length,
      domains: summarized.domainSet.length,
      regions: summarized.regionSet.length,
    },
    entries: sortEntriesWithinCluster(entries),
  };
}

function groupBy(entries, selector) {
  const map = new Map();

  entries.forEach((entry) => {
    const key = selector(entry);
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(entry);
  });

  return map;
}

export function buildSemanticClusters(entries = []) {
  if (!entries.length) {
    return {
      families: [],
      layout: null,
    };
  }

  const domainGroups = [...groupBy(entries, (entry) => entry.domain).entries()]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) =>
      buildClusterGroup(
        `domain-${normalizeValue(key)}`,
        buildGroupTitle(key, "Domain cluster"),
        "Entries grouped by shared domain, then re-ranked by semantic affinity inside the cluster.",
        buildClusterEntries(items, items),
      ),
    );

  const socialLogicGroups = [
    ...groupBy(entries, (entry) =>
      entry.socialRole && entry.spatialLogic
        ? `${entry.socialRole} / ${entry.spatialLogic}`
        : null,
    ).entries(),
  ]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) =>
      buildClusterGroup(
        `social-logic-${normalizeValue(key)}`,
        buildGroupTitle(key, "Social + logic cluster"),
        "Entries grouped by matching social role and spatial logic.",
        buildClusterEntries(items, items),
      ),
    );

  const privacyClimateGroups = [
    ...groupBy(entries, (entry) =>
      entry.privacyLevel && entry.climateResponse
        ? `${entry.privacyLevel} / ${entry.climateResponse}`
        : null,
    ).entries(),
  ]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) =>
      buildClusterGroup(
        `privacy-climate-${normalizeValue(key)}`,
        buildGroupTitle(key, "Privacy + climate cluster"),
        "Entries grouped by privacy condition and climatic response.",
        buildClusterEntries(items, items),
      ),
    );

  const regionCultureGroups = [
    ...groupBy(entries, (entry) =>
      entry.region && entry.culturalSpecificity
        ? `${entry.region} / ${entry.culturalSpecificity}`
        : null,
    ).entries(),
  ]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) =>
      buildClusterGroup(
        `region-culture-${normalizeValue(key)}`,
        buildGroupTitle(key, "Region + culture cluster"),
        "Entries grouped by regional context and cultural specificity.",
        buildClusterEntries(items, items),
      ),
    );

  const families = [
    {
      id: "domain-families",
      title: "Domain families",
      description:
        "Broad programmatic families shaped by shared domain membership.",
      clusters: domainGroups
        .sort((a, b) => b.entries.length - a.entries.length)
        .slice(0, 8),
    },
    {
      id: "social-logic-families",
      title: "Social + logic families",
      description:
        "Clusters where social role and spatial logic overlap strongly.",
      clusters: socialLogicGroups
        .sort((a, b) => b.entries.length - a.entries.length)
        .slice(0, 8),
    },
    {
      id: "privacy-climate-families",
      title: "Privacy + climate families",
      description:
        "Clusters organized around privacy structure and environmental behavior.",
      clusters: privacyClimateGroups
        .sort((a, b) => b.entries.length - a.entries.length)
        .slice(0, 8),
    },
    {
      id: "region-culture-families",
      title: "Region + culture families",
      description:
        "Clusters organized by region and cultural specificity together.",
      clusters: regionCultureGroups
        .sort((a, b) => b.entries.length - a.entries.length)
        .slice(0, 8),
    },
  ].filter((family) => family.clusters.length > 0);

  const layout = {
    familyCount: families.length,
    clusterCount: families.reduce(
      (sum, family) => sum + family.clusters.length,
      0,
    ),
    entryCount: entries.length,
  };

  return {
    families,
    layout,
  };
}
