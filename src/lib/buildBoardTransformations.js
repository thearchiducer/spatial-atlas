import { compareBoards } from "./compareBoards";
import { normalizeEntryIds } from "./boardUtils";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getBoardEntries(board, entries) {
  const ids = new Set(normalizeEntryIds(board));
  return entries.filter((entry) => ids.has(entry.id));
}

function buildMove(
  key,
  priority,
  title,
  why,
  action,
  suggestedEntries = [],
  focusTargets = [],
) {
  return {
    key,
    priority,
    title,
    why,
    action,
    suggestedEntries,
    focusTargets,
  };
}

function findSuggestedEntries(entries, boardEntries, matcher, limit = 4) {
  const boardIds = new Set(boardEntries.map((entry) => entry.id));

  return entries
    .filter((entry) => !boardIds.has(entry.id))
    .filter(matcher)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      term: entry.term,
      type: entry.type,
    }));
}

function findFocusTargets(boardEntries, matcher, limit = 4) {
  return boardEntries
    .filter(matcher)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      term: entry.term,
      type: entry.type,
    }));
}

function buildIdentityMoves(
  weaker,
  stronger,
  allEntries,
  weakerBoardEntries,
  transformations,
) {
  const weakIdentity = weaker.identity;
  const strongIdentity = stronger.identity;

  if (weakIdentity.privacyModel !== strongIdentity.privacyModel) {
    transformations.push(
      buildMove(
        "shift-privacy-model",
        "core",
        `Shift privacy from ${weakIdentity.privacyModel} toward ${strongIdentity.privacyModel}`,
        "The stronger board expresses a more resolved privacy model.",
        `Rework the weaker board so its privacy logic reads more clearly as ${strongIdentity.privacyModel}.`,
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.privacyLevel) ===
              normalize(strongIdentity.privacyModel) ||
            normalize(entry.enclosureType) === "controlled" ||
            normalize(entry.type) === "threshold",
        ),
        findFocusTargets(
          weakerBoardEntries,
          (entry) =>
            normalize(entry.privacyLevel) ===
            normalize(weakIdentity.privacyModel),
        ),
      ),
    );
  }

  if (weakIdentity.circulationModel !== strongIdentity.circulationModel) {
    transformations.push(
      buildMove(
        "shift-circulation-model",
        "core",
        `Shift circulation from ${weakIdentity.circulationModel} toward ${strongIdentity.circulationModel}`,
        "The stronger board has a clearer circulation reading.",
        `Introduce moves that make the weaker board circulate more like ${strongIdentity.circulationModel}.`,
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.circulationRole) ===
              normalize(strongIdentity.circulationModel) ||
            normalize(entry.type) === "circulation",
        ),
        findFocusTargets(weakerBoardEntries, (entry) =>
          Boolean(normalize(entry.circulationRole)),
        ),
      ),
    );
  }

  if (weakIdentity.socialModel !== strongIdentity.socialModel) {
    transformations.push(
      buildMove(
        "shift-social-model",
        "support",
        `Shift social model from ${weakIdentity.socialModel} toward ${strongIdentity.socialModel}`,
        "The stronger board expresses a more coherent occupation model.",
        `Adjust the weaker board so social behavior reads more like ${strongIdentity.socialModel}.`,
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.socialRole) ===
            normalize(strongIdentity.socialModel),
        ),
        findFocusTargets(weakerBoardEntries, (entry) =>
          Boolean(normalize(entry.socialRole)),
        ),
      ),
    );
  }

  if (weakIdentity.spatialPattern !== strongIdentity.spatialPattern) {
    transformations.push(
      buildMove(
        "shift-spatial-pattern",
        "core",
        `Reconstruct spatial pattern toward ${strongIdentity.spatialPattern}`,
        "The stronger board is organized around a more coherent overall pattern.",
        `Recompose the weaker board so it behaves more like ${strongIdentity.spatialPattern}.`,
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.type) === "threshold" ||
            normalize(entry.type) === "circulation" ||
            Boolean(normalize(entry.spatialLogic)),
        ),
        findFocusTargets(weakerBoardEntries, () => true, 4),
      ),
    );
  }
}

