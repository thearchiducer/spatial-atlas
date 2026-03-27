function matchesFilter(entryValue, filterValue) {
  if (!filterValue) return true;
  return String(entryValue || "").trim() === String(filterValue).trim();
}

export function filterEntries(entries, filters) {
  return entries.filter((entry) => {
    if (!matchesFilter(entry.type, filters.type)) return false;
    if (!matchesFilter(entry.scale, filters.scale)) return false;
    if (!matchesFilter(entry.domain, filters.domain)) return false;
    if (!matchesFilter(entry.status, filters.status)) return false;
    if (!matchesFilter(entry.region, filters.region)) return false;

    if (!matchesFilter(entry.privacyLevel, filters.privacyLevel)) return false;
    if (!matchesFilter(entry.enclosureType, filters.enclosureType))
      return false;
    if (!matchesFilter(entry.circulationRole, filters.circulationRole)) {
      return false;
    }
    if (!matchesFilter(entry.socialRole, filters.socialRole)) return false;
    if (!matchesFilter(entry.spatialLogic, filters.spatialLogic)) return false;
    if (
      !matchesFilter(entry.culturalSpecificity, filters.culturalSpecificity)
    ) {
      return false;
    }
    if (!matchesFilter(entry.ritualWeight, filters.ritualWeight)) return false;
    if (!matchesFilter(entry.climateResponse, filters.climateResponse)) {
      return false;
    }

    return true;
  });
}
