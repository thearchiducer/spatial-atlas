import { normalizeEntryIds } from "./boardUtils";

function getBoardEntries(board, entries) {
  const ids = new Set(normalizeEntryIds(board));
  return entries.filter((entry) => ids.has(entry.id));
}

function getValue(entry, key) {
  return String(entry?.[key] || "").trim();
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function countBy(entries, key) {
  const map = new Map();

  for (const entry of entries) {
    const value = normalize(getValue(entry, key));
    if (!value) continue;
    map.set(value, (map.get(value) || 0) + 1);
  }

  return map;
}

function topFromMap(map, fallback = "undefined") {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return { key: fallback, count: 0 };
  return { key: sorted[0][0], count: sorted[0][1] };
}

function hasType(entries, typeName) {
  return entries.some((entry) => normalize(entry.type) === normalize(typeName));
}

function hasTermLike(entries, text) {
  return entries.some((entry) =>
    normalize(entry.term).includes(normalize(text)),
  );
}

function summarizeDominantModels(entries) {
  const privacyMap = countBy(entries, "privacyLevel");
  const circulationMap = countBy(entries, "circulationRole");
  const socialMap = countBy(entries, "socialRole");
  const climateMap = countBy(entries, "climateResponse");

  const privacy = topFromMap(privacyMap, "mixed");
  const circulation = topFromMap(circulationMap, "mixed");
  const social = topFromMap(socialMap, "mixed");
  const climate = topFromMap(climateMap, "weak");

  return {
    privacy,
    circulation,
    social,
    climate,
  };
}

function detectPattern(models) {
  const privacy = models.privacy.key;
  const circulation = models.circulation.key;
  const social = models.social.key;

  if (
    (privacy === "layered" || privacy === "restricted") &&
    (circulation === "directed" || circulation === "controlled")
  ) {
    return {
      key: "layered-sequence",
      label: "Layered Sequence",
      note: "The board is organized as a privacy gradient supported by guided movement.",
    };
  }

  if (
    privacy === "open" &&
    (circulation === "mixed" || circulation === "integrated")
  ) {
    return {
      key: "open-field",
      label: "Open Field",
      note: "The board behaves more like an open spatial field than a strict sequence.",
    };
  }

  if (
    social === "gathering" &&
    (circulation === "integrated" || circulation === "mixed")
  ) {
    return {
      key: "social-cluster",
      label: "Social Cluster",
      note: "The board is driven by collective occupation and clustered interaction.",
    };
  }

  return {
    key: "hybrid-system",
    label: "Hybrid System",
    note: "The board combines multiple partial logics without collapsing into one singular type.",
  };
}

function buildIdentity(models, pattern) {
  return {
    privacyModel: models.privacy.key,
    circulationModel: models.circulation.key,
    socialModel: models.social.key,
    climateModel: models.climate.key,
    spatialPattern: pattern.label,
  };
}

function detectStrengths(entries, models, pattern) {
  const strengths = [];

  if (models.privacy.key === "layered" || models.privacy.key === "restricted") {
    strengths.push({
      key: "privacy-gradient",
      label: "Privacy gradient is legible",
      note: "The board shows evidence of buffering, transition, or controlled exposure.",
      weight: 10,
    });
  }

  if (
    models.circulation.key === "directed" ||
    models.circulation.key === "controlled"
  ) {
    strengths.push({
      key: "movement-clarity",
      label: "Movement logic is clear",
      note: "Circulation appears intentional rather than accidental.",
      weight: 10,
    });
  }

  if (models.social.key === "gathering" || models.social.key === "mixed") {
    strengths.push({
      key: "social-readability",
      label: "Social behavior is readable",
      note: "The board supports identifiable patterns of occupation and use.",
      weight: 8,
    });
  }

  if (pattern.key !== "hybrid-system") {
    strengths.push({
      key: "pattern-coherence",
      label: "A coherent spatial pattern is emerging",
      note: pattern.note,
      weight: 12,
    });
  }

  if (entries.length >= 4) {
    strengths.push({
      key: "critical-mass",
      label: "Board has enough material to evaluate",
      note: "The board contains enough entries to begin reading it as a direction rather than a fragment.",
      weight: 6,
    });
  }

  return strengths;
}

function detectMissing(entries, models) {
  const missing = [];

  const hasThreshold =
    hasType(entries, "Threshold") || hasTermLike(entries, "threshold");
  const hasCirculation =
    hasType(entries, "Circulation") ||
    entries.some((entry) => normalize(entry.circulationRole));
  const hasGathering = entries.some(
    (entry) => normalize(entry.socialRole) === "gathering",
  );
  const hasProtected = entries.some((entry) =>
    ["layered", "restricted", "controlled"].includes(
      normalize(entry.privacyLevel) || normalize(entry.enclosureType),
    ),
  );

  if (!hasThreshold) {
    missing.push({
      key: "missing-threshold",
      label: "Threshold logic is missing",
      note: "The board needs a clearer transitional condition between states or zones.",
      severity: "warning",
      penalty: 10,
    });
  }

  if (!hasCirculation) {
    missing.push({
      key: "missing-circulation",
      label: "Circulation structure is missing",
      note: "There is no strong movement system tying the entries into one spatial sequence.",
      severity: "critical",
      penalty: 18,
    });
  }

  if (!hasGathering) {
    missing.push({
      key: "missing-gathering",
      label: "No gathering anchor is present",
      note: "The board may need a stronger shared or collective space to stabilize its program logic.",
      severity: "warning",
      penalty: 8,
    });
  }

  if (!hasProtected && models.privacy.key !== "open") {
    missing.push({
      key: "missing-protected-zone",
      label: "Protected condition is underdeveloped",
      note: "The board suggests control, but lacks a clearly protected spatial condition.",
      severity: "warning",
      penalty: 8,
    });
  }

  return missing;
}

function detectTensions(entries) {
  const tensions = [];

  const privacyCounts = countBy(entries, "privacyLevel");
  const circulationCounts = countBy(entries, "circulationRole");
  const climateCounts = countBy(entries, "climateResponse");

  const layered = privacyCounts.get("layered") || 0;
  const open = privacyCounts.get("open") || 0;

  if (layered > 0 && open > 0) {
    tensions.push({
      key: "privacy-conflict",
      label: "Privacy model is internally mixed",
      note: "The board combines open exposure and layered privacy without a resolved hierarchy.",
      severity: "warning",
      penalty: 10,
    });
  }

  const directed = circulationCounts.get("directed") || 0;
  const mixed = circulationCounts.get("mixed") || 0;

  if (directed > 0 && mixed > 0) {
    tensions.push({
      key: "circulation-ambiguity",
      label: "Circulation reads in two directions",
      note: "The board partly behaves as a guided sequence and partly as a mixed network.",
      severity: "info",
      penalty: 5,
    });
  }

  if (climateCounts.size >= 3) {
    tensions.push({
      key: "climate-fragmentation",
      label: "Climate strategy is fragmented",
      note: "The environmental response is distributed across too many competing ideas.",
      severity: "warning",
      penalty: 8,
    });
  }

  if (entries.length <= 2) {
    tensions.push({
      key: "underdefined-board",
      label: "Board is underdefined",
      note: "The board does not yet contain enough entries for a stable directional reading.",
      severity: "info",
      penalty: 6,
    });
  }

  return tensions;
}

function buildNextMoves(missing, tensions, models) {
  const moves = [];

  if (missing.some((item) => item.key === "missing-circulation")) {
    moves.push({
      key: "add-circulation-spine",
      title: "Add a circulation spine",
      priority: "critical",
      note: "Introduce a circulation or sequence-defining entry to organize movement.",
    });
  }

  if (missing.some((item) => item.key === "missing-threshold")) {
    moves.push({
      key: "insert-threshold",
      title: "Insert a threshold",
      priority: "core",
      note: "Add a mediating spatial condition to improve transition between different states.",
    });
  }

  if (missing.some((item) => item.key === "missing-gathering")) {
    moves.push({
      key: "add-gathering-anchor",
      title: "Add a gathering anchor",
      priority: "core",
      note: "Introduce a collective or mixed social space to stabilize social hierarchy.",
    });
  }

  if (tensions.some((item) => item.key === "privacy-conflict")) {
    moves.push({
      key: "clarify-privacy-model",
      title: "Clarify privacy hierarchy",
      priority: "core",
      note: "Decide whether the board primarily protects, exposes, or sequences occupation.",
    });
  }

  if (tensions.some((item) => item.key === "climate-fragmentation")) {
    moves.push({
      key: "consolidate-climate",
      title: "Consolidate climate response",
      priority: "support",
      note: "Choose one dominant environmental strategy and let the others support it.",
    });
  }

  if (!moves.length) {
    moves.push({
      key: "refine-pattern",
      title: "Refine the dominant pattern",
      priority: "refinement",
      note: `The board is already fairly coherent. Strengthen the ${models.privacy.key} / ${models.circulation.key} logic rather than adding more unrelated entries.`,
    });
  }

  return moves;
}

function buildScoreBreakdown(strengths, missing, tensions) {
  const strengthScore = strengths.reduce((sum, item) => sum + item.weight, 0);
  const missingPenalty = missing.reduce((sum, item) => sum + item.penalty, 0);
  const tensionPenalty = tensions.reduce((sum, item) => sum + item.penalty, 0);

  const rawScore = 60 + strengthScore - missingPenalty - tensionPenalty;
  const finalScore = Math.max(20, Math.min(100, rawScore));

  return {
    strengthScore,
    missingPenalty,
    tensionPenalty,
    finalScore,
  };
}

export function evaluateBoardDirection(board, entries) {
  const boardEntries = getBoardEntries(board, entries);

  const models = summarizeDominantModels(boardEntries);
  const pattern = detectPattern(models);
  const identity = buildIdentity(models, pattern);

  const strengths = detectStrengths(boardEntries, models, pattern);
  const missing = detectMissing(boardEntries, models);
  const tensions = detectTensions(boardEntries);
  const nextMoves = buildNextMoves(missing, tensions, models);

  const scoreBreakdown = buildScoreBreakdown(strengths, missing, tensions);

  return {
    boardId: board?.id || null,
    boardName: board?.name || "Untitled board",
    entryCount: boardEntries.length,
    identity,
    pattern,
    strengths,
    missing,
    tensions,
    nextMoves,
    scoreBreakdown,
    score: scoreBreakdown.finalScore,
    summary:
      pattern.note ||
      "The board is beginning to express a readable spatial direction.",
  };
}