function getEntryConceptKey(entry) {
  if (!entry) return "";

  return [
    normalize(entry.type),
    normalize(entry.privacyLevel),
    normalize(entry.circulationRole),
    normalize(entry.socialRole),
    normalize(entry.climateResponse),
    normalize(entry.enclosureType),
  ].join("|");
}

function getBoardEntryConceptSet(boardEntries = []) {
  return new Set(boardEntries.map((entry) => getEntryConceptKey(entry)));
}

function rankSuggestedEntriesForMove(
  entries = [],
  move = {},
  decisionProfile = null,
) {
  const titleText = normalize(move.title);
  const actionText = normalize(move.action);
  const combinedText = `${titleText} ${actionText}`;

  return [...entries]
    .map((entry) => {
      let score = 0;

      if (combinedText.includes("circulation")) {
        if (normalize(entry.type) === "circulation") score += 14;
        if (
          ["directed", "controlled"].includes(normalize(entry.circulationRole))
        ) {
          score += 10;
        }
      }

      if (combinedText.includes("threshold")) {
        if (normalize(entry.type) === "threshold") score += 14;
        if (normalize(entry.term).includes("threshold")) score += 8;
        if (normalize(entry.term).includes("buffer")) score += 6;
      }

      if (combinedText.includes("privacy")) {
        if (["layered", "restricted"].includes(normalize(entry.privacyLevel))) {
          score += 12;
        }
      }

      if (combinedText.includes("social")) {
        if (["gathering", "mixed"].includes(normalize(entry.socialRole))) {
          score += 8;
        }
      }

      if (decisionProfile?.privacyBias) {
        if (
          normalize(entry.privacyLevel) ===
          normalize(decisionProfile?.privacyBias)
        ) {
          score += 4;
        }
      }

      if (decisionProfile?.circulationBias) {
        if (
          normalize(entry.circulationRole) ===
          normalize(decisionProfile?.circulationBias)
        ) {
          score += 4;
        }
      }

      if (decisionProfile?.socialBias) {
        if (
          normalize(entry.socialRole) === normalize(decisionProfile?.socialBias)
        ) {
          score += 3;
        }
      }

      return {
        ...entry,
        transformationEntryScore: score,
      };
    })
    .sort((a, b) => {
      if (b.transformationEntryScore !== a.transformationEntryScore) {
        return b.transformationEntryScore - a.transformationEntryScore;
      }
      return String(a.term || "").localeCompare(String(b.term || ""));
    });
}

