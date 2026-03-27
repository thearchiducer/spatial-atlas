import { useEffect } from "react";

export default function useAtlasPersistence({
  entries,
  atlas,
  activeView,
  setActiveView,
  selectedEntryId,
  setSelectedEntryId,
  compareEntryIds,
  setCompareEntryIds,
  setHighlightedEntryId,
  pinnedEntryIds,
  compareHistory,
  entryOverrides,
  savedCollections,
  projectBoards,
  activeProjectBoardId,
  directionVersions,
  writeUrlState,
  getInitialUrlState,
  PINNED_STORAGE_KEY,
  COMPARE_HISTORY_STORAGE_KEY,
  ENTRY_OVERRIDES_STORAGE_KEY,
  SAVED_COLLECTIONS_STORAGE_KEY,
  PROJECT_BOARDS_STORAGE_KEY,
  ACTIVE_PROJECT_BOARD_STORAGE_KEY,
  DIRECTION_VERSIONS_STORAGE_KEY,
}) {
  useEffect(() => {
    writeUrlState({
      selectedEntryId,
      compareEntryIds,
      filters: atlas.filters,
      activeView,
    });
  }, [
    selectedEntryId,
    compareEntryIds,
    atlas.filters,
    activeView,
    writeUrlState,
  ]);

  useEffect(() => {
    window.localStorage.setItem(
      PINNED_STORAGE_KEY,
      JSON.stringify(pinnedEntryIds),
    );
  }, [pinnedEntryIds, PINNED_STORAGE_KEY]);

  useEffect(() => {
    window.localStorage.setItem(
      COMPARE_HISTORY_STORAGE_KEY,
      JSON.stringify(compareHistory),
    );
  }, [compareHistory, COMPARE_HISTORY_STORAGE_KEY]);

  useEffect(() => {
    window.localStorage.setItem(
      ENTRY_OVERRIDES_STORAGE_KEY,
      JSON.stringify(entryOverrides),
    );
  }, [entryOverrides, ENTRY_OVERRIDES_STORAGE_KEY]);

  useEffect(() => {
    window.localStorage.setItem(
      SAVED_COLLECTIONS_STORAGE_KEY,
      JSON.stringify(savedCollections),
    );
  }, [savedCollections, SAVED_COLLECTIONS_STORAGE_KEY]);

  useEffect(() => {
    window.localStorage.setItem(
      PROJECT_BOARDS_STORAGE_KEY,
      JSON.stringify(projectBoards),
    );
  }, [projectBoards, PROJECT_BOARDS_STORAGE_KEY]);

  useEffect(() => {
    window.localStorage.setItem(
      DIRECTION_VERSIONS_STORAGE_KEY,
      JSON.stringify(directionVersions),
    );
  }, [directionVersions, DIRECTION_VERSIONS_STORAGE_KEY]);

  useEffect(() => {
    if (activeProjectBoardId) {
      window.localStorage.setItem(
        ACTIVE_PROJECT_BOARD_STORAGE_KEY,
        activeProjectBoardId,
      );
    } else {
      window.localStorage.removeItem(ACTIVE_PROJECT_BOARD_STORAGE_KEY);
    }
  }, [activeProjectBoardId, ACTIVE_PROJECT_BOARD_STORAGE_KEY]);

  useEffect(() => {
    function handlePopState() {
      const nextState = getInitialUrlState(entries);

      setSelectedEntryId(nextState.selectedEntryId);
      setCompareEntryIds(nextState.compareEntryIds);
      setActiveView(nextState.view);
      atlas.replaceFilters(nextState.filters);

      if (nextState.selectedEntryId) {
        setHighlightedEntryId(nextState.selectedEntryId);
      } else {
        setHighlightedEntryId(null);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    atlas,
    entries,
    getInitialUrlState,
    setSelectedEntryId,
    setCompareEntryIds,
    setActiveView,
    setHighlightedEntryId,
  ]);
}
