function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesAny(value, terms) {
  const text = normalize(value);
  return terms.some((term) => text.includes(term));
}

function getZone(entry) {
  const explicitZone = normalize(entry?.zone);

  if (
    explicitZone === "public" ||
    explicitZone === "transition" ||
    explicitZone === "private" ||
    explicitZone === "service"
  ) {
    return explicitZone;
  }

  const term = normalize(entry?.term);
  const type = normalize(entry?.type);
  const socialRole = normalize(entry?.socialRole);
  const privacy = normalize(entry?.privacyLevel);

  if (
    includesAny(term, [
      "bath",
      "toilet",
      "wc",
      "closet",
      "storage",
      "pantry",
      "laundry",
      "mechanical",
      "service",
      "shaft",
      "utility",
      "kitchen",
    ]) ||
    type === "service" ||
    type === "technical" ||
    socialRole === "service"
  ) {
    return "service";
  }

  if (
    includesAny(term, [
      "bed",
      "master",
      "sleep",
      "suite",
      "office",
      "study",
      "library",
    ]) ||
    privacy === "private" ||
    privacy === "restricted"
  ) {
    return "private";
  }

  if (
    includesAny(term, [
      "entry",
      "vestibule",
      "foyer",
      "hall",
      "lobby",
      "narthex",
      "engawa",
      "gallery",
      "passage",
      "antechamber",
      "airlock",
      "corridor",
      "reception",
    ]) ||
    type === "threshold" ||
    type === "circulation"
  ) {
    return "transition";
  }

  if (
    includesAny(term, [
      "living",
      "dining",
      "majlis",
      "salon",
      "guest",
      "parlor",
      "drawing",
      "family room",
      "meeting",
      "classroom",
      "studio",
    ]) ||
    privacy === "public" ||
    socialRole === "gathering" ||
    socialRole === "reception"
  ) {
    return "public";
  }

  if (privacy === "semi-public") return "public";
  if (privacy === "semi-private") return "transition";

  return "transition";
}

function inferPrivacyModel(entries) {
  const zones = entries.map(getZone);
  const publicCount = zones.filter((zone) => zone === "public").length;
  const transitionCount = zones.filter((zone) => zone === "transition").length;
  const privateCount = zones.filter((zone) => zone === "private").length;

  if (publicCount > 0 && transitionCount > 0 && privateCount > 0) {
    return "Layered";
  }

  if (publicCount >= privateCount && transitionCount <= 1) {
    return "Open";
  }

  if (privateCount >= publicCount && privateCount >= 2) {
    return "Secluded";
  }

  return "Balanced";
}

function inferSocialModel(entries) {
  const terms = entries.map((entry) => normalize(entry?.term));
  const socialRoles = entries.map((entry) => normalize(entry?.socialRole));

  const guestWeight =
    terms.filter((term) =>
      includesAny(term, ["guest", "majlis", "salon", "reception", "living"]),
    ).length + socialRoles.filter((role) => role === "reception").length;

  const familyWeight =
    terms.filter((term) =>
      includesAny(term, ["family", "bed", "suite", "dining", "kitchen"]),
    ).length + socialRoles.filter((role) => role === "dwelling").length;

  if (guestWeight > familyWeight + 1) return "Guest-centered";
  if (familyWeight > guestWeight + 1) return "Family-centered";
  return "Mixed";
}

function inferCirculationModel(entries) {
  const types = entries.map((entry) => normalize(entry?.type));
  const terms = entries.map((entry) => normalize(entry?.term));
  const hasThreshold = types.includes("threshold");
  const hasCirculation = types.includes("circulation");
  const thresholdTerms = terms.filter((term) =>
    includesAny(term, [
      "entry",
      "vestibule",
      "foyer",
      "hall",
      "corridor",
      "gallery",
      "antechamber",
    ]),
  ).length;

  if ((hasThreshold && hasCirculation) || thresholdTerms >= 2) {
    return "Controlled";
  }

  if (hasThreshold || hasCirculation) {
    return "Directed";
  }

  return "Free";
}

