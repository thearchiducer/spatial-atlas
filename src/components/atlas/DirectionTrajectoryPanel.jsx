function getSafeEntryIds(board) {
  if (!board) return [];
  if (Array.isArray(board.entryIds)) return board.entryIds.filter(Boolean);
  if (Array.isArray(board.entries)) {
    return board.entries
      .map((entry) => (typeof entry === "string" ? entry : entry?.id))
      .filter(Boolean);
  }
  return [];
}

function getSafeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getSnapshotTimestamp(snapshot) {
  if (!snapshot) return 0;

  if (typeof snapshot.timestamp === "number") {
    return snapshot.timestamp;
  }

  if (typeof snapshot.savedAt === "string") {
    const parsed = Date.parse(snapshot.savedAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof snapshot.createdAt === "string") {
    const parsed = Date.parse(snapshot.createdAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function getHistoryTimestamp(item) {
  if (!item) return 0;

  if (typeof item.createdAt === "string") {
    const parsed = Date.parse(item.createdAt);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof item.timestamp === "number") {
    return item.timestamp;
  }

  return 0;
}

function getSnapshotBoardEntryCount(snapshot) {
  if (!snapshot) return 0;

  if (Array.isArray(snapshot.board?.entryIds)) {
    return snapshot.board.entryIds.length;
  }

  if (Array.isArray(snapshot.entryIds)) {
    return snapshot.entryIds.length;
  }

  return 0;
}

function getSnapshotSummaryCounts(snapshot) {
  const packet = snapshot?.packet || {};
  const summary = packet.summary || {};

  const tensionCount = Array.isArray(packet.tensions)
    ? packet.tensions.length
    : Array.isArray(summary.tensions)
      ? summary.tensions.length
      : 0;

  const missingCount = Array.isArray(packet.gapSignals)
    ? packet.gapSignals.length
    : Array.isArray(summary.gapSignals)
      ? summary.gapSignals.length
      : 0;

  const strengthCount = Array.isArray(packet.entries)
    ? packet.entries.length
    : 0;

  return {
    tensionCount,
    missingCount,
    strengthCount,
  };
}

function getBoardConditionCounts(activeBoard) {
  const intelligence = activeBoard?.intelligence || {};
  const summary = intelligence.summary || {};

  const tensionCount = Array.isArray(summary.tensions)
    ? summary.tensions.length
    : Array.isArray(activeBoard?.tensions)
      ? activeBoard.tensions.length
      : 0;

  const missingCount = Array.isArray(summary.gapSignals)
    ? summary.gapSignals.length
    : Array.isArray(activeBoard?.missing)
      ? activeBoard.missing.length
      : 0;

  const strengthCount = Array.isArray(summary.strengths)
    ? summary.strengths.length
    : Array.isArray(activeBoard?.strengths)
      ? activeBoard.strengths.length
      : 0;

  return {
    tensionCount,
    missingCount,
    strengthCount,
  };
}

function computeStructuralDiff(previousSnapshot, activeBoard) {
  if (!previousSnapshot || !activeBoard) return null;

  const previous = getSnapshotSummaryCounts(previousSnapshot);
  const current = getBoardConditionCounts(activeBoard);

  return {
    tensionsRemoved: previous.tensionCount - current.tensionCount,
    missingResolved: previous.missingCount - current.missingCount,
    strengthsAdded: current.strengthCount - previous.strengthCount,
  };
}

function computeDecisionPattern(decisionProfile) {
  const totals = decisionProfile?.totals || {};
  const lines = [];

  const accepted = getSafeNumber(totals.acceptedRecommendations);
  const ignored = getSafeNumber(totals.ignoredRecommendations);
  const deselected = getSafeNumber(totals.deselectedPreviewEntries);
  const restored = getSafeNumber(totals.restoredVersions);
  const selections = getSafeNumber(totals.selectedEntries);
  const addedToBoard = getSafeNumber(totals.addedEntriesToBoard);

  if (accepted > ignored && accepted > 0) {
    lines.push(
      "Tends to operationalize recommendations rather than dismiss them.",
    );
  } else if (ignored > accepted && ignored > 0) {
    lines.push(
      "Tends to filter recommendations critically before changing direction.",
    );
  }

  if (deselected > 0) {
    lines.push(
      "Refines transformations by excluding some suggested entries before applying them.",
    );
  }

  if (restored > 0) {
    lines.push(
      "Revisits previous direction states instead of only moving forward.",
    );
  }

  if (selections > 0 || addedToBoard > 0) {
    lines.push(
      "Actively shapes direction through entry selection and board editing.",
    );
  }

  if (decisionProfile?.privacyBias) {
    lines.push(`Privacy bias: ${decisionProfile.privacyBias}.`);
  }

  if (decisionProfile?.circulationBias) {
    lines.push(`Circulation bias: ${decisionProfile.circulationBias}.`);
  }

  if (decisionProfile?.socialBias) {
    lines.push(`Social bias: ${decisionProfile.socialBias}.`);
  }

  if (decisionProfile?.climateBias) {
    lines.push(`Climate bias: ${decisionProfile.climateBias}.`);
  }

  return lines;
}

function computeDirectionStatus({
  transformationCount,
  acceptedRecommendationCount,
  tensionCount,
  missingCount,
}) {
  if (transformationCount < 2) return "Early";

  if (
    transformationCount >= 5 &&
    acceptedRecommendationCount >= 3 &&
    tensionCount <= 1 &&
    missingCount <= 1
  ) {
    return "Established";
  }

  if (transformationCount >= 3 && acceptedRecommendationCount >= 2) {
    return "Stabilizing";
  }

  return "Evolving";
}

function formatTransformationDate(item) {
  if (typeof item?.createdAtLabel === "string" && item.createdAtLabel.trim()) {
    return item.createdAtLabel;
  }

  if (typeof item?.createdAt === "string") {
    const parsed = new Date(item.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }

  return null;
}

function buildTrajectoryGraphNodes(activeBoard, boardHistory, boardVersions) {
  const nodes = [];

  if (activeBoard?.derivedFromBoardName || activeBoard?.derivedFromBoardId) {
    nodes.push({
      id: `source-${activeBoard.derivedFromBoardId || activeBoard.derivedFromBoardName}`,
      type: "source",
      title:
        activeBoard.derivedFromBoardName ||
        activeBoard.derivedFromBoardId ||
        "Previous direction",
      subtitle: "Source direction",
      depth: 0,
      isCurrent: false,
    });
  } else {
    nodes.push({
      id: `source-${activeBoard?.id || "current"}`,
      type: "source",
      title: activeBoard?.name || "Untitled board",
      subtitle: "Initial direction",
      depth: 0,
      isCurrent: false,
    });
  }

  boardHistory
    .slice()
    .reverse()
    .forEach((item, index) => {
      nodes.push({
        id: item?.id || `transformation-${index}`,
        type: "transformation",
        title: item?.transformationTitle || "Untitled transformation",
        subtitle: formatTransformationDate(item) || "Applied transformation",
        depth: 0,
        isCurrent: false,
      });
    });

  if (boardVersions.length) {
    nodes.push({
      id: `versions-${activeBoard?.id || "current"}`,
      type: "version",
      title: `${boardVersions.length} saved version${boardVersions.length === 1 ? "" : "s"}`,
      subtitle: "Recorded states",
      depth: 0,
      isCurrent: false,
    });
  }

  nodes.push({
    id: `current-${activeBoard?.id || "current"}`,
    type: "current",
    title: activeBoard?.name || "Untitled board",
    subtitle: "Current direction",
    depth: 0,
    isCurrent: true,
  });

  return nodes;
}
function getNodeToneClasses(type, isCurrent = false) {
  if (isCurrent) {
    return {
      dot: "bg-emerald-500",
      card: "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#d1fae5]",
    };
  }

  if (type === "source") {
    return {
      dot: "bg-stone-500",
      card: "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]",
    };
  }

  if (type === "transformation") {
    return {
      dot: "bg-violet-500",
      card: "border-[rgba(168,85,247,0.35)] bg-[rgba(168,85,247,0.10)] text-[#e9d5ff]",
    };
  }

  if (type === "version") {
    return {
      dot: "bg-sky-500",
      card: "border-[rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.10)] text-[#bae6fd]",
    };
  }

  return {
    dot: "bg-stone-500",
    card: "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]",
  };
}

function TrajectoryGraph({ nodes = [] }) {
  if (!nodes.length) {
    return (
      <div
        className='border px-3 py-2 text-sm'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
          color: "var(--text-muted)",
        }}
      >
        No trajectory graph is available yet.
      </div>
    );
  }

  return (
    <div className='mt-2 space-y-0'>
      {nodes.map((node, index) => {
        const tone = getNodeToneClasses(node.type, node.isCurrent);
        const isLast = index === nodes.length - 1;

        return (
          <div
            key={node.id}
            className='relative flex gap-3'
            style={{ marginLeft: `${node.depth * 28}px` }}
          >
            {node.depth > 0 ? (
              <div
                className='absolute left-[-14px] top-4 h-px w-3'
                style={{ background: "var(--border-color)" }}
              />
            ) : null}

            <div className='flex w-5 flex-col items-center'>
              <div className={`mt-2 h-2.5 w-2.5 rounded-full ${tone.dot}`} />
              {!isLast ? (
                <div
                  className='mt-1 w-px flex-1'
                  style={{ background: "var(--border-color)" }}
                />
              ) : null}
            </div>

            <div className='flex-1 pb-4'>
              <div
                className={`border px-3 py-2 ${tone.card} ${
                  node.isCurrent ? "ring-2 ring-emerald-400" : ""
                }`}
              >
                <div className='text-sm font-semibold'>{node.title}</div>
                <div className='mt-1 text-xs opacity-80'>{node.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildBoardBranchTree(projectBoards = [], activeBoardId = null) {
  const safeBoards = Array.isArray(projectBoards) ? projectBoards : [];
  const byParent = new Map();

  safeBoards.forEach((board) => {
    const parentId = board?.derivedFromBoardId || null;
    if (!parentId) return;

    if (!byParent.has(parentId)) {
      byParent.set(parentId, []);
    }

    byParent.get(parentId).push(board);
  });

  byParent.forEach((children) => {
    children.sort((a, b) => {
      const aTime = Date.parse(a?.createdAt || a?.updatedAt || "") || 0;
      const bTime = Date.parse(b?.createdAt || b?.updatedAt || "") || 0;
      return aTime - bTime;
    });
  });

  const roots = safeBoards.filter((board) => !board?.derivedFromBoardId);

  roots.sort((a, b) => {
    const aTime = Date.parse(a?.createdAt || a?.updatedAt || "") || 0;
    const bTime = Date.parse(b?.createdAt || b?.updatedAt || "") || 0;
    return aTime - bTime;
  });

  const nodes = [];

  function walk(board, depth = 0) {
    if (!board?.id) return;

    nodes.push({
      id: `board-${board.id}`,
      type: board.id === activeBoardId ? "current" : "board",
      title: board.name || "Untitled board",
      subtitle:
        board.id === activeBoardId
          ? "Current direction"
          : board.boardCreationMode === "transformation-copy"
            ? `Derived copy${
                board.derivedFromTransformationTitle
                  ? ` · ${board.derivedFromTransformationTitle}`
                  : ""
              }`
            : "Direction",
      depth,
      isCurrent: board.id === activeBoardId,
    });

    const children = byParent.get(board.id) || [];

    children.forEach((child) => {
      if (child?.derivedFromTransformationTitle) {
        nodes.push({
          id: `branch-${child.id}`,
          type: "transformation",
          title: child.derivedFromTransformationTitle,
          subtitle: "Branch transformation",
          depth: depth + 1,
          isCurrent: false,
        });
      }

      walk(child, depth + 1);
    });
  }

  roots.forEach((root) => walk(root, 0));

  return nodes;
}
export default function DirectionTrajectoryPanel({
  activeBoard,
  activeBoardId = null,
  projectBoards = [],
  directionVersions = [],
  appliedTransformationHistory = [],
  decisionProfile = null,
}) {
  if (!activeBoard) return null;

  const safeVersions = Array.isArray(directionVersions)
    ? directionVersions
    : [];
  const safeHistory = Array.isArray(appliedTransformationHistory)
    ? appliedTransformationHistory
    : [];

  const resolvedActiveBoardId = activeBoardId || activeBoard?.id || null;
  const boardName = activeBoard?.name || "Untitled board";

  const boardVersions = safeVersions
    .filter((snapshot) => snapshot?.boardId === resolvedActiveBoardId)
    .sort((a, b) => getSnapshotTimestamp(b) - getSnapshotTimestamp(a));

  const boardHistory = safeHistory
    .filter((item) => item?.boardId === resolvedActiveBoardId)
    .sort((a, b) => getHistoryTimestamp(b) - getHistoryTimestamp(a));

  const branchNodes = buildBoardBranchTree(
    projectBoards,
    resolvedActiveBoardId,
  );
  const previousVersion =
    boardVersions.length >= 2 ? boardVersions[1] : boardVersions[0] || null;

  const structuralDiff = computeStructuralDiff(previousVersion, activeBoard);
  const decisionPatternLines = computeDecisionPattern(decisionProfile);

  const currentEntryCount = getSafeEntryIds(activeBoard).length;
  const previousEntryCount = getSnapshotBoardEntryCount(previousVersion);
  const currentCounts = getBoardConditionCounts(activeBoard);

  const transformationCount = boardHistory.length;
  const versionCount = boardVersions.length;
  const acceptedRecommendationCount = getSafeNumber(
    decisionProfile?.totals?.acceptedRecommendations,
  );
  const restoredVersions = getSafeNumber(
    decisionProfile?.totals?.restoredVersions,
  );

  const directionStatus = computeDirectionStatus({
    transformationCount,
    acceptedRecommendationCount,
    tensionCount: currentCounts.tensionCount,
    missingCount: currentCounts.missingCount,
  });

  const statusToneClasses =
    directionStatus === "Established"
      ? "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#d1fae5]"
      : directionStatus === "Stabilizing"
        ? "border-[rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.10)] text-[#e0f2fe]"
        : directionStatus === "Evolving"
          ? "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fef3c7]"
          : "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]";

  const latestTransformation = boardHistory[0] || null;
  const latestAddedCount = Array.isArray(latestTransformation?.addedEntryIds)
    ? latestTransformation.addedEntryIds.length
    : 0;

  const trajectoryNodes = branchNodes.length
    ? branchNodes
    : buildTrajectoryGraphNodes(activeBoard, boardHistory, boardVersions);
  return (
    <div
      className='border p-4'
      style={{
        borderColor: "rgba(168,85,247,0.35)",
        background: "rgba(168,85,247,0.08)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "#d8b4fe" }}
      >
        Direction trajectory
      </div>

      <div
        className='mt-2 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        How this direction has evolved through transformations, saved versions,
        and repeated design decisions.
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <div
          className='border px-4 py-3'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className='text-[10px] uppercase tracking-[0.12em]'
            style={{ color: "var(--text-muted)" }}
          >
            Active direction
          </div>
          <div
            className='mt-1 text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {boardName}
          </div>
        </div>

        <div
          className='border px-4 py-3'
          style={{
            borderColor: "rgba(56,189,248,0.35)",
            background: "rgba(56,189,248,0.10)",
          }}
        >
          <div
            className='text-[10px] uppercase tracking-[0.12em]'
            style={{ color: "#bae6fd" }}
          >
            Saved versions
          </div>
          <div
            className='mt-1 text-sm font-semibold'
            style={{ color: "#e0f2fe" }}
          >
            {versionCount}
          </div>
        </div>

        <div
          className='border px-4 py-3'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
          }}
        >
          <div
            className='text-[10px] uppercase tracking-[0.12em]'
            style={{ color: "#a7f3d0" }}
          >
            Current entries
          </div>
          <div
            className='mt-1 text-sm font-semibold'
            style={{ color: "#d1fae5" }}
          >
            {currentEntryCount}
          </div>
        </div>
      </div>

      <div className='mt-4'>
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Direction lineage
        </div>

        <TrajectoryGraph nodes={trajectoryNodes} />
      </div>

      <div className='mt-4'>
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Structural shifts
        </div>

        <div className='mt-2 space-y-2'>
          {structuralDiff ? (
            <>
              <div
                className='border px-3 py-2 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                }}
              >
                Tensions{" "}
                {structuralDiff.tensionsRemoved >= 0 ? "reduced" : "increased"}{" "}
                ({Math.abs(structuralDiff.tensionsRemoved)})
              </div>

              <div
                className='border px-3 py-2 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                }}
              >
                Missing elements{" "}
                {structuralDiff.missingResolved >= 0 ? "resolved" : "increased"}{" "}
                ({Math.abs(structuralDiff.missingResolved)})
              </div>

              <div
                className='border px-3 py-2 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                }}
              >
                Strength signals{" "}
                {structuralDiff.strengthsAdded >= 0 ? "added" : "reduced"} (
                {Math.abs(structuralDiff.strengthsAdded)})
              </div>

              {previousVersion ? (
                <div
                  className='border px-3 py-2 text-sm'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Entries{" "}
                  {currentEntryCount >= previousEntryCount
                    ? "increased"
                    : "reduced"}{" "}
                  ({Math.abs(currentEntryCount - previousEntryCount)})
                </div>
              ) : null}
            </>
          ) : (
            <div
              className='border px-3 py-2 text-sm'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
              }}
            >
              No structural comparison is available yet.
            </div>
          )}

          {latestTransformation ? (
            <div
              className='border px-3 py-2 text-sm'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              Latest transformation:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {latestTransformation.transformationTitle}
              </strong>
              {latestAddedCount > 0
                ? ` · ${latestAddedCount} entr${
                    latestAddedCount === 1 ? "y" : "ies"
                  } added`
                : ""}
            </div>
          ) : null}
        </div>
      </div>

      <div className='mt-4'>
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Decision pattern
        </div>

        <div className='mt-2 space-y-2'>
          {decisionPatternLines.length ? (
            decisionPatternLines.map((line, index) => (
              <div
                key={index}
                className='border px-3 py-2 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                }}
              >
                • {line}
              </div>
            ))
          ) : (
            <div
              className='border px-3 py-2 text-sm'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
              }}
            >
              Not enough decision history is available yet to identify a stable
              pattern.
            </div>
          )}
        </div>
      </div>

      <div className='mt-4'>
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Direction status
        </div>

        <div
          className={`mt-2 inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold ${statusToneClasses}`}
        >
          <span className='h-2 w-2 rounded-full bg-current' />
          {directionStatus}
        </div>
      </div>

      {restoredVersions > 0 ? (
        <div
          className='mt-4 border px-3 py-2 text-sm'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          {restoredVersions} version{restoredVersions === 1 ? "" : "s"} restored
          in this decision profile.
        </div>
      ) : null}
    </div>
  );
}
