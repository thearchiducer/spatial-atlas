import { normalizeEntryIds } from "../../lib/boardUtils";

function countBy(items, getKey) {
  const map = new Map();

  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return map;
}

function topEntriesFromMap(map, limit = 3) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function getBoardEntries(board, entries) {
  const ids = new Set(normalizeEntryIds(board));
  return entries.filter((entry) => ids.has(entry.id));
}

function getComparePairs(board) {
  return Array.isArray(board?.comparePairs) ? board.comparePairs : [];
}

function hasValue(value, expected) {
  return String(value || "").toLowerCase() === expected.toLowerCase();
}

function includesValue(value, text) {
  return String(value || "")
    .toLowerCase()
    .includes(text.toLowerCase());
}

function scorePrivacyModel(boardEntries) {
  let layered = 0;
  let exposed = 0;
  let controlled = 0;

  for (const entry of boardEntries) {
    if (hasValue(entry.privacyLevel, "layered")) layered += 1;
    if (hasValue(entry.privacyLevel, "open")) exposed += 1;
    if (hasValue(entry.enclosureType, "controlled")) controlled += 1;
  }

  if (layered >= 2 && controlled >= 1) {
    return {
      key: "layered",
      label: "Layered",
      score: 90,
      note: "The board suggests a privacy gradient rather than direct exposure.",
    };
  }

  if (exposed >= layered + 1) {
    return {
      key: "open",
      label: "Open",
      score: 65,
      note: "The board leans toward open exposure rather than buffered privacy.",
    };
  }

  return {
    key: "mixed",
    label: "Mixed",
    score: 72,
    note: "The board mixes layered and open privacy signals.",
  };
}

function scoreCirculationModel(boardEntries) {
  let directed = 0;
  let controlled = 0;
  let minimal = 0;
  let mixed = 0;

  for (const entry of boardEntries) {
    if (hasValue(entry.circulationRole, "directed")) directed += 1;
    if (hasValue(entry.circulationRole, "controlled")) controlled += 1;
    if (hasValue(entry.circulationRole, "minimal")) minimal += 1;
    if (hasValue(entry.circulationRole, "mixed")) mixed += 1;
  }

  if (directed + controlled >= 2) {
    return {
      key: "directed",
      label: "Directed",
      score: 88,
      note: "Movement appears intentionally guided rather than loosely distributed.",
    };
  }

  if (mixed >= 2) {
    return {
      key: "mixed",
      label: "Mixed",
      score: 72,
      note: "The board supports multiple circulation readings without one dominant route.",
    };
  }

  if (minimal >= 1 && directed === 0) {
    return {
      key: "minimal",
      label: "Minimal",
      score: 62,
      note: "Circulation is understated and may need stronger directional structure.",
    };
  }

  return {
    key: "integrated",
    label: "Integrated",
    score: 70,
    note: "Circulation participates in the whole system without a strong singular identity.",
  };
}

function detectSpatialPattern(boardEntries) {
  const privacy = scorePrivacyModel(boardEntries);
  const circulation = scoreCirculationModel(boardEntries);

  if (privacy.key === "layered" && circulation.key === "directed") {
    return {
      key: "layered-sequence",
      label: "Layered Sequence",
      note: "A privacy gradient and directed movement combine into a sequential spatial logic.",
    };
  }

  if (privacy.key === "open" && circulation.key === "mixed") {
    return {
      key: "mixed-open-field",
      label: "Mixed Open Field",
      note: "The board behaves like an adaptable open field with distributed movement.",
    };
  }

  if (privacy.key === "mixed" && circulation.key === "integrated") {
    return {
      key: "hybrid-mixed-sequence",
      label: "Hybrid Mixed Sequence",
      note: "The board mixes multiple readings without fully collapsing into disorder.",
    };
  }

  return {
    key: "composite-pattern",
    label: "Composite Pattern",
    note: "The board contains multiple partial spatial systems without one totally dominant pattern.",
  };
}

