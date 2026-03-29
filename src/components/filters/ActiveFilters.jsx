export default function ActiveFilters({ filters, updateFilter }) {
  const active = Object.entries(filters).filter(
    ([key, value]) => value && key !== "query" && key !== "sortBy",
  );

  if (!active.length) return null;

  return (
    <div className='mt-3 flex flex-wrap gap-2'>
      {active.map(([key, value]) => (
        <button
          key={key}
          type='button'
          onClick={() => updateFilter(key, "")}
          className='flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-muted)";
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>{key}:</span>

          <strong style={{ color: "var(--text-primary)" }}>{value}</strong>

          <span style={{ color: "var(--text-muted)" }}>×</span>
        </button>
      ))}
    </div>
  );
}
