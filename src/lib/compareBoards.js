import { evaluateBoardDirection } from "./evaluateBoardDirection";
import { getBoardPatternPreferenceBoost } from "./preferenceScoring";

function compareNumbers(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function buildReason(label, winner, difference, note) {
  if (!winner || difference <= 0) return null;

  return {
    key: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    winner,
    difference,
    note,
  };
}

function compareScoreBreakdown(a, b) {
  const reasons = [];

  const strengthWinner = compareNumbers(
    a.scoreBreakdown.strengthScore,
    b.scoreBreakdown.strengthScore,
  );

  if (strengthWinner !== 0) {
    reasons.push(
      buildReason(
        "Strength score",
        strengthWinner > 0 ? "A" : "B",
        Math.abs(
          a.scoreBreakdown.strengthScore - b.scoreBreakdown.strengthScore,
        ),
        "One board contains stronger readable architectural advantages.",
      ),
    );
  }

  const missingWinner = compareNumbers(
    b.scoreBreakdown.missingPenalty,
    a.scoreBreakdown.missingPenalty,
  );

  if (missingWinner !== 0) {
    reasons.push(
      buildReason(
        "Missing elements",
        missingWinner > 0 ? "A" : "B",
        Math.abs(
          a.scoreBreakdown.missingPenalty - b.scoreBreakdown.missingPenalty,
        ),
        "One board has fewer missing structural ingredients.",
      ),
    );
  }

  const tensionWinner = compareNumbers(
    b.scoreBreakdown.tensionPenalty,
    a.scoreBreakdown.tensionPenalty,
  );

  if (tensionWinner !== 0) {
    reasons.push(
      buildReason(
        "Internal tensions",
        tensionWinner > 0 ? "A" : "B",
        Math.abs(
          a.scoreBreakdown.tensionPenalty - b.scoreBreakdown.tensionPenalty,
        ),
        "One board is internally more stable and less contradictory.",
      ),
    );
  }

  return reasons.filter(Boolean);
}

function compareIdentity(a, b) {
  const differences = [];

  const keys = [
    ["privacyModel", "Privacy"],
    ["circulationModel", "Circulation"],
    ["socialModel", "Social"],
    ["climateModel", "Climate"],
    ["spatialPattern", "Pattern"],
  ];

  for (const [key, label] of keys) {
    const left = a.identity[key];
    const right = b.identity[key];

    if (left !== right) {
      differences.push({
        key,
        label,
        a: left,
        b: right,
      });
    }
  }

  return differences;
}

function compareListLengths(aList, bList, label, betterWhenLower = false) {
  const aCount = aList.length;
  const bCount = bList.length;

  if (aCount === bCount) {
    return null;
  }

  const winner = betterWhenLower
    ? aCount < bCount
      ? "A"
      : "B"
    : aCount > bCount
      ? "A"
      : "B";

  return {
    key: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    winner,
    aCount,
    bCount,
    difference: Math.abs(aCount - bCount),
  };
}

function buildRawVerdict(a, b, scoreReasons) {
  if (a.score === b.score) {
    return {
      strongerBoardId: null,
      strongerSide: "tie",
      summary:
        "Both boards are currently close in raw architectural strength and need qualitative judgment beyond score alone.",
    };
  }

  const strongerSide = a.score > b.score ? "A" : "B";
  const strongerBoardId = a.score > b.score ? a.boardId : b.boardId;
  const strongerBoardName = a.score > b.score ? a.boardName : b.boardName;
  const leadReason = scoreReasons[0];

  return {
    strongerBoardId,
    strongerSide,
    summary: leadReason
      ? `${strongerBoardName} is currently stronger architecturally, mainly because of ${leadReason.label.toLowerCase()}.`
      : `${strongerBoardName} is currently stronger by raw board score.`,
  };
}

function buildPreferenceVerdict(
  analysisA,
  analysisB,
  preferenceBoostA,
  preferenceBoostB,
) {
  const adjustedScoreA = analysisA.score + preferenceBoostA;
  const adjustedScoreB = analysisB.score + preferenceBoostB;

  if (adjustedScoreA === adjustedScoreB) {
    return {
      strongerBoardId: null,
      strongerSide: "tie",
      adjustedScoreA,
      adjustedScoreB,
      scoreGap: 0,
      summary:
        "Both boards currently align equally with the learned preference profile.",
    };
  }

  const strongerSide = adjustedScoreA > adjustedScoreB ? "A" : "B";
  const strongerBoardId =
    adjustedScoreA > adjustedScoreB ? analysisA.boardId : analysisB.boardId;
  const strongerBoardName =
    adjustedScoreA > adjustedScoreB ? analysisA.boardName : analysisB.boardName;

  return {
    strongerBoardId,
    strongerSide,
    adjustedScoreA,
    adjustedScoreB,
    scoreGap: Math.abs(adjustedScoreA - adjustedScoreB),
    summary: `${strongerBoardName} is currently more aligned with the learned preference profile for this context.`,
  };
}

function buildPreferenceReasons(
  analysisA,
  analysisB,
  preferenceBoostA,
  preferenceBoostB,
  decisionProfile,
) {
  if (!decisionProfile) return [];

  const reasons = [];

  if (preferenceBoostA !== preferenceBoostB) {
    reasons.push({
      key: "preference-alignment",
      label: "Preference alignment",
      winner: preferenceBoostA > preferenceBoostB ? "A" : "B",
      difference: Math.abs(preferenceBoostA - preferenceBoostB),
      note: "One board is more aligned with the learned preference profile.",
    });
  }

  if (
    decisionProfile?.privacyBias &&
    analysisA.identity.privacyModel !== analysisB.identity.privacyModel
  ) {
    const aMatch =
      String(analysisA.identity.privacyModel).toLowerCase() ===
      String(decisionProfile?.privacyBias).toLowerCase();
    const bMatch =
      String(analysisB.identity.privacyModel).toLowerCase() ===
      String(decisionProfile?.privacyBias).toLowerCase();

    if (aMatch !== bMatch) {
      reasons.push({
        key: "privacy-bias-fit",
        label: "Privacy bias fit",
        winner: aMatch ? "A" : "B",
        difference: 1,
        note: `One board aligns more closely with the learned privacy bias (${decisionProfile?.privacyBias}).`,
      });
    }
  }

  if (
    decisionProfile?.circulationBias &&
    analysisA.identity.circulationModel !== analysisB.identity.circulationModel
  ) {
    const aMatch =
      String(analysisA.identity.circulationModel).toLowerCase() ===
      String(decisionProfile?.circulationBias).toLowerCase();
    const bMatch =
      String(analysisB.identity.circulationModel).toLowerCase() ===
      String(decisionProfile?.circulationBias).toLowerCase();

    if (aMatch !== bMatch) {
      reasons.push({
        key: "circulation-bias-fit",
        label: "Circulation bias fit",
        winner: aMatch ? "A" : "B",
        difference: 1,
        note: `One board aligns more closely with the learned circulation bias (${decisionProfile?.circulationBias}).`,
      });
    }
  }

  if (
    Array.isArray(decisionProfile?.preferredPatterns) &&
    decisionProfile?.preferredPatterns.length &&
    analysisA.identity.spatialPattern !== analysisB.identity.spatialPattern
  ) {
    const normalizedPatterns = decisionProfile?.preferredPatterns.map((item) =>
      String(item).toLowerCase(),
    );
    const aMatch = normalizedPatterns.includes(
      String(analysisA.identity.spatialPattern).toLowerCase(),
    );
    const bMatch = normalizedPatterns.includes(
      String(analysisB.identity.spatialPattern).toLowerCase(),
    );

    if (aMatch !== bMatch) {
      reasons.push({
        key: "preferred-pattern-fit",
        label: "Preferred pattern fit",
        winner: aMatch ? "A" : "B",
        difference: 1,
        note: "One board aligns better with the preferred spatial patterns learned from past decisions.",
      });
    }
  }

  return reasons;
}

export function compareBoards(boardA, boardB, entries, decisionProfile = null) {
  if (!boardA || !boardB) {
    return null;
  }

  const analysisA = evaluateBoardDirection(boardA, entries);
  const analysisB = evaluateBoardDirection(boardB, entries);

  const preferenceBoostA = getBoardPatternPreferenceBoost(
    analysisA.identity,
    decisionProfile,
  );
  const preferenceBoostB = getBoardPatternPreferenceBoost(
    analysisB.identity,
    decisionProfile,
  );

  const scoreReasons = compareScoreBreakdown(analysisA, analysisB);
  const identityDifferences = compareIdentity(analysisA, analysisB);

  const listComparisons = [
    compareListLengths(
      analysisA.strengths,
      analysisB.strengths,
      "Strength count",
      false,
    ),
    compareListLengths(
      analysisA.missing,
      analysisB.missing,
      "Missing count",
      true,
    ),
    compareListLengths(
      analysisA.tensions,
      analysisB.tensions,
      "Tension count",
      true,
    ),
    compareListLengths(
      analysisA.nextMoves,
      analysisB.nextMoves,
      "Next move count",
      true,
    ),
  ].filter(Boolean);

  const rawVerdict = buildRawVerdict(analysisA, analysisB, scoreReasons);
  const preferenceVerdict = buildPreferenceVerdict(
    analysisA,
    analysisB,
    preferenceBoostA,
    preferenceBoostB,
  );
  const preferenceReasons = buildPreferenceReasons(
    analysisA,
    analysisB,
    preferenceBoostA,
    preferenceBoostB,
    decisionProfile,
  );

  return {
    boardA: analysisA,
    boardB: analysisB,

    strongerBoardId: rawVerdict.strongerBoardId,
    strongerSide: rawVerdict.strongerSide,
    summary: rawVerdict.summary,
    scoreGap: Math.abs(analysisA.score - analysisB.score),

    rawVerdict,
    preferenceVerdict,

    scoreReasons,
    identityDifferences,
    listComparisons,

    preferenceBoostA,
    preferenceBoostB,
    adjustedScoreA: preferenceVerdict.adjustedScoreA,
    adjustedScoreB: preferenceVerdict.adjustedScoreB,
    preferenceReasons,
    decisionProfileUsed: Boolean(decisionProfile),
  };
}
