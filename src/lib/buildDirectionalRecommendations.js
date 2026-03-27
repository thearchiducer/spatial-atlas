import { evaluateBoardDirection } from "./evaluateBoardDirection";
import { compareBoards } from "./compareBoards";

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

function pushRecommendation(list, item) {
  if (!item) return;
  list.push(item);
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeEntryIds(board) {
  if (!board) return [];

  if (Array.isArray(board.entryIds)) {
    return board.entryIds.filter(Boolean);
  }

  // fallback ONLY if entries is actually an array of IDs
  if (Array.isArray(board.entries)) {
    return board.entries
      .map((entry) => (typeof entry === "string" ? entry : entry?.id))
      .filter(Boolean);
  }

  return [];
}

function getBoardEntries(board, entries) {
  const ids = new Set(normalizeEntryIds(board));
  return entries.filter((entry) => ids.has(entry.id));
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

function findFocusTargets(boardEntries, matcher, limit = 3) {
  return boardEntries
    .filter(matcher)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      term: entry.term,
      type: entry.type,
    }));
}

function buildFromMissing(analysis, allEntries, boardEntries, recommendations) {
  for (const item of analysis.missing) {
    if (item.key === "missing-circulation") {
      pushRecommendation(recommendations, {
        key: "add-circulation-spine",
        category: "spatial-structure",
        priority: "critical",
        title: "Add a circulation spine",
        why: item.note,
        action:
          "Introduce an entry or relation that clearly organizes movement across the board.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            normalize(entry.type) === "circulation" ||
            ["directed", "controlled"].includes(
              normalize(entry.circulationRole),
            ),
        ),
        focusTargets: [],
      });
    }

    if (item.key === "missing-threshold") {
      pushRecommendation(recommendations, {
        key: "insert-threshold",
        category: "transition",
        priority: "core",
        title: "Insert a threshold condition",
        why: item.note,
        action:
          "Add a mediating spatial condition between exposed and protected states.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            normalize(entry.type) === "threshold" ||
            normalize(entry.term).includes("threshold") ||
            normalize(entry.term).includes("buffer") ||
            normalize(entry.term).includes("transition"),
        ),
        focusTargets: findFocusTargets(boardEntries, (entry) =>
          ["open", "layered", "restricted"].includes(
            normalize(entry.privacyLevel),
          ),
        ),
      });
    }

    if (item.key === "missing-gathering") {
      pushRecommendation(recommendations, {
        key: "add-gathering-anchor",
        category: "social",
        priority: "core",
        title: "Add a gathering anchor",
        why: item.note,
        action:
          "Introduce a gathering-oriented or mixed social entry to stabilize collective use.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["gathering", "mixed"].includes(normalize(entry.socialRole)),
        ),
        focusTargets: [],
      });
    }

    if (item.key === "missing-protected-zone") {
      pushRecommendation(recommendations, {
        key: "strengthen-protected-zone",
        category: "privacy",
        priority: "core",
        title: "Strengthen a protected zone",
        why: item.note,
        action:
          "Add or reinforce a buffered, layered, or controlled condition in the board.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["layered", "restricted"].includes(normalize(entry.privacyLevel)) ||
            normalize(entry.enclosureType) === "controlled",
        ),
        focusTargets: findFocusTargets(
          boardEntries,
          (entry) => normalize(entry.privacyLevel) === "open",
        ),
      });
    }
  }
}

function buildFromTensions(
  analysis,
  allEntries,
  boardEntries,
  recommendations,
) {
  for (const item of analysis.tensions) {
    if (item.key === "privacy-conflict") {
      pushRecommendation(recommendations, {
        key: "clarify-privacy-hierarchy",
        category: "privacy",
        priority: "core",
        title: "Clarify privacy hierarchy",
        why: item.note,
        action:
          "Decide whether the board primarily exposes, protects, or sequences privacy.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["layered", "restricted"].includes(normalize(entry.privacyLevel)) ||
            normalize(entry.type) === "threshold",
        ),
        focusTargets: findFocusTargets(boardEntries, (entry) =>
          ["open", "layered", "restricted"].includes(
            normalize(entry.privacyLevel),
          ),
        ),
      });
    }

    if (item.key === "circulation-ambiguity") {
      pushRecommendation(recommendations, {
        key: "resolve-circulation-reading",
        category: "spatial-structure",
        priority: "support",
        title: "Resolve circulation ambiguity",
        why: item.note,
        action:
          "Choose whether movement should read as directed sequence or distributed network.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            normalize(entry.type) === "circulation" ||
            ["directed", "controlled", "mixed"].includes(
              normalize(entry.circulationRole),
            ),
        ),
        focusTargets: findFocusTargets(boardEntries, (entry) =>
          Boolean(normalize(entry.circulationRole)),
        ),
      });
    }

    if (item.key === "climate-fragmentation") {
      pushRecommendation(recommendations, {
        key: "consolidate-climate-response",
        category: "climate",
        priority: "support",
        title: "Consolidate climate response",
        why: item.note,
        action:
          "Reduce competing environmental ideas and commit to one dominant climate strategy.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) => Boolean(normalize(entry.climateResponse)),
        ),
        focusTargets: findFocusTargets(boardEntries, (entry) =>
          Boolean(normalize(entry.climateResponse)),
        ),
      });
    }

    if (item.key === "underdefined-board") {
      pushRecommendation(recommendations, {
        key: "increase-board-definition",
        category: "board-development",
        priority: "critical",
        title: "Increase board definition",
        why: item.note,
        action:
          "Add a few more structurally meaningful entries before making directional judgments.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["threshold", "circulation", "room", "zone"].includes(
              normalize(entry.type),
            ),
          6,
        ),
        focusTargets: [],
      });
    }
  }
}

