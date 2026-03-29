function nodeTone(zone) {
  if (zone === "public") {
    return {
      borderColor: "var(--zone-public-border)",
      background: "var(--zone-public-bg)",
      color: "var(--zone-public-text)",
    };
  }

  if (zone === "transition") {
    return {
      borderColor: "var(--zone-transition-border)",
      background: "var(--zone-transition-bg)",
      color: "var(--zone-transition-text)",
    };
  }

  if (zone === "private") {
    return {
      borderColor: "var(--zone-private-border)",
      background: "var(--zone-private-bg)",
      color: "var(--zone-private-text)",
    };
  }

  if (zone === "service") {
    return {
      borderColor: "var(--zone-service-border)",
      background: "var(--zone-service-bg)",
      color: "var(--zone-service-text)",
    };
  }

  return {
    borderColor: "var(--border-color)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
  };
}

function edgeTone(type) {
  if (type === "hub") {
    return "var(--tone-violet-text)";
  }

  if (type === "secondary") {
    return "var(--tone-warning-text)";
  }

  return "var(--text-muted)";
}

function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}

function ZoneLegend() {
  return (
    <div className='flex flex-wrap gap-2'>
      <span
        className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
        style={{
          borderColor: "var(--zone-public-border)",
          background: "var(--zone-public-bg)",
          color: "var(--zone-public-text)",
        }}
      >
        Public
      </span>

      <span
        className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
        style={{
          borderColor: "var(--zone-transition-border)",
          background: "var(--zone-transition-bg)",
          color: "var(--zone-transition-text)",
        }}
      >
        Transition
      </span>

      <span
        className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
        style={{
          borderColor: "var(--zone-private-border)",
          background: "var(--zone-private-bg)",
          color: "var(--zone-private-text)",
        }}
      >
        Private
      </span>

      <span
        className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
        style={{
          borderColor: "var(--zone-service-border)",
          background: "var(--zone-service-bg)",
          color: "var(--zone-service-text)",
        }}
      >
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
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Diagram")}
          <h3
            className='mt-2 text-lg font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Spatial diagram
          </h3>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Conceptual spatial organization derived from board semantics.
          </p>
        </div>

        <ZoneLegend />
      </div>

      <div className='mt-5 overflow-x-auto'>
        <div className='flex min-w-max items-center gap-3'>
          {nodes.map((node, index) => {
            const tone = nodeTone(node.zone);

            return (
              <div key={node.id} className='flex items-center gap-3'>
                <div
                  className='min-w-[132px] border px-3 py-3'
                  style={{
                    borderColor: tone.borderColor,
                    background: tone.background,
                    color: tone.color,
                  }}
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
                    <div
                      className='text-[11px]'
                      style={{ color: "var(--text-muted)" }}
                    >
                      →
                    </div>
                    <div
                      className='h-[2px] w-10'
                      style={{
                        background: edgeTone(
                          edges[index] ? edges[index].type : "primary",
                        ),
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {layout.pattern ? (
        <div
          className='mt-5 border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
          }}
        >
          {annotationLabel("Pattern")}
          <div
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            <strong style={{ color: "var(--text-primary)" }}>
              {layout.pattern.type}
            </strong>{" "}
            — {layout.pattern.description}
          </div>
        </div>
      ) : null}
    </section>
  );
}
