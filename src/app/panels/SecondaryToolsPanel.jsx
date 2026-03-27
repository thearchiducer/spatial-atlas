import { useMemo, useState } from "react";
import BoardComparisonPanel from "../../components/atlas/BoardComparisonPanel";
import BoardIntelligencePanel from "../../components/atlas/BoardIntelligencePanel";
import DirectionVersionsPanel from "../../components/atlas/DirectionVersionsPanel";
import SavedCollectionsPanel from "../../components/atlas/SavedCollectionsPanel";
import CompareHistoryPanel from "../../components/atlas/CompareHistoryPanel";
import DatasetIOPanel from "../../components/debug/DatasetIOPanel";
import EntryScoringInspectorPanel from "../../components/debug/EntryScoringInspectorPanel";
import TransformationHistoryPanel from "../../components/atlas/TransformationHistoryPanel";
import BoardEvolutionPanel from "../../components/atlas/BoardEvolutionPanel";
import DirectionTrajectoryPanel from "../../components/atlas/DirectionTrajectoryPanel";

function SectionToggle({
  title,
  subtitle,
  countLabel = "",
  isOpen,
  onToggle,
  tone = "stone",
}) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-300 bg-sky-50 text-sky-950"
      : tone === "amber"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : tone === "emerald"
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : tone === "violet"
            ? "border-violet-300 bg-violet-50 text-violet-950"
            : "border-stone-300 bg-stone-50 text-stone-950";

  return (
    <button
      type='button'
      onClick={onToggle}
      className={`flex w-full items-start justify-between gap-4 border px-4 py-3 text-left transition hover:bg-white ${toneClasses}`}
    >
      <div className='min-w-0'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='text-sm font-semibold'>{title}</div>

          {countLabel ? (
            <div className='border border-current/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] opacity-75'>
              {countLabel}
            </div>
          ) : null}
        </div>

        {subtitle ? (
          <div className='mt-1 text-xs leading-relaxed opacity-75'>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className='shrink-0 border border-current/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] opacity-80'>
        {isOpen ? "Open" : "Closed"}
      </div>
    </button>
  );
}

function SectionBody({ isOpen, children }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className='pt-3'>{children}</div>
    </div>
  );
}

function DockSection({
  sectionKey,
  title,
  subtitle,
  countLabel,
  tone,
  openSections,
  onToggle,
  children,
}) {
  return (
    <div className='space-y-3'>
      <SectionToggle
        title={title}
        subtitle={subtitle}
        countLabel={countLabel}
        isOpen={openSections[sectionKey]}
        onToggle={() => onToggle(sectionKey)}
        tone={tone}
      />

      <SectionBody isOpen={openSections[sectionKey]}>{children}</SectionBody>
    </div>
  );
}

