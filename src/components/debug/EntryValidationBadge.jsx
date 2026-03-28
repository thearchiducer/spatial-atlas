export default function EntryValidationBadge({ issues }) {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-col items-end gap-2'>
      <span
        className='rounded-full border px-3 py-1 text-xs font-medium'
        style={{
          borderColor: "rgba(251,191,36,0.30)",
          background: "rgba(251,191,36,0.10)",
          color: "#fde68a",
        }}
      >
        {issues.length} issue{issues.length === 1 ? "" : "s"}
      </span>

      <div
        className='max-w-[240px] rounded-2xl border p-3 text-left text-xs shadow-sm'
        style={{
          borderColor: "rgba(251,191,36,0.25)",
          background: "rgba(251,191,36,0.08)",
          color: "#fef3c7",
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
