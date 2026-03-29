function formatDateLabel(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function HistoryCard({ item, tone = "applied" }) {
  const toneStyles =
    tone === "undone"
      ? {
          containerBorder: "var(--tone-warning-border)",
          containerBg: "var(--tone-warning-bg)",
          badgeBorder: "var(--tone-warning-border)",
          badgeBg: "var(--tone-warning-bg)",
          badgeText: "var(--tone-warning-text)",
        }
      : {
          containerBorder: "var(--tone-success-border)",
          containerBg: "var(--tone-success-bg)",
          badgeBorder: "var(--tone-success-border)",
          badgeBg: "var(--tone-success-bg)",
          badgeText: "var(--tone-success-text)",
        };

  return (
    <div
      className='border p-4'
      style={{
        borderColor: toneStyles.containerBorder,
        background: toneStyles.containerBg,
      }}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div
            className='text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {item.transformationTitle || "Unnamed transformation"}
          </div>

          <div
            className='mt-1 text-[11px] uppercase tracking-[0.08em]'
            style={{ color: "var(--text-muted)" }}
          >
            Direction {item.boardName || item.boardId || "Unknown"}
          </div>
        </div>

        <div
          className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
          style={{
            borderColor: toneStyles.badgeBorder,
            background: toneStyles.badgeBg,
            color: toneStyles.badgeText,
          }}
        >
          {tone === "undone" ? "Undone" : "Applied"}
        </div>
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2'>
        <div>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{ color: "var(--text-muted)" }}
          >
            Time
          </div>
          <div
            className='mt-1 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {formatDateLabel(item.createdAt)}
          </div>
        </div>

        <div>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{ color: "var(--text-muted)" }}
          >
            Added entries
          </div>
          <div
            className='mt-1 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {Array.isArray(item.addedEntryIds) ? item.addedEntryIds.length : 0}
          </div>
        </div>
      </div>

      {Array.isArray(item.addedEntryIds) && item.addedEntryIds.length ? (
        <div className='mt-3'>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{ color: "var(--text-muted)" }}
          >
            Applied entries
          </div>

          <div className='mt-2 flex flex-wrap gap-2'>
            {item.addedEntryIds.map((id) => (
              <span
                key={id}
                className='border px-2 py-1 text-[11px]'
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      className='border px-4 py-6 text-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
      }}
    >
      {text}
    </div>
  );
}

export default function TransformationHistoryPanel({
  appliedTransformationHistory = [],
  undoneTransformationHistory = [],
}) {
  const applied = Array.isArray(appliedTransformationHistory)
    ? appliedTransformationHistory
    : [];
  const undone = Array.isArray(undoneTransformationHistory)
    ? undoneTransformationHistory
    : [];

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
          Transformation history
        </div>

        <h2
          className='mt-3 text-2xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Timeline of applied transformations
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Review the sequence of transformations that were applied or undone
          while developing board directions.
        </p>
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <div
          className='border px-4 py-3'
          style={{
            borderColor: "var(--tone-success-border)",
            background: "var(--tone-success-bg)",
          }}
        >
          <div
            className='text-[10px] uppercase tracking-[0.12em]'
            style={{ color: "var(--tone-success-text)" }}
          >
            Applied stack
          </div>
          <div
            className='mt-1 text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {applied.length}
          </div>
        </div>

        <div
          className='border px-4 py-3'
          style={{
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
          }}
        >
          <div
            className='text-[10px] uppercase tracking-[0.12em]'
            style={{ color: "var(--tone-warning-text)" }}
          >
            Undone stack
          </div>
          <div
            className='mt-1 text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {undone.length}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div
          className='text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Applied transformations
        </div>

        {applied.length ? (
          <div className='space-y-3'>
            {applied.map((item) => (
              <HistoryCard key={item.id} item={item} tone='applied' />
            ))}
          </div>
        ) : (
          <EmptyState text='No applied transformations recorded yet.' />
        )}
      </div>

      <div className='space-y-4'>
        <div
          className='text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Undone transformations
        </div>

        {undone.length ? (
          <div className='space-y-3'>
            {undone.map((item) => (
              <HistoryCard key={item.id} item={item} tone='undone' />
            ))}
          </div>
        ) : (
          <EmptyState text='No undone transformations recorded yet.' />
        )}
      </div>
    </section>
  );
}