function filterSuggestedEntriesForMove(
  move,
  weakerBoardEntries = [],
  decisionProfile = null,
) {
  const suggestedEntries = Array.isArray(move.suggestedEntries)
    ? move.suggestedEntries
    : [];

  const boardEntryIds = new Set(weakerBoardEntries.map((entry) => entry.id));
  const boardConcepts = getBoardEntryConceptSet(weakerBoardEntries);

  const ranked = rankSuggestedEntriesForMove(
    suggestedEntries,
    move,
    decisionProfile,
  );

  const kept = [];
  const skipped = [];

  const keptConcepts = new Set();

  ranked.forEach((entry) => {
    const conceptKey = getEntryConceptKey(entry);

    if (boardEntryIds.has(entry.id)) {
      skipped.push({
        ...entry,
        skipReason: "already-in-board",
      });
      return;
    }

    if (conceptKey && boardConcepts.has(conceptKey)) {
      skipped.push({
        ...entry,
        skipReason: "conceptually-covered",
      });
      return;
    }

    if (conceptKey && keptConcepts.has(conceptKey)) {
      skipped.push({
        ...entry,
        skipReason: "duplicate-in-selection",
      });
      return;
    }

    if ((entry.transformationEntryScore || 0) <= 0) {
      skipped.push({
        ...entry,
        skipReason: "zero-impact",
      });
      return;
    }

    kept.push(entry);
    if (conceptKey) keptConcepts.add(conceptKey);
  });

  return {
    kept,
    skipped,
  };
}
function buildMissingMoves(
  weaker,
  stronger,
  allEntries,
  weakerBoardEntries,
  transformations,
) {
  const strongerMissingKeys = new Set(stronger.missing.map((item) => item.key));

  for (const item of weaker.missing) {
    if (!strongerMissingKeys.has(item.key)) {
      transformations.push(
        buildMove(
          `resolve-${item.key}`,
          item.severity === "critical" ? "critical" : "core",
          `Resolve ${item.label.toLowerCase()}`,
          "This gap exists in the weaker board but not in the stronger one.",
          item.note,
          findSuggestedEntries(allEntries, weakerBoardEntries, (entry) => {
            if (item.key === "missing-circulation") {
              return (
                normalize(entry.type) === "circulation" ||
                ["directed", "controlled"].includes(
                  normalize(entry.circulationRole),
                )
              );
            }

            if (item.key === "missing-threshold") {
              return (
                normalize(entry.type) === "threshold" ||
                normalize(entry.term).includes("threshold") ||
                normalize(entry.term).includes("buffer")
              );
            }

            if (item.key === "missing-gathering") {
              return ["gathering", "mixed"].includes(
                normalize(entry.socialRole),
              );
            }

            if (item.key === "missing-protected-zone") {
              return (
                ["layered", "restricted"].includes(
                  normalize(entry.privacyLevel),
                ) || normalize(entry.enclosureType) === "controlled"
              );
            }

            return false;
          }),
          findFocusTargets(weakerBoardEntries, () => true, 3),
        ),
      );
    }
  }

  const weakerMissingKeys = new Set(weaker.missing.map((item) => item.key));

  if (
    weakerMissingKeys.has("missing-circulation") &&
    !strongerMissingKeys.has("missing-circulation")
  ) {
    transformations.push(
      buildMove(
        "borrow-circulation-clarity",
        "critical",
        "Borrow circulation clarity from the stronger board",
        "The weaker board lacks circulation structure while the stronger board does not.",
        "Introduce a clearer directional spine or sequence-defining move.",
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.type) === "circulation" ||
            ["directed", "controlled"].includes(
              normalize(entry.circulationRole),
            ),
        ),
        findFocusTargets(
          weakerBoardEntries,
          (entry) => !normalize(entry.circulationRole),
          3,
        ),
      ),
    );
  }

  if (
    weakerMissingKeys.has("missing-threshold") &&
    !strongerMissingKeys.has("missing-threshold")
  ) {
    transformations.push(
      buildMove(
        "borrow-threshold-logic",
        "core",
        "Introduce threshold logic",
        "The stronger board handles transition more clearly.",
        "Add a transitional condition between major spatial states.",
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.type) === "threshold" ||
            normalize(entry.term).includes("threshold") ||
            normalize(entry.term).includes("transition"),
        ),
        findFocusTargets(
          weakerBoardEntries,
          (entry) =>
            ["open", "layered", "restricted"].includes(
              normalize(entry.privacyLevel),
            ),
          3,
        ),
      ),
    );
  }
}

function buildTensionMoves(
  weaker,
  stronger,
  allEntries,
  weakerBoardEntries,
  transformations,
) {
  const strongerTensionKeys = new Set(
    stronger.tensions.map((item) => item.key),
  );

  for (const item of weaker.tensions) {
    if (!strongerTensionKeys.has(item.key)) {
      transformations.push(
        buildMove(
          `reduce-${item.key}`,
          item.severity === "warning" ? "core" : "support",
          `Reduce ${item.label.toLowerCase()}`,
          "This tension weakens the board and does not appear in the stronger comparison case.",
          item.note,
          findSuggestedEntries(allEntries, weakerBoardEntries, (entry) => {
            if (item.key === "privacy-conflict") {
              return (
                normalize(entry.type) === "threshold" ||
                ["layered", "restricted"].includes(
                  normalize(entry.privacyLevel),
                )
              );
            }

            if (item.key === "circulation-ambiguity") {
              return (
                normalize(entry.type) === "circulation" ||
                ["directed", "controlled"].includes(
                  normalize(entry.circulationRole),
                )
              );
            }

            if (item.key === "climate-fragmentation") {
              return Boolean(normalize(entry.climateResponse));
            }

            return false;
          }),
          findFocusTargets(weakerBoardEntries, () => true, 4),
        ),
      );
    }
  }

  const weakPrivacyConflict = weaker.tensions.some(
    (item) => item.key === "privacy-conflict",
  );
  const strongPrivacyConflict = stronger.tensions.some(
    (item) => item.key === "privacy-conflict",
  );

  if (weakPrivacyConflict && !strongPrivacyConflict) {
    transformations.push(
      buildMove(
        "resolve-privacy-conflict",
        "core",
        "Resolve privacy conflict",
        "The stronger board has a clearer privacy hierarchy.",
        "Reduce contradictory open/layered conditions and establish one dominant privacy reading.",
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.type) === "threshold" ||
            ["layered", "restricted"].includes(normalize(entry.privacyLevel)),
        ),
        findFocusTargets(weakerBoardEntries, (entry) =>
          ["open", "layered", "restricted"].includes(
            normalize(entry.privacyLevel),
          ),
        ),
      ),
    );
  }

  const weakCirculationAmbiguity = weaker.tensions.some(
    (item) => item.key === "circulation-ambiguity",
  );
  const strongCirculationAmbiguity = stronger.tensions.some(
    (item) => item.key === "circulation-ambiguity",
  );

  if (weakCirculationAmbiguity && !strongCirculationAmbiguity) {
    transformations.push(
      buildMove(
        "resolve-circulation-ambiguity",
        "support",
        "Resolve circulation ambiguity",
        "The stronger board reads more clearly in movement terms.",
        "Choose whether the board should behave as a sequence or as a distributed field.",
        findSuggestedEntries(
          allEntries,
          weakerBoardEntries,
          (entry) =>
            normalize(entry.type) === "circulation" ||
            ["directed", "controlled"].includes(
              normalize(entry.circulationRole),
            ),
        ),
        findFocusTargets(weakerBoardEntries, (entry) =>
          Boolean(normalize(entry.circulationRole)),
        ),
      ),
    );
  }
}

