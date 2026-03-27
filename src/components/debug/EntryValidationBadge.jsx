export default function EntryValidationBadge({ issues }) {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col items-end gap-2'>
      <span className='rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900'>
        {issues.length} issue{issues.length === 1 ? "" : "s"}
      </span>

      <div className='max-w-[240px] rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900 shadow-sm'>
        <ul className='list-disc space-y-1 pl-4'>
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