function inferServiceStrategy(entries) {
  const zones = entries.map(getZone);
  const serviceCount = zones.filter((zone) => zone === "service").length;

  if (serviceCount >= 3) return "Attached";
  if (serviceCount >= 1) return "Integrated";
  return "Minimal";
}

function inferSpatialPattern(entries) {
  const zones = entries.map(getZone);
  const publicCount = zones.filter((zone) => zone === "public").length;
  const transitionCount = zones.filter((zone) => zone === "transition").length;
  const privateCount = zones.filter((zone) => zone === "private").length;
  const serviceCount = zones.filter((zone) => zone === "service").length;

  if (publicCount && transitionCount && privateCount) {
    return "Public → Transition → Private gradient detected";
  }

  if (transitionCount >= 2 && publicCount <= 1 && privateCount <= 1) {
    return "Threshold-heavy sequence detected";
  }

  if (serviceCount >= 2 && privateCount >= 1) {
    return "Private + service support cluster detected";
  }

  if (publicCount >= 2 && privateCount === 0) {
    return "Open social grouping detected";
  }

  return "Mixed spatial pattern detected";
}

function buildGapSignals(entries) {
  const types = new Set(entries.map((entry) => normalize(entry?.type)));
  const socialRoles = new Set(
    entries.map((entry) => normalize(entry?.socialRole)),
  );
  const privacyLevels = new Set(
    entries.map((entry) => normalize(entry?.privacyLevel)),
  );
  const zones = entries.map(getZone);

  const signals = [];

  if (!types.has("threshold")) {
    signals.push({
      title: "Missing threshold logic",
      description: "The board has no threshold-type entry.",
      implication:
        "Without a threshold, the transition between public and private zones becomes abrupt and harder to control.",
    });
  }

  if (!types.has("circulation")) {
    signals.push({
      title: "Missing circulation spine",
      description: "The board has no circulation-type entry.",
      implication:
        "Movement may become unclear, and the project can lack a strong ordering spine.",
    });
  }

  if (!privacyLevels.has("private") && !privacyLevels.has("restricted")) {
    signals.push({
      title: "Weak private anchor",
      description:
        "The board does not yet include a clearly private or restricted space.",
      implication:
        "The design may struggle to form a meaningful public-to-private gradient.",
    });
  }

  if (!socialRoles.has("gathering") && !zones.includes("public")) {
    signals.push({
      title: "Weak social center",
      description:
        "There is no strong gathering-oriented or clearly public space.",
      implication:
        "The project may lack a recognizable social anchor or front-facing spatial identity.",
    });
  }

  return signals;
}

function buildTensions(entries) {
  const zones = entries.map(getZone);
  const terms = entries.map((entry) => normalize(entry?.term));
  const privacyLevels = entries.map((entry) => normalize(entry?.privacyLevel));
  const types = entries.map((entry) => normalize(entry?.type));

  const tensions = [];

  const hasPublic = zones.includes("public");
  const hasPrivate = zones.includes("private");
  const hasTransition = zones.includes("transition");
  const hasKitchen = terms.some((term) => term.includes("kitchen"));
  const hasDining = terms.some((term) => term.includes("dining"));
  const hasLiving = terms.some((term) =>
    includesAny(term, ["living", "majlis", "salon", "guest"]),
  );
  const hasThreshold = types.includes("threshold");

  if (hasPublic && hasPrivate && !hasTransition) {
    tensions.push({
      title: "Privacy vs direct exposure",
      description:
        "Public and private spaces are both present, but transition spaces are weak or missing.",
    });
  }

  if (hasKitchen && !hasDining && hasLiving) {
    tensions.push({
      title: "Service vs social mismatch",
      description:
        "Kitchen is present without a clear dining partner, while social spaces are already defined.",
    });
  }

  if (
    privacyLevels.includes("public") &&
    privacyLevels.includes("restricted") &&
    !hasThreshold
  ) {
    tensions.push({
      title: "Open-to-restricted conflict",
      description:
        "The board combines highly open and highly protected spaces without enough mediating sequence.",
    });
  }

  if (hasPrivate && hasPublic && !hasThreshold && !hasTransition) {
    tensions.push({
      title: "Compressed hierarchy",
      description:
        "The board asks for both openness and separation but lacks enough intermediate structure.",
    });
  }

  return tensions;
}

