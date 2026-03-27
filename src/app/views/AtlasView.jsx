import SearchSummaryBar from "../../components/atlas/SearchSummaryBar";
import PinnedEntriesPanel from "../../components/atlas/PinnedEntriesPanel";
import ComparePanel from "../../components/atlas/ComparePanel";
import CompareModeLayout from "../../components/atlas/CompareModeLayout";
import SectionList from "../../components/atlas/SectionList";
import SelectedEntryPanel from "../../components/atlas/SelectedEntryPanel";
import EntryEditorPanel from "../../components/atlas/EntryEditorPanel";
import DesignIntentPanel from "../../components/atlas/DesignIntentPanel";
import ProjectBoardPanel from "../../components/atlas/ProjectBoardPanel";
import DesignDirectionPanel from "../../components/atlas/DesignDirectionPanel";
import BoardAnalysisPanel from "../../components/atlas/BoardAnalysisPanel";
import LayoutPanel from "../../components/atlas/LayoutPanel";

export default function AtlasView(props) {
  const {
    atlas,
    topSearchReasons,
    hasPinnedEntries,
    pinnedEntries,
    isCompareMode,
    compareEntries,
    compareLinkCopied,
    highlightedEntryId,
    compareEntryIds,
    pinnedEntryIds,
    activeBoardEntryIds,
    activeProjectBoard,
    selectedEntry,
    recommendedEntries,
    editingEntry,
    isEditingDirty,
    entryOverrides,
    hasSelection,
    projectBoards,
    hydratedActiveProjectBoard,
    lastIntentSummaryLabel,
    hasBoard,

    handleSelectEntry,
    handleRemovePinnedEntry,
    handleClearPinned,
    handleRemoveCompareEntry,
    handleClearCompare,
    handleCopyCompareLink,
    handleRelatedClick,
    handleCompareEntry,
    handleTogglePinEntry,
    handleAddEntryToBoard,
    handleClearSelection,
    handlePrintEntrySheet,
    handleOpenEditor,
    handleSaveEntryOverride,
    handleCloseEditor,
    handleResetEntryOverride,
    handleResetAllEntryOverrides,
    handleDesignIntentChange,
    handleCreateProjectBoard,
    handleOpenProjectBoard,
    handleDeleteProjectBoard,
    handleAddSelectedEntryToBoard,
    handleAddComparePairToBoard,
    handleRemoveBoardEntry,
    handleRemoveEntryFromBoard,
    handleRemoveBoardComparePair,
    handleOpenCompareHistoryItem,
    handleUpdateBoardNotes,
    handleExportBoardSheet,
  } = props;

  return (
    <>
      <SearchSummaryBar
        filters={{ ...atlas.filters, query: atlas.debouncedQuery }}
        visibleCount={atlas.visibleEntries.length}
        topReasons={topSearchReasons}
      />

      {hasPinnedEntries ? (
        <PinnedEntriesPanel
          pinnedEntries={pinnedEntries}
          onSelectEntry={handleSelectEntry}
          onRemovePinnedEntry={handleRemovePinnedEntry}
          onClearPinned={handleClearPinned}
        />
      ) : null}

      {isCompareMode ? (
        <CompareModeLayout
          compareEntries={compareEntries}
          onSelectEntry={handleSelectEntry}
          onRemoveCompareEntry={handleRemoveCompareEntry}
          onClearCompare={handleClearCompare}
          onCopyCompareLink={handleCopyCompareLink}
          compareLinkCopied={compareLinkCopied}
        />
      ) : (
        <ComparePanel
          compareEntries={compareEntries}
          onRemoveCompareEntry={handleRemoveCompareEntry}
          onClearCompare={handleClearCompare}
          onSelectEntry={handleSelectEntry}
        />
      )}

      <SectionList
        groupedSections={atlas.groupedSections}
        onRelatedClick={handleRelatedClick}
        onSelectEntry={handleSelectEntry}
        onCompareEntry={handleCompareEntry}
        onTogglePinEntry={handleTogglePinEntry}
        onAddToBoard={handleAddEntryToBoard}
        highlightedEntryId={highlightedEntryId}
        compareEntryIds={compareEntryIds}
        pinnedEntryIds={pinnedEntryIds}
        activeBoardEntryIds={activeBoardEntryIds}
        activeBoardName={activeProjectBoard?.name || ""}
        searchQuery={atlas.debouncedQuery}
      />

      {!isCompareMode && hasSelection ? (
        <SelectedEntryPanel
          selectedEntry={selectedEntry}
          recommendedEntries={recommendedEntries}
          onRelatedClick={handleRelatedClick}
          onClear={handleClearSelection}
          onCompareEntry={handleCompareEntry}
          onTogglePinEntry={handleTogglePinEntry}
          onPrintEntrySheet={handlePrintEntrySheet}
          onEditEntry={handleOpenEditor}
          onAddToBoard={handleAddEntryToBoard}
          isCompared={
            selectedEntry ? compareEntryIds.includes(selectedEntry.id) : false
          }
          isPinned={
            selectedEntry ? pinnedEntryIds.includes(selectedEntry.id) : false
          }
          isInActiveBoard={
            selectedEntry
              ? activeBoardEntryIds.includes(selectedEntry.id)
              : false
          }
          activeBoardName={activeProjectBoard?.name || ""}
          searchQuery={atlas.debouncedQuery}
        />
      ) : null}

      <EntryEditorPanel
        entry={editingEntry}
        isOpen={Boolean(editingEntry)}
        isDirty={isEditingDirty}
        hasOverride={Boolean(
          editingEntry ? entryOverrides[editingEntry.id] : null,
        )}
        onSave={handleSaveEntryOverride}
        onClose={handleCloseEditor}
        onResetEntry={handleResetEntryOverride}
        onResetAll={handleResetAllEntryOverrides}
      />

      {hasSelection ? (
        <DesignIntentPanel
          entries={atlas.visibleEntries}
          onSelectEntry={handleSelectEntry}
          onCompareEntry={handleCompareEntry}
          onTogglePinEntry={handleTogglePinEntry}
          onIntentChange={handleDesignIntentChange}
        />
      ) : null}

      <ProjectBoardPanel
        boards={projectBoards}
        activeBoard={hydratedActiveProjectBoard}
        selectedEntry={selectedEntry}
        compareEntries={compareEntries}
        intentSummaryLabel={lastIntentSummaryLabel}
        onCreateBoard={handleCreateProjectBoard}
        onOpenBoard={handleOpenProjectBoard}
        onDeleteBoard={handleDeleteProjectBoard}
        onAddSelectedEntry={handleAddSelectedEntryToBoard}
        onAddComparePair={handleAddComparePairToBoard}
        onRemoveBoardEntry={handleRemoveBoardEntry}
        onRemoveEntryFromBoard={handleRemoveEntryFromBoard}
        onRemoveComparePair={handleRemoveBoardComparePair}
        onOpenComparePair={handleOpenCompareHistoryItem}
        onUpdateBoardNotes={handleUpdateBoardNotes}
        onSelectEntry={handleSelectEntry}
        onExportBoardSheet={handleExportBoardSheet}
      />

      {hasBoard ? (
        <DesignDirectionPanel
          activeBoard={hydratedActiveProjectBoard}
          onAddEntryToBoard={handleAddEntryToBoard}
          onRemoveEntryFromBoard={handleRemoveEntryFromBoard}
        />
      ) : null}

      {hasBoard ? (
        <BoardAnalysisPanel activeBoard={hydratedActiveProjectBoard} />
      ) : null}

      {hasBoard ? (
        <LayoutPanel activeBoard={hydratedActiveProjectBoard} />
      ) : null}
    </>
  );
}
