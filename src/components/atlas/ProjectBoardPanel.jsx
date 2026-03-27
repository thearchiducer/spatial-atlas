import { useEffect, useMemo, useState } from "react";

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

function MetricChip({ label, value }) {
  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
      {label} · {value}
    </span>
  );
}

function EntryPill({ entry, onRemove }) {
  if (!entry) return null;

  return (
    <div
      className='flex items-center gap-2 border px-3 py-2'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div className='min-w-0 flex-1'>
        <div
          className='truncate text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {entry.term}
        </div>
        <div
          className='truncate text-[11px] uppercase tracking-[0.08em]'
          style={{ color: "var(--text-muted)" }}
        >
          {entry.type || "—"} · {entry.privacyLevel || "—"}
        </div>
      </div>

      <button
        type='button'
        onClick={() => onRemove(entry)}
        className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition'
        style={{
          background: "rgba(251,191,36,0.10)",
          borderColor: "rgba(251,191,36,0.30)",
          color: "#fde68a",
        }}
      >
        Remove
      </button>
    </div>
  );
}

function ComparePairCard({ pair }) {
  if (!pair) return null;

  const left = pair.left || null;
  const right = pair.right || null;

  return (
    <div
      className='border p-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {left?.term || pair.leftId || "Unknown"} ↔{" "}
        {right?.term || pair.rightId || "Unknown"}
      </div>
      <div
        className='mt-1 text-[11px] uppercase tracking-[0.08em]'
        style={{ color: "var(--text-muted)" }}
      >
        Compare pair
      </div>
    </div>
  );
}

function BoardCard({ board, isActive, onOpen, onDelete }) {
  const entryCount = Array.isArray(board?.entryIds) ? board.entryIds.length : 0;
  const pairCount = Array.isArray(board?.comparePairs)
    ? board.comparePairs.length
    : 0;

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        if (!onOpen) return;
        onOpen(board.id);
      }}
      className='border p-4 transition cursor-pointer'
      style={{
        borderColor: isActive ? "rgba(168,85,247,0.55)" : "var(--border-color)",
        background: isActive ? "rgba(168,85,247,0.08)" : "var(--bg-surface)",
        color: "var(--text-primary)",
        boxShadow: isActive
          ? "0 0 0 1px rgba(168,85,247,0.12), 0 8px 18px rgba(0,0,0,0.28)"
          : "0 0 0 1px rgba(255,255,255,0.02), 0 4px 10px rgba(0,0,0,0.18)",
      }}
    >
      <div
        className='flex items-start justify-between gap-3 border-b pb-4'
        style={{ borderColor: "rgba(255,255,255,0.10)" }}
      >
        <div>
          <div
            className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Project board
          </div>

          <h3
            className='text-base font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {board?.name || "Untitled board"}
          </h3>

          {isActive && (
            <div
              className='mt-1 inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
              style={{
                background: "rgba(168,85,247,0.15)",
                borderColor: "rgba(168,85,247,0.40)",
                color: "#d8b4fe",
              }}
            >
              Active
            </div>
          )}

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {board?.description ||
              "Working board for applied spatial research."}
          </p>
        </div>

        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            onDelete(board);
          }}
          className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          Delete
        </button>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        <MetricChip label='Entries' value={entryCount} />
        <MetricChip label='Pairs' value={pairCount} />
        <MetricChip
          label='Updated'
          value={
            board?.updatedAt ? new Date(board.updatedAt).toLocaleString() : "—"
          }
        />
      </div>

      <div className='mt-4'>
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            if (!onOpen) return;
            onOpen(board.id);
          }}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: isActive
              ? "rgba(168,85,247,0.40)"
              : "var(--border-color)",
            background: isActive ? "rgba(168,85,247,0.15)" : "var(--bg-muted)",
            color: isActive ? "#d8b4fe" : "var(--text-primary)",
          }}
        >
          {isActive ? "Current board" : "Activate board"}
        </button>
      </div>
    </div>
  );
}