function buildFromIdentity(
  analysis,
  allEntries,
  boardEntries,
  recommendations,
) {
  const { identity } = analysis;

  if (
    identity.privacyModel === "open" &&
    identity.circulationModel === "mixed"
  ) {
    pushRecommendation(recommendations, {
      key: "stabilize-open-field",
      category: "pattern",
      priority: "support",
      title: "Stabilize the open-field logic",
      why: "The board is reading as open and mixed, which can drift unless anchored.",
      action:
        "Add one strong organizer so openness remains intentional instead of vague.",
      suggestedEntries: findSuggestedEntries(
        allEntries,
        boardEntries,
        (entry) =>
          normalize(entry.type) === "threshold" ||
          ["directed", "controlled"].includes(normalize(entry.circulationRole)),
      ),
      focusTargets: findFocusTargets(
        boardEntries,
        (entry) =>
          normalize(entry.privacyLevel) === "open" ||
          normalize(entry.circulationRole) === "mixed",
      ),
    });
  }

  if (
    identity.privacyModel === "layered" &&
    identity.circulationModel === "directed"
  ) {
    pushRecommendation(recommendations, {
      key: "reinforce-layered-sequence",
      category: "pattern",
      priority: "refinement",
      title: "Reinforce the layered sequence",
      why: "The board already shows a clear sequential pattern worth sharpening.",
      action:
        "Strengthen transitions and remove entries that weaken the privacy gradient.",
      suggestedEntries: findSuggestedEntries(
        allEntries,
        boardEntries,
        (entry) =>
          normalize(entry.type) === "threshold" ||
          normalize(entry.term).includes("buffer") ||
          normalize(entry.circulationRole) === "directed",
      ),
      focusTargets: findFocusTargets(boardEntries, (entry) =>
        ["layered", "restricted"].includes(normalize(entry.privacyLevel)),
      ),
    });
  }

  if (identity.socialModel === "mixed") {
    pushRecommendation(recommendations, {
      key: "sharpen-social-model",
      category: "social",
      priority: "support",
      title: "Sharpen the social model",
      why: "The board combines multiple social readings without a dominant behavioral stance.",
      action:
        "Decide whether the board should primarily gather, retreat, or balance both deliberately.",
      suggestedEntries: findSuggestedEntries(
        allEntries,
        boardEntries,
        (entry) =>
          ["gathering", "retreat"].includes(normalize(entry.socialRole)),
      ),
      focusTargets: findFocusTargets(boardEntries, (entry) =>
        Boolean(normalize(entry.socialRole)),
      ),
    });
  }
}

