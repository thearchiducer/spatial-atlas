import MetricCard from "./MetricCard";

function formatDateLabel() {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function HeroHeader({ metrics }) {
  const issuedOn = formatDateLabel();

  return (
    <header className='border border-stone-300 bg-white'>
      <div className='grid xl:grid-cols-[1.2fr_.8fr]'>
        <div className='border-b border-stone-300 p-8 xl:border-b-0 xl:border-r xl:p-10'>
          <div className='grid gap-6 md:grid-cols-[1fr_auto] md:items-start'>
            <div>
              <div className='mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-800'>
                Architectural Design System
              </div>

              <h1 className='font-serif text-4xl leading-none tracking-tight text-stone-900 md:text-6xl'>
                Spatial Atlas
              </h1>

              <p className='mt-4 max-w-3xl text-stone-600'>
                A structured system for organizing spatial types, relationships,
                privacy gradients, circulation logic, and architectural
                direction across scales.
              </p>
            </div>

            <div className='min-w-[220px] border border-stone-300 bg-stone-50/40 p-4'>
              <div className='grid gap-3 text-sm text-stone-700'>
                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
                    Project Code
                  </div>
                  <div className='mt-1 font-medium text-stone-900'>SA-01</div>
                </div>

                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
                    Version
                  </div>
                  <div className='mt-1 font-medium text-stone-900'>v1.0</div>
                </div>

                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
                    Type
                  </div>
                  <div className='mt-1 font-medium text-stone-900'>
                    Spatial Intelligence
                  </div>
                </div>

                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
                    Issued
                  </div>
                  <div className='mt-1 font-medium text-stone-900'>
                    {issuedOn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-8 grid gap-2 md:grid-cols-4'>
            <MetricCard value={metrics.visibleEntries} label='Spatial Types' />
            <MetricCard
              value={metrics.visibleSections}
              label='Taxonomy Layers'
            />
            <MetricCard value={metrics.controlledTypes} label='Logic Systems' />
            <MetricCard value={metrics.scaleBands} label='Scale Domains' />
          </div>
        </div>

        <aside className='bg-stone-50/50 p-8 xl:p-10'>
          <div className='border-b border-stone-300 pb-4'>
            <h2 className='text-sm font-semibold uppercase tracking-[0.18em] text-stone-700'>
              System Logic
            </h2>
          </div>

          <div className='mt-5 space-y-4 text-sm text-stone-600'>
            <div>
              <div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500'>
                Method
              </div>
              <p className='mt-1'>
                Intent → Classification → Strategy → Spatial Configuration
              </p>
            </div>

            <div>
              <div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500'>
                Reading
              </div>
              <p className='mt-1'>
                Spatial decisions are structured through privacy, circulation,
                adjacency, and social organization rather than isolated room
                placement.
              </p>
            </div>

            <div>
              <div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500'>
                Use
              </div>
              <p className='mt-1'>
                The system supports comparison, iteration, and direction-setting
                before formal plan resolution.
              </p>
            </div>

            <div>
              <div className='text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500'>
                Position
              </div>
              <p className='mt-1'>
                Architecture is treated as a logical spatial system, not a loose
                sequence of stylistic moves.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
