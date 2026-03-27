import SearchSummaryBar from "../../components/atlas/SearchSummaryBar";
import SectionList from "../../components/atlas/SectionList";
import MinimalModeWrapper from "../../components/layout/MinimalModeWrapper";

export default function MinimalView({
  atlas,
  topSearchReasons,
  handleRelatedClick,
  handleSelectEntry,
  handleCompareEntry,
  handleTogglePinEntry,
  handleAddEntryToBoard,
  highlightedEntryId,
  compareEntryIds,
  pinnedEntryIds,
  activeBoardEntryIds,
  activeProjectBoard,
}) {
  return (
    <MinimalModeWrapper enabled={true}>
      <main className='space-y-5'>
        <SearchSummaryBar
          filters={{ ...atlas.filters, query: atlas.debouncedQuery }}
          visibleCount={atlas.visibleEntries.length}
          topReasons={topSearchReasons}
        />

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
      </main>
    </MinimalModeWrapper>
  );
}