export default function SecondaryToolsPanel({
  boardContext,
  decisionContext,
  historyContext,
  historyActions,
  datasetContext,
  uiContext,
  hasBoard,
  hasSavedCollectionsFlag,
  hasCompareHistoryFlag,
  hasOverridesFlag,
  hasSelection,
  docked = false,
}) {
  const {
    projectBoards,
    activeProjectBoardId,
    hydratedActiveProjectBoard,
    entries,
    selectedEntry,
    compareEntries,
    recommendedEntries,
    pinnedEntryIds,
  } = boardContext;

  const {
    decisionProfile,
    globalDecisionProfile,
    activeBoardDecisionProfile,
    onSelectEntry,
    onAcceptRecommendation,
    onIgnoreRecommendation,
    onApplyTransformation,
  } = decisionContext;

  const {
    directionVersions,
    compareHistory,
    savedCollections,
    lastAppliedTransformation,
    appliedTransformationHistory,
    undoneTransformationHistory,
  } = historyContext;

  const {
    handleSaveDirectionVersion,
    handleDeleteDirectionVersion,
    handleRestoreDirectionVersion,
    handleCreateCollectionFromPinned,
    handleCreateCollectionFromCompare,
    handleCreateCollectionFromSelectedAndPinned,
    handleOpenCollection,
    handleDeleteCollection,
    handleOpenCompareHistoryItem,
    handleRemoveCompareHistoryItem,
    handleClearCompareHistory,
    onUndoLastTransformation,
    onRedoLastTransformation,
  } = historyActions;

  const {
    entryOverrides,
    handleExportDataset,
    handleExportOverrides,
    handleExportIntelligenceState,
    handleImportPayload,
    handleResetAllEntryOverrides,
  } = datasetContext;

  const {
    secondaryToolsOpen = true,
    secondaryToolsCount = 0,
    setShowSecondaryTools,
  } = uiContext;

  const hasBoardComparison = projectBoards.length >= 2;
  const hasCompareContext =
    Array.isArray(compareEntries) && compareEntries.length > 0;

  const hasAnySecondaryTools =
    hasBoardComparison ||
    hasBoard ||
    hasSavedCollectionsFlag ||
    hasCompareHistoryFlag ||
    hasOverridesFlag ||
    hasSelection;

  const contextSummary = useMemo(() => {
    if (hasCompareContext) {
      return {
        title: "Compare context",
        subtitle:
          "Comparison tools are most relevant right now because compare mode is active.",
        tone: "sky",
      };
    }

    if (hasBoard) {
      return {
        title: "Board context",
        subtitle:
          "Board tools are currently the strongest working context because an active board is loaded.",
        tone: "emerald",
      };
    }

    if (hasSelection) {
      return {
        title: "Selection context",
        subtitle:
          "A spatial entry is selected, so entry scoring and collection actions are useful.",
        tone: "amber",
      };
    }

    return {
      title: "General tools",
      subtitle:
        "No strong active context is selected. These tools remain available for broader review and data maintenance.",
      tone: "stone",
    };
  }, [hasBoard, hasCompareContext, hasSelection]);

  const [openSections, setOpenSections] = useState({
    intelligence: true,
    compare: hasCompareContext,
    versions: hasBoard && !hasCompareContext,
    transformations: false,
    evolution: false,
    scoring: hasSelection,
    collections: false,
    history: false,
    dataset: false,
  });

  function toggleSection(key) {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  const sections = [];

  if (hasBoard) {
    let priority = 5;
    if (hasCompareContext) priority = 12;

    sections.push({
      key: "intelligence",
      priority,
      node: (
        <DockSection
          sectionKey='intelligence'
          title='Board intelligence'
          subtitle='Interpret the active board as a spatial direction system with strengths, missing elements, tensions, and next moves.'
          countLabel={hydratedActiveProjectBoard?.name || "Active board"}
          tone='emerald'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <BoardIntelligencePanel
            board={hydratedActiveProjectBoard}
            entries={entries}
            onSelectEntry={onSelectEntry}
            decisionProfile={decisionProfile}
            globalDecisionProfile={globalDecisionProfile}
            activeBoardDecisionProfile={activeBoardDecisionProfile}
            onAcceptRecommendation={onAcceptRecommendation}
            onIgnoreRecommendation={onIgnoreRecommendation}
          />
        </DockSection>
      ),
    });
  }
  // 🔥 NEW SECTION — Transformation History
  if (
    appliedTransformationHistory?.length ||
    undoneTransformationHistory?.length
  ) {
    let priority = 25;

    sections.push({
      key: "transformations",
      priority,
      node: (
        <DockSection
          sectionKey='transformations'
          title='Transformation history'
          subtitle='Track applied and undone transformation moves across boards.'
          countLabel={`${appliedTransformationHistory.length} applied`}
          tone='violet'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <TransformationHistoryPanel
            appliedTransformationHistory={appliedTransformationHistory}
            undoneTransformationHistory={undoneTransformationHistory}
          />
        </DockSection>
      ),
    });
  }
  if (hasBoardComparison) {
    let priority = 50;
    if (hasCompareContext) priority = 10;
    else if (hasBoard) priority = 30;

    sections.push({
      key: "compare",
      priority,
      node: (
        <DockSection
          sectionKey='compare'
          title='Board comparison'
          subtitle='Compare multiple boards to evaluate which direction is stronger.'
          countLabel={`${projectBoards.length} boards`}
          tone={hasCompareContext ? "sky" : "stone"}
          openSections={openSections}
          onToggle={toggleSection}
        >
          <BoardComparisonPanel
            boards={projectBoards}
            entries={entries}
            activeBoardId={activeProjectBoardId}
            decisionProfile={decisionProfile}
            onSelectEntry={onSelectEntry}
            onApplyTransformation={onApplyTransformation}
            lastAppliedTransformation={lastAppliedTransformation}
            appliedTransformationHistory={appliedTransformationHistory}
            undoneTransformationHistory={undoneTransformationHistory}
            onUndoLastTransformation={onUndoLastTransformation}
            onRedoLastTransformation={onRedoLastTransformation}
          />
        </DockSection>
      ),
    });
  }

  if (hasBoard) {
    let priority = 40;
    if (!hasCompareContext) priority = 15;
    else priority = 20;

    sections.push({
      key: "versions",
      priority,
      node: (
        <DockSection
          sectionKey='versions'
          title='Direction versions'
          subtitle='Save, inspect, and restore direction snapshots for the active board.'
          countLabel={`${directionVersions.length} snapshots`}
          tone='emerald'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <DirectionVersionsPanel
            activeBoard={hydratedActiveProjectBoard}
            snapshots={directionVersions}
            onSaveSnapshot={handleSaveDirectionVersion}
            onDeleteSnapshot={handleDeleteDirectionVersion}
            onRestoreSnapshot={handleRestoreDirectionVersion}
          />
        </DockSection>
      ),
    });
  }

  if (hasSelection) {
    let priority = 45;
    if (!hasCompareContext && !hasBoard) priority = 10;
    else if (hasCompareContext) priority = 25;
    else priority = 35;

    sections.push({
      key: "scoring",
      priority,
      node: (
        <DockSection
          sectionKey='scoring'
          title='Entry scoring inspector'
          subtitle='Inspect how the current entry compares semantically against nearby candidates.'
          countLabel={selectedEntry ? selectedEntry.term : "Selection"}
          tone='amber'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <EntryScoringInspectorPanel
            selectedEntry={selectedEntry}
            compareEntries={compareEntries}
            recommendedEntries={recommendedEntries}
          />
        </DockSection>
      ),
    });
  }
  if (hasBoard) {
    let priority = 28;

    sections.push({
      key: "evolution",
      priority,
      node: (
        <DockSection
          sectionKey='evolution'
          title='Board evolution'
          subtitle='Inspect root, source, and current board lineage for transformed directions.'
          countLabel={hydratedActiveProjectBoard?.name || "Active board"}
          tone='violet'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <BoardEvolutionPanel
            projectBoards={projectBoards}
            activeProjectBoardId={activeProjectBoardId}
          />
          <DirectionTrajectoryPanel
            activeBoard={hydratedActiveProjectBoard}
            activeBoardId={activeProjectBoardId}
            projectBoards={projectBoards}
            directionVersions={directionVersions}
            appliedTransformationHistory={appliedTransformationHistory}
            decisionProfile={decisionProfile}
          />
        </DockSection>
      ),
    });
  }
  if (hasSavedCollectionsFlag) {
    let priority = 60;
    if (hasSelection && !hasBoard && !hasCompareContext) priority = 20;
    else if (hasBoard) priority = 35;

    sections.push({
      key: "collections",
      priority,
      node: (
        <DockSection
          sectionKey='collections'
          title='Saved collections'
          subtitle='Reusable saved groups of atlas entries for recurring research directions.'
          countLabel={`${savedCollections.length} collections`}
          tone={hasSelection ? "amber" : "stone"}
          openSections={openSections}
          onToggle={toggleSection}
        >
          <SavedCollectionsPanel
            collections={savedCollections}
            selectedEntry={selectedEntry}
            pinnedEntries={pinnedEntryIds}
            compareEntries={compareEntries}
            onCreateFromPinned={handleCreateCollectionFromPinned}
            onCreateFromCompare={handleCreateCollectionFromCompare}
            onCreateFromSelectedAndPinned={
              handleCreateCollectionFromSelectedAndPinned
            }
            onOpenCollection={handleOpenCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        </DockSection>
      ),
    });
  }

  if (hasCompareHistoryFlag) {
    let priority = 70;
    if (hasCompareContext) priority = 15;

    sections.push({
      key: "history",
      priority,
      node: (
        <DockSection
          sectionKey='history'
          title='Compare history'
          subtitle='Reopen recent compare sessions without rebuilding them.'
          countLabel={`${compareHistory.length} saved`}
          tone='sky'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <CompareHistoryPanel
            compareHistory={compareHistory}
            onOpenCompareHistoryItem={handleOpenCompareHistoryItem}
            onRemoveCompareHistoryItem={handleRemoveCompareHistoryItem}
            onClearCompareHistory={handleClearCompareHistory}
          />
        </DockSection>
      ),
    });
  }

  if (hasOverridesFlag) {
    sections.push({
      key: "dataset",
      priority: 100,
      node: (
        <DockSection
          sectionKey='dataset'
          title='Dataset I/O'
          subtitle='Import, export, and manage local entry override data.'
          countLabel={`${Object.keys(entryOverrides).length} overrides`}
          tone='violet'
          openSections={openSections}
          onToggle={toggleSection}
        >
          <DatasetIOPanel
            overrideCount={Object.keys(entryOverrides).length}
            onExportDataset={handleExportDataset}
            onExportOverrides={handleExportOverrides}
            onExportIntelligenceState={handleExportIntelligenceState}
            onImportPayload={handleImportPayload}
            onClearOverrides={handleResetAllEntryOverrides}
          />
        </DockSection>
      ),
    });
  }

  const orderedSections = sections.sort((a, b) => a.priority - b.priority);

  if (!hasAnySecondaryTools) {
    return null;
  }

  return (
    <section
      className={
        docked ? "space-y-5" : "border border-stone-300 bg-stone-50/40 p-5"
      }
    >
      {!docked ? (
        <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
          <div>
            <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
              Secondary tools
            </div>

            <h2 className='mt-2 text-lg font-semibold tracking-tight text-stone-900'>
              Comparison, history, and workspace tools
            </h2>

            <p className='mt-2 text-sm leading-relaxed text-stone-600'>
              These tools support the workflow, but are not part of the primary
              design sequence.
            </p>
          </div>

          <button
            type='button'
            onClick={() => setShowSecondaryTools?.((current) => !current)}
            className='border border-stone-400 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-stone-800 transition hover:bg-stone-100 active:bg-stone-200'
          >
            {secondaryToolsOpen
              ? `Hide tools (${secondaryToolsCount})`
              : `Show tools (${secondaryToolsCount})`}
          </button>
        </div>
      ) : null}

      <div
        className={
          docked
            ? "space-y-5"
            : `mt-5 space-y-5 transition-all duration-300 ease-in-out ${
                secondaryToolsOpen
                  ? "max-h-[6000px] opacity-100"
                  : "max-h-0 overflow-hidden opacity-0"
              }`
        }
      >
        <div
          className={`border px-4 py-3 ${
            contextSummary.tone === "sky"
              ? "border-sky-300 bg-sky-50"
              : contextSummary.tone === "emerald"
                ? "border-emerald-300 bg-emerald-50"
                : contextSummary.tone === "amber"
                  ? "border-amber-300 bg-amber-50"
                  : "border-stone-300 bg-stone-50"
          }`}
        >
          <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
            Active dock context
          </div>
          <div className='mt-1 text-sm font-semibold text-stone-900'>
            {contextSummary.title}
          </div>
          <div className='mt-1 text-xs leading-relaxed text-stone-600'>
            {contextSummary.subtitle}
          </div>
        </div>

        {orderedSections.map((section) => (
          <div
            key={section.key}
            className={
              section.priority <= 15
                ? "ring-1 ring-stone-200"
                : section.priority <= 30
                  ? "opacity-100"
                  : "opacity-85"
            }
          >
            {section.node}
          </div>
        ))}
      </div>
    </section>
  );
}