function buildFromComparison(
  analysis,
  comparison,
  allEntries,
  boardEntries,
  recommendations,
) {
  if (!comparison) return;

  const side =
    comparison.boardA.boardId === analysis.boardId
      ? "A"
      : comparison.boardB.boardId === analysis.boardId
        ? "B"
        : null;

  if (!side) return;

  const isWeaker = comparison.strongerSide && comparison.strongerSide !== side;
  if (!isWeaker) return;

  for (const item of comparison.scoreReasons) {
    if (item.winner === side) continue;

    if (item.key === "strength-score") {
      pushRecommendation(recommendations, {
        key: "increase-architectural-strength",
        category: "comparison",
        priority: "core",
        title: "Increase architectural strength",
        why: item.note,
        action:
          "Add entries or relations that make the board’s main spatial idea more legible.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["layered", "restricted"].includes(normalize(entry.privacyLevel)) ||
            ["directed", "controlled"].includes(
              normalize(entry.circulationRole),
            ),
        ),
        focusTargets: [],
      });
    }

    if (item.key === "missing-elements") {
      pushRecommendation(recommendations, {
        key: "close-structural-gaps",
        category: "comparison",
        priority: "critical",
        title: "Close structural gaps",
        why: item.note,
        action:
          "Resolve the board’s missing spatial ingredients before refining style or character.",
        suggestedEntries: findSuggestedEntries(
          allEntries,
          boardEntries,
          (entry) =>
            ["threshold", "circulation"].includes(normalize(entry.type)) ||
            ["gathering", "mixed"].includes(normalize(entry.socialRole)),
          6,
        ),
        focusTargets: [],
      });
    }

    if (item.key === "internal-tensions") {
      pushRecommendation(recommendations, {
        key: "reduce-internal-tensions",
        category: "comparison",
        priority: "core",
        title: "Reduce internal tensions",
        why: item.note,
        action:
          "Simplify contradictory moves so the board reads as one direction instead of several.",
        suggestedEntries: [],
        focusTargets: findFocusTargets(
          boardEntries,
          (entry) =>
            Boolean(normalize(entry.privacyLevel)) ||
            Boolean(normalize(entry.circulationRole)) ||
            Boolean(normalize(entry.climateResponse)),
          4,
        ),
      });
    }
  }

  for (const diff of comparison.identityDifferences) {
    if (diff.a === diff.b) continue;

    pushRecommendation(recommendations, {
      key: `identity-gap-${diff.key}`,
      category: "identity",
      priority: "support",
      title: `Review ${diff.label.toLowerCase()} model`,
      why: `The stronger board differs in ${diff.label.toLowerCase()}.`,
      action: `Check whether your current ${diff.label.toLowerCase()} reading is intentional or accidental.`,
      suggestedEntries: findSuggestedEntries(
        allEntries,
        boardEntries,
        (entry) => {
          const label = normalize(diff.label);
          if (label === "privacy") {
            return Boolean(normalize(entry.privacyLevel));
          }
          if (label === "circulation") {
            return Boolean(normalize(entry.circulationRole));
          }
          if (label === "social") {
            return Boolean(normalize(entry.socialRole));
          }
          if (label === "climate") {
            return Boolean(normalize(entry.climateResponse));
          }
          return Boolean(normalize(entry.type));
        },
      ),
      focusTargets: [],
    });
  }
}

function sortRecommendations(items) {
  const priorityRank = {
    critical: 0,
    core: 1,
    support: 2,
    refinement: 3,
  };

  return [...items].sort((a, b) => {
    const aRank = priorityRank[a.priority] ?? 99;
    const bRank = priorityRank[b.priority] ?? 99;

    if (aRank !== bRank) return aRank - bRank;
    return a.title.localeCompare(b.title);
  });
}

