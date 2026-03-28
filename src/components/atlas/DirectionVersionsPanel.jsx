import { useMemo, useState } from "react";
import { compareDirectionVersionSnapshots } from "../../lib/directionVersions";

function toneClasses(tone) {
  if (tone === "positive") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#a7f3d0]";
  }

  if (tone === "negative") {
    return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]";
  }

  if (tone === "tradeoff") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]";
  }

  return "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]";
}

function strengthClasses(strength) {
  if (strength === "Clear") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#a7f3d0]";
  }

  if (strength === "Developing") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]";
  }

  return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]";
}

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

function EmptyState({ text }) {
  return (
    <div
      className='border border-dashed p-4 text-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
        color: "var(--text-muted)",
      }}
    >
      {text}
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div
      className='border p-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      {annotationLabel(label)}
      <div
        className='mt-1 text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function SnapshotCard({ snapshot, isActiveBoardVersion, onRestore, onDelete }) {
  const identity = snapshot?.packet?.identity;
  const summary = snapshot?.packet?.summary;

  return (
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Saved direction")}
          <div
            className='mt-2 text-base font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {snapshot.label}
          </div>
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {snapshot.savedAtLabel}
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {isActiveBoardVersion ? (
            <span
              className='border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'
              style={{
                borderColor: "rgba(56,189,248,0.35)",
                background: "rgba(56,189,248,0.10)",
                color: "#bae6fd",
              }}
            >
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

      <div
        className='mt-4 border p-3'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {annotationLabel("Verdict")}
        <div
          className='mt-2 text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {identity?.title || "No identity"}
        </div>
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
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
        <span
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Entries · {snapshot.packet?.entries?.length || 0}
        </span>
        <span
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Gaps · {snapshot.packet?.gapSignals?.length || 0}
        </span>
        <span
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Tensions · {snapshot.packet?.tensions?.length || 0}
        </span>
        <span
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Next moves · {snapshot.packet?.nextMoves?.length || 0}
        </span>
      </div>

      <div
        className='mt-4 flex flex-wrap gap-2 border-t pt-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={() => onRestore(snapshot.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }}
        >
          Restore to board
        </button>

        <button
          type='button'
          onClick={() => onDelete(snapshot.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(248,113,113,0.35)",
            background: "rgba(248,113,113,0.10)",
            color: "#fecaca",
          }}
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
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
        }}
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
    <div
      className='border p-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div className='flex items-center justify-between gap-3'>
        {annotationLabel(label)}

        <span
          className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
            changed
              ? "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]"
              : "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
          }`}
        >
          {changed ? "Changed" : "Stable"}
        </span>
      </div>

      <div className='mt-3 grid gap-2 md:grid-cols-2'>
        <div
          className='border px-3 py-2 text-sm'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          {leftValue || "—"}
        </div>
        <div
          className='border px-3 py-2 text-sm font-semibold'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-primary)",
          }}
        >
          {rightValue || "—"}
        </div>
      </div>
    </div>
  );
}

function DiffList({ title, items, emptyText, tone }) {
  return (
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </div>

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
        <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </p>
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
    <div
      className='mt-6 border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        {annotationLabel("Compare snapshot")}
        <h3
          className='mt-2 text-lg font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Version comparison
        </h3>
      </div>

      <div className='mt-4 grid gap-4 xl:grid-cols-2'>
        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          {annotationLabel("Left snapshot")}
          <div
            className='mt-2 text-base font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {comparison.left.label}
          </div>
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {leftIdentity?.sentence || "No identity sentence available."}
          </p>
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          {annotationLabel("Right snapshot")}
          <div
            className='mt-2 text-base font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {comparison.right.label}
          </div>
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {rightIdentity?.sentence || "No identity sentence available."}
          </p>
        </div>
      </div>

      <div
        className='mt-4 border p-3'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {annotationLabel("What changed")}
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
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
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Direction versioning")}
          <h2
            className='mt-2 text-xl font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            Direction versions + compare snapshot
          </h2>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Save snapshots of the current board direction, then compare how the
            verdict, tensions, gaps, entries, and next moves shift over time.
          </p>
        </div>

        <div className='flex flex-col items-start'>
          <button
            type='button'
            onClick={onSaveSnapshot}
            disabled={!activeBoard}
            className='border px-4 py-2 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-40'
            style={{
              borderColor: "rgba(16,185,129,0.35)",
              background: "rgba(16,185,129,0.10)",
              color: "#a7f3d0",
            }}
          >
            Save direction version
          </button>

          <p className='mt-2 text-xs' style={{ color: "var(--text-muted)" }}>
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
            <div
              className='mt-5 border p-4 text-sm'
              style={{
                borderColor: "rgba(251,191,36,0.30)",
                background: "rgba(251,191,36,0.08)",
                color: "#fde68a",
              }}
            >
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
