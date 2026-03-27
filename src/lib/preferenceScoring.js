function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function includesNormalized(list, value) {
  const target = normalize(value);
  return safeArray(list).some((item) => normalize(item) === target);
}

export function getEntryPreferenceBoost(entry, decisionProfile) {
  if (!entry || !decisionProfile) return 0;

  let score = 0;

  if (
    entry.type &&
    includesNormalized(decisionProfile?.repeatedEntryTypes, entry.type)
  ) {
    score += 10;
  }

  if (
    entry.id &&
    includesNormalized(decisionProfile?.repeatedEntryIds, entry.id)
  ) {
    score += 14;
  }

  if (
    entry.privacyLevel &&
    normalize(entry.privacyLevel) === normalize(decisionProfile?.privacyBias)
  ) {
    score += 8;
  }

  if (
    entry.circulationRole &&
    normalize(entry.circulationRole) ===
      normalize(decisionProfile?.circulationBias)
  ) {
    score += 8;
  }

  if (
    entry.socialRole &&
    normalize(entry.socialRole) === normalize(decisionProfile?.socialBias)
  ) {
    score += 6;
  }

  if (
    entry.climateResponse &&
    normalize(entry.climateResponse) === normalize(decisionProfile?.climateBias)
  ) {
    score += 5;
  }

  return score;
}

export function getBoardPatternPreferenceBoost(identity, decisionProfile) {
  if (!identity || !decisionProfile) return 0;

  let score = 0;

  if (
    identity.privacyModel &&
    normalize(identity.privacyModel) === normalize(decisionProfile?.privacyBias)
  ) {
    score += 10;
  }

  if (
    identity.circulationModel &&
    normalize(identity.circulationModel) ===
      normalize(decisionProfile?.circulationBias)
  ) {
    score += 10;
  }

  if (
    identity.socialModel &&
    normalize(identity.socialModel) === normalize(decisionProfile?.socialBias)
  ) {
    score += 8;
  }

  if (
    identity.climateModel &&
    normalize(identity.climateModel) === normalize(decisionProfile?.climateBias)
  ) {
    score += 6;
  }

  if (
    identity.spatialPattern &&
    includesNormalized(
      decisionProfile?.preferredPatterns,
      identity.spatialPattern,
    )
  ) {
    score += 12;
  }

  return score;
}

export function getRecommendationPreferenceBoost(
  recommendation,
  decisionProfile,
) {
  if (!recommendation || !decisionProfile) return 0;

  let score = 0;

  if (
    recommendation.key &&
    includesNormalized(
      decisionProfile?.acceptedRecommendationKeys,
      recommendation.key,
    )
  ) {
    score += 18;
  }

  if (
    recommendation.key &&
    includesNormalized(
      decisionProfile?.ignoredRecommendationKeys,
      recommendation.key,
    )
  ) {
    score -= 18;
  }

  if (recommendation.category === "privacy" && decisionProfile?.privacyBias) {
    score += 6;
  }

  if (recommendation.category === "social" && decisionProfile?.socialBias) {
    score += 5;
  }

  if (recommendation.category === "climate" && decisionProfile?.climateBias) {
    score += 4;
  }

  if (
    recommendation.category === "spatial-structure" &&
    decisionProfile?.circulationBias
  ) {
    score += 6;
  }

  const suggestedEntries = safeArray(recommendation.suggestedEntries);

  for (const entry of suggestedEntries) {
    if (
      entry.type &&
      includesNormalized(decisionProfile?.repeatedEntryTypes, entry.type)
    ) {
      score += 4;
    }

    if (
      entry.id &&
      includesNormalized(decisionProfile?.repeatedEntryIds, entry.id)
    ) {
      score += 5;
    }
  }

  return score;
}