function detectSocialModel(boardEntries) {
  const socialMap = countBy(boardEntries, (entry) => entry.socialRole);
  const top = topEntriesFromMap(socialMap, 2);

  if (!top.length) {
    return {
      key: "undefined",
      label: "Undefined",
      note: "The board does not yet express a strong social model.",
    };
  }

  if (top[0].key === "gathering") {
    return {
      key: "gathering",
      label: "Gathering",
      note: "The board prioritizes social concentration and shared occupancy.",
    };
  }

  if (top[0].key === "retreat") {
    return {
      key: "retreat",
      label: "Retreat",
      note: "The board leans toward withdrawal, focus, and controlled occupation.",
    };
  }

  return {
    key: "mixed",
    label: "Mixed",
    note: "The board combines multiple social roles without one dominant collective stance.",
  };
}

function detectClimateResponse(boardEntries) {
  const climateMap = countBy(boardEntries, (entry) => entry.climateResponse);
  const top = topEntriesFromMap(climateMap, 2);

  if (!top.length) {
    return {
      key: "weak",
      label: "Weak",
      note: "Climate logic is not strongly expressed in the board.",
    };
  }

  if (top.length === 1 || top[0].count >= top[1].count + 2) {
    return {
      key: "coherent",
      label: "Coherent",
      note: `Climate response is led by "${top[0].key}".`,
    };
  }

  return {
    key: "fragmented",
    label: "Fragmented",
    note: "Multiple climate responses appear without a dominant environmental strategy.",
  };
}

function detectMissingElements(boardEntries) {
  const issues = [];

  const hasThreshold = boardEntries.some(
    (entry) =>
      includesValue(entry.term, "threshold") ||
      hasValue(entry.type, "Threshold"),
  );

  const hasCirculation = boardEntries.some(
    (entry) =>
      hasValue(entry.type, "Circulation") || Boolean(entry.circulationRole),
  );

  const hasGathering = boardEntries.some((entry) =>
    hasValue(entry.socialRole, "gathering"),
  );

  const hasProtected = boardEntries.some(
    (entry) =>
      hasValue(entry.privacyLevel, "layered") ||
      hasValue(entry.enclosureType, "controlled"),
  );

  if (!hasThreshold) {
    issues.push({
      key: "threshold-missing",
      label: "Threshold system missing",
      note: "The board lacks a clear transitional device between conditions.",
      severity: "warning",
    });
  }

  if (!hasCirculation) {
    issues.push({
      key: "circulation-missing",
      label: "Circulation system missing",
      note: "The board has no clear movement logic tying entries together.",
      severity: "critical",
    });
  }

  if (!hasGathering) {
    issues.push({
      key: "gathering-missing",
      label: "Gathering capacity missing",
      note: "The board currently lacks a strong gathering-oriented or mixed social space.",
      severity: "warning",
    });
  }

  if (!hasProtected) {
    issues.push({
      key: "protected-zone-missing",
      label: "Protected zone missing",
      note: "The board needs at least one buffered or controlled condition.",
      severity: "warning",
    });
  }

  return issues;
}

function detectTensions(boardEntries) {
  const tensions = [];

  const openCount = boardEntries.filter((entry) =>
    hasValue(entry.privacyLevel, "open"),
  ).length;

  const layeredCount = boardEntries.filter((entry) =>
    hasValue(entry.privacyLevel, "layered"),
  ).length;

  if (openCount > 0 && layeredCount > 0) {
    tensions.push({
      key: "privacy-tension",
      label: "Privacy tension",
      note: "The board mixes open and layered privacy models and may need clearer hierarchy.",
      severity: "info",
    });
  }

  const climate = detectClimateResponse(boardEntries);
  if (climate.key === "fragmented") {
    tensions.push({
      key: "climate-fragment",
      label: "Climate strategy is fragmented",
      note: "Environmental logic may need consolidation into a dominant response.",
      severity: "warning",
    });
  }

  const social = detectSocialModel(boardEntries);
  if (social.key === "mixed") {
    tensions.push({
      key: "social-mix",
      label: "Social model is mixed",
      note: "Multiple social roles coexist without a fully dominant behavioral model.",
      severity: "info",
    });
  }

  return tensions;
}

