const DEFAULT_SEMANTIC_FIELDS = {
  privacyLevel: "semi-public",
  enclosureType: "enclosed",
  circulationRole: "none",
  socialRole: "none",
  spatialLogic: "distributed",
  culturalSpecificity: "generalized",
  ritualWeight: "none",
  climateResponse: "neutral",
};

export function normalizeEntry(entry) {
  const normalizedRelated = Array.isArray(entry.related)
    ? entry.related
        .map((item) => {
          if (typeof item === "string") {
            return { id: item, label: item };
          }

          if (item && typeof item === "object" && item.id) {
            return {
              id: item.id,
              label: item.label || item.id,
            };
          }

          return null;
        })
        .filter(Boolean)
    : [];

  return {
    ...DEFAULT_SEMANTIC_FIELDS,
    ...entry,
    synonyms: Array.isArray(entry.synonyms) ? entry.synonyms : [],
    related: normalizedRelated,
    notes: entry.notes || "",
    region: entry.region || "Cross-cultural",
    sourceCategory: entry.sourceCategory || "Unclassified",
  };
}
