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
      <span className='text-xs font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {label}
      </span>
      <select
        id={fieldId}
        name={name}
        className='h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none'
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
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
