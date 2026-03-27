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
          className='flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1 text-sm transition hover:bg-stone-100'
        >
          <span className='text-stone-600'>{key}:</span>
          <strong className='text-stone-900'>{value}</strong>
          <span className='text-stone-500'>×</span>
        </button>
      ))}
    </div>
  );
}
