function formatDateLabel(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function HistoryCard({ item, tone = "applied" }) {
  const toneClasses =
    tone === "undone"
      ? {
          container: "border-amber-300 bg-amber-50",
          badge: "border-amber-300 bg-white text-amber-900",
        }
      : {
          container: "border-emerald-300 bg-emerald-50",
          badge: "border-emerald-300 bg-white text-emerald-900",
        };

  return (
    <div className={`border p-4 ${toneClasses.container}`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div className='text-sm font-semibold text-stone-900'>
            {item.transformationTitle || "Unnamed transformation"}
          </div>

          <div className='mt-1 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
            Direction {item.boardName || item.boardId || "Unknown"}
          </div>
        </div>

        <div
          className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${toneClasses.badge}`}
        >
          {tone === "undone" ? "Undone" : "Applied"}
        </div>
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2'>
        <div>
          <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
            Time
          </div>
          <div className='mt-1 text-sm text-stone-700'>
            {formatDateLabel(item.createdAt)}
          </div>
        </div>

        <div>
          <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
            Added entries
          </div>
          <div className='mt-1 text-sm text-stone-700'>
            {Array.isArray(item.addedEntryIds) ? item.addedEntryIds.length : 0}
          </div>
        </div>
      </div>

      {Array.isArray(item.addedEntryIds) && item.addedEntryIds.length ? (
        <div className='mt-3'>
          <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
            Applied entries
          </div>

          <div className='mt-2 flex flex-wrap gap-2'>
            {item.addedEntryIds.map((id) => (
              <span
                key={id}
                className='border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700'
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
    <div className='border border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500'>
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
    <section className='space-y-5 rounded-3xl border border-stone-300 bg-white/90 p-5 shadow-sm'>
      <div>
        <div className='inline-flex border border-stone-300 bg-stone-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-700'>
          Transformation history
        </div>

        <h2 className='mt-3 text-2xl font-semibold tracking-tight text-stone-900'>
          Timeline of applied transformations
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Review the sequence of transformations that were applied or undone
          while developing board directions.
        </p>
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <div className='border border-emerald-300 bg-emerald-50 px-4 py-3'>
          <div className='text-[10px] uppercase tracking-[0.12em] text-emerald-900'>
            Applied stack
          </div>
          <div className='mt-1 text-sm font-semibold text-emerald-950'>
            {applied.length}
          </div>
        </div>

        <div className='border border-amber-300 bg-amber-50 px-4 py-3'>
          <div className='text-[10px] uppercase tracking-[0.12em] text-amber-900'>
            Undone stack
          </div>
          <div className='mt-1 text-sm font-semibold text-amber-950'>
            {undone.length}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
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
        <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
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
