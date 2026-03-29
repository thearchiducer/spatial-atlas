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
    <header
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div className='grid xl:grid-cols-[1.2fr_.8fr]'>
        <div
          className='border-b p-8 xl:border-b-0 xl:border-r xl:p-10'
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className='grid gap-6 md:grid-cols-[1fr_auto] md:items-start'>
            <div>
              <div
                className='mb-4 text-[11px] font-bold uppercase tracking-[0.22em]'
                style={{ color: "var(--tone-warning-text)" }}
              >
                Architectural Design System
              </div>

              <h1
                className='font-serif text-4xl leading-none tracking-tight md:text-6xl'
                style={{ color: "var(--text-primary)" }}
              >
                Spatial Atlas
              </h1>

              <p
                className='mt-4 max-w-3xl'
                style={{ color: "var(--text-secondary)" }}
              >
                A structured system for organizing spatial types, relationships,
                privacy gradients, circulation logic, and architectural
                direction across scales.
              </p>
            </div>

            <div
              className='min-w-[220px] border p-4'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
              }}
            >
              <div
                className='grid gap-3 text-sm'
                style={{ color: "var(--text-secondary)" }}
              >
                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Project Code
                  </div>
                  <div
                    className='mt-1 font-medium'
                    style={{ color: "var(--text-primary)" }}
                  >
                    SA-01
                  </div>
                </div>

                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Version
                  </div>
                  <div
                    className='mt-1 font-medium'
                    style={{ color: "var(--text-primary)" }}
                  >
                    v1.0
                  </div>
                </div>

                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Type
                  </div>
                  <div
                    className='mt-1 font-medium'
                    style={{ color: "var(--text-primary)" }}
                  >
                    Spatial Intelligence
                  </div>
                </div>

                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Issued
                  </div>
                  <div
                    className='mt-1 font-medium'
                    style={{ color: "var(--text-primary)" }}
                  >
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

        <aside
          className='p-8 xl:p-10'
          style={{ background: "var(--bg-muted)" }}
        >
          <div
            className='border-b pb-4'
            style={{ borderColor: "var(--border-color)" }}
          >
            <h2
              className='text-sm font-semibold uppercase tracking-[0.18em]'
              style={{ color: "var(--text-secondary)" }}
            >
              System Logic
            </h2>
          </div>

          <div
            className='mt-5 space-y-4 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            <div>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: "var(--text-muted)" }}
              >
                Method
              </div>
              <p className='mt-1'>
                Intent → Classification → Strategy → Spatial Configuration
              </p>
            </div>

            <div>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: "var(--text-muted)" }}
              >
                Reading
              </div>
              <p className='mt-1'>
                Spatial decisions are structured through privacy, circulation,
                adjacency, and social organization rather than isolated room
                placement.
              </p>
            </div>

            <div>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: "var(--text-muted)" }}
              >
                Use
              </div>
              <p className='mt-1'>
                The system supports comparison, iteration, and direction-setting
                before formal plan resolution.
              </p>
            </div>

            <div>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: "var(--text-muted)" }}
              >
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
