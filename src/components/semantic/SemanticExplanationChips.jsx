function getTone(points) {
  if (points >= 7) {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (points >= 4) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-stone-200 bg-stone-50 text-stone-700";
}

function ExplanationChip({ item, compact = false }) {
  return (
    <div
      className={`inline-flex min-h-[32px] items-center border ${getTone(
        item.points,
      )}`}
    >
      <span className='border-r border-current/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]'>
        {item.label}
      </span>

      <span className='px-2.5 py-1 text-[11px] font-semibold'>
        {compact ? `+${item.points}` : `+${item.points}`}
      </span>
    </div>
  );
}

export default function SemanticExplanationChips({
  breakdown = [],
  compact = false,
  limit = null,
}) {
  if (!Array.isArray(breakdown) || breakdown.length === 0) {
    return null;
  }

  const items = limit ? breakdown.slice(0, limit) : breakdown;

  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <ExplanationChip
          key={`${item.label}-${item.points}`}
          item={item}
          compact={compact}
        />
      ))}
    </div>
  );
}
