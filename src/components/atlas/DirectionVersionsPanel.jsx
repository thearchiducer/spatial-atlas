import { useMemo, useState } from "react";
import { compareDirectionVersionSnapshots } from "../../lib/directionVersions";

function toneClasses(tone) {
  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (tone === "negative") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (tone === "tradeoff") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-stone-200 bg-stone-50 text-stone-700";
}

function strengthClasses(strength) {
  if (strength === "Clear") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (strength === "Developing") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className='border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500'>
      {text}
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className='border border-stone-200 bg-white p-3'>
      {annotationLabel(label)}
      <div className='mt-1 text-sm font-semibold text-stone-900'>
        {value || "—"}
      </div>
    </div>
  );
}

function SnapshotCard({ snapshot, isActiveBoardVersion, onRestore, onDelete }) {
  const identity = snapshot?.packet?.identity;
  const summary = snapshot?.packet?.summary;

  return (
    <div className='border border-stone-300 bg-white p-4'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Saved direction")}
          <div className='mt-2 text-base font-semibold text-stone-900'>
            {snapshot.label}
          </div>
          <p className='mt-2 text-sm text-stone-600'>{snapshot.savedAtLabel}</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {isActiveBoardVersion ? (
            <span className='border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-800'>
              Active board lineage
            </span>
          ) : null}

          <span
            className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${strengthClasses(
              identity?.strength,
            )}`}
          >
            {identity?.strength || "Unknown"}
          </span>
        </div>
      </div>

      <div className='mt-4 border border-stone-200 bg-stone-50/60 p-3'>
        {annotationLabel("Verdict")}
        <div className='mt-2 text-sm font-semibold text-stone-900'>
          {identity?.title || "No identity"}
        </div>
        <p className='mt-2 text-sm text-stone-700'>
          {identity?.sentence || "No identity sentence available."}
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <StatCell label='Privacy' value={summary?.privacyModel} />
        <StatCell label='Social' value={summary?.socialModel} />
        <StatCell label='Circulation' value={summary?.circulationModel} />
        <StatCell label='Service' value={summary?.serviceStrategy} />
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        <span className='border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
          Entries · {snapshot.packet?.entries?.length || 0}
        </span>
        <span className='border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
          Gaps · {snapshot.packet?.gapSignals?.length || 0}
        </span>
        <span className='border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
          Tensions · {snapshot.packet?.tensions?.length || 0}
        </span>
        <span className='border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
          Next moves · {snapshot.packet?.nextMoves?.length || 0}
        </span>
      </div>

      <div className='mt-4 flex flex-wrap gap-2 border-t border-stone-200 pt-4'>
        <button
          type='button'
          onClick={() => onRestore(snapshot.id)}
          className='border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-emerald-700 transition hover:bg-emerald-100'
        >
          Restore to board
        </button>

        <button
          type='button'
          onClick={() => onDelete(snapshot.id)}
          className='border border-red-200 bg-red-50 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-100'
        >
          Delete snapshot
        </button>
      </div>
    </div>
  );
}

function SnapshotPicker({ label, value, snapshots, onChange }) {
  return (
    <label className='flex flex-col gap-2'>
      <span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className='border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-stone-500'
      >
        {snapshots.map((snapshot) => (
          <option key={snapshot.id} value={snapshot.id}>
            {snapshot.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareMetric({ label, leftValue, rightValue, changed }) {
  return (
    <div className='border border-stone-200 bg-white p-3'>
      <div className='flex items-center justify-between gap-3'>
        {annotationLabel(label)}

        <span
          className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
            changed
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-stone-200 bg-stone-50 text-stone-600"
          }`}
        >
          {changed ? "Changed" : "Stable"}
        </span>
      </div>

      <div className='mt-3 grid gap-2 md:grid-cols-2'>
        <div className='border border-stone-200 bg-stone-50/70 px-3 py-2 text-sm text-stone-700'>
          {leftValue || "—"}
        </div>
        <div className='border border-stone-200 bg-stone-50/70 px-3 py-2 text-sm font-semibold text-stone-900'>
          {rightValue || "—"}
        </div>
      </div>
    </div>
  );
}

