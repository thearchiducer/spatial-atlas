import { useState } from "react";
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

function JumpButton({ targetId, children }) {
  function handleClick() {
    const target = document.getElementById(targetId);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

function SectionBlock({
  id,
  title,
  defaultOpen = true,
  children,
  countLabel = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className='scroll-mt-28 border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex items-center justify-between gap-3 border-b px-4 py-3'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </div>

          {countLabel ? (
            <div
              className='mt-1 text-xs'
              style={{ color: "var(--text-muted)" }}
            >
              {countLabel}
            </div>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => setIsOpen((current) => !current)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {isOpen ? <div className='p-4'>{children}</div> : null}
    </section>
  );
}

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
    handleRemoveEntryFromBoard,
    handleUpdateBoardNotes,
    handleExportBoardSheet,
  } = props;

  const visibleEntryCount = atlas.visibleEntries.length;
  const compareCount = compareEntries.length;
  const pinnedCount = pinnedEntries.length;
  const boardCount = projectBoards.length;
  const activeBoardName = activeProjectBoard?.name || "";
  const activeBoardEntryCount = activeBoardEntryIds.length;

  return (
    <>
      <div className='sticky top-24 z-20 space-y-3'>
        <div
          className='border p-3 shadow-sm'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className='mb-3 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Navigate workspace
          </div>

          <div className='flex flex-wrap gap-2'>
            <JumpButton targetId='atlas-search-summary'>Search</JumpButton>
            <JumpButton targetId='atlas-compare'>Compare</JumpButton>
            <JumpButton targetId='atlas-entries'>Entries</JumpButton>
            <JumpButton targetId='atlas-selected-entry'>Selected</JumpButton>
            <JumpButton targetId='atlas-intent'>Intent</JumpButton>
            <JumpButton targetId='atlas-project-boards'>Boards</JumpButton>
            <JumpButton targetId='atlas-direction'>Direction</JumpButton>
            <JumpButton targetId='atlas-analysis'>Analysis</JumpButton>
            <JumpButton targetId='atlas-layout'>Layout</JumpButton>
            <JumpButton targetId='atlas-pinned'>
              Pinned ({pinnedCount})
            </JumpButton>
          </div>
        </div>

        <div
          className='border px-3 py-2 text-xs shadow-sm'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          Flow: Browse entries → add to active board → compare → transform →
          review direction
        </div>
      </div>

      <section id='atlas-search-summary' className='scroll-mt-28'>
        <SearchSummaryBar
          filters={{ ...atlas.filters, query: atlas.debouncedQuery }}
          visibleCount={visibleEntryCount}
          topReasons={topSearchReasons}
        />
      </section>

      {hasPinnedEntries ? (
        <section id='atlas-pinned' className='scroll-mt-28'>
          <PinnedEntriesPanel
            pinnedEntries={pinnedEntries}
            onSelectEntry={handleSelectEntry}
            onRemovePinnedEntry={handleRemovePinnedEntry}
            onClearPinned={handleClearPinned}
          />
        </section>
      ) : null}

      <SectionBlock
        id='atlas-compare'
        title='Compare'
        defaultOpen={true}
        countLabel={`${compareCount} compare entr${compareCount === 1 ? "y" : "ies"}`}
      >
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
      </SectionBlock>

      <SectionBlock
        id='atlas-entries'
        title='Entries'
        defaultOpen={true}
        countLabel={`${visibleEntryCount} visible entries`}
      >
        <SectionList
          groupedSections={atlas.groupedSections}
          onRelatedClick={handleRelatedClick}
          onSelectEntry={handleSelectEntry}
          onCompareEntry={handleCompareEntry}
          onTogglePinEntry={handleTogglePinEntry}
          onAddToBoard={handleAddEntryToBoard}
          onRemoveFromBoard={(entryId) =>
            handleRemoveEntryFromBoard(activeProjectBoard?.id, entryId)
          }
          highlightedEntryId={highlightedEntryId}
          compareEntryIds={compareEntryIds}
          pinnedEntryIds={pinnedEntryIds}
          activeBoardEntryIds={activeBoardEntryIds}
          activeBoardName={activeBoardName}
          searchQuery={atlas.debouncedQuery}
        />
      </SectionBlock>

      {!isCompareMode && hasSelection ? (
        <SectionBlock
          id='atlas-selected-entry'
          title='Selected entry'
          defaultOpen={true}
          countLabel={selectedEntry ? selectedEntry.term : ""}
        >
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
            activeBoardName={activeBoardName}
            searchQuery={atlas.debouncedQuery}
          />
        </SectionBlock>
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
        <SectionBlock
          id='atlas-intent'
          title='Design intent'
          defaultOpen={false}
          countLabel='Intent matching and direction framing'
        >
          <DesignIntentPanel
            entries={atlas.visibleEntries}
            onSelectEntry={handleSelectEntry}
            onCompareEntry={handleCompareEntry}
            onTogglePinEntry={handleTogglePinEntry}
            onIntentChange={handleDesignIntentChange}
          />
        </SectionBlock>
      ) : null}

      <SectionBlock
        id='atlas-project-boards'
        title='Project boards'
        defaultOpen={true}
        countLabel={`${boardCount} board${boardCount === 1 ? "" : "s"} · ${
          hydratedActiveProjectBoard?.name
            ? `active: ${hydratedActiveProjectBoard.name}`
            : "no active board"
        }`}
      >
        <ProjectBoardPanel
          boards={projectBoards}
          entries={atlas.visibleEntries}
          activeBoardId={hydratedActiveProjectBoard?.id || null}
          selectedEntry={selectedEntry}
          compareEntries={compareEntries}
          onCreateBoard={handleCreateProjectBoard}
          onSetActiveBoard={handleOpenProjectBoard}
          onDeleteBoard={handleDeleteProjectBoard}
          onAddSelectedEntry={handleAddSelectedEntryToBoard}
          onAddComparePair={handleAddComparePairToBoard}
          onRemoveEntryFromBoard={handleRemoveEntryFromBoard}
          onUpdateBoardNotes={handleUpdateBoardNotes}
          onExportBoardSheet={handleExportBoardSheet}
        />
      </SectionBlock>

      {hasBoard ? (
        <SectionBlock
          id='atlas-direction'
          title='Direction'
          defaultOpen={false}
          countLabel={`${activeBoardEntryCount} active board entr${
            activeBoardEntryCount === 1 ? "y" : "ies"
          }`}
        >
          <DesignDirectionPanel
            activeBoard={hydratedActiveProjectBoard}
            onAddEntryToBoard={handleAddEntryToBoard}
            onRemoveEntryFromBoard={handleRemoveEntryFromBoard}
          />
        </SectionBlock>
      ) : null}

      {hasBoard ? (
        <SectionBlock
          id='atlas-analysis'
          title='Board analysis'
          defaultOpen={false}
          countLabel='Direction reading and evaluation'
        >
          <BoardAnalysisPanel activeBoard={hydratedActiveProjectBoard} />
        </SectionBlock>
      ) : null}

      {hasBoard ? (
        <SectionBlock
          id='atlas-layout'
          title='Layout'
          defaultOpen={false}
          countLabel='Spatial organization view'
        >
          <LayoutPanel activeBoard={hydratedActiveProjectBoard} />
        </SectionBlock>
      ) : null}
    </>
  );
}
