export default function Sidebar({ groupedSections }) {
  return (
    <aside className='border border-stone-300 bg-white xl:sticky xl:top-28 xl:h-fit'>
      <div className='border-b border-stone-300 px-5 py-4'>
        <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
          Atlas index
        </div>
        <h2 className='mt-2 text-base font-semibold tracking-tight text-stone-900'>
          System sections
        </h2>
      </div>

      <nav className='flex flex-col'>
        {groupedSections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className='grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-stone-200 px-5 py-3 text-sm text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            <span className='text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500'>
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className='truncate'>{section.title}</span>

            <span className='text-[11px] uppercase tracking-[0.08em] text-stone-500'>
              {section.entries.length}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
