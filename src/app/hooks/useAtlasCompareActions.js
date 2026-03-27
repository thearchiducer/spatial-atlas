import { useCallback } from "react";

function getCompareSemanticSnapshot(
  leftEntry,
  rightEntry,
  getSemanticBreakdown,
  countSharedValues,
) {
  let score = 0;

  if (leftEntry.type === rightEntry.type) score += 12;
  if (leftEntry.domain === rightEntry.domain) score += 10;
  if (leftEntry.region === rightEntry.region) score += 6;
  if (leftEntry.section === rightEntry.section) score += 4;
  if (leftEntry.scale === rightEntry.scale) score += 4;
  if (leftEntry.sourceCategory === rightEntry.sourceCategory) score += 3;

  score += countSharedValues(leftEntry.synonyms, rightEntry.synonyms) * 2;

  const semanticBreakdown = getSemanticBreakdown(leftEntry, rightEntry);
  score += semanticBreakdown.reduce((sum, item) => sum + item.points, 0);

  score = Math.min(score, 100);

  let label = "Distinct concepts";
  if (score >= 70) label = "Same family";
  else if (score >= 45) label = "Adjacent family";

  return { score, label };
}

function buildCompareHistoryItem(
  ids,
  entriesDataset,
  getSemanticBreakdown,
  countSharedValues,
) {
  if (!Array.isArray(ids) || ids.length !== 2) return null;

  const leftEntry = entriesDataset.find((entry) => entry.id === ids[0]);
  const rightEntry = entriesDataset.find((entry) => entry.id === ids[1]);

  if (!leftEntry || !rightEntry) return null;

  const snapshot = getCompareSemanticSnapshot(
    leftEntry,
    rightEntry,
    getSemanticBreakdown,
    countSharedValues,
  );

  const savedAt = new Date().toISOString();

  return {
    key: ids.join("__"),
    ids,
    terms: [leftEntry.term, rightEntry.term],
    score: snapshot.score,
    label: snapshot.label,
    savedAt,
    savedAtLabel: new Date(savedAt).toLocaleString(),
  };
}

export default function useAtlasCompareActions({
  entries,
  MAX_COMPARE_HISTORY,
  setCompareEntryIds,
  setCompareHistory,
  setCompareLinkCopied,
  setActiveView,
  setSelectedEntryId,
  setHighlightedEntryId,
  countSharedValues,
  getSemanticBreakdown,
}) {
  const saveCompareHistoryForIds = useCallback(
    (ids) => {
      const nextItem = buildCompareHistoryItem(
        ids,
        entries,
        getSemanticBreakdown,
        countSharedValues,
      );
      if (!nextItem) return;

      setCompareHistory((current) => {
        const safeCurrent = Array.isArray(current) ? current : [];
        const withoutDuplicate = safeCurrent.filter(
          (item) => item.key !== nextItem.key,
        );
        return [nextItem, ...withoutDuplicate].slice(0, MAX_COMPARE_HISTORY);
      });
    },
    [
      entries,
      getSemanticBreakdown,
      countSharedValues,
      setCompareHistory,
      MAX_COMPARE_HISTORY,
    ],
  );

  const handleCompareEntry = useCallback(
    (entryId) => {
      setCompareLinkCopied(false);

      setCompareEntryIds((current) => {
        let next;

        if (current.includes(entryId)) {
          next = current.filter((id) => id !== entryId);
        } else if (current.length >= 2) {
          next = [current[1], entryId];
        } else {
          next = [...current, entryId];
        }

        if (next.length === 2) {
          saveCompareHistoryForIds(next);
        }

        return next;
      });
    },
    [setCompareLinkCopied, setCompareEntryIds, saveCompareHistoryForIds],
  );

  const handleRemoveCompareEntry = useCallback(
    (entryId) => {
      setCompareLinkCopied(false);
      setCompareEntryIds((current) => current.filter((id) => id !== entryId));
    },
    [setCompareLinkCopied, setCompareEntryIds],
  );

  const handleClearCompare = useCallback(() => {
    setCompareLinkCopied(false);
    setCompareEntryIds([]);
  }, [setCompareLinkCopied, setCompareEntryIds]);

  const handleOpenCompareHistoryItem = useCallback(
    (ids) => {
      const nextIds = ids
        .filter((id) => entries.some((entry) => entry.id === id))
        .slice(0, 2);

      setActiveView("atlas");
      setCompareLinkCopied(false);
      setCompareEntryIds(nextIds);

      if (nextIds[0]) {
        setSelectedEntryId(nextIds[0]);
        setHighlightedEntryId(nextIds[0]);
      }

      if (nextIds.length === 2) {
        saveCompareHistoryForIds(nextIds);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [
      entries,
      setActiveView,
      setCompareLinkCopied,
      setCompareEntryIds,
      setSelectedEntryId,
      setHighlightedEntryId,
      saveCompareHistoryForIds,
    ],
  );

  const handleRemoveCompareHistoryItem = useCallback(
    (key) => {
      setCompareHistory((current) =>
        current.filter((item) => item.key !== key),
      );
    },
    [setCompareHistory],
  );

  const handleClearCompareHistory = useCallback(() => {
    setCompareHistory([]);
  }, [setCompareHistory]);

  const handleCopyCompareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCompareLinkCopied(true);
      setTimeout(() => setCompareLinkCopied(false), 1800);
    } catch {
      setCompareLinkCopied(false);
    }
  }, [setCompareLinkCopied]);

  return {
    handleCompareEntry,
    handleRemoveCompareEntry,
    handleClearCompare,
    handleOpenCompareHistoryItem,
    handleRemoveCompareHistoryItem,
    handleClearCompareHistory,
    handleCopyCompareLink,
  };
}
