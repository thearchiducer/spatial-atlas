function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function scoreExactMatch(left, right, points) {
  if (!left || !right) return 0;
  return normalizeValue(left) === normalizeValue(right) ? points : 0;
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

  if (!leftKey || !rightKey) return 0;

  if (leftKey === rightKey) {
    return compatibilityMap.exact || 0;
  }

  const forward = compatibilityMap[leftKey + "|" + rightKey];
  const backward = compatibilityMap[rightKey + "|" + leftKey];

  return forward || backward || 0;
}

function addBreakdown(breakdown, label, points) {
  if (points > 0) {
    breakdown.push({ label, points });
  }
}

function countFilledIntentFields(intent) {
  return Object.keys(intent).reduce((count, key) => {
    return intent[key] ? count + 1 : count;
  }, 0);
}

function getIntentSummary(intent) {
  const parts = [];

  if (intent.domain) parts.push(intent.domain);
  if (intent.scale) parts.push(intent.scale);
  if (intent.privacyLevel) parts.push(intent.privacyLevel);
  if (intent.socialRole) parts.push(intent.socialRole);
  if (intent.spatialLogic) parts.push(intent.spatialLogic);
  if (intent.climateResponse) parts.push(intent.climateResponse);

  return parts.length ? parts.join(" · ") : "No intent selected";
}

function getIntentBreakdown(entry, intent) {
  const breakdown = [];

  addBreakdown(
    breakdown,
    "domain match",
    scoreExactMatch(entry.domain, intent.domain, 10),
  );

  addBreakdown(
    breakdown,
    "scale match",
    scoreExactMatch(entry.scale, intent.scale, 7),
  );

  addBreakdown(
    breakdown,
    "region match",
    scoreExactMatch(entry.region, intent.region, 6),
  );

  addBreakdown(
    breakdown,
    "privacy alignment",
    scoreOrdinalCloseness(
      entry.privacyLevel,
      intent.privacyLevel,
      ["public", "semi-public", "semi-private", "private", "restricted"],
      { 0: 10, 1: 6, 2: 2 },
    ),
  );

  addBreakdown(
    breakdown,
    "enclosure alignment",
    scoreSetCompatibility(entry.enclosureType, intent.enclosureType, {
      exact: 8,
      "open|semi-open": 4,
      "semi-open|edge-conditioned": 4,
      "enclosed|linear-enclosed": 4,
      "enclosed|edge-conditioned": 2,
    }),
  );

  addBreakdown(
    breakdown,
    "circulation fit",
    scoreSetCompatibility(entry.circulationRole, intent.circulationRole, {
      exact: 8,
      "primary|secondary": 4,
      "threshold|nodal": 4,
      "primary|threshold": 2,
      "secondary|threshold": 2,
    }),
  );

  addBreakdown(
    breakdown,
    "social role fit",
    scoreSetCompatibility(entry.socialRole, intent.socialRole, {
      exact: 10,
      "reception|gathering": 4,
      "gathering|mixed": 4,
      "reception|mixed": 4,
      "movement|waiting": 3,
      "ritual|gathering": 3,
      "ritual|mixed": 2,
    }),
  );

  addBreakdown(
    breakdown,
    "spatial logic fit",
    scoreSetCompatibility(entry.spatialLogic, intent.spatialLogic, {
      exact: 9,
      "axial|linear": 4,
      "centralized|courtyard": 4,
      "perimeter|courtyard": 5,
      "transitional|nested": 3,
      "transitional|perimeter": 2,
      "distributed|centralized": 1,
    }),
  );

  addBreakdown(
    breakdown,
    "cultural specificity fit",
    scoreOrdinalCloseness(
      entry.culturalSpecificity,
      intent.culturalSpecificity,
      ["generalized", "regional", "highly-specific"],
      { 0: 6, 1: 3 },
    ),
  );

  addBreakdown(
    breakdown,
    "ritual fit",
    scoreOrdinalCloseness(
      entry.ritualWeight,
      intent.ritualWeight,
      ["none", "low", "medium", "high"],
      { 0: 6, 1: 3, 2: 1 },
    ),
  );

  addBreakdown(
    breakdown,
    "climate fit",
    scoreSetCompatibility(entry.climateResponse, intent.climateResponse, {
      exact: 8,
      "thermal-buffer|shade-oriented": 3,
      "thermal-buffer|ventilation-oriented": 3,
      "courtyard-tempered|shade-oriented": 4,
      "courtyard-tempered|ventilation-oriented": 4,
    }),
  );

  return breakdown;
}

