import { normalizeEntryIds } from "./boardUtils";

export function getPreviewSelectedEntryIds(transformation) {
  return normalizeEntryIds({
    entries: transformation?.suggestedEntries,
  });
}

export function getPreviewSelectedEntries(transformation, selectedEntryIds) {
  const suggestedEntries = Array.isArray(transformation?.suggestedEntries)
    ? transformation.suggestedEntries
    : [];

  return suggestedEntries.filter((entry) =>
    selectedEntryIds.includes(entry.id),
  );
}

export function getPreviewDeselectedEntries(transformation, selectedEntryIds) {
  const suggestedEntries = Array.isArray(transformation?.suggestedEntries)
    ? transformation.suggestedEntries
    : [];

  return suggestedEntries.filter(
    (entry) => !selectedEntryIds.includes(entry.id),
  );
}