function buildNextMoveBorrowing(
  weaker,
  stronger,
  allEntries,
  weakerBoardEntries,
  transformations,
) {
  const weakerNextTitles = new Set(
    weaker.nextMoves.map((item) => normalize(item.title)),
  );

  for (const item of stronger.nextMoves) {
    if (!weakerNextTitles.has(normalize(item.title))) {
      transformations.push(
        buildMove(
          `borrow-next-${normalize(item.title).replace(/\s+/g, "-")}`,
          item.priority || "support",
          `Adopt move: ${item.title}`,
          "This move appears in the stronger board’s trajectory but not in the weaker one.",
          item.note,
          findSuggestedEntries(allEntries, weakerBoardEntries, (entry) => {
            const title = normalize(item.title);

            if (title.includes("threshold")) {
              return normalize(entry.type) === "threshold";
            }

            if (title.includes("circulation")) {
              return normalize(entry.type) === "circulation";
            }

            if (title.includes("gathering")) {
              return ["gathering", "mixed"].includes(
                normalize(entry.socialRole),
              );
            }

            if (title.includes("privacy")) {
              return ["layered", "restricted"].includes(
                normalize(entry.privacyLevel),
              );
            }

            return false;
          }),
          findFocusTargets(weakerBoardEntries, () => true, 3),
        ),
      );
    }
  }
}
function getTransformationThemeWeight(move, decisionProfile) {
  if (!decisionProfile) return 0;

  const text = `${move.key} ${move.title} ${move.action}`.toLowerCase();

  let score = 0;

  const acceptedThemes = Array.isArray(
    decisionProfile?.acceptedTransformationThemes,
  )
    ? decisionProfile?.acceptedTransformationThemes
    : [];

  const ignoredThemes = Array.isArray(
    decisionProfile?.ignoredTransformationThemes,
  )
    ? decisionProfile?.ignoredTransformationThemes
    : [];

  acceptedThemes.forEach((theme, index) => {
    if (text.includes(String(theme).toLowerCase())) {
      score += Math.max(10 - index * 2, 3);
    }
  });

  ignoredThemes.forEach((theme, index) => {
    if (text.includes(String(theme).toLowerCase())) {
      score -= Math.max(8 - index * 2, 2);
    }
  });

  return score;
}
function getTransformationKeyPreferenceWeight(move, decisionProfile) {
  if (!decisionProfile) return 0;

  let score = 0;

  const acceptedKeys = Array.isArray(
    decisionProfile?.acceptedTransformationKeys,
  )
    ? decisionProfile?.acceptedTransformationKeys
    : [];

  const ignoredKeys = Array.isArray(decisionProfile?.ignoredTransformationKeys)
    ? decisionProfile?.ignoredTransformationKeys
    : [];

  if (acceptedKeys.includes(move.key)) {
    score += 12;
  }

  if (ignoredKeys.includes(move.key)) {
    score -= 12;
  }

  return score;
}
function getDeselectionPenalty(move, decisionProfile) {
  if (!decisionProfile) return 0;

  const deselectedTypes = Array.isArray(decisionProfile?.deselectedEntryTypes)
    ? decisionProfile?.deselectedEntryTypes
    : [];

  const suggestedEntries = Array.isArray(move.suggestedEntries)
    ? move.suggestedEntries
    : [];

  let penalty = 0;

  suggestedEntries.forEach((entry) => {
    if (!entry?.type) return;
    if (deselectedTypes.includes(entry.type)) {
      penalty += 3;
    }
  });

  return penalty;
}
function sortTransformations(items) {
  return [...items].sort((a, b) => {
    if ((b.impactScore || 0) !== (a.impactScore || 0)) {
      return (b.impactScore || 0) - (a.impactScore || 0);
    }

    const priorityRank = {
      critical: 0,
      core: 1,
      support: 2,
      refinement: 3,
    };

    const aRank = priorityRank[a.priority] ?? 99;
    const bRank = priorityRank[b.priority] ?? 99;

    if (aRank !== bRank) return aRank - bRank;

    return a.title.localeCompare(b.title);
  });
}

