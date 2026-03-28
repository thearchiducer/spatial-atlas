export default function SelectFilter({
  label,
  name,
  value,
  options,
  onChange,
}) {
  const fieldId = `filter-${name}`;

  return (
    <label htmlFor={fieldId} className='flex flex-col gap-2'>
      <span
        className='text-xs font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>

      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className='h-11 rounded-xl border px-3 text-sm outline-none transition'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
        }}
      >
        {options.map((option) => (
          <option key={option || "all"} value={option}>
            {option || `All ${label.toLowerCase()}`}
          </option>
        ))}
      </select>
    </label>
  );
}
