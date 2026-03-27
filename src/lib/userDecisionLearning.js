import { getRecommendationPreferenceBoost } from "./preferenceScoring";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function topKey(map) {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

function topKeys(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function inferTransformationThemes(key = "", title = "") {
  const text = `${key} ${title}`.toLowerCase();
  const themes = [];

  if (text.includes("privacy")) themes.push("privacy");
  if (text.includes("circulation")) themes.push("circulation");
  if (text.includes("threshold")) themes.push("threshold");
  if (text.includes("social")) themes.push("social");
  if (text.includes("pattern")) themes.push("pattern");
  if (text.includes("tension")) themes.push("tension");
  if (text.includes("missing")) themes.push("missing");

  return themes;
}

export function createDecisionEvent(type, payload = {}) {
  return {
    id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function summarizeDecisionProfile(decisionLog = []) {
  const log = safeArray(decisionLog);

  const profile = {
    privacyBias: null,
    circulationBias: null,
    socialBias: null,
    climateBias: null,
    preferredPatterns: [],
    acceptedRecommendationKeys: [],
    ignoredRecommendationKeys: [],
    acceptedTransformationKeys: [],
    ignoredTransformationKeys: [],
    acceptedTransformationThemes: [],
    ignoredTransformationThemes: [],
    repeatedEntryTypes: [],
    repeatedEntryIds: [],
    deselectedEntryTypes: [],
    deselectedEntryIds: [],
    totals: {
      acceptedRecommendations: 0,
      ignoredRecommendations: 0,
      selectedEntries: 0,
      addedEntriesToBoard: 0,
      restoredVersions: 0,
      deselectedPreviewEntries: 0,
    },
  };

  const privacyCounts = new Map();
  const circulationCounts = new Map();
  const socialCounts = new Map();
  const climateCounts = new Map();
  const patternCounts = new Map();

  const acceptedRecCounts = new Map();
  const ignoredRecCounts = new Map();

  const entryTypeCounts = new Map();
  const entryIdCounts = new Map();

  const deselectedEntryTypeCounts = new Map();
  const deselectedEntryIdCounts = new Map();

  const acceptedTransformationThemeCounts = new Map();
  const ignoredTransformationThemeCounts = new Map();

  const acceptedTransformationKeys = new Set();
  const ignoredTransformationKeys = new Set();

  for (const event of log) {
    const payload = event?.payload || {};

    if (event.type === "accepted_recommendation") {
      profile.totals.acceptedRecommendations += 1;

      if (payload.recommendationKey) {
        acceptedRecCounts.set(
          payload.recommendationKey,
          (acceptedRecCounts.get(payload.recommendationKey) || 0) + 1,
        );
      }

      if (
        payload.category === "transformation" ||
        payload.category === "transformation-copy" ||
        payload.category === "transformation-redo"
      ) {
        if (payload.recommendationKey) {
          acceptedTransformationKeys.add(payload.recommendationKey);
        }

        const themes = inferTransformationThemes(
          payload.recommendationKey,
          payload.recommendationTitle,
        );

        themes.forEach((theme) => {
          acceptedTransformationThemeCounts.set(
            theme,
            (acceptedTransformationThemeCounts.get(theme) || 0) + 1,
          );
        });
      }
    }

    if (event.type === "ignored_recommendation") {
      profile.totals.ignoredRecommendations += 1;

      if (payload.recommendationKey) {
        ignoredRecCounts.set(
          payload.recommendationKey,
          (ignoredRecCounts.get(payload.recommendationKey) || 0) + 1,
        );
      }

      if (
        payload.category === "transformation-undo" ||
        payload.category === "transformation"
      ) {
        if (payload.recommendationKey) {
          ignoredTransformationKeys.add(payload.recommendationKey);
        }

        const themes = inferTransformationThemes(
          payload.recommendationKey,
          payload.recommendationTitle,
        );

        themes.forEach((theme) => {
          ignoredTransformationThemeCounts.set(
            theme,
            (ignoredTransformationThemeCounts.get(theme) || 0) + 1,
          );
        });
      }
    }

    if (event.type === "selected_entry") {
      profile.totals.selectedEntries += 1;

      if (payload.entryId) {
        entryIdCounts.set(
          payload.entryId,
          (entryIdCounts.get(payload.entryId) || 0) + 1,
        );
      }

      if (payload.entryType) {
        entryTypeCounts.set(
          payload.entryType,
          (entryTypeCounts.get(payload.entryType) || 0) + 1,
        );
      }

      if (payload.privacyLevel) {
        privacyCounts.set(
          payload.privacyLevel,
          (privacyCounts.get(payload.privacyLevel) || 0) + 1,
        );
      }

      if (payload.circulationRole) {
        circulationCounts.set(
          payload.circulationRole,
          (circulationCounts.get(payload.circulationRole) || 0) + 1,
        );
      }

      if (payload.socialRole) {
        socialCounts.set(
          payload.socialRole,
          (socialCounts.get(payload.socialRole) || 0) + 1,
        );
      }

      if (payload.climateResponse) {
        climateCounts.set(
          payload.climateResponse,
          (climateCounts.get(payload.climateResponse) || 0) + 1,
        );
      }
    }

    if (event.type === "added_entry_to_board") {
      profile.totals.addedEntriesToBoard += 1;

      if (payload.entryId) {
        entryIdCounts.set(
          payload.entryId,
          (entryIdCounts.get(payload.entryId) || 0) + 1,
        );
      }

      if (payload.entryType) {
        entryTypeCounts.set(
          payload.entryType,
          (entryTypeCounts.get(payload.entryType) || 0) + 1,
        );
      }
    }

    if (event.type === "restored_direction_version") {
      profile.totals.restoredVersions += 1;

      if (payload.identity?.privacyModel) {
        privacyCounts.set(
          payload.identity.privacyModel,
          (privacyCounts.get(payload.identity.privacyModel) || 0) + 1,
        );
      }

      if (payload.identity?.circulationModel) {
        circulationCounts.set(
          payload.identity.circulationModel,
          (circulationCounts.get(payload.identity.circulationModel) || 0) + 1,
        );
      }

      if (payload.identity?.socialModel) {
        socialCounts.set(
          payload.identity.socialModel,
          (socialCounts.get(payload.identity.socialModel) || 0) + 1,
        );
      }

      if (payload.identity?.climateModel) {
        climateCounts.set(
          payload.identity.climateModel,
          (climateCounts.get(payload.identity.climateModel) || 0) + 1,
        );
      }

      if (payload.identity?.spatialPattern) {
        patternCounts.set(
          payload.identity.spatialPattern,
          (patternCounts.get(payload.identity.spatialPattern) || 0) + 1,
        );
      }
    }

    if (event.type === "deselected_preview_entry") {
      profile.totals.deselectedPreviewEntries += 1;

      if (payload.entryId) {
        deselectedEntryIdCounts.set(
          payload.entryId,
          (deselectedEntryIdCounts.get(payload.entryId) || 0) + 1,
        );
      }

      if (payload.entryType) {
        deselectedEntryTypeCounts.set(
          payload.entryType,
          (deselectedEntryTypeCounts.get(payload.entryType) || 0) + 1,
        );
      }
    }
  }

  profile.privacyBias = topKey(privacyCounts);
  profile.circulationBias = topKey(circulationCounts);
  profile.socialBias = topKey(socialCounts);
  profile.climateBias = topKey(climateCounts);
  profile.preferredPatterns = topKeys(patternCounts, 3);

  profile.acceptedRecommendationKeys = topKeys(acceptedRecCounts, 6);
  profile.ignoredRecommendationKeys = topKeys(ignoredRecCounts, 6);

  profile.acceptedTransformationKeys = Array.from(acceptedTransformationKeys);
  profile.ignoredTransformationKeys = Array.from(ignoredTransformationKeys);
  profile.acceptedTransformationThemes = topKeys(
    acceptedTransformationThemeCounts,
    8,
  );
  profile.ignoredTransformationThemes = topKeys(
    ignoredTransformationThemeCounts,
    8,
  );

  profile.repeatedEntryTypes = topKeys(entryTypeCounts, 6);
  profile.repeatedEntryIds = topKeys(entryIdCounts, 10);

  profile.deselectedEntryTypes = topKeys(deselectedEntryTypeCounts, 6);
  profile.deselectedEntryIds = topKeys(deselectedEntryIdCounts, 10);

  return profile;
}

export function scoreRecommendationForProfile(recommendation, profile) {
  if (!recommendation || !profile) return 0;

  let score = 0;
  const category = normalize(recommendation.category);
  const title = normalize(recommendation.title);
  const key = recommendation.key;

  if (key && safeArray(profile.acceptedRecommendationKeys).includes(key)) {
    score += 18;
  }

  if (key && safeArray(profile.ignoredRecommendationKeys).includes(key)) {
    score -= 18;
  }

  if (profile.privacyBias && title.includes(normalize(profile.privacyBias))) {
    score += 8;
  }

  if (
    profile.circulationBias &&
    title.includes(normalize(profile.circulationBias))
  ) {
    score += 8;
  }

  if (category === "privacy" && profile.privacyBias) score += 6;
  if (category === "social" && profile.socialBias) score += 6;
  if (category === "climate" && profile.climateBias) score += 6;
  if (category === "spatial-structure" && profile.circulationBias) score += 6;

  const suggestedEntries = safeArray(recommendation.suggestedEntries);

  for (const entry of suggestedEntries) {
    if (
      entry?.type &&
      safeArray(profile.repeatedEntryTypes).includes(entry.type)
    ) {
      score += 4;
    }

    if (entry?.id && safeArray(profile.repeatedEntryIds).includes(entry.id)) {
      score += 6;
    }
  }

  return score;
}

export function personalizeRecommendations(
  recommendations = [],
  profile = null,
) {
  const items = safeArray(recommendations);

  return [...items]
    .map((item) => ({
      ...item,
      learningScore: getRecommendationPreferenceBoost(item, profile),
    }))
    .sort((a, b) => {
      if (b.learningScore !== a.learningScore) {
        return b.learningScore - a.learningScore;
      }
      return a.title.localeCompare(b.title);
    });
}

export function getDecisionLogForBoard(decisionLog = [], boardId = null) {
  if (!boardId) return [];

  return safeArray(decisionLog).filter(
    (event) => event?.payload?.boardId === boardId,
  );
}

export function mergeDecisionProfiles(
  primaryProfile = null,
  fallbackProfile = null,
) {
  const primary = primaryProfile || {};
  const fallback = fallbackProfile || {};

  return {
    privacyBias: primary.privacyBias || fallback.privacyBias || null,
    circulationBias:
      primary.circulationBias || fallback.circulationBias || null,
    socialBias: primary.socialBias || fallback.socialBias || null,
    climateBias: primary.climateBias || fallback.climateBias || null,

    preferredPatterns: safeArray(primary.preferredPatterns).length
      ? safeArray(primary.preferredPatterns)
      : safeArray(fallback.preferredPatterns),

    acceptedRecommendationKeys: safeArray(primary.acceptedRecommendationKeys)
      .length
      ? safeArray(primary.acceptedRecommendationKeys)
      : safeArray(fallback.acceptedRecommendationKeys),

    ignoredRecommendationKeys: safeArray(primary.ignoredRecommendationKeys)
      .length
      ? safeArray(primary.ignoredRecommendationKeys)
      : safeArray(fallback.ignoredRecommendationKeys),

    acceptedTransformationKeys: safeArray(primary.acceptedTransformationKeys)
      .length
      ? safeArray(primary.acceptedTransformationKeys)
      : safeArray(fallback.acceptedTransformationKeys),

    ignoredTransformationKeys: safeArray(primary.ignoredTransformationKeys)
      .length
      ? safeArray(primary.ignoredTransformationKeys)
      : safeArray(fallback.ignoredTransformationKeys),

    acceptedTransformationThemes: safeArray(
      primary.acceptedTransformationThemes,
    ).length
      ? safeArray(primary.acceptedTransformationThemes)
      : safeArray(fallback.acceptedTransformationThemes),

    ignoredTransformationThemes: safeArray(primary.ignoredTransformationThemes)
      .length
      ? safeArray(primary.ignoredTransformationThemes)
      : safeArray(fallback.ignoredTransformationThemes),

    repeatedEntryTypes: safeArray(primary.repeatedEntryTypes).length
      ? safeArray(primary.repeatedEntryTypes)
      : safeArray(fallback.repeatedEntryTypes),

    repeatedEntryIds: safeArray(primary.repeatedEntryIds).length
      ? safeArray(primary.repeatedEntryIds)
      : safeArray(fallback.repeatedEntryIds),

    deselectedEntryTypes: safeArray(primary.deselectedEntryTypes).length
      ? safeArray(primary.deselectedEntryTypes)
      : safeArray(fallback.deselectedEntryTypes),

    deselectedEntryIds: safeArray(primary.deselectedEntryIds).length
      ? safeArray(primary.deselectedEntryIds)
      : safeArray(fallback.deselectedEntryIds),

    totals: {
      acceptedRecommendations:
        primary.totals?.acceptedRecommendations ??
        fallback.totals?.acceptedRecommendations ??
        0,
      ignoredRecommendations:
        primary.totals?.ignoredRecommendations ??
        fallback.totals?.ignoredRecommendations ??
        0,
      selectedEntries:
        primary.totals?.selectedEntries ??
        fallback.totals?.selectedEntries ??
        0,
      addedEntriesToBoard:
        primary.totals?.addedEntriesToBoard ??
        fallback.totals?.addedEntriesToBoard ??
        0,
      restoredVersions:
        primary.totals?.restoredVersions ??
        fallback.totals?.restoredVersions ??
        0,
      deselectedPreviewEntries:
        primary.totals?.deselectedPreviewEntries ??
        fallback.totals?.deselectedPreviewEntries ??
        0,
    },
  };
}

export function getDecisionProfileMaturity(profile = null) {
  const totals = profile?.totals || {};

  const activityScore =
    (totals.selectedEntries || 0) +
    (totals.addedEntriesToBoard || 0) * 2 +
    (totals.acceptedRecommendations || 0) * 3 +
    (totals.restoredVersions || 0) * 2;

  if (activityScore >= 20) {
    return {
      level: "established",
      label: "Established",
      note: "This profile is based on repeated board interactions and can be treated as relatively stable.",
      activityScore,
    };
  }

  if (activityScore >= 8) {
    return {
      level: "emerging",
      label: "Emerging",
      note: "This profile has enough activity to suggest direction, but it is still evolving.",
      activityScore,
    };
  }

  return {
    level: "low",
    label: "Low confidence",
    note: "This profile is still based on limited interaction data and should be treated cautiously.",
    activityScore,
  };
}