function uniqueByKey(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!item?.key || seen.has(item.key)) continue;
    seen.add(item.key);
    result.push(item);
  }

  return result;
}
function getPriorityWeight(priority) {
  if (priority === "critical") return 40;
  if (priority === "core") return 28;
  if (priority === "support") return 16;
  if (priority === "refinement") return 8;
  return 0;
}

function getIssueResolutionWeight(title = "", key = "") {
  const text = `${key} ${title}`.toLowerCase();

  let score = 0;

  if (text.includes("circulation")) score += 14;
  if (text.includes("threshold")) score += 12;
  if (text.includes("privacy")) score += 12;
  if (text.includes("tension")) score += 10;
  if (text.includes("missing")) score += 10;
  if (text.includes("pattern")) score += 8;
  if (text.includes("social")) score += 6;

  return score;
}

function getEntrySupportWeight(move) {
  const suggestedCount = Array.isArray(move.suggestedEntries)
    ? move.suggestedEntries.length
    : 0;

  const focusCount = Array.isArray(move.focusTargets)
    ? move.focusTargets.length
    : 0;

  return suggestedCount * 4 + focusCount * 2;
}

function getIdentityAlignmentWeight(weaker, stronger, move) {
  const text = `${move.key} ${move.title}`.toLowerCase();

  let score = 0;

  if (
    weaker?.identity?.privacyModel !== stronger?.identity?.privacyModel &&
    text.includes("privacy")
  ) {
    score += 12;
  }

  if (
    weaker?.identity?.circulationModel !==
      stronger?.identity?.circulationModel &&
    text.includes("circulation")
  ) {
    score += 12;
  }

  if (
    weaker?.identity?.socialModel !== stronger?.identity?.socialModel &&
    text.includes("social")
  ) {
    score += 8;
  }

  if (
    weaker?.identity?.spatialPattern !== stronger?.identity?.spatialPattern &&
    text.includes("pattern")
  ) {
    score += 10;
  }

  return score;
}

function getPreferenceFitWeight(move, decisionProfile) {
  if (!decisionProfile) return 0;

  const text = `${move.key} ${move.title} ${move.action}`.toLowerCase();

  let score = 0;

  if (
    decisionProfile?.privacyBias &&
    text.includes(String(decisionProfile?.privacyBias).toLowerCase())
  ) {
    score += 8;
  }

  if (
    decisionProfile?.circulationBias &&
    text.includes(String(decisionProfile?.circulationBias).toLowerCase())
  ) {
    score += 8;
  }

  if (
    decisionProfile?.socialBias &&
    text.includes(String(decisionProfile?.socialBias).toLowerCase())
  ) {
    score += 6;
  }

  if (
    Array.isArray(decisionProfile?.preferredPatterns) &&
    decisionProfile?.preferredPatterns.some((pattern) =>
      text.includes(String(pattern).toLowerCase()),
    )
  ) {
    score += 8;
  }

  return score;
}

