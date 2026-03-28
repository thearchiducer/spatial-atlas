export default function Sidebar({ groupedSections }) {
  return (
    <aside
      className='border xl:sticky xl:top-28 xl:h-fit'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b px-5 py-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--text-muted)" }}
        >
          Atlas index
        </div>

        <h2
          className='mt-2 text-base font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          System sections
        </h2>
      </div>

      <nav className='flex flex-col'>
        {groupedSections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className='grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-3 text-sm transition'
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              color: "var(--text-secondary)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span
              className='text-[10px] font-semibold uppercase tracking-[0.14em]'
              style={{ color: "var(--text-muted)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className='truncate'>{section.title}</span>

            <span
              className='text-[11px] uppercase tracking-[0.08em]'
              style={{ color: "var(--text-muted)" }}
            >
              {section.entries.length}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
