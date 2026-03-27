import { useEffect, useMemo, useState } from "react";

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function MetricChip({ label, value }) {
  return (
    <span className='border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
      {label} · {value}
    </span>
  );
}

function EntryPill({ entry, onRemove }) {
  if (!entry) return null;

  return (
    <div className='flex items-center gap-2 border border-stone-200 bg-white px-3 py-2'>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm font-semibold text-stone-900'>
          {entry.term}
        </div>
        <div className='truncate text-[11px] uppercase tracking-[0.08em] text-stone-500'>
          {entry.type || "—"} · {entry.privacyLevel || "—"}
        </div>
      </div>

      <button
        type='button'
        onClick={() => onRemove(entry)}
        className='border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-100'
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
    <div className='border border-stone-200 bg-white p-3'>
      <div className='text-sm font-semibold text-stone-900'>
        {left?.term || pair.leftId || "Unknown"} ↔{" "}
        {right?.term || pair.rightId || "Unknown"}
      </div>
      <div className='mt-1 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
        Compare pair
      </div>
    </div>
  );
}

function BoardCard({ board, isActive, onOpen, onDelete }) {
  const entryCount = Array.isArray(board?.entries) ? board.entries.length : 0;
  const pairCount = Array.isArray(board?.comparePairs)
    ? board.comparePairs.length
    : 0;

  return (
    <div
      className={
        "border p-4 transition " +
        (isActive
          ? "border-stone-900 bg-stone-950 text-white"
          : "border-stone-300 bg-white")
      }
    >
      <div className='flex items-start justify-between gap-3 border-b border-current/15 pb-4'>
        <div>
          <div className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70'>
            Project board
          </div>

          <h3
            className={
              "text-base font-semibold tracking-tight " +
              (isActive ? "text-white" : "text-stone-900")
            }
          >
            {board?.name || "Untitled board"}
          </h3>

          <p
            className={
              "mt-2 text-sm leading-relaxed " +
              (isActive ? "text-stone-300" : "text-stone-600")
            }
          >
            {board?.description ||
              "Working board for applied spatial research."}
          </p>
        </div>

        <button
          type='button'
          onClick={() => onDelete(board)}
          className={
            "border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] " +
            (isActive
              ? "border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800"
              : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100")
          }
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
          onClick={() => onOpen(board)}
          className={
            "border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition " +
            (isActive
              ? "border-stone-600 bg-stone-900 text-white hover:bg-stone-800"
              : "border-stone-300 bg-white text-stone-900 hover:bg-stone-100")
          }
        >
          {isActive ? "Active board" : "Open board"}
        </button>
      </div>
    </div>
  );
}

export default function ProjectBoardPanel({
  boards = [],
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

  const activeBoardEntries = Array.isArray(activeBoard?.entries)
    ? activeBoard.entries
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
    <section className='border border-stone-300 bg-white p-5'>
      {annotationLabel("Project board mode")}

      <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
        Applied design workspace
      </h2>

      <p className='mt-2 text-sm leading-relaxed text-stone-600'>
        Turn entries, compare pairs, and spatial intent into a project-specific
        working board.
      </p>

      <div className='mt-4 flex flex-wrap gap-2 border-b border-stone-200 pb-4'>
        <button
          type='button'
          onClick={onCreateBoard}
          className='border border-stone-900 bg-stone-950 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-white transition hover:bg-stone-800'
        >
          Create board
        </button>

        <button
          type='button'
          onClick={onAddSelectedEntry}
          disabled={!canAddSelected}
          className='border border-stone-300 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Add selected entry
        </button>

        <button
          type='button'
          onClick={onAddComparePair}
          disabled={!canAddCompare}
          className='border border-stone-300 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Add active compare pair
        </button>

        <button
          type='button'
          onClick={onExportBoardSheet}
          disabled={!activeBoard}
          className='border border-stone-300 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Export board sheet
        </button>
      </div>

      <div className='mt-6 border border-stone-200 bg-stone-50/60 p-4'>
        <div className='mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
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
        <div className='border border-stone-200 bg-white p-4'>
          <div className='flex items-start justify-between gap-3 border-b border-stone-200 pb-4'>
            <div>
              <h3 className='text-base font-semibold text-stone-900'>
                Active board entries
              </h3>
              <p className='mt-1 text-sm text-stone-600'>
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
                <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500'>
                  Active board is empty.
                </div>
              )
            ) : (
              <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500'>
                Open a board to manage its entries.
              </div>
            )}
          </div>

          <div className='mt-5 border-t border-stone-200 pt-4'>
            {annotationLabel("Board notes")}
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              onBlur={handleNotesBlur}
              placeholder='Working notes, spatial intent, program reminders...'
              className='mt-2 min-h-[120px] w-full border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500'
            />
          </div>
        </div>

        <div className='border border-stone-200 bg-white p-4'>
          <div className='flex items-start justify-between gap-3 border-b border-stone-200 pb-4'>
            <div>
              <h3 className='text-base font-semibold text-stone-900'>
                Active compare pairs
              </h3>
              <p className='mt-1 text-sm text-stone-600'>
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
                <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500'>
                  No compare pairs in this board.
                </div>
              )
            ) : (
              <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500'>
                Open a board to inspect its compare pairs.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
