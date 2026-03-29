import { getSafeEntryIds } from "../../lib/boardUtils";

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

function SmallCard({ label, value, tone = "stone" }) {
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

function EntryCountDelta({ beforeCount, afterCount }) {
  const delta = (afterCount || 0) - (beforeCount || 0);

  const toneStyles =
    delta > 0
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
        }
      : delta < 0
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
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
        Entry delta
      </div>
      <div className='mt-1 text-sm font-semibold'>
        {beforeCount} → {afterCount}
      </div>
      <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-75'>
        Δ {delta}
      </div>
    </div>
  );
}

function BoardCard({ title, board, tone = "stone" }) {
  if (!board) {
    return (
      <div
        className='border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
        }}
      >
        <div className='text-sm' style={{ color: "var(--text-muted)" }}>
          No board available.
        </div>
      </div>
    );
  }

  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
        }
      : tone === "sky"
        ? {
            borderColor: "var(--tone-info-border)",
            background: "var(--tone-info-bg)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          };

  return (
    <div
      className='border p-4'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
      }}
    >
      {annotationLabel(title)}
      <div
        className='mt-2 text-lg font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {board?.name || "Untitled board"}
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2'>
        <SmallCard
          label='Entries'
          value={getSafeEntryIds(board).length}
          tone={
            tone === "emerald" ? "emerald" : tone === "sky" ? "sky" : "stone"
          }
        />
        <SmallCard
          label='Mode'
          value={board.boardCreationMode || "standard"}
          tone='stone'
        />
      </div>

      {board.derivedFromTransformationTitle ? (
        <div
          className='mt-3 border px-3 py-2 text-sm'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          Derived from transformation:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {board.derivedFromTransformationTitle}
          </strong>
        </div>
      ) : null}
    </div>
  );
}

function findRootBoard(board, boardsById) {
  let current = board;
  const visited = new Set();

  while (current?.derivedFromBoardId && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = boardsById.get(current.derivedFromBoardId);
    if (!parent) break;
    current = parent;
  }

  return current || board;
}

export default function BoardEvolutionPanel({
  projectBoards = [],
  activeProjectBoardId = null,
}) {
  const boards = Array.isArray(projectBoards) ? projectBoards : [];
  const activeBoard =
    boards.find((board) => board.id === activeProjectBoardId) || null;

  if (!activeBoard) {
    return (
      <section
        className='space-y-5 rounded-3xl border p-5 shadow-sm'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-subtle)",
        }}
      >
        <div>
          <div
            className='inline-flex border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }}
          >
            Board evolution
          </div>
          <h2
            className='mt-3 text-2xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Evolution view
          </h2>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Select an active board to inspect its evolution lineage.
          </p>
        </div>
      </section>
    );
  }

  const boardsById = new Map(boards.map((board) => [board.id, board]));
  const sourceBoard = activeBoard.derivedFromBoardId
    ? boardsById.get(activeBoard.derivedFromBoardId) || null
    : null;
  const rootBoard = findRootBoard(activeBoard, boardsById);

  const rootCount = Array.isArray(rootBoard?.entryIds)
    ? rootBoard.entryIds.length
    : 0;
  const sourceCount = Array.isArray(sourceBoard?.entryIds)
    ? sourceBoard.entryIds.length
    : 0;
  const activeCount = Array.isArray(activeBoard?.entryIds)
    ? activeBoard.entryIds.length
    : 0;

  return (
    <section
      className='space-y-5 rounded-3xl border p-5 shadow-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div>
        <div
          className='inline-flex border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          Board evolution
        </div>

        <h2
          className='mt-3 text-2xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Evolution lineage
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Inspect the active board as part of an evolution chain from root board
          to source board to current state.
        </p>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <SmallCard label='Root board' value={rootBoard?.name || "None"} />
        <SmallCard
          label='Source board'
          value={sourceBoard?.name || "None"}
          tone='sky'
        />
        <SmallCard
          label='Current board'
          value={activeBoard?.name || "None"}
          tone='emerald'
        />
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <EntryCountDelta beforeCount={rootCount} afterCount={activeCount} />
        <EntryCountDelta beforeCount={sourceCount} afterCount={activeCount} />
        <SmallCard
          label='Lineage mode'
          value={activeBoard.boardCreationMode || "standard"}
          tone='stone'
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        <BoardCard title='Root board' board={rootBoard} />
        <BoardCard title='Source board' board={sourceBoard} tone='sky' />
        <BoardCard title='Current board' board={activeBoard} tone='emerald' />
      </div>
    </section>
  );
}
