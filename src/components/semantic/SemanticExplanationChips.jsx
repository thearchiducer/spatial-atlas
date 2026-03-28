function getToneStyle(points) {
  if (points >= 7) {
    return {
      borderColor: "rgba(16,185,129,0.35)",
      background: "rgba(16,185,129,0.10)",
      color: "#a7f3d0",
    };
  }

  if (points >= 4) {
    return {
      borderColor: "rgba(251,191,36,0.30)",
      background: "rgba(251,191,36,0.10)",
      color: "#fde68a",
    };
  }

  return {
    borderColor: "var(--border-color)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
  };
}

function ExplanationChip({ item, compact = false }) {
  const toneStyle = getToneStyle(item.points);

  return (
    <div
      className='inline-flex min-h-[32px] items-center border'
      style={toneStyle}
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

  const items =
    typeof limit === "number" ? breakdown.slice(0, limit) : breakdown;

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
