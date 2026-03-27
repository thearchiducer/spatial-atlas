function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesAny(value, terms) {
  const text = normalize(value);
  return terms.some((term) => text.includes(term));
}

function countMatchingEntries(entries, matcher) {
  return entries.reduce((count, entry) => {
    return matcher(entry) ? count + 1 : count;
  }, 0);
}

function inferPrimarySpatialMode(summary, entries) {
  const terms = entries.map((entry) => normalize(entry?.term));
  const types = entries.map((entry) => normalize(entry?.type));

  const thresholdCount =
    types.filter((type) => type === "threshold").length +
    countMatchingEntries(entries, (entry) =>
      includesAny(entry?.term, [
        "entry",
        "vestibule",
        "foyer",
        "narthex",
        "antechamber",
        "engawa",
        "airlock",
      ]),
    );

  const circulationCount =
    types.filter((type) => type === "circulation").length +
    countMatchingEntries(entries, (entry) =>
      includesAny(entry?.term, ["corridor", "gallery", "hall", "passage"]),
    );

  const socialCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.term, [
      "living",
      "majlis",
      "salon",
      "guest",
      "dining",
      "drawing",
      "family room",
    ]),
  );

  const retreatCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.term, ["bed", "suite", "study", "office", "library"]),
  );

  if (summary?.privacyModel === "Layered" && thresholdCount >= 2) {
    return "layered sequence";
  }

  if (summary?.circulationModel === "Controlled" && circulationCount >= 1) {
    return "organized spine";
  }

  if (socialCount >= 3 && summary?.socialModel !== "Family-centered") {
    return "social cluster";
  }

  if (retreatCount >= 2 && summary?.privacyModel === "Secluded") {
    return "retreat core";
  }

  if (terms.some((term) => includesAny(term, ["courtyard", "sahn", "patio"]))) {
    return "courtyard field";
  }

  return "mixed sequence";
}

function inferProjectFamily(summary, entries) {
  const terms = entries.map((entry) => normalize(entry?.term));

  const domesticCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.domain, [
      "domestic",
      "residential",
      "dwelling",
      "housing",
    ]),
  );

  const ritualCount = countMatchingEntries(
    entries,
    (entry) =>
      includesAny(entry?.socialRole, ["ritual"]) ||
      includesAny(entry?.term, ["narthex", "sanctuary", "prayer", "ablution"]),
  );

  const receptionCount = countMatchingEntries(
    entries,
    (entry) =>
      includesAny(entry?.socialRole, ["reception", "gathering"]) ||
      includesAny(entry?.term, ["majlis", "salon", "guest", "reception"]),
  );

  if (ritualCount >= 2) return "ritual environment";
  if (domesticCount >= 3 && summary?.socialModel === "Family-centered") {
    return "domestic environment";
  }
  if (receptionCount >= 2 && summary?.socialModel === "Guest-centered") {
    return "hosting environment";
  }
  if (
    terms.some((term) =>
      includesAny(term, ["office", "study", "library", "workshop"]),
    )
  ) {
    return "work-focused environment";
  }

  return "hybrid environment";
}

function inferPriority(summary, entries) {
  const thresholdCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.term, [
      "entry",
      "vestibule",
      "foyer",
      "narthex",
      "antechamber",
      "gallery",
      "corridor",
      "hall",
    ]),
  );

  const hostingCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.term, ["living", "majlis", "salon", "guest", "dining"]),
  );

  const retreatCount = countMatchingEntries(entries, (entry) =>
    includesAny(entry?.term, ["bed", "suite", "study", "office", "library"]),
  );

  if (summary?.privacyModel === "Layered" && thresholdCount >= 2) {
    return "privacy progression";
  }

  if (summary?.socialModel === "Guest-centered" && hostingCount >= 2) {
    return "hosting clarity";
  }

  if (summary?.socialModel === "Family-centered" && retreatCount >= 2) {
    return "protected domestic life";
  }

  if (summary?.circulationModel === "Controlled") {
    return "movement order";
  }

  if (
    summary?.serviceStrategy === "Attached" ||
    summary?.serviceStrategy === "Integrated"
  ) {
    return "service coordination";
  }

  return "balanced adaptability";
}

function inferCounterPriority(summary) {
  if (summary?.privacyModel === "Layered") return "direct exposure";
  if (summary?.socialModel === "Guest-centered") return "deep seclusion";
  if (summary?.socialModel === "Family-centered") return "front-facing hosting";
  if (summary?.circulationModel === "Controlled") return "free drift";
  if (summary?.serviceStrategy === "Attached") return "detached servicing";
  return "rigid specialization";
}

function buildIdentityTitle(summary, entries) {
  const projectFamily = inferProjectFamily(summary, entries);
  const spatialMode = inferPrimarySpatialMode(summary, entries);

  const familyLabelMap = {
    "domestic environment": "Domestic",
    "hosting environment": "Hosting",
    "ritual environment": "Ritual",
    "work-focused environment": "Work-focused",
    "hybrid environment": "Hybrid",
  };

  const modeLabelMap = {
    "layered sequence": "Layered Sequence",
    "organized spine": "Organized Spine",
    "social cluster": "Social Cluster",
    "retreat core": "Retreat Core",
    "courtyard field": "Courtyard Field",
    "mixed sequence": "Mixed Sequence",
  };

  return `${familyLabelMap[projectFamily] || "Hybrid"} ${modeLabelMap[spatialMode] || "Sequence"}`;
}

function buildIdentitySentence(summary, entries) {
  const projectFamily = inferProjectFamily(summary, entries);
  const spatialMode = inferPrimarySpatialMode(summary, entries);
  const priority = inferPriority(summary, entries);
  const counterPriority = inferCounterPriority(summary);

  return `A ${spatialMode} within a ${projectFamily} that prioritizes ${priority} over ${counterPriority}.`;
}

function buildIdentityTags(summary, entries) {
  const tags = [
    summary?.privacyModel || null,
    summary?.socialModel || null,
    summary?.circulationModel || null,
    inferPrimarySpatialMode(summary, entries),
    inferPriority(summary, entries),
  ]
    .filter(Boolean)
    .slice(0, 5);

  return tags;
}

function buildIdentityStrength(summary) {
  const gaps = Array.isArray(summary?.gapSignals)
    ? summary.gapSignals.length
    : 0;
  const tensions = Array.isArray(summary?.tensions)
    ? summary.tensions.length
    : 0;

  if (gaps <= 1 && tensions <= 1) return "Clear";
  if (gaps <= 2 && tensions <= 2) return "Developing";
  return "Unstable";
}

export function buildDirectionIdentity(summary, entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  const title = buildIdentityTitle(summary, safeEntries);
  const sentence = buildIdentitySentence(summary, safeEntries);
  const tags = buildIdentityTags(summary, safeEntries);
  const strength = buildIdentityStrength(summary);

  return {
    title,
    sentence,
    tags,
    strength,
  };
}
