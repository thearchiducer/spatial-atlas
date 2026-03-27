function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function LegendTag({ children, tone = "stone" }) {
  const toneClasses =
    tone === "core"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : tone === "critical"
        ? "border-red-200 bg-red-50 text-red-700"
        : tone === "threshold"
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : "border-stone-300 bg-white text-stone-700";

  return (
    <span
      className={`border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${toneClasses}`}
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
        fill: "#fef2f2",
        stroke: "#dc2626",
        label: "#991b1b",
      };
    }

    if (tone === "core") {
      return {
        fill: "#eff6ff",
        stroke: "#2563eb",
        label: "#1d4ed8",
      };
    }

    if (tone === "threshold") {
      return {
        fill: "#fff7ed",
        stroke: "#ea580c",
        label: "#c2410c",
      };
    }

    return {
      fill: "#f5f5f4",
      stroke: "#78716c",
      label: "#57534e",
    };
  }

  return (
    <section className='mt-4 border border-stone-200 bg-stone-50/60 p-4'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Diagram view")}
          <div className='mt-1 text-sm text-stone-700'>
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
                />

                <text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor='middle'
                  fontSize='10'
                  letterSpacing='0.14em'
                  fill='#78716c'
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

      <p className='mt-3 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
        Conceptual only · sequence and emphasis, not plan geometry.
      </p>
    </section>
  );
}
