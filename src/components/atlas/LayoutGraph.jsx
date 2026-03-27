function nodeTone(zone) {
  if (zone === "public") {
    return "border-sky-300 bg-sky-50 text-sky-950";
  }

  if (zone === "transition") {
    return "border-amber-300 bg-amber-50 text-amber-950";
  }

  if (zone === "private") {
    return "border-emerald-300 bg-emerald-50 text-emerald-950";
  }

  if (zone === "service") {
    return "border-violet-300 bg-violet-50 text-violet-950";
  }

  return "border-stone-300 bg-white text-stone-900";
}

function edgeTone(type) {
  if (type === "hub") {
    return "bg-violet-300";
  }

  if (type === "secondary") {
    return "bg-amber-300";
  }

  return "bg-stone-400";
}

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function ZoneLegend() {
  return (
    <div className='flex flex-wrap gap-2'>
      <span className='border border-sky-300 bg-sky-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-sky-950'>
        Public
      </span>
      <span className='border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-amber-950'>
        Transition
      </span>
      <span className='border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-emerald-950'>
        Private
      </span>
      <span className='border border-violet-300 bg-violet-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-violet-950'>
        Service
      </span>
    </div>
  );
}

export default function LayoutGraph({ layout }) {
  if (!layout || !layout.diagramNodes || !layout.diagramNodes.length) {
    return null;
  }

  const nodes = layout.diagramNodes;
  const edges = Array.isArray(layout.edges) ? layout.edges : [];

  return (
    <section className='border border-stone-300 bg-white p-5'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Diagram")}
          <h3 className='mt-2 text-lg font-semibold tracking-tight text-stone-900'>
            Spatial diagram
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            Conceptual spatial organization derived from board semantics.
          </p>
        </div>

        <ZoneLegend />
      </div>

      <div className='mt-5 overflow-x-auto'>
        <div className='flex min-w-max items-center gap-3'>
          {nodes.map((node, index) => {
            return (
              <div key={node.id} className='flex items-center gap-3'>
                <div
                  className={
                    "min-w-[132px] border px-3 py-3 " + nodeTone(node.zone)
                  }
                >
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70'>
                    {node.zone}
                  </div>

                  <div className='mt-2 text-sm font-semibold'>{node.term}</div>

                  <div className='mt-2 text-[11px] uppercase tracking-[0.08em] opacity-75'>
                    {node.type} · {node.privacyLevel || "—"}
                  </div>
                </div>

                {index < nodes.length - 1 ? (
                  <div className='flex items-center gap-2'>
                    <div className='text-[11px] text-stone-500'>→</div>
                    <div
                      className={
                        "h-[2px] w-10 " +
                        edgeTone(edges[index] ? edges[index].type : "primary")
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {layout.pattern ? (
        <div className='mt-5 border border-stone-200 bg-stone-50/60 p-4'>
          {annotationLabel("Pattern")}
          <div className='mt-2 text-sm text-stone-700'>
            <strong className='text-stone-900'>{layout.pattern.type}</strong> —{" "}
            {layout.pattern.description}
          </div>
        </div>
      ) : null}
    </section>
  );
}