function DiffList({ title, items, emptyText, tone }) {
  return (
    <div className='border border-stone-200 bg-white p-4'>
      <div className='text-sm font-semibold text-stone-900'>{title}</div>

      {items.length ? (
        <div className='mt-3 flex flex-wrap gap-2'>
          {items.map((item) => (
            <span
              key={title + "-" + (item.id || item.title || item.term)}
              className={`border px-3 py-1 text-[11px] uppercase tracking-[0.08em] ${toneClasses(
                tone,
              )}`}
            >
              {item.term || item.title}
            </span>
          ))}
        </div>
      ) : (
        <p className='mt-2 text-sm text-stone-500'>{emptyText}</p>
      )}
    </div>
  );
}

function SnapshotComparePanel({ comparison }) {
  if (!comparison) return null;

  const leftIdentity = comparison.left?.packet?.identity;
  const rightIdentity = comparison.right?.packet?.identity;
  const leftSummary = comparison.left?.packet?.summary;
  const rightSummary = comparison.right?.packet?.summary;

  return (
    <div className='mt-6 border border-stone-300 bg-white p-5'>
      <div className='border-b border-stone-200 pb-4'>
        {annotationLabel("Compare snapshot")}
        <h3 className='mt-2 text-lg font-semibold text-stone-900'>
          Version comparison
        </h3>
      </div>

      <div className='mt-4 grid gap-4 xl:grid-cols-2'>
        <div className='border border-stone-200 bg-white p-4'>
          {annotationLabel("Left snapshot")}
          <div className='mt-2 text-base font-semibold text-stone-900'>
            {comparison.left.label}
          </div>
          <p className='mt-2 text-sm text-stone-700'>
            {leftIdentity?.sentence || "No identity sentence available."}
          </p>
        </div>

        <div className='border border-stone-200 bg-white p-4'>
          {annotationLabel("Right snapshot")}
          <div className='mt-2 text-base font-semibold text-stone-900'>
            {comparison.right.label}
          </div>
          <p className='mt-2 text-sm text-stone-700'>
            {rightIdentity?.sentence || "No identity sentence available."}
          </p>
        </div>
      </div>

      <div className='mt-4 border border-stone-200 bg-stone-50/60 p-3'>
        {annotationLabel("What changed")}
        <p className='mt-2 text-sm text-stone-700'>
          This comparison highlights how the design direction shifted between
          two states of the board.
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
        <CompareMetric
          label='Identity'
          leftValue={leftIdentity?.title}
          rightValue={rightIdentity?.title}
          changed={comparison.summary.identityChanged}
        />
        <CompareMetric
          label='Strength'
          leftValue={leftIdentity?.strength}
          rightValue={rightIdentity?.strength}
          changed={comparison.summary.strengthChanged}
        />
        <CompareMetric
          label='Privacy'
          leftValue={leftSummary?.privacyModel}
          rightValue={rightSummary?.privacyModel}
          changed={comparison.summary.privacyChanged}
        />
        <CompareMetric
          label='Social'
          leftValue={leftSummary?.socialModel}
          rightValue={rightSummary?.socialModel}
          changed={comparison.summary.socialChanged}
        />
        <CompareMetric
          label='Circulation'
          leftValue={leftSummary?.circulationModel}
          rightValue={rightSummary?.circulationModel}
          changed={comparison.summary.circulationChanged}
        />
      </div>

      <div className='mt-4 grid gap-4 xl:grid-cols-2'>
        <DiffList
          title='Entries only in left snapshot'
          items={comparison.entryDiff.onlyInLeft}
          emptyText='No unique entries on the left side.'
          tone='tradeoff'
        />
        <DiffList
          title='Entries only in right snapshot'
          items={comparison.entryDiff.onlyInRight}
          emptyText='No unique entries on the right side.'
          tone='positive'
        />
        <DiffList
          title='Gaps only in left snapshot'
          items={comparison.gapDiff.onlyInLeft}
          emptyText='No unique gap signals on the left side.'
          tone='negative'
        />
        <DiffList
          title='Gaps only in right snapshot'
          items={comparison.gapDiff.onlyInRight}
          emptyText='No unique gap signals on the right side.'
          tone='tradeoff'
        />
        <DiffList
          title='Tensions only in left snapshot'
          items={comparison.tensionDiff.onlyInLeft}
          emptyText='No unique tensions on the left side.'
          tone='negative'
        />
        <DiffList
          title='Tensions only in right snapshot'
          items={comparison.tensionDiff.onlyInRight}
          emptyText='No unique tensions on the right side.'
          tone='tradeoff'
        />
        <DiffList
          title='Moves only in left snapshot'
          items={comparison.moveDiff.onlyInLeft}
          emptyText='No unique next moves on the left side.'
          tone='tradeoff'
        />
        <DiffList
          title='Moves only in right snapshot'
          items={comparison.moveDiff.onlyInRight}
          emptyText='No unique next moves on the right side.'
          tone='positive'
        />
      </div>
    </div>
  );
}