function scoreTransformationMove(move, weaker, stronger, decisionProfile) {
  const priorityWeight = getPriorityWeight(move.priority);
  const issueWeight = getIssueResolutionWeight(move.title, move.key);
  const entrySupportWeight = getEntrySupportWeight(move);
  const identityAlignmentWeight = getIdentityAlignmentWeight(
    weaker,
    stronger,
    move,
  );
  const preferenceFitWeight = getPreferenceFitWeight(move, decisionProfile);
  const transformationThemeWeight = getTransformationThemeWeight(
    move,
    decisionProfile,
  );
  const transformationKeyWeight = getTransformationKeyPreferenceWeight(
    move,
    decisionProfile,
  );
  const deselectionPenalty = getDeselectionPenalty(move, decisionProfile);

  const impactScore =
    priorityWeight +
    issueWeight +
    entrySupportWeight +
    identityAlignmentWeight +
    preferenceFitWeight +
    transformationThemeWeight +
    transformationKeyWeight -
    deselectionPenalty;

  return {
    ...move,
    impactScore,
    impactBreakdown: {
      priorityWeight,
      issueWeight,
      entrySupportWeight,
      identityAlignmentWeight,
      preferenceFitWeight,
      transformationThemeWeight,
      transformationKeyWeight,
      deselectionPenalty,
    },
  };
}
function inferMoveThemes(move) {
  const text =
    `${move?.key || ""} ${move?.title || ""} ${move?.action || ""}`.toLowerCase();
  const themes = [];

  if (text.includes("privacy")) themes.push("privacy");
  if (text.includes("circulation")) themes.push("circulation");
  if (text.includes("threshold")) themes.push("threshold");
  if (text.includes("social")) themes.push("social");
  if (text.includes("pattern")) themes.push("pattern");
  if (text.includes("climate")) themes.push("climate");
  if (text.includes("tension")) themes.push("tension");
  if (text.includes("missing")) themes.push("missing");

  return themes;
}
function scoreCandidateEntryForThemes(
  entry,
  themes = [],
  decisionProfile = null,
) {
  let score = 0;

  if (themes.includes("privacy")) {
    if (
      ["layered", "restricted", "semi-private", "semi-private"].includes(
        normalize(entry?.privacyLevel),
      )
    ) {
      score += 16;
    }
    if (normalize(entry?.type) === "threshold") score += 10;
  }

  if (themes.includes("threshold")) {
    if (normalize(entry?.type) === "threshold") score += 18;
    if (normalize(entry?.term).includes("threshold")) score += 10;
    if (normalize(entry?.term).includes("buffer")) score += 8;
    if (normalize(entry?.term).includes("transition")) score += 8;
  }

  if (themes.includes("circulation")) {
    if (normalize(entry?.type) === "circulation") score += 16;
    if (
      ["directed", "controlled", "threshold"].includes(
        normalize(entry?.circulationRole),
      )
    ) {
      score += 10;
    }
  }

  if (themes.includes("social")) {
    if (["mixed", "gathering"].includes(normalize(entry?.socialRole))) {
      score += 14;
    }
  }

  if (themes.includes("climate")) {
    if (
      normalize(entry?.climateResponse) &&
      normalize(entry?.climateResponse) !== "neutral"
    ) {
      score += 10;
    }
  }

  if (decisionProfile?.privacyBias) {
    if (
      normalize(entry?.privacyLevel) === normalize(decisionProfile.privacyBias)
    ) {
      score += 5;
    }
  }

  if (decisionProfile?.circulationBias) {
    if (
      normalize(entry?.circulationRole) ===
      normalize(decisionProfile.circulationBias)
    ) {
      score += 5;
    }
  }

  if (decisionProfile?.socialBias) {
    if (
      normalize(entry?.socialRole) === normalize(decisionProfile.socialBias)
    ) {
      score += 4;
    }
  }

  return score;
}
function operationalizeTransformationMove(
  move,
  allEntries = [],
  weakerBoardEntries = [],
  decisionProfile = null,
) {
  const existingSuggestedEntries = Array.isArray(move?.suggestedEntries)
    ? move.suggestedEntries
    : [];

  if (existingSuggestedEntries.length > 0) {
    return {
      ...move,
      isActionable: true,
      actionableReason: "existing-suggestions",
    };
  }

  const focusTargets = Array.isArray(move?.focusTargets)
    ? move.focusTargets
    : [];
  if (!focusTargets.length) {
    return {
      ...move,
      suggestedEntries: [],
      isActionable: false,
      actionableReason: "no-focus-targets",
    };
  }

  const weakerBoardIds = new Set(
    weakerBoardEntries.map((entry) => entry?.id).filter(Boolean),
  );
  const themes = inferMoveThemes(move);

  const focusTargetIds = new Set(
    focusTargets.map((item) => item?.id).filter(Boolean),
  );

  const candidates = allEntries
    .filter((entry) => {
      if (!entry?.id) return false;
      if (weakerBoardIds.has(entry.id)) return false;
      if (focusTargetIds.has(entry.id)) return false;
      return true;
    })
    .map((entry) => ({
      ...entry,
      operationalizationScore: scoreCandidateEntryForThemes(
        entry,
        themes,
        decisionProfile,
      ),
    }))
    .filter((entry) => entry.operationalizationScore > 0)
    .sort((a, b) => b.operationalizationScore - a.operationalizationScore);

  const derivedSuggestedEntries = candidates.slice(0, 4);

  return {
    ...move,
    suggestedEntries: derivedSuggestedEntries,
    isActionable: derivedSuggestedEntries.length > 0,
    actionableReason: derivedSuggestedEntries.length
      ? "derived-from-focus-targets"
      : "no-derived-suggestions",
  };
}

