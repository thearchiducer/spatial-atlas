export default function MetricCard({ value, label }) {
  return (
    <div
      className='border px-4 py-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>

      <div
        className='mt-1 text-lg font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}
