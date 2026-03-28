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

function LegendTag({ children, tone = "stone" }) {
  const toneStyles =
    tone === "core"
      ? {
          borderColor: "rgba(56, 189, 248, 0.22)",
          background: "rgba(56, 189, 248, 0.05)",
          color: "#93c5fd",
        }
      : tone === "critical"
        ? {
            borderColor: "rgba(248, 113, 113, 0.22)",
            background: "rgba(248, 113, 113, 0.05)",
            color: "#fca5a5",
          }
        : tone === "threshold"
          ? {
              borderColor: "rgba(251, 146, 60, 0.22)",
              background: "rgba(251, 146, 60, 0.05)",
              color: "#fdba74",
            }
          : {
              borderColor: "rgba(168, 85, 247, 0.22)",
              background: "rgba(168, 85, 247, 0.05)",
              color: "#c4b5fd",
            };

  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={toneStyles}
    >
      {children}
    </span>
  );
}

export default function SpatialDiagramPanel({ translator }) {
  if (
    !translator ||
    !Array.isArray(translator.moves) ||
    !translator.moves.length
  ) {
    return null;
  }

  const width = Math.max(760, translator.moves.length * 180);
  const height = 240;
  const startX = 90;
  const y = 95;
  const gap = 160;

  const nodes = translator.moves.map((move, index) => {
    const x = startX + index * gap;

    let tone = "neutral";
    const priority = String(move.priority || "").toLowerCase();
    const title = String(move.title || "").toLowerCase();

    if (priority === "critical") tone = "critical";
    else if (priority === "core") tone = "core";
    else if (title.includes("threshold")) tone = "threshold";

    return {
      ...move,
      x,
      y,
      tone,
    };
  });

  function toneStyles(tone) {
    if (tone === "critical") {
      return {
        fill: "rgba(248,113,113,0.10)",
        stroke: "#f87171",
        label: "#fecaca",
      };
    }

    if (tone === "core") {
      return {
        fill: "rgba(56,189,248,0.10)",
        stroke: "#38bdf8",
        label: "#bae6fd",
      };
    }

    if (tone === "threshold") {
      return {
        fill: "rgba(251,146,60,0.10)",
        stroke: "#fb923c",
        label: "#fdba74",
      };
    }

    return {
      fill: "rgba(255,255,255,0.03)",
      stroke: "#78716c",
      label: "#d6d3d1",
    };
  }

  return (
    <section
      className='mt-4 border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Diagram view")}
          <div
            className='mt-1 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            A conceptual sequence of the translated spatial moves.
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <LegendTag tone='core'>Core</LegendTag>
          <LegendTag tone='critical'>Critical</LegendTag>
          <LegendTag tone='threshold'>Threshold</LegendTag>
        </div>
      </div>

      <div className='mt-4 overflow-x-auto'>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className='h-[240px] min-w-[760px] w-full'
          role='img'
          aria-label='Spatial moves diagram'
        >
          <defs>
            <marker
              id='diagram-arrow'
              markerWidth='10'
              markerHeight='10'
              refX='8'
              refY='3'
              orient='auto'
              markerUnits='strokeWidth'
            >
              <path d='M0,0 L0,6 L9,3 z' fill='#a8a29e' />
            </marker>
          </defs>

          {nodes.slice(0, -1).map((node, index) => {
            const nextNode = nodes[index + 1];

            return (
              <line
                key={`edge-${node.title}-${nextNode.title}`}
                x1={node.x + 54}
                y1={node.y}
                x2={nextNode.x - 54}
                y2={nextNode.y}
                stroke='#a8a29e'
                strokeWidth='1.6'
                markerEnd='url(#diagram-arrow)'
              />
            );
          })}

          {nodes.map((node, index) => {
            const style = toneStyles(node.tone);

            return (
              <g key={`node-${node.title}-${index}`}>
                <rect
                  x={node.x - 54}
                  y={node.y - 28}
                  width='108'
                  height='56'
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth='1.8'
                  rx='10'
                />

                <text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor='middle'
                  fontSize='10'
                  letterSpacing='0.14em'
                  fill='#a8a29e'
                >
                  {String(index + 1).padStart(2, "0")}
                </text>

                <text
                  x={node.x}
                  y={node.y + 13}
                  textAnchor='middle'
                  fontSize='11'
                  fontWeight='600'
                  fill={style.label}
                >
                  {node.title.length > 16
                    ? node.title.slice(0, 16) + "…"
                    : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p
        className='mt-3 text-[11px] uppercase tracking-[0.08em]'
        style={{ color: "var(--text-muted)" }}
      >
        Conceptual only · sequence and emphasis, not plan geometry.
      </p>
    </section>
  );
}