function buildNextMoves(entries, gapSignals, tensions) {
  const moves = [];
  const zones = entries.map(getZone);
  const terms = entries.map((entry) => normalize(entry?.term));
  const types = entries.map((entry) => normalize(entry?.type));

  const hasThreshold = types.includes("threshold");
  const hasCirculation = types.includes("circulation");
  const hasPrivate = zones.includes("private");
  const hasPublic = zones.includes("public");
  const hasDining = terms.some((term) => term.includes("dining"));
  const hasKitchen = terms.some((term) => term.includes("kitchen"));
  const hasLiving = terms.some((term) =>
    includesAny(term, ["living", "majlis", "salon", "guest"]),
  );

  if (!hasThreshold) {
    moves.push({
      title: "Add a threshold space",
      description:
        "Introduce a vestibule, foyer, entry hall, or similar threshold element to control sequence and privacy.",
    });
  }

  if (!hasCirculation) {
    moves.push({
      title: "Introduce a circulation spine",
      description:
        "Add a corridor, gallery, or hall-type space so movement has an identifiable organizer.",
    });
  }

  if (!hasPrivate) {
    moves.push({
      title: "Define a private anchor",
      description:
        "Add at least one clearly private room such as a bedroom, suite, or secluded office/study.",
    });
  }

  if (hasKitchen && !hasDining) {
    moves.push({
      title: "Pair kitchen with a social support space",
      description:
        "Add a dining space or another food-related gathering space to strengthen service-to-social logic.",
    });
  }

  if (hasLiving && !hasThreshold) {
    moves.push({
      title: "Buffer the social anchor",
      description:
        "Insert a mediating threshold before the main gathering space so arrival feels intentional.",
    });
  }

  if (!hasPublic) {
    moves.push({
      title: "Clarify the public face",
      description:
        "Add or strengthen a clearly public room so the project has a readable social front.",
    });
  }

  if (tensions.length > 0) {
    moves.push({
      title: "Resolve the strongest tension first",
      description:
        "Use the tensions list below to decide which conflict must be settled before expanding the board.",
    });
  }

  if (!moves.length && !gapSignals.length) {
    moves.push({
      title: "Refine relationships, not quantity",
      description:
        "The board already has a workable structure. Compare entries and strengthen their intended sequence and hierarchy.",
    });
  }

  return moves.slice(0, 6);
}

export function buildDirectionSummary(entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  const privacyModel = inferPrivacyModel(safeEntries);
  const socialModel = inferSocialModel(safeEntries);
  const circulationModel = inferCirculationModel(safeEntries);
  const serviceStrategy = inferServiceStrategy(safeEntries);
  const spatialPattern = inferSpatialPattern(safeEntries);
  const gapSignals = buildGapSignals(safeEntries);
  const tensions = buildTensions(safeEntries);
  const nextMoves = buildNextMoves(safeEntries, gapSignals, tensions);

  const boardCharacter =
    privacyModel +
    ", " +
    socialModel.toLowerCase() +
    ", " +
    circulationModel.toLowerCase() +
    "-access system";

  return {
    privacyModel,
    socialModel,
    circulationModel,
    serviceStrategy,
    spatialPattern,
    boardCharacter,
    gapSignals,
    tensions,
    nextMoves,
  };
}