export default function ProjectBoardPanel({
  boards = [],
  entries = [],
  activeBoardId = null,
  selectedEntry = null,
  compareEntries = [],
  onCreateBoard,
  onSetActiveBoard,
  onDeleteBoard,
  onAddSelectedEntry,
  onAddComparePair,
  onExportBoardSheet,
  onUpdateBoardNotes,
  onRemoveEntryFromBoard,
}) {
  const activeBoard = useMemo(() => {
    return boards.find((board) => board?.id === activeBoardId) || null;
  }, [boards, activeBoardId]);

  const activeBoardEntries = Array.isArray(activeBoard?.entryIds)
    ? activeBoard.entryIds
        .map((id) => entries.find((e) => e.id === id))
        .filter(Boolean)
    : [];

  const activeComparePairs = Array.isArray(activeBoard?.comparePairs)
    ? activeBoard.comparePairs
    : [];

  const activeBoardNotes = activeBoard?.notes || "";
  const [draftNotes, setDraftNotes] = useState(activeBoardNotes);

  useEffect(() => {
    setDraftNotes(activeBoardNotes);
  }, [activeBoardNotes]);

  function handleRemoveEntry(entry) {
    if (!activeBoard || !entry || !onRemoveEntryFromBoard) return;
    onRemoveEntryFromBoard(activeBoard.id, entry.id);
  }

  function handleNotesBlur() {
    if (!activeBoard || !onUpdateBoardNotes) return;
    onUpdateBoardNotes(activeBoard.id, draftNotes);
  }

  const canAddSelected = Boolean(activeBoard && selectedEntry);
  const canAddCompare = Boolean(activeBoard && compareEntries.length === 2);

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      {annotationLabel("Project board mode")}

      <h2
        className='mt-2 text-xl font-semibold tracking-tight'
        style={{ color: "var(--text-primary)" }}
      >
        Applied design workspace
      </h2>

      <p
        className='mt-2 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        Turn entries, compare pairs, and spatial intent into a project-specific
        working board.
      </p>

      <div
        className='mt-4 flex flex-wrap gap-2 border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={onCreateBoard}
          className='border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(168,85,247,0.40)",
            background: "rgba(168,85,247,0.15)",
            color: "#d8b4fe",
          }}
        >
          Create board
        </button>

        <button
          type='button'
          onClick={onAddSelectedEntry}
          disabled={!canAddSelected}
          className='border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
          }}
        >
          Add selected entry
        </button>

        <button
          type='button'
          onClick={onAddComparePair}
          disabled={!canAddCompare}
          className='border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
          }}
        >
          Add active compare pair
        </button>

        <button
          type='button'
          onClick={onExportBoardSheet}
          disabled={!activeBoard}
          className='border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
          }}
        >
          Export board sheet
        </button>
      </div>

      <div
        className='mt-6 border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          className='mb-3 text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Boards
        </div>

        <div className='grid gap-3'>
          {boards.length ? (
            boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isActive={board.id === activeBoardId}
                onOpen={onSetActiveBoard}
                onDelete={onDeleteBoard}
              />
            ))
          ) : (
            <div className='border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-500'>
              No boards yet.
            </div>
          )}
        </div>
      </div>

      <div className='mt-6 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]'>
        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div className='flex items-start justify-between gap-3 border-b border-stone-200 pb-4'>
            <div>
              <h3
                className='text-base font-semibold '
                style={{ color: "var(--text-primary)" }}
              >
                Active board entries
              </h3>
              <p
                className='mt-1 text-sm '
                style={{ color: "var(--text-secondary)" }}
              >
                Remove entries directly from the active board here.
              </p>
            </div>

            <MetricChip label='Entries' value={activeBoardEntries.length} />
          </div>

          <div className='mt-4 grid gap-2'>
            {activeBoard ? (
              activeBoardEntries.length ? (
                activeBoardEntries.map((entry) => (
                  <EntryPill
                    key={entry.id}
                    entry={entry}
                    onRemove={handleRemoveEntry}
                  />
                ))
              ) : (
                <div
                  className='border border-dashed p-4 text-sm'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "rgba(255,255,255,0.02)",
                    color: "var(--text-muted)",
                  }}
                >
                  Active board is empty.
                </div>
              )
            ) : (
              <div
                className='border border-dashed p-4 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text-muted)",
                }}
              >
                Open a board to manage its entries.
              </div>
            )}
          </div>

          <div
            className='mt-5 border-t pt-4'
            style={{ borderColor: "var(--border-color)" }}
          >
            {annotationLabel("Board notes")}
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              onBlur={handleNotesBlur}
              placeholder='Working notes, spatial intent, program reminders...'
              className='mt-2 min-h-[120px] w-full border px-3 py-3 text-sm outline-none transition'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className='flex items-start justify-between gap-3 border-b pb-4'
            style={{ borderColor: "var(--border-color)" }}
          >
            <div>
              <h3
                className='text-base font-semibold '
                style={{ color: "var(--text-primary)" }}
              >
                Active compare pairs
              </h3>
              <p
                className='mt-1 text-sm '
                style={{ color: "var(--text-secondary)" }}
              >
                Pairs attached to the active board.
              </p>
            </div>

            <MetricChip label='Pairs' value={activeComparePairs.length} />
          </div>

          <div className='mt-4 grid gap-2'>
            {activeBoard ? (
              activeComparePairs.length ? (
                activeComparePairs.map((pair, index) => (
                  <ComparePairCard
                    key={
                      pair.id ||
                      `${pair.leftId || pair.left?.id}-${pair.rightId || pair.right?.id}-${index}`
                    }
                    pair={pair}
                  />
                ))
              ) : (
                <div
                  className='border border-dashed p-4 text-sm'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "rgba(255,255,255,0.02)",
                    color: "var(--text-muted)",
                  }}
                >
                  No compare pairs in this board.
                </div>
              )
            ) : (
              <div
                className='border border-dashed p-4 text-sm'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text-muted)",
                }}
              >
                Open a board to inspect its compare pairs.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