function groupRecommendations(items) {
  const groups = {
    critical: [],
    core: [],
    support: [],
    refinement: [],
  };

  for (const item of items) {
    if (!groups[item.priority]) {
      groups.support.push(item);
    } else {
      groups[item.priority].push(item);
    }
  }

  return groups;
}
function buildFromBoardComparison(comparison, board, recommendations) {
  if (!comparison || !board) return;

  const boardId = board.id;
  const weakerBoardId =
    comparison.strongerSide === "A"
      ? comparison.boardB?.boardId
      : comparison.strongerSide === "B"
        ? comparison.boardA?.boardId
        : null;

  if (!weakerBoardId || weakerBoardId !== boardId) return;

  const strongerBoard =
    comparison.strongerSide === "A" ? comparison.boardA : comparison.boardB;

  const weakerBoard =
    comparison.strongerSide === "A" ? comparison.boardB : comparison.boardA;

  if (
    weakerBoard?.identity?.privacyModel !==
    strongerBoard?.identity?.privacyModel
  ) {
    recommendations.push({
      key: "compare-borrow-privacy-model",
      category: "comparison",
      priority: "core",
      title: `Borrow privacy logic from ${strongerBoard.boardName}`,
      why: `${strongerBoard.boardName} expresses a stronger privacy model (${strongerBoard.identity.privacyModel}).`,
      action: `Rework the weaker board so its privacy model moves toward ${strongerBoard.identity.privacyModel}.`,
      suggestedEntries: [],
      focusTargets: [],
    });
  }

  if (
    weakerBoard?.identity?.circulationModel !==
    strongerBoard?.identity?.circulationModel
  ) {
    recommendations.push({
      key: "compare-borrow-circulation-model",
      category: "comparison",
      priority: "core",
      title: `Borrow circulation clarity from ${strongerBoard.boardName}`,
      why: `${strongerBoard.boardName} has a stronger circulation reading (${strongerBoard.identity.circulationModel}).`,
      action: `Clarify movement so the weaker board behaves more like ${strongerBoard.identity.circulationModel}.`,
      suggestedEntries: [],
      focusTargets: [],
    });
  }

  const weakerMissingKeys = new Set(
    (weakerBoard?.missing || []).map((item) => item.key),
  );
  const strongerMissingKeys = new Set(
    (strongerBoard?.missing || []).map((item) => item.key),
  );

  if (
    weakerMissingKeys.has("missing-threshold") &&
    !strongerMissingKeys.has("missing-threshold")
  ) {
    recommendations.push({
      key: "compare-borrow-threshold-logic",
      category: "comparison",
      priority: "critical",
      title: `Borrow threshold logic from ${strongerBoard.boardName}`,
      why: `${weakerBoard.boardName} is missing threshold structure while ${strongerBoard.boardName} is not.`,
      action:
        "Add a threshold or transition condition that clarifies sequence and privacy shifts.",
      suggestedEntries: [],
      focusTargets: [],
    });
  }

  if (
    weakerMissingKeys.has("missing-circulation") &&
    !strongerMissingKeys.has("missing-circulation")
  ) {
    recommendations.push({
      key: "compare-borrow-circulation-spine",
      category: "comparison",
      priority: "critical",
      title: `Introduce circulation spine from ${strongerBoard.boardName}`,
      why: `${weakerBoard.boardName} lacks circulation structure that exists in the stronger board.`,
      action:
        "Add a clearer movement spine or sequence-defining circulation structure.",
      suggestedEntries: [],
      focusTargets: [],
    });
  }

  const weakerTensionKeys = new Set(
    (weakerBoard?.tensions || []).map((item) => item.key),
  );
  const strongerTensionKeys = new Set(
    (strongerBoard?.tensions || []).map((item) => item.key),
  );

  if (
    weakerTensionKeys.has("privacy-conflict") &&
    !strongerTensionKeys.has("privacy-conflict")
  ) {
    recommendations.push({
      key: "compare-reduce-privacy-conflict",
      category: "comparison",
      priority: "core",
      title: "Reduce privacy conflict seen only in weaker board",
      why: "The weaker board contains a privacy conflict not present in the stronger board.",
      action:
        "Reduce contradictory privacy conditions and establish a more coherent hierarchy.",
      suggestedEntries: [],
      focusTargets: [],
    });
  }

  if (
    weakerTensionKeys.has("circulation-ambiguity") &&
    !strongerTensionKeys.has("circulation-ambiguity")
  ) {
    recommendations.push({
      key: "compare-reduce-circulation-ambiguity",
      category: "comparison",
      priority: "support",
      title: "Reduce circulation ambiguity seen only in weaker board",
      why: "The weaker board has ambiguous circulation not present in the stronger board.",
      action:
        "Choose a clearer movement logic and reduce contradictory movement cues.",
      suggestedEntries: [],
      focusTargets: [],
    });
  }
}
export function buildDirectionalRecommendations({
  board,
  entries = [],
  comparisonBoard = null,
  decisionProfile = null,
  existingAnalysis = null,
  existingComparison = null,
}) {
  if (!board) return null;

  const analysis = existingAnalysis || evaluateBoardDirection(board, entries);
  const boardEntries = getBoardEntries(board, entries);
  const comparison = existingComparison
    ? existingComparison
    : comparisonBoard
      ? compareBoards(board, comparisonBoard, entries, decisionProfile)
      : null;

  const recommendations = [];

  buildFromMissing(analysis, entries, boardEntries, recommendations);
  buildFromTensions(analysis, entries, boardEntries, recommendations);
  buildFromIdentity(analysis, entries, boardEntries, recommendations);
  buildFromComparison(
    analysis,
    comparison,
    entries,
    boardEntries,
    recommendations,
  );
  buildFromBoardComparison(comparison, board, recommendations);

  if (!recommendations.length) {
    recommendations.push({
      key: "refine-dominant-pattern",
      category: "refinement",
      priority: "refinement",
      title: "Refine the dominant pattern",
      why: "The board is relatively coherent and no major structural repair is required.",
      action:
        "Focus on sharpening the strongest pattern rather than adding unrelated entries.",
      suggestedEntries: [],
      focusTargets: findFocusTargets(boardEntries, () => true, 3),
    });
  }

  const unique = uniqueByKey(recommendations);
  const ordered = sortRecommendations(unique);
  const grouped = groupRecommendations(ordered);

  return {
    boardId: analysis.boardId,
    boardName: analysis.boardName,
    summary:
      ordered[0]?.title || "No urgent recommendations. Continue refinement.",
    all: ordered,
    grouped,
    comparisonUsed: Boolean(comparisonBoard),
  };
}
