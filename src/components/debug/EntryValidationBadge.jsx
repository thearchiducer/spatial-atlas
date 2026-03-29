export default function EntryValidationBadge({ issues }) {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col items-end gap-2'>
      <span
        className='rounded-full border px-3 py-1 text-xs font-medium'
        style={{
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
        }}
      >
        {issues.length} issue{issues.length === 1 ? "" : "s"}
      </span>

      <div
        className='max-w-[240px] rounded-2xl border p-3 text-left text-xs shadow-sm'
        style={{
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--text-primary)",
        }}
      >
        <ul className='list-disc space-y-1 pl-4'>
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