export function buildBoardTransformations({
  boardA,
  boardB,
  entries = [],
  decisionProfile = null,
  existingComparison = null,
}) {
  const comparison =
    existingComparison ||
    compareBoards(boardA, boardB, entries, decisionProfile);

  if (!comparison) return null;

  if (!comparison.strongerSide || comparison.strongerSide === "tie") {
    return {
      comparison,
      weakerBoard: null,
      strongerBoard: null,
      summary:
        "The boards are too close to define a meaningful transformation direction.",
      transformations: [],
    };
  }

  const stronger =
    comparison.strongerSide === "A" ? comparison.boardA : comparison.boardB;
  const weaker =
    comparison.strongerSide === "A" ? comparison.boardB : comparison.boardA;

  const weakerSourceBoard = comparison.strongerSide === "A" ? boardB : boardA;
  const weakerBoardEntries = getBoardEntries(weakerSourceBoard, entries);

  const transformations = [];

  buildIdentityMoves(
    weaker,
    stronger,
    entries,
    weakerBoardEntries,
    transformations,
  );
  buildMissingMoves(
    weaker,
    stronger,
    entries,
    weakerBoardEntries,
    transformations,
  );
  buildTensionMoves(
    weaker,
    stronger,
    entries,
    weakerBoardEntries,
    transformations,
  );
  buildNextMoveBorrowing(
    weaker,
    stronger,
    entries,
    weakerBoardEntries,
    transformations,
  );

  const unique = uniqueByKey(transformations);

  const operationalized = unique.map((move) =>
    operationalizeTransformationMove(
      move,
      entries,
      weakerBoardEntries,
      decisionProfile,
    ),
  );

  const actionableOnly = operationalized.filter((move) => move.isActionable);

  const scored = actionableOnly.map((move) =>
    scoreTransformationMove(move, weaker, stronger, decisionProfile),
  );

  const filtered = scored.map((move) => {
    const filtering = filterSuggestedEntriesForMove(
      move,
      weakerBoardEntries,
      decisionProfile,
    );

    const keptCount = filtering.kept.length;
    const skippedCount = filtering.skipped.length;

    return {
      ...move,
      suggestedEntries: filtering.kept,
      skippedSuggestedEntries: filtering.skipped,
      isActionable: filtering.kept.length > 0,
      impactScore: (move.impactScore || 0) + keptCount * 3 - skippedCount * 2,
    };
  });

  const ordered = sortTransformations(
    filtered.filter((move) => move.isActionable),
  );

  return {
    comparison,
    weakerBoard: weaker,
    strongerBoard: stronger,
    summary: ordered.length
      ? `${weaker.boardName} can be moved toward ${stronger.boardName} by clarifying identity, closing structural gaps, and borrowing stronger directional moves.`
      : `No actionable transformation moves were found. The remaining differences are currently descriptive rather than directly operational.`,
    transformations: ordered,
  };
}