function buildNextMoves(boardEntries, missingElements, tensions) {
  const moves = [];

  if (missingElements.some((item) => item.key === "threshold-missing")) {
    moves.push({
      key: "add-threshold",
      title: "Add threshold",
      priority: "critical",
      note: "Insert a mediating entry or zone to improve transition between conditions.",
    });
  }

  if (missingElements.some((item) => item.key === "circulation-missing")) {
    moves.push({
      key: "strengthen-sequence",
      title: "Strengthen sequence",
      priority: "critical",
      note: "Introduce a stronger circulation spine or directional relationship.",
    });
  }

  if (missingElements.some((item) => item.key === "gathering-missing")) {
    moves.push({
      key: "add-gathering",
      title: "Add gathering core",
      priority: "core",
      note: "Introduce at least one space or concept with gathering or mixed social capacity.",
    });
  }

  if (tensions.some((item) => item.key === "privacy-tension")) {
    moves.push({
      key: "clarify-privacy",
      title: "Clarify privacy hierarchy",
      priority: "core",
      note: "Decide whether the board should primarily protect, expose, or sequence privacy.",
    });
  }

  if (tensions.some((item) => item.key === "climate-fragment")) {
    moves.push({
      key: "consolidate-climate",
      title: "Consolidate climate logic",
      priority: "core",
      note: "Choose one environmental strategy to dominate and let others support it.",
    });
  }

  if (!moves.length) {
    moves.push({
      key: "refine-identity",
      title: "Refine identity",
      priority: "refinement",
      note: "The board is coherent enough to begin sharpening rather than repairing.",
    });
  }

  return moves;
}

function buildStrengths(boardEntries) {
  const strengths = [];

  const privacy = scorePrivacyModel(boardEntries);
  const circulation = scoreCirculationModel(boardEntries);
  const pattern = detectSpatialPattern(boardEntries);

  strengths.push({
    key: "privacy-model",
    label: `${privacy.label} privacy model`,
    note: privacy.note,
  });

  strengths.push({
    key: "circulation-model",
    label: `${circulation.label} circulation model`,
    note: circulation.note,
  });

  strengths.push({
    key: "spatial-pattern",
    label: pattern.label,
    note: pattern.note,
  });

  return strengths;
}

function scoreBoard(boardEntries, missingElements, tensions) {
  let score = 100;

  score -=
    missingElements.filter((item) => item.severity === "critical").length * 20;
  score -=
    missingElements.filter((item) => item.severity === "warning").length * 10;
  score -= tensions.filter((item) => item.severity === "warning").length * 8;
  score -= tensions.filter((item) => item.severity === "info").length * 4;

  return Math.max(35, Math.min(100, score));
}

export function analyzeBoardDirection(board, entries) {
  const boardEntries = getBoardEntries(board, entries);
  const comparePairs = getComparePairs(board);

  const privacy = scorePrivacyModel(boardEntries);
  const circulation = scoreCirculationModel(boardEntries);
  const pattern = detectSpatialPattern(boardEntries);
  const social = detectSocialModel(boardEntries);
  const climate = detectClimateResponse(boardEntries);

  const missingElements = detectMissingElements(boardEntries);
  const tensions = detectTensions(boardEntries);
  const nextMoves = buildNextMoves(boardEntries, missingElements, tensions);
  const strengths = buildStrengths(boardEntries);
  const score = scoreBoard(boardEntries, missingElements, tensions);

  return {
    boardId: board?.id || null,
    boardName: board?.name || "Untitled board",
    entryCount: boardEntries.length,
    comparePairCount: comparePairs.length,
    score,
    identity: {
      privacy: privacy.label,
      circulation: circulation.label,
      social: social.label,
      climate: climate.label,
      pattern: pattern.label,
    },
    summaries: {
      privacy: privacy.note,
      circulation: circulation.note,
      social: social.note,
      climate: climate.note,
      pattern: pattern.note,
    },
    strengths,
    missingElements,
    tensions,
    nextMoves,
  };
}