export default function DirectionVersionsPanel({
  activeBoard = null,
  snapshots = [],
  onSaveSnapshot,
  onDeleteSnapshot,
  onRestoreSnapshot,
}) {
  const safeSnapshots = useMemo(() => {
    return Array.isArray(snapshots) ? snapshots : [];
  }, [snapshots]);

  const boardSnapshots = useMemo(() => {
    if (!activeBoard) return safeSnapshots;
    return safeSnapshots.filter(
      (snapshot) => snapshot.boardId === activeBoard.id,
    );
  }, [safeSnapshots, activeBoard]);

  const [leftSnapshotId, setLeftSnapshotId] = useState("");
  const [rightSnapshotId, setRightSnapshotId] = useState("");

  const effectiveSnapshots = boardSnapshots.length
    ? boardSnapshots
    : safeSnapshots;

  const leftSnapshot = useMemo(() => {
    return (
      effectiveSnapshots.find((snapshot) => snapshot.id === leftSnapshotId) ||
      effectiveSnapshots[0] ||
      null
    );
  }, [effectiveSnapshots, leftSnapshotId]);

  const rightSnapshot = useMemo(() => {
    return (
      effectiveSnapshots.find((snapshot) => snapshot.id === rightSnapshotId) ||
      effectiveSnapshots[1] ||
      effectiveSnapshots[0] ||
      null
    );
  }, [effectiveSnapshots, rightSnapshotId]);

  const comparison = useMemo(() => {
    if (
      !leftSnapshot ||
      !rightSnapshot ||
      leftSnapshot.id === rightSnapshot.id
    ) {
      return null;
    }

    return compareDirectionVersionSnapshots(leftSnapshot, rightSnapshot);
  }, [leftSnapshot, rightSnapshot]);

  return (
    <section className='border border-stone-300 bg-white p-5'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Direction versioning")}
          <h2 className='mt-2 text-xl font-semibold text-stone-900'>
            Direction versions + compare snapshot
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            Save snapshots of the current board direction, then compare how the
            verdict, tensions, gaps, entries, and next moves shift over time.
          </p>
        </div>

        <div className='flex flex-col items-start'>
          <button
            type='button'
            onClick={onSaveSnapshot}
            disabled={!activeBoard}
            className='border border-stone-900 bg-stone-900 px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500'
          >
            Save direction version
          </button>

          <p className='mt-2 text-xs text-stone-500'>
            Creates a snapshot you can compare later.
          </p>
        </div>
      </div>

      <div className='mt-5 grid gap-4 xl:grid-cols-2'>
        {effectiveSnapshots.length ? (
          effectiveSnapshots.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              isActiveBoardVersion={snapshot.boardId === activeBoard?.id}
              onRestore={onRestoreSnapshot}
              onDelete={onDeleteSnapshot}
            />
          ))
        ) : (
          <EmptyState text='No direction snapshots saved yet.' />
        )}
      </div>

      {effectiveSnapshots.length >= 2 ? (
        <>
          <div className='mt-6 grid gap-3 md:grid-cols-2'>
            <SnapshotPicker
              label='Left snapshot'
              value={leftSnapshot?.id || ""}
              snapshots={effectiveSnapshots}
              onChange={setLeftSnapshotId}
            />

            <SnapshotPicker
              label='Right snapshot'
              value={rightSnapshot?.id || ""}
              snapshots={effectiveSnapshots}
              onChange={setRightSnapshotId}
            />
          </div>

          {leftSnapshot?.id === rightSnapshot?.id ? (
            <div className='mt-5 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
              Pick two different snapshots to compare them meaningfully.
            </div>
          ) : (
            <SnapshotComparePanel comparison={comparison} />
          )}
        </>
      ) : null}
    </section>
  );
}