function getConflictBreakdown(entry, intent) {
  const conflicts = [];

  function addConflict(label, penalty, condition) {
    if (condition) {
      conflicts.push({ label, penalty });
    }
  }

  addConflict(
    "privacy conflict",
    7,
    intent.privacyLevel &&
      entry.privacyLevel &&
      Math.abs(
        [
          "public",
          "semi-public",
          "semi-private",
          "private",
          "restricted",
        ].indexOf(normalizeValue(intent.privacyLevel)) -
          [
            "public",
            "semi-public",
            "semi-private",
            "private",
            "restricted",
          ].indexOf(normalizeValue(entry.privacyLevel)),
      ) >= 3,
  );

  addConflict(
    "domain conflict",
    6,
    intent.domain &&
      entry.domain &&
      normalizeValue(intent.domain) !== normalizeValue(entry.domain),
  );

  addConflict(
    "social role conflict",
    6,
    intent.socialRole &&
      entry.socialRole &&
      normalizeValue(intent.socialRole) !== normalizeValue(entry.socialRole) &&
      !scoreSetCompatibility(entry.socialRole, intent.socialRole, {
        exact: 1,
        "reception|gathering": 1,
        "gathering|mixed": 1,
        "reception|mixed": 1,
        "movement|waiting": 1,
        "ritual|gathering": 1,
        "ritual|mixed": 1,
      }),
  );

  addConflict(
    "spatial logic conflict",
    5,
    intent.spatialLogic &&
      entry.spatialLogic &&
      normalizeValue(intent.spatialLogic) !==
        normalizeValue(entry.spatialLogic) &&
      !scoreSetCompatibility(entry.spatialLogic, intent.spatialLogic, {
        exact: 1,
        "axial|linear": 1,
        "centralized|courtyard": 1,
        "perimeter|courtyard": 1,
        "transitional|nested": 1,
        "transitional|perimeter": 1,
      }),
  );

  addConflict(
    "climate conflict",
    4,
    intent.climateResponse &&
      entry.climateResponse &&
      normalizeValue(intent.climateResponse) !==
        normalizeValue(entry.climateResponse) &&
      !scoreSetCompatibility(entry.climateResponse, intent.climateResponse, {
        exact: 1,
        "thermal-buffer|shade-oriented": 1,
        "thermal-buffer|ventilation-oriented": 1,
        "courtyard-tempered|shade-oriented": 1,
        "courtyard-tempered|ventilation-oriented": 1,
      }),
  );

  return conflicts;
}

function buildRationale(entry, intent) {
  const reasons = [];

  if (intent.privacyLevel && entry.privacyLevel) {
    reasons.push(
      entry.privacyLevel === intent.privacyLevel
        ? "privacy aligns exactly"
        : "privacy is adjacent rather than exact",
    );
  }

  if (intent.socialRole && entry.socialRole) {
    reasons.push(
      entry.socialRole === intent.socialRole
        ? "social role is directly aligned"
        : "social role is partially compatible",
    );
  }

  if (intent.spatialLogic && entry.spatialLogic) {
    reasons.push(
      entry.spatialLogic === intent.spatialLogic
        ? "spatial logic matches directly"
        : "spatial logic is related but not identical",
    );
  }

  if (intent.climateResponse && entry.climateResponse) {
    reasons.push(
      entry.climateResponse === intent.climateResponse
        ? "climate response fits directly"
        : "climate response is compatible",
    );
  }

  return reasons.slice(0, 3);
}

function getConfidenceLabel(score) {
  if (score >= 42) return "Strong fit";
  if (score >= 24) return "Moderate fit";
  return "Weak fit";
}

function getSequenceRole(entry) {
  const privacyOrder = [
    "public",
    "semi-public",
    "semi-private",
    "private",
    "restricted",
  ];
  const roleOrder = {
    movement: 1,
    reception: 2,
    waiting: 2,
    gathering: 3,
    mixed: 3,
    dwelling: 4,
    service: 4,
    ritual: 4,
    none: 5,
  };

  const privacyRank = privacyOrder.indexOf(normalizeValue(entry.privacyLevel));
  const socialRank = roleOrder[normalizeValue(entry.socialRole)] || 5;

  return {
    privacyRank: privacyRank === -1 ? 5 : privacyRank,
    socialRank,
  };
}

function buildSuggestedSequence(matches) {
  const top = matches.slice(0, 8);

  return [...top]
    .sort((a, b) => {
      const left = getSequenceRole(a);
      const right = getSequenceRole(b);

      if (left.privacyRank !== right.privacyRank) {
        return left.privacyRank - right.privacyRank;
      }

      if (left.socialRank !== right.socialRank) {
        return left.socialRank - right.socialRank;
      }

      return b.__intentScore - a.__intentScore;
    })
    .slice(0, 5);
}

function buildStrategyBuckets(matches) {
  return {
    strongest: matches.filter((entry) => entry.__intentScore >= 42).slice(0, 4),
    adaptable: matches
      .filter((entry) => entry.__intentScore >= 24 && entry.__intentScore < 42)
      .slice(0, 4),
    edgeCases: matches
      .filter((entry) => entry.__intentScore > 0 && entry.__intentScore < 24)
      .slice(0, 4),
  };
}

export function buildDesignIntentMatches(entries, intent) {
  const filledFields = countFilledIntentFields(intent);

  if (!Array.isArray(entries) || entries.length === 0 || filledFields === 0) {
    return {
      summaryLabel: getIntentSummary(intent),
      filledFields,
      matches: [],
      suggestedSequence: [],
      buckets: {
        strongest: [],
        adaptable: [],
        edgeCases: [],
      },
    };
  }

  const matches = entries
    .map((entry) => {
      const positiveBreakdown = getIntentBreakdown(entry, intent);
      const conflictBreakdown = getConflictBreakdown(entry, intent);

      const positiveScore = positiveBreakdown.reduce(
        (sum, item) => sum + item.points,
        0,
      );

      const penaltyScore = conflictBreakdown.reduce(
        (sum, item) => sum + item.penalty,
        0,
      );

      const finalScore = Math.max(0, positiveScore - penaltyScore);

      return {
        ...entry,
        __intentScore: finalScore,
        __intentPositiveBreakdown: positiveBreakdown,
        __intentConflictBreakdown: conflictBreakdown,
        __intentBreakdown: positiveBreakdown,
        __intentLabel: getConfidenceLabel(finalScore),
        __intentRationale: buildRationale(entry, intent),
      };
    })
    .filter((entry) => entry.__intentScore > 0)
    .sort((a, b) => {
      if (b.__intentScore !== a.__intentScore) {
        return b.__intentScore - a.__intentScore;
      }

      return a.term.localeCompare(b.term);
    });

  return {
    summaryLabel: getIntentSummary(intent),
    filledFields,
    matches,
    suggestedSequence: buildSuggestedSequence(matches),
    buckets: buildStrategyBuckets(matches),
  };
}
