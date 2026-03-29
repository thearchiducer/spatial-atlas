import { useMemo, useState } from "react";
import { buildTransformationSimulation } from "../../lib/buildTransformationSimulation";
import { buildBoardIntelligence } from "../../lib/buildBoardIntelligence";
import { normalizeEntryIds } from "../../lib/boardUtils";
import {
  getPreviewDeselectedEntries,
  getPreviewSelectedEntries,
  getPreviewSelectedEntryIds,
} from "../../lib/transformationPreviewUtils";
import TransformationPreviewModal from "./TransformationPreviewModal";

function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}

function labelFromBoard(board) {
  return board?.name || "Untitled board";
}

function BoardPicker({ label, value, boards, onChange }) {
  return (
    <label className='flex flex-col gap-2'>
      <span
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className='border px-3 py-2 text-sm outline-none transition'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-primary)",
        }}
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }
        : tone === "sky"
          ? {
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
              color: "var(--tone-info-text)",
            }
          : tone === "violet"
            ? {
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }
            : {
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
                color: "var(--text-primary)",
              };

  return (
    <div
      className='border px-4 py-3'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      <div className='text-[10px] uppercase tracking-[0.12em] opacity-70'>
        {label}
      </div>
      <div className='mt-1 text-sm font-semibold'>{value}</div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  emptyText = "No items.",
  toneA = "emerald",
  toneB = "amber",
}) {
  function getToneClasses(tone) {
    if (tone === "emerald") {
      return {
        chipBorder: "var(--tone-success-border)",
        chipBg: "var(--tone-success-bg)",
        chipText: "var(--tone-success-text)",
        text: "var(--tone-success-text)",
      };
    }

    if (tone === "amber") {
      return {
        chipBorder: "var(--tone-warning-border)",
        chipBg: "var(--tone-warning-bg)",
        chipText: "var(--tone-warning-text)",
        text: "var(--tone-warning-text)",
      };
    }

    return {
      chipBorder: "var(--border-color)",
      chipBg: "var(--bg-muted)",
      chipText: "var(--text-secondary)",
      text: "var(--text-secondary)",
    };
  }

  return (
    <div
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div
        className='border-b px-4 py-2.5'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-[11px] font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      </div>

      <div className='divide-y' style={{ borderColor: "var(--border-color)" }}>
        {items.length ? (
          items.map((item) => {
            const hasWinner = item.winner;
            const hasCounts =
              typeof item.aCount === "number" &&
              typeof item.bCount === "number";

            const winnerTone =
              item.winner === "A"
                ? getToneClasses(toneA)
                : item.winner === "B"
                  ? getToneClasses(toneB)
                  : getToneClasses("stone");

            const toneAClasses = getToneClasses(toneA);
            const toneBClasses = getToneClasses(toneB);

            return (
              <div key={item.key} className='px-4 py-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <div
                    className='text-sm font-medium'
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </div>

                  {hasWinner ? (
                    <div
                      className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                      style={{
                        borderColor: winnerTone.chipBorder,
                        background: winnerTone.chipBg,
                        color: winnerTone.chipText,
                      }}
                    >
                      Winner {item.winner}
                    </div>
                  ) : null}

                  {typeof item.difference === "number" &&
                  item.difference > 0 ? (
                    <div
                      className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                      style={{
                        borderColor: "var(--border-color)",
                        background: "var(--bg-muted)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Δ {item.difference}
                    </div>
                  ) : null}
                </div>

                {hasCounts ? (
                  <div
                    className='mt-1 text-[12px]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span
                      className='font-medium'
                      style={{ color: toneAClasses.text }}
                    >
                      A: {item.aCount}
                    </span>
                    <span
                      className='mx-1'
                      style={{ color: "var(--text-muted)" }}
                    >
                      ·
                    </span>
                    <span
                      className='font-medium'
                      style={{ color: toneBClasses.text }}
                    >
                      B: {item.bCount}
                    </span>
                  </div>
                ) : null}

                {item.note ? (
                  <div
                    className='mt-1 text-[12.5px] leading-relaxed'
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.note}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div
            className='px-4 py-3 text-sm'
            style={{ color: "var(--text-muted)" }}
          >
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function IdentitySummary({ identity }) {
  if (!identity) return null;

  return (
    <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
      <MetricCard label='Privacy' value={identity.privacyModel} />
      <MetricCard label='Circulation' value={identity.circulationModel} />
      <MetricCard label='Social' value={identity.socialModel} />
      <MetricCard label='Climate' value={identity.climateModel} />
      <MetricCard label='Pattern' value={identity.spatialPattern} />
    </div>
  );
}

function BoardSummaryCard({
  title,
  comparisonBoard,
  boardTone = "A",
  isWinner = false,
}) {
  if (!comparisonBoard) return null;

  const toneStyles =
    boardTone === "A"
      ? {
          containerBorder: "var(--tone-success-border)",
          containerBg: "var(--tone-success-bg)",
          badgeBorder: "var(--tone-success-border)",
          badgeBg: "var(--tone-success-bg)",
          badgeText: "var(--tone-success-text)",
          scoreBorder: "var(--tone-success-border)",
          scoreBg: "var(--tone-success-bg)",
          scoreText: "var(--tone-success-text)",
        }
      : {
          containerBorder: "var(--tone-warning-border)",
          containerBg: "var(--tone-warning-bg)",
          badgeBorder: "var(--tone-warning-border)",
          badgeBg: "var(--tone-warning-bg)",
          badgeText: "var(--tone-warning-text)",
          scoreBorder: "var(--tone-warning-border)",
          scoreBg: "var(--tone-warning-bg)",
          scoreText: "var(--tone-warning-text)",
        };

  return (
    <div
      className='border p-4'
      style={{
        borderColor: toneStyles.containerBorder,
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel(title)}
          <div
            className='mt-1 text-lg font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {comparisonBoard.boardName || "Untitled board"}
          </div>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {comparisonBoard.summary}
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {isWinner ? (
            <span
              className='border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]'
              style={{
                borderColor: toneStyles.badgeBorder,
                background: toneStyles.badgeBg,
                color: toneStyles.badgeText,
              }}
            >
              Stronger direction
            </span>
          ) : null}

          <span
            className='border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]'
            style={{
              borderColor: toneStyles.scoreBorder,
              background: toneStyles.scoreBg,
              color: toneStyles.scoreText,
            }}
          >
            Score: {comparisonBoard.score}
          </span>
        </div>
      </div>

      <IdentitySummary identity={comparisonBoard.identity} />

      <div className='mt-4 grid gap-3 md:grid-cols-4'>
        <MetricCard
          label='Strengths'
          value={comparisonBoard.strengths.length}
          tone={boardTone === "A" ? "emerald" : "amber"}
        />
        <MetricCard
          label='Missing'
          value={comparisonBoard.missing.length}
          tone='amber'
        />
        <MetricCard
          label='Tensions'
          value={comparisonBoard.tensions.length}
          tone='amber'
        />
        <MetricCard
          label='Next moves'
          value={comparisonBoard.nextMoves.length}
        />
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <MetricCard
          label='Strength score'
          value={comparisonBoard.scoreBreakdown.strengthScore}
          tone={boardTone === "A" ? "emerald" : "amber"}
        />
        <MetricCard
          label='Missing penalty'
          value={comparisonBoard.scoreBreakdown.missingPenalty}
          tone='amber'
        />
        <MetricCard
          label='Tension penalty'
          value={comparisonBoard.scoreBreakdown.tensionPenalty}
          tone='amber'
        />
      </div>
    </div>
  );
}

function VerdictPanel({ comparison, boardA, boardB }) {
  if (!comparison) return null;

  const winnerLabel =
    comparison.strongerSide === "A"
      ? labelFromBoard(boardA)
      : comparison.strongerSide === "B"
        ? labelFromBoard(boardB)
        : "Tie";

  return (
    <div
      className='border p-5'
      style={{
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
      }}
    >
      {annotationLabel("Comparison verdict")}
      <h3
        className='mt-2 text-lg font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {comparison.summary}
      </h3>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <MetricCard label='Stronger direction' value={winnerLabel} tone='sky' />
        <MetricCard label='Score gap' value={comparison.scoreGap} tone='sky' />
        <MetricCard
          label='Identity differences'
          value={comparison.identityDifferences.length}
          tone='sky'
        />
      </div>
    </div>
  );
}

function PreferenceVerdictPanel({ comparison, boardA, boardB }) {
  if (!comparison?.decisionProfileUsed) return null;

  const winnerLabel =
    comparison.preferenceVerdict?.strongerSide === "A"
      ? labelFromBoard(boardA)
      : comparison.preferenceVerdict?.strongerSide === "B"
        ? labelFromBoard(boardB)
        : "Tie";

  return (
    <div
      className='border p-5'
      style={{
        borderColor: "var(--tone-violet-border)",
        background: "var(--tone-violet-bg)",
      }}
    >
      {annotationLabel("Preference-aware verdict")}
      <h3
        className='mt-2 text-lg font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {comparison.preferenceVerdict?.summary}
      </h3>

      <div className='mt-4 grid gap-3 md:grid-cols-4'>
        <MetricCard
          label='Preference fit winner'
          value={winnerLabel}
          tone='violet'
        />
        <MetricCard
          label='A preference boost'
          value={comparison.preferenceBoostA}
          tone='violet'
        />
        <MetricCard
          label='B preference boost'
          value={comparison.preferenceBoostB}
          tone='violet'
        />
        <MetricCard
          label='Adjusted score gap'
          value={comparison.preferenceVerdict?.scoreGap ?? 0}
          tone='violet'
        />
      </div>
    </div>
  );
}

function EntryChipList({
  title,
  items,
  emptyText = "None.",
  onSelectEntry,
  tone = "stone",
}) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
          hover: "var(--tone-success-bg)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
            hover: "var(--tone-warning-bg)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
            hover: "var(--bg-subtle)",
          };

  return (
    <div className='mt-3'>
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.12em]'
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>

      {items.length ? (
        <div className='mt-2 flex flex-wrap gap-2'>
          {items.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelectEntry?.(item.id)}
              className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition transform active:scale-95 hover:shadow-sm'
              style={{
                borderColor: toneStyles.borderColor,
                background: toneStyles.background,
                color: toneStyles.color,
              }}
              title={`Open ${item.term}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = toneStyles.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = toneStyles.background;
              }}
            >
              {item.term}
            </button>
          ))}
        </div>
      ) : (
        <div className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </div>
      )}
    </div>
  );
}

function TransformationPlanBlock({
  transformationPlan,
  onSelectEntry,
  onPreviewTransformation,
}) {
  if (!transformationPlan) return null;

  return (
    <div
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div
        className='border-b px-4 py-3'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-[11px] font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Transformation plan
        </div>
      </div>

      <div className='space-y-4 p-4'>
        <div>
          <div
            className='text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {transformationPlan.summary}
          </div>
        </div>

        {transformationPlan.transformations.length ? (
          <div className='space-y-3'>
            {transformationPlan.transformations.map((item) => (
              <div
                key={item.key}
                className='border px-3 py-3'
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                }}
              >
                <div className='flex flex-wrap items-center gap-2'>
                  <div
                    className='text-sm font-semibold'
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </div>
                  <div
                    className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                    style={{
                      borderColor: "var(--border-color)",
                      background: "var(--bg-muted)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {item.priority}
                  </div>
                </div>

                <div
                  className='mt-2 text-sm leading-relaxed'
                  style={{ color: "var(--text-secondary)" }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>Why:</strong>{" "}
                  {item.why}
                </div>

                <div
                  className='mt-2 text-sm leading-relaxed'
                  style={{ color: "var(--text-secondary)" }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>
                    Action:
                  </strong>{" "}
                  {item.action}
                </div>

                <EntryChipList
                  title='Suggested entries'
                  items={item.suggestedEntries || []}
                  emptyText='No specific entry suggestions.'
                  onSelectEntry={onSelectEntry}
                  tone='emerald'
                />

                <EntryChipList
                  title='Focus targets'
                  items={item.focusTargets || []}
                  emptyText='No direct focus targets.'
                  onSelectEntry={onSelectEntry}
                  tone='amber'
                />

                <div className='mt-3 flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() =>
                      onPreviewTransformation?.(item, transformationPlan)
                    }
                    className='border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition'
                    style={{
                      borderColor: "var(--tone-success-border)",
                      background: "var(--tone-success-bg)",
                      color: "var(--tone-success-text)",
                    }}
                  >
                    Preview transformation
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-sm' style={{ color: "var(--text-muted)" }}>
            No transformation opportunities detected. Try adjusting the
            direction or comparing a different pair.
          </div>
        )}
      </div>
    </div>
  );
}

function UndoTransformationBlock({
  lastAppliedTransformation,
  appliedTransformationHistory = [],
  undoneTransformationHistory = [],
  onUndoLastTransformation,
  onRedoLastTransformation,
  lastActionLabel = null,
}) {
  const appliedCount = appliedTransformationHistory.length;
  const undoneCount = undoneTransformationHistory.length;

  if (!lastAppliedTransformation && !undoneCount) return null;

  return (
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--tone-warning-text)" }}
      >
        Transformation history controls
      </div>

      {lastAppliedTransformation ? (
        <>
          <div
            className='mt-2 text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {lastAppliedTransformation.transformationTitle}
          </div>

          <div
            className='mt-1 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            Added {lastAppliedTransformation.addedEntryIds.length} entr
            {lastAppliedTransformation.addedEntryIds.length === 1
              ? "y"
              : "ies"}{" "}
            to the weaker direction.
          </div>
        </>
      ) : (
        <div
          className='mt-2 text-sm'
          style={{ color: "var(--text-secondary)" }}
        >
          No active applied transformation to undo.
        </div>
      )}

      <div className='mt-3 grid gap-3 md:grid-cols-2'>
        <MetricCard label='Applied stack' value={appliedCount} tone='emerald' />
        <MetricCard label='Redo stack' value={undoneCount} tone='amber' />
      </div>

      {lastActionLabel ? (
        <div
          className='mt-3 text-xs leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          {lastActionLabel}
        </div>
      ) : null}

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={onUndoLastTransformation}
          disabled={!appliedCount}
          className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }}
        >
          Undo last transformation
        </button>

        <button
          type='button'
          onClick={onRedoLastTransformation}
          disabled={!undoneCount}
          className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }}
        >
          Redo last transformation
        </button>
      </div>
    </div>
  );
}

export default function BoardComparisonPanel({
  boards = [],
  entries = [],
  activeBoardId = null,
  decisionProfile = null,
  onSelectEntry,
  onApplyTransformation,
  lastAppliedTransformation,
  appliedTransformationHistory,
  undoneTransformationHistory,
  onUndoLastTransformation,
  onRedoLastTransformation,
}) {
  const safeBoards = useMemo(
    () => (Array.isArray(boards) ? boards : []),
    [boards],
  );
  const [transformationApplyMode, setTransformationApplyMode] =
    useState("live");
  const safeEntries = useMemo(
    () => (Array.isArray(entries) ? entries : []),
    [entries],
  );

  const preferredBoardAId = useMemo(() => {
    return activeBoardId || safeBoards[0]?.id || "";
  }, [activeBoardId, safeBoards]);

  const preferredBoardBId = useMemo(() => {
    const fallbackA = preferredBoardAId || safeBoards[0]?.id || "";
    const otherBoard =
      safeBoards.find((board) => board.id !== fallbackA) ||
      safeBoards[1] ||
      safeBoards[0];

    return otherBoard?.id || "";
  }, [preferredBoardAId, safeBoards]);

  const [boardASelection, setBoardASelection] = useState(
    () => preferredBoardAId,
  );
  const [boardBSelection, setBoardBSelection] = useState(
    () => preferredBoardBId,
  );
  const [previewedTransformation, setPreviewedTransformation] = useState(null);
  const [previewSelectedEntryIds, setPreviewSelectedEntryIds] = useState([]);
  const [lastActionLabel, setLastActionLabel] = useState(null);

  function handlePreviewTransformation(transformation) {
    setLastActionLabel(null);
    setPreviewedTransformation(transformation);
    setPreviewSelectedEntryIds(getPreviewSelectedEntryIds(transformation));
  }

  function handleCloseTransformationPreview() {
    setLastActionLabel(null);
    setPreviewedTransformation(null);
    setPreviewSelectedEntryIds([]);
    setTransformationApplyMode("live");
  }

  function handleTogglePreviewEntry(entryId) {
    setPreviewSelectedEntryIds((current) =>
      current.includes(entryId)
        ? current.filter((id) => id !== entryId)
        : [...current, entryId],
    );
  }

  function handleSelectAllPreviewEntries() {
    const nextIds = normalizeEntryIds({
      entries: previewedTransformation?.suggestedEntries,
    });

    setPreviewSelectedEntryIds(nextIds);
  }

  function handleClearAllPreviewEntries() {
    setPreviewSelectedEntryIds([]);
  }

  const boardAId = useMemo(() => {
    const exists = safeBoards.some((board) => board.id === boardASelection);
    return exists ? boardASelection : preferredBoardAId;
  }, [safeBoards, boardASelection, preferredBoardAId]);

  const boardBId = useMemo(() => {
    const exists = safeBoards.some((board) => board.id === boardBSelection);
    const fallback =
      preferredBoardBId && preferredBoardBId !== boardAId
        ? preferredBoardBId
        : safeBoards.find((board) => board.id !== boardAId)?.id || "";

    return exists && boardBSelection !== boardAId ? boardBSelection : fallback;
  }, [safeBoards, boardBSelection, preferredBoardBId, boardAId]);

  const boardA = useMemo(
    () => safeBoards.find((board) => board.id === boardAId) || null,
    [safeBoards, boardAId],
  );

  const boardB = useMemo(
    () => safeBoards.find((board) => board.id === boardBId) || null,
    [safeBoards, boardBId],
  );

  const comparisonPacket = useMemo(() => {
    if (!boardA || !boardB || boardA.id === boardB.id) {
      return {
        analysis: null,
        recommendations: [],
        transformationPlan: null,
        comparison: null,
      };
    }

    return buildBoardIntelligence({
      board: boardA,
      entries: safeEntries,
      comparisonBoard: boardB,
      decisionProfile,
    });
  }, [boardA, boardB, safeEntries, decisionProfile]);

  const comparison = comparisonPacket.comparison;
  const transformationPlan = comparisonPacket.transformationPlan;

  const simulatedPreview = useMemo(() => {
    return buildTransformationSimulation({
      previewedTransformation,
      transformationPlan,
      previewSelectedEntryIds,
      boardA,
      boardB,
      entries: safeEntries,
    });
  }, [
    previewedTransformation,
    transformationPlan,
    previewSelectedEntryIds,
    boardA,
    boardB,
    safeEntries,
  ]);
  function handleUndoWithFeedback() {
    onUndoLastTransformation?.();
    setLastActionLabel("Last transformation was undone");
  }

  function handleRedoWithFeedback() {
    onRedoLastTransformation?.();
    setLastActionLabel("Last transformation was restored");
  }
  function handleConfirmTransformation() {
    if (!previewedTransformation || !transformationPlan) return;
    setLastActionLabel(
      transformationApplyMode === "live"
        ? "Transformation applied to weaker direction"
        : "Transformed copy created",
    );
    const selectedEntries = getPreviewSelectedEntries(
      previewedTransformation,
      previewSelectedEntryIds,
    );

    const deselectedEntries = getPreviewDeselectedEntries(
      previewedTransformation,
      previewSelectedEntryIds,
    );

    const nextTransformation = {
      ...previewedTransformation,
      suggestedEntries: selectedEntries,
      deselectedEntries,
    };

    onApplyTransformation?.(
      nextTransformation,
      transformationPlan,
      transformationApplyMode,
    );

    setPreviewedTransformation(null);
    setPreviewSelectedEntryIds([]);
    setTransformationApplyMode("live");
  }

  if (safeBoards.length < 2) {
    return (
      <section
        className='border p-5'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
        }}
      >
        {annotationLabel("Board comparison")}
        <h2
          className='mt-2 text-xl font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Compare project directions
        </h2>

        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          Create at least two boards to compare which design direction is
          stronger and why.
        </p>
      </section>
    );
  }

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      {annotationLabel("Board comparison")}

      <div className='mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <h2
            className='text-xl font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            Compare project directions
          </h2>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Compare two boards to see which direction is currently stronger,
            what identity each board is expressing, and where their liabilities
            and next moves differ.
          </p>
        </div>
      </div>

      <div className='mt-5 grid gap-3 md:grid-cols-2'>
        <BoardPicker
          label='Board A'
          value={boardAId}
          boards={safeBoards}
          onChange={(value) => {
            setLastActionLabel(null);
            setBoardASelection(value);
          }}
        />

        <BoardPicker
          label='Board B'
          value={boardBId}
          boards={safeBoards}
          onChange={(value) => {
            setLastActionLabel(null);
            setBoardBSelection(value);
          }}
        />
      </div>

      {boardAId === boardBId ? (
        <div
          className='mt-5 border p-4 text-sm'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }}
        >
          Pick two different boards to get a meaningful comparison.
        </div>
      ) : !comparison ? (
        <div
          className='mt-5 border p-4 text-sm'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }}
        >
          Comparison could not be generated for the selected boards.
        </div>
      ) : (
        <>
          <div className='mt-5 space-y-4'>
            <VerdictPanel
              comparison={comparison}
              boardA={boardA}
              boardB={boardB}
            />

            <PreferenceVerdictPanel
              comparison={comparison}
              boardA={boardA}
              boardB={boardB}
            />
          </div>

          <TransformationPreviewModal
            transformation={previewedTransformation}
            transformationPlan={transformationPlan}
            selectedEntryIds={previewSelectedEntryIds}
            applyMode={transformationApplyMode}
            onChangeApplyMode={setTransformationApplyMode}
            onToggleEntry={handleTogglePreviewEntry}
            onSelectAll={handleSelectAllPreviewEntries}
            onClearAll={handleClearAllPreviewEntries}
            onClose={handleCloseTransformationPreview}
            onConfirm={handleConfirmTransformation}
            simulatedPreview={simulatedPreview}
          />

          <div className='mt-4'>
            <UndoTransformationBlock
              lastAppliedTransformation={lastAppliedTransformation}
              appliedTransformationHistory={appliedTransformationHistory}
              undoneTransformationHistory={undoneTransformationHistory}
              onUndoLastTransformation={handleUndoWithFeedback}
              onRedoLastTransformation={handleRedoWithFeedback}
              lastActionLabel={lastActionLabel}
            />
          </div>

          {/* ✅ FIXED: wrap both summaries in a grid */}
          <div className='mt-5 space-y-3'>
            <div
              className='max-w-2xl text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {comparison.strongerSide === "A"
                ? `"${comparison.boardA.boardName}" currently expresses the stronger direction based on structural coherence and overall fit.`
                : comparison.strongerSide === "B"
                  ? `${comparison.boardB.boardName} currently expresses the stronger direction based on structural coherence and overall fit.`
                  : "Both boards are currently close in strength, so the comparison should be read as directional rather than decisive."}
            </div>

            <div className='mt-5'>
              <TransformationPlanBlock
                transformationPlan={transformationPlan}
                onSelectEntry={onSelectEntry}
                onPreviewTransformation={handlePreviewTransformation}
              />
            </div>
            <div className='grid gap-4 xl:grid-cols-2'>
              <BoardSummaryCard
                title='Board A'
                comparisonBoard={comparison.boardA}
                boardTone='A'
                isWinner={comparison.strongerSide === "A"}
              />

              <BoardSummaryCard
                title='Board B'
                comparisonBoard={comparison.boardB}
                boardTone='B'
                isWinner={comparison.strongerSide === "B"}
              />
            </div>
          </div>

          <div className='mt-5 space-y-5'>
            <section className='space-y-3'>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--text-muted)" }}
              >
                Directional analysis
              </div>
              <div className='grid gap-4 xl:grid-cols-4'>
                <ListBlock
                  title='Why one board is stronger'
                  items={comparison.scoreReasons}
                  emptyText='No major score-based distinction was found.'
                />

                <ListBlock
                  title='Identity differences'
                  items={comparison.identityDifferences}
                  emptyText='The two boards currently express very similar identities.'
                />

                <ListBlock
                  title='Structural comparisons'
                  items={comparison.listComparisons}
                  emptyText='The boards are close in structural counts.'
                />

                <ListBlock
                  title='Preference-aware differences'
                  items={comparison.preferenceReasons || []}
                  emptyText='No preference-based distinction was found.'
                />
              </div>
            </section>

            <section className='space-y-3'>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--text-muted)" }}
              >
                Liabilities by board
              </div>

              <div className='grid gap-4 xl:grid-cols-2'>
                <ListBlock
                  title={`${comparison.boardA.boardName} · Missing elements`}
                  items={comparison.boardA.missing}
                  emptyText='No major missing elements.'
                />

                <ListBlock
                  title={`${comparison.boardB.boardName} · Missing elements`}
                  items={comparison.boardB.missing}
                  emptyText='No major missing elements.'
                />

                <ListBlock
                  title={`${comparison.boardA.boardName} · Tensions`}
                  items={comparison.boardA.tensions}
                  emptyText='No major tensions.'
                />

                <ListBlock
                  title={`${comparison.boardB.boardName} · Tensions`}
                  items={comparison.boardB.tensions}
                  emptyText='No major tensions.'
                />
              </div>
            </section>

            <section className='space-y-3'>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--text-muted)" }}
              >
                Recommended next actions
              </div>

              <div className='grid gap-4 xl:grid-cols-2'>
                <ListBlock
                  title={`${comparison.boardA.boardName} · Next moves`}
                  items={comparison.boardA.nextMoves}
                  emptyText='No urgent moves.'
                />

                <ListBlock
                  title={`${comparison.boardB.boardName} · Next moves`}
                  items={comparison.boardB.nextMoves}
                  emptyText='No urgent moves.'
                />
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
