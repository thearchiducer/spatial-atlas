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

function getSemanticEdgeScore(baseEntry, candidate) {
  let score = 0;
  const reasons = [];

  function add(points, reason) {
    if (points > 0) {
      score += points;
      reasons.push(reason);
    }
  }

  add(baseEntry.type === candidate.type ? 12 : 0, "same type");
  add(baseEntry.domain === candidate.domain ? 10 : 0, "same domain");
  add(baseEntry.region === candidate.region ? 6 : 0, "same region");
  add(baseEntry.section === candidate.section ? 4 : 0, "same section");
  add(baseEntry.scale === candidate.scale ? 4 : 0, "same scale");
  add(
    baseEntry.sourceCategory === candidate.sourceCategory ? 3 : 0,
    "same source category",
  );

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
      "service|dwelling": 1,
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

  const synonymScore =
    countSharedValues(baseEntry.synonyms, candidate.synonyms) * 2;
  add(synonymScore, "shared synonyms");

  return {
    score,
    reasons,
  };
}

function classifyStrength(score) {
  if (score >= 45) return "strong";
  if (score >= 26) return "medium";
  return "light";
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function findEntryById(entries, id) {
  return entries.find((entry) => entry.id === id) || null;
}

function buildNode(entry, relation, edgeScore, edgeReasons) {
  return {
    id: entry.id,
    term: entry.term,
    type: entry.type,
    domain: entry.domain,
    scale: entry.scale,
    region: entry.region,

    privacyLevel: entry.privacyLevel,
    enclosureType: entry.enclosureType,
    circulationRole: entry.circulationRole,
    socialRole: entry.socialRole,
    spatialLogic: entry.spatialLogic,
    culturalSpecificity: entry.culturalSpecificity,
    ritualWeight: entry.ritualWeight,
    climateResponse: entry.climateResponse,

    relation,
    strength: classifyStrength(edgeScore),
    edgeScore,
    edgeReasons: edgeReasons.slice(0, 3),
  };
}

function sortNodesByWeight(nodes) {
  return [...nodes].sort((a, b) => {
    if (b.edgeScore !== a.edgeScore) return b.edgeScore - a.edgeScore;
    return a.term.localeCompare(b.term);
  });
}

function buildGraphCanvas(center, groups) {
  const width = 980;
  const height = 640;
  const centerX = width / 2;
  const centerY = height / 2;

  const relationOrder = [
    "related",
    "same-type",
    "same-domain",
    "same-region",
    "semantic-neighbor",
  ];

  const relationRadiusMap = {
    related: 170,
    "same-type": 250,
    "same-domain": 315,
    "same-region": 380,
    "semantic-neighbor": 445,
  };

  const relationNodes = relationOrder.flatMap(
    (relation) =>
      groups
        .find((group) => group.id === relation)
        ?.nodes.map((node) => ({ ...node, relation }))
        .slice(0, relation === "related" ? 6 : 8) || [],
  );

  const bucketCounts = relationOrder.reduce((accumulator, relation) => {
    accumulator[relation] = relationNodes.filter(
      (node) => node.relation === relation,
    ).length;
    return accumulator;
  }, {});

  const totalCount = Math.max(relationNodes.length, 1);
  const relationSeen = {};

  const nodes = relationNodes.map((node, index) => {
    relationSeen[node.relation] = (relationSeen[node.relation] || 0) + 1;

    const bucketIndex = relationSeen[node.relation] - 1;
    const bucketCount = Math.max(bucketCounts[node.relation] || 1, 1);

    const globalAngle = (Math.PI * 2 * index) / totalCount - Math.PI / 2;
    const localOffset =
      bucketCount === 1
        ? 0
        : ((bucketIndex / (bucketCount - 1)) * 0.9 - 0.45) * Math.PI;

    const angle = globalAngle + localOffset;
    const radius = relationRadiusMap[node.relation] || 300;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    return {
      ...node,
      x,
      y,
      radius:
        node.strength === "strong" ? 20 : node.strength === "medium" ? 16 : 13,
    };
  });

  const edges = nodes.map((node) => ({
    fromX: centerX,
    fromY: centerY,
    toX: node.x,
    toY: node.y,
    strength: node.strength,
    relation: node.relation,
  }));

  return {
    width,
    height,
    center: {
      ...center,
      x: centerX,
      y: centerY,
      radius: 28,
    },
    nodes,
    edges,
  };
}

export function buildEntryGraph(entries, selectedEntry) {
  if (!selectedEntry) {
    return {
      center: null,
      groups: [],
      allNodes: [],
      canvas: null,
    };
  }

  const relatedNodes = uniqueById(
    (selectedEntry.related || [])
      .map((item) => {
        const relatedId = typeof item === "string" ? item : item?.id;
        if (!relatedId) return null;

        const relatedEntry = findEntryById(entries, relatedId);
        if (!relatedEntry) return null;

        const semantic = getSemanticEdgeScore(selectedEntry, relatedEntry);

        return buildNode(relatedEntry, "related", semantic.score + 18, [
          "direct relation",
          ...semantic.reasons,
        ]);
      })
      .filter(Boolean),
  );

  const excludedIds = new Set([
    selectedEntry.id,
    ...relatedNodes.map((node) => node.id),
  ]);

  const candidateNodes = entries
    .filter((entry) => !excludedIds.has(entry.id))
    .map((entry) => {
      const semantic = getSemanticEdgeScore(selectedEntry, entry);

      let relation = "semantic-neighbor";
      let bonus = 0;

      if (entry.type === selectedEntry.type) {
        relation = "same-type";
        bonus = 10;
      } else if (entry.domain === selectedEntry.domain) {
        relation = "same-domain";
        bonus = 7;
      } else if (entry.region === selectedEntry.region) {
        relation = "same-region";
        bonus = 4;
      }

      return buildNode(
        entry,
        relation,
        semantic.score + bonus,
        semantic.reasons,
      );
    })
    .filter((node) => node.edgeScore >= 18);

  const sameTypeNodes = sortNodesByWeight(
    candidateNodes.filter((node) => node.relation === "same-type").slice(0, 8),
  );

  const sameDomainNodes = sortNodesByWeight(
    candidateNodes
      .filter((node) => node.relation === "same-domain")
      .slice(0, 8),
  );

  const sameRegionNodes = sortNodesByWeight(
    candidateNodes
      .filter((node) => node.relation === "same-region")
      .slice(0, 8),
  );

  const semanticNeighborNodes = sortNodesByWeight(
    candidateNodes
      .filter((node) => node.relation === "semantic-neighbor")
      .slice(0, 8),
  );

  const groups = [
    {
      id: "related",
      title: "Directly related",
      description: "Explicitly linked in the entry data model.",
      nodes: sortNodesByWeight(relatedNodes),
    },
    {
      id: "same-type",
      title: "Same type",
      description: "Taxonomically aligned spaces with semantic weighting.",
      nodes: sameTypeNodes,
    },
    {
      id: "same-domain",
      title: "Same domain",
      description: "Functionally adjacent spaces with semantic weighting.",
      nodes: sameDomainNodes,
    },
    {
      id: "same-region",
      title: "Same region",
      description: "Culturally or geographically adjacent spaces.",
      nodes: sameRegionNodes,
    },
    {
      id: "semantic-neighbor",
      title: "Semantic neighbors",
      description: "Strong matches discovered mainly through semantic scoring.",
      nodes: semanticNeighborNodes,
    },
  ].filter((group) => group.nodes.length > 0);

  const center = {
    id: selectedEntry.id,
    term: selectedEntry.term,
    type: selectedEntry.type,
    domain: selectedEntry.domain,
    scale: selectedEntry.scale,
    region: selectedEntry.region,
    privacyLevel: selectedEntry.privacyLevel,
    enclosureType: selectedEntry.enclosureType,
    circulationRole: selectedEntry.circulationRole,
    socialRole: selectedEntry.socialRole,
    spatialLogic: selectedEntry.spatialLogic,
    culturalSpecificity: selectedEntry.culturalSpecificity,
    ritualWeight: selectedEntry.ritualWeight,
    climateResponse: selectedEntry.climateResponse,
  };

  const allNodes = [
    ...relatedNodes,
    ...sameTypeNodes,
    ...sameDomainNodes,
    ...sameRegionNodes,
    ...semanticNeighborNodes,
  ];

  return {
    center,
    groups,
    allNodes,
    canvas: buildGraphCanvas(center, groups),
  };
}
