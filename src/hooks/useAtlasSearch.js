import { useMemo, useState } from "react";
import { defaultFilters } from "../constants/defaultState";
import { normalizeEntry } from "../lib/normalizeEntry";
import { searchEntries } from "../lib/searchEntries";
import { filterEntries } from "../lib/filterEntries";
import { sortEntries } from "../lib/sortEntries";
import { groupEntriesBySection } from "../lib/groupEntriesBySection";
import { useDebouncedValue } from "./useDebouncedValue";

export function useAtlasSearch(rawEntries, rawSections, initialFilters = {}) {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters,
  });

  const debouncedQuery = useDebouncedValue(filters.query, 180);

  const normalizedEntries = useMemo(
    () => rawEntries.map(normalizeEntry),
    [rawEntries],
  );

  const visibleEntries = useMemo(() => {
    const searched = searchEntries(normalizedEntries, debouncedQuery);
    const filtered = filterEntries(searched, filters);
    return sortEntries(filtered, filters.sortBy, debouncedQuery);
  }, [normalizedEntries, debouncedQuery, filters]);

  const groupedSections = useMemo(
    () => groupEntriesBySection(visibleEntries, rawSections),
    [visibleEntries, rawSections],
  );

  const visibleSectionCount = groupedSections.filter(
    (section) => section.entries.length > 0,
  ).length;

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function replaceFilters(nextFilters) {
    setFilters({
      ...defaultFilters,
      ...nextFilters,
    });
  }

  return {
    filters,
    debouncedQuery,
    updateFilter,
    clearFilters,
    replaceFilters,
    visibleEntries,
    groupedSections,
    metrics: {
      visibleEntries: visibleEntries.length,
      visibleSections: visibleSectionCount,
      controlledTypes: 8,
      scaleBands: 4,
    },
  };
}
