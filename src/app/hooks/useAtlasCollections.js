import { useCallback } from "react";

function buildCollectionPayload(name, description, entryIds, entriesDataset) {
  const uniqueIds = [...new Set(entryIds.filter(Boolean))].filter((id) =>
    entriesDataset.some((entry) => entry.id === id),
  );

  if (!uniqueIds.length) return null;

  const entryTerms = uniqueIds
    .map((id) => {
      const entry = entriesDataset.find((item) => item.id === id);
      return entry ? entry.term : null;
    })
    .filter(Boolean);

  const createdAt = new Date().toISOString();

  return {
    id:
      "collection-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    name,
    description,
    entryIds: uniqueIds,
    entryTerms,
    createdAt,
    createdAtLabel: new Date(createdAt).toLocaleString(),
  };
}

export default function useAtlasCollections({
  entries,
  selectedEntry,
  pinnedEntryIds,
  compareEntryIds,
  setSavedCollections,
  setPinnedEntryIds,
  setSelectedEntryId,
  setHighlightedEntryId,
  setCompareEntryIds,
  setActiveView,
}) {
  const handleCreateCollection = useCallback(
    (entryIds, fallbackName, fallbackDescription) => {
      const namePrompt = window.prompt("Collection name", fallbackName);
      const name = namePrompt ? namePrompt.trim() : fallbackName;

      if (!name) return;

      const descriptionPrompt = window.prompt(
        "Collection description",
        fallbackDescription,
      );
      const description = descriptionPrompt ? descriptionPrompt.trim() : "";

      const nextCollection = buildCollectionPayload(
        name,
        description,
        entryIds,
        entries,
      );

      if (!nextCollection) {
        window.alert("No valid entries were available for this collection.");
        return;
      }

      setSavedCollections((current) => [nextCollection, ...current]);
    },
    [entries, setSavedCollections],
  );

  const handleCreateCollectionFromPinned = useCallback(() => {
    handleCreateCollection(
      pinnedEntryIds,
      "Pinned research board",
      "Saved from current pinned entries.",
    );
  }, [handleCreateCollection, pinnedEntryIds]);

  const handleCreateCollectionFromCompare = useCallback(() => {
    handleCreateCollection(
      compareEntryIds,
      "Compare board",
      "Saved from the current compare set.",
    );
  }, [handleCreateCollection, compareEntryIds]);

  const handleCreateCollectionFromSelectedAndPinned = useCallback(() => {
    const ids = [
      ...(selectedEntry ? [selectedEntry.id] : []),
      ...pinnedEntryIds,
    ];

    handleCreateCollection(
      ids,
      "Selected + pinned board",
      "Saved from the selected entry and current pinned entries.",
    );
  }, [handleCreateCollection, selectedEntry, pinnedEntryIds]);

  const handleOpenCollection = useCallback(
    (collection) => {
      const validIds = (collection.entryIds || []).filter((id) =>
        entries.some((entry) => entry.id === id),
      );

      if (!validIds.length) {
        window.alert("This collection no longer contains valid entry ids.");
        return;
      }

      setPinnedEntryIds(validIds);

      if (validIds[0]) {
        setSelectedEntryId(validIds[0]);
        setHighlightedEntryId(validIds[0]);
      }

      if (validIds.length >= 2) {
        setCompareEntryIds(validIds.slice(0, 2));
      } else {
        setCompareEntryIds([]);
      }

      setActiveView("atlas");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [
      entries,
      setPinnedEntryIds,
      setSelectedEntryId,
      setHighlightedEntryId,
      setCompareEntryIds,
      setActiveView,
    ],
  );

  const handleDeleteCollection = useCallback(
    (collectionId) => {
      setSavedCollections((current) =>
        current.filter((item) => item.id !== collectionId),
      );
    },
    [setSavedCollections],
  );

  return {
    handleCreateCollection,
    handleCreateCollectionFromPinned,
    handleCreateCollectionFromCompare,
    handleCreateCollectionFromSelectedAndPinned,
    handleOpenCollection,
    handleDeleteCollection,
  };
}
