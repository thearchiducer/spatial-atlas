import { buildLayout } from "../../lib/layoutEngine";

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function Section({ index, title, description, children }) {
  return (
    <section className='border border-stone-300 bg-white p-4'>
      <div className='border-b border-stone-200 pb-4'>
        <div className='grid gap-3 md:grid-cols-[72px_minmax(0,1fr)] md:items-end'>
          <div className='text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500'>
            {index}
          </div>

          <div>
            <h3 className='text-base font-semibold tracking-tight text-stone-900'>
              {title}
            </h3>
            {description ? (
              <p className='mt-2 text-sm leading-relaxed text-stone-600'>
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className='mt-4'>{children}</div>
    </section>
  );
}

function SequenceView({ sequence }) {
  if (!sequence.length) {
    return <p className='text-sm text-stone-500'>No sequence generated.</p>;
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {sequence.map((entry, index) => (
        <div key={entry.id} className='flex items-center gap-2'>
          <span className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-800'>
            {entry.term}
          </span>
          {index < sequence.length - 1 ? (
            <span className='text-stone-400'>→</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ZoneBlock({ title, items, tone }) {
  let toneClass = "border-stone-200 bg-white";

  if (tone === "public") {
    toneClass = "border-sky-200 bg-sky-50/40";
  } else if (tone === "transition") {
    toneClass = "border-amber-200 bg-amber-50/40";
  } else if (tone === "private") {
    toneClass = "border-emerald-200 bg-emerald-50/40";
  } else if (tone === "service") {
    toneClass = "border-violet-200 bg-violet-50/40";
  }

  return (
    <div className={"border p-3 " + toneClass}>
      <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {title}
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        {items.length ? (
          items.map((entry) => (
            <span
              key={entry.id}
              className='border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'
            >
              {entry.term}
            </span>
          ))
        ) : (
          <span className='text-[11px] uppercase tracking-[0.08em] text-stone-400'>
            None
          </span>
        )}
      </div>
    </div>
  );
}

function ZoningView({ zones }) {
  return (
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      <ZoneBlock title='Public' items={zones.public || []} tone='public' />
      <ZoneBlock
        title='Transition'
        items={zones.transition || []}
        tone='transition'
      />
      <ZoneBlock title='Private' items={zones.private || []} tone='private' />
      <ZoneBlock title='Service' items={zones.service || []} tone='service' />
    </div>
  );
}

function CirculationView({ circulation, pattern }) {
  if (!circulation && !pattern) {
    return (
      <p className='text-sm text-stone-500'>No circulation logic detected.</p>
    );
  }

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <div className='border border-stone-200 bg-stone-50/60 p-4'>
        {annotationLabel("Circulation")}
        {circulation ? (
          <div className='mt-2 text-sm text-stone-700'>
            <strong className='text-stone-900'>{circulation.type}</strong> —{" "}
            {circulation.description}
          </div>
        ) : (
          <div className='mt-2 text-sm text-stone-500'>None</div>
        )}
      </div>

      <div className='border border-stone-200 bg-stone-50/60 p-4'>
        {annotationLabel("Pattern")}
        {pattern ? (
          <div className='mt-2 text-sm text-stone-700'>
            <strong className='text-stone-900'>{pattern.type}</strong> —{" "}
            {pattern.description}
          </div>
        ) : (
          <div className='mt-2 text-sm text-stone-500'>None</div>
        )}
      </div>
    </div>
  );
}

function AdjacencyView({ layout, entriesById }) {
  if (!layout.edges.length) {
    return (
      <p className='text-sm text-stone-500'>No adjacency edges generated.</p>
    );
  }

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      {layout.edges.map((edge) => {
        const from = entriesById.get(edge.from);
        const to = entriesById.get(edge.to);

        return (
          <div
            key={edge.from + "|" + edge.to + "|" + edge.type}
            className='border border-stone-200 bg-stone-50/60 p-3'
          >
            <div className='text-sm font-semibold text-stone-900'>
              {(from && from.term) || edge.from} → {(to && to.term) || edge.to}
            </div>
            <div className='mt-1 text-[11px] uppercase tracking-[0.08em] text-stone-500'>
              {edge.label} · {edge.strength}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NarrativeView({ layout }) {
  return (
    <div className='space-y-3'>
      <div className='border border-stone-200 bg-stone-50/60 p-4 text-sm leading-relaxed text-stone-700'>
        {layout.narrative}
      </div>

      {layout.warnings && layout.warnings.length ? (
        <div className='border border-amber-200 bg-amber-50 p-4'>
          {annotationLabel("Layout warnings")}
          <ul className='mt-3 space-y-2 text-sm text-amber-900'>
            {layout.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className='border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900'>
          No major layout warnings detected.
        </div>
      )}
    </div>
  );
}

function BranchView({ branches, entriesById }) {
  if (!branches.length) {
    return <p className='text-sm text-stone-500'>No branch data available.</p>;
  }

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      {branches.map((branch) => {
        const nextTerms = (branch.nextIds || [])
          .map((id) => {
            const entry = entriesById.get(id);
            return entry ? entry.term : id;
          })
          .filter(Boolean);

        return (
          <div key={branch.id} className='border border-stone-200 bg-white p-3'>
            <div className='text-sm font-semibold text-stone-900'>
              {branch.term}
            </div>
            <div className='mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
              Connects to
            </div>
            <div className='mt-2 text-sm text-stone-700'>
              {nextTerms.length ? nextTerms.join(", ") : "No outgoing links"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function nodeTone(zone) {
  if (zone === "public") {
    return {
      fill: "#f0f9ff",
      stroke: "#7dd3fc",
      text: "#082f49",
      label: "Public",
    };
  }

  if (zone === "transition") {
    return {
      fill: "#fffbeb",
      stroke: "#fcd34d",
      text: "#78350f",
      label: "Transition",
    };
  }

  if (zone === "private") {
    return {
      fill: "#ecfdf5",
      stroke: "#6ee7b7",
      text: "#064e3b",
      label: "Private",
    };
  }

  if (zone === "service") {
    return {
      fill: "#f5f3ff",
      stroke: "#c4b5fd",
      text: "#4c1d95",
      label: "Service",
    };
  }

  return {
    fill: "#fafaf9",
    stroke: "#d6d3d1",
    text: "#292524",
    label: "Zone",
  };
}

function LegendPill({ zone }) {
  const tone = nodeTone(zone);

  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: tone.stroke,
        backgroundColor: tone.fill,
        color: tone.text,
      }}
    >
      {tone.label}
    </span>
  );
}

function estimateAreaWeight(node) {
  if (!node) return 1;

  const zone = String(node.zone || "").toLowerCase();
  const type = String(node.type || "").toLowerCase();
  const privacy = String(node.privacyLevel || "").toLowerCase();

  let weight = 1;

  if (zone === "public") weight += 0.9;
  if (zone === "transition") weight += 0.45;
  if (zone === "private") weight += 0.7;
  if (zone === "service") weight -= 0.15;

  if (type === "circulation") weight += 0.28;
  if (type === "threshold") weight += 0.34;
  if (privacy === "restricted") weight += 0.18;

  return weight;
}

function edgeStyle(type) {
  if (type === "hub") {
    return {
      stroke: "#8b5cf6",
      strokeWidth: 2.25,
      dash: "none",
    };
  }

  if (type === "secondary") {
    return {
      stroke: "#f59e0b",
      strokeWidth: 1.75,
      dash: "8 8",
    };
  }

  return {
    stroke: "#57534e",
    strokeWidth: 2.6,
    dash: "none",
  };
}

function buildOrthogonalPath(x1, y1, x2, y2, bendY) {
  return `M ${x1} ${y1} L ${x1} ${bendY} L ${x2} ${bendY} L ${x2} ${y2}`;
}

function getAxisNodeIds(layout) {
  const sequence = Array.isArray(layout.sequence) ? layout.sequence : [];
  const nodes = Array.isArray(layout.diagramNodes) ? layout.diagramNodes : [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const preferred = sequence
    .filter((entry) => {
      const node = nodeById.get(entry.id);
      if (!node) return false;
      return String(node.zone || "").toLowerCase() !== "service";
    })
    .slice(0, 4)
    .map((entry) => entry.id)
    .filter(Boolean);

  if (preferred.length >= 2) {
    return preferred;
  }

  return sequence
    .slice(0, 4)
    .map((entry) => entry.id)
    .filter(Boolean);
}

function getBranchNodes(layout, axisNodeIds) {
  const allNodes = Array.isArray(layout.diagramNodes)
    ? layout.diagramNodes
    : [];
  const axisSet = new Set(axisNodeIds);

  return allNodes.filter((node) => !axisSet.has(node.id));
}

function buildAxisLayout(axisNodes, canvasWidth, spineY) {
  if (!axisNodes.length) return [];

  const leftPadding = 110;
  const gap = 34;
  const weights = axisNodes.map((node) => estimateAreaWeight(node));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
  const usableWidth =
    canvasWidth - leftPadding * 2 - gap * Math.max(axisNodes.length - 1, 0);

  let cursorX = leftPadding;

  return axisNodes.map((node, index) => {
    const weight = weights[index];
    const width = Math.max(
      156,
      Math.min((usableWidth * weight) / totalWeight, 248),
    );
    const height = Math.max(96, Math.min(82 + weight * 22, 138));

    const positioned = {
      ...node,
      renderMode: "axis",
      x: cursorX,
      y: spineY - height / 2,
      width,
      height,
    };

    cursorX += width + gap;
    return positioned;
  });
}

function buildBandTemplate(canvasWidth, canvasHeight, spineY) {
  return {
    public: {
      x: 60,
      y: 72,
      width: canvasWidth - 120,
      height: 150,
    },
    transition: {
      x: 44,
      y: spineY - 112,
      width: canvasWidth - 88,
      height: 224,
    },
    private: {
      x: 60,
      y: spineY + 128,
      width: canvasWidth - 120,
      height: 176,
    },
    service: {
      x: 120,
      y: canvasHeight - 190,
      width: canvasWidth - 240,
      height: 120,
    },
  };
}

function groupBranchNodesByZone(branchNodes) {
  const grouped = {
    public: [],
    transition: [],
    private: [],
    service: [],
  };

  branchNodes.forEach((node) => {
    const zone = String(node.zone || "").toLowerCase();
    if (grouped[zone]) {
      grouped[zone].push(node);
    } else {
      grouped.transition.push(node);
    }
  });

  return grouped;
}

function getAnchorNodeForBranchNode(node, positionedAxisNodes, layout) {
  const edges = Array.isArray(layout.edges) ? layout.edges : [];
  let parentEdge = edges.find((edge) => edge.to === node.id);
  if (!parentEdge) {
    parentEdge = edges.find((edge) => edge.from === node.id);
  }

  if (parentEdge) {
    const anchorId =
      parentEdge.to === node.id ? parentEdge.from : parentEdge.to;
    const anchor = positionedAxisNodes.find(
      (axisNode) => axisNode.id === anchorId,
    );
    if (anchor) return anchor;
  }

  const sameZone = positionedAxisNodes.find(
    (axisNode) => axisNode.zone === node.zone,
  );
  if (sameZone) return sameZone;

  return positionedAxisNodes[0] || null;
}

function buildBranchLayout(
  branchNodes,
  positionedAxisNodes,
  layout,
  canvasWidth,
  canvasHeight,
  spineY,
) {
  if (!branchNodes.length) return [];

  const grouped = groupBranchNodesByZone(branchNodes);
  const bands = buildBandTemplate(canvasWidth, canvasHeight, spineY);
  const positioned = [];

  ["public", "transition", "private", "service"].forEach((zone) => {
    const nodes = grouped[zone];
    if (!nodes.length) return;

    const band = bands[zone];
    const cols = Math.min(
      nodes.length,
      zone === "service" ? 3 : zone === "transition" ? 2 : 4,
    );
    const gapX = 18;
    const gapY = 22;
    const slotWidth = (band.width - gapX * Math.max(cols - 1, 0)) / cols;

    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const weight = estimateAreaWeight(node);

      const rawWidth =
        zone === "service"
          ? slotWidth * 0.8
          : zone === "public"
            ? slotWidth * 0.92
            : slotWidth * 0.88;

      const width = Math.max(
        zone === "service" ? 118 : 126,
        Math.min(rawWidth + weight * 10, 208),
      );

      const height = Math.max(
        zone === "service" ? 78 : 86,
        Math.min(76 + weight * 16, 120),
      );

      const anchor = getAnchorNodeForBranchNode(
        node,
        positionedAxisNodes,
        layout,
      );
      const anchorCenterX = anchor
        ? anchor.x + anchor.width / 2
        : band.x + band.width / 2;
      const centeredX = anchorCenterX - width / 2;
      const minX = band.x + 10;
      const maxX = band.x + band.width - width - 10;
      const x = Math.max(minX, Math.min(centeredX, maxX));

      const y = band.y + 18 + row * (height + gapY);

      positioned.push({
        ...node,
        renderMode: "branch",
        x,
        y,
        width,
        height,
      });
    });
  });

  return positioned;
}

function buildRenderedEdges(layout, positionedNodes, spineY) {
  const edges = Array.isArray(layout.edges) ? layout.edges : [];
  const nodeMap = new Map(positionedNodes.map((node) => [node.id, node]));
  const axisIds = new Set(getAxisNodeIds(layout));

  const primaryEdges = edges.filter((edge) => edge.type === "primary");
  const selectedSecondaryEdges = edges
    .filter((edge) => edge.type !== "primary")
    .slice(0, 2);

  return [...primaryEdges, ...selectedSecondaryEdges]
    .map((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);

      if (!from || !to) return null;

      const fromAxis = axisIds.has(edge.from);
      const toAxis = axisIds.has(edge.to);

      if (fromAxis && toAxis) {
        const x1 = from.x + from.width;
        const y1 = from.y + from.height / 2;
        const x2 = to.x;
        const y2 = to.y + to.height / 2;
        const midX = x1 + (x2 - x1) / 2;

        return {
          ...edge,
          path: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
        };
      }

      if (fromAxis && !toAxis) {
        const x1 = from.x + from.width / 2;
        const y1 = from.y + (to.y < spineY ? 2 : from.height - 2);
        const x2 = to.x + to.width / 2;
        const y2 = to.y + (to.y < spineY ? to.height - 2 : 2);
        const bendY = to.y < spineY ? y2 - 26 : y2 + 26;

        return {
          ...edge,
          path: buildOrthogonalPath(x1, y1, x2, y2, bendY),
        };
      }

      if (!fromAxis && toAxis) {
        const x1 = from.x + from.width / 2;
        const y1 = from.y + (from.y < spineY ? from.height - 2 : 2);
        const x2 = to.x + to.width / 2;
        const y2 = to.y + (from.y < spineY ? 2 : to.height - 2);
        const bendY = from.y < spineY ? y1 + 26 : y1 - 26;

        return {
          ...edge,
          path: buildOrthogonalPath(x1, y1, x2, y2, bendY),
        };
      }

      const x1 = from.x + from.width / 2;
      const y1 = from.y + from.height / 2;
      const x2 = to.x + to.width / 2;
      const y2 = to.y + to.height / 2;
      const bendY = y1 < y2 ? y1 + 24 : y1 - 24;

      return {
        ...edge,
        path: buildOrthogonalPath(x1, y1, x2, y2, bendY),
      };
    })
    .filter(Boolean);
}

function buildFieldFromTemplate(zone, nodes, template) {
  if (!nodes.length) return null;

  const tone = nodeTone(zone);

  return {
    zone,
    tone,
    x: template.x,
    y: template.y,
    width: template.width,
    height: template.height,
  };
}

function buildZoneFields(positionedNodes, canvasWidth, canvasHeight, spineY) {
  const templates = buildBandTemplate(canvasWidth, canvasHeight, spineY);

  return ["public", "transition", "private", "service"]
    .map((zone) => {
      const nodes = positionedNodes.filter((node) => node.zone === zone);
      return buildFieldFromTemplate(zone, nodes, templates[zone]);
    })
    .filter(Boolean);
}

function buildArchitecturalRendererData(layout) {
  const allNodes = Array.isArray(layout.diagramNodes)
    ? layout.diagramNodes
    : [];
  if (!allNodes.length) {
    return {
      width: 1440,
      height: 860,
      spineY: 430,
      fields: [],
      nodes: [],
      edges: [],
    };
  }

  const width = 1440;
  const height = 860;
  const spineY = 430;

  const axisNodeIds = getAxisNodeIds(layout);
  const axisNodes = axisNodeIds
    .map((id) => allNodes.find((node) => node.id === id))
    .filter(Boolean);

  const branchNodes = getBranchNodes(layout, axisNodeIds);

  const positionedAxisNodes = buildAxisLayout(axisNodes, width, spineY);
  const positionedBranchNodes = buildBranchLayout(
    branchNodes,
    positionedAxisNodes,
    layout,
    width,
    height,
    spineY,
  );

  const nodes = [...positionedBranchNodes, ...positionedAxisNodes];
  const fields = buildZoneFields(nodes, width, height, spineY);
  const renderedEdges = buildRenderedEdges(layout, nodes, spineY);

  return {
    width,
    height,
    spineY,
    fields,
    nodes,
    edges: renderedEdges,
  };
}

function VisualLayoutRenderer({ layout }) {
  const canvas = buildArchitecturalRendererData(layout);

  if (!canvas.nodes.length) {
    return (
      <div className='border border-stone-200 bg-stone-50/60 p-4 text-sm text-stone-500'>
        No visual layout could be rendered.
      </div>
    );
  }

  return (
    <section className='border border-stone-300 bg-white p-5'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Visual layout renderer")}
          <h3 className='mt-2 text-lg font-semibold tracking-tight text-stone-900'>
            Architectural layout renderer
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            Clean architectural logic with fixed zone bands, a dominant
            circulation spine, and branch nodes anchored to connected axis
            rooms.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <LegendPill zone='public' />
          <LegendPill zone='transition' />
          <LegendPill zone='private' />
          <LegendPill zone='service' />
        </div>
      </div>

      <div className='mt-5 overflow-x-auto border border-stone-200 bg-stone-50/60 p-4'>
        <svg
          width={canvas.width}
          height={canvas.height}
          viewBox={`0 0 ${canvas.width} ${canvas.height}`}
          className='max-w-full'
          role='img'
          aria-label='Architectural layout renderer'
        >
          <defs>
            <marker
              id='layout-arrow-v5'
              markerWidth='10'
              markerHeight='10'
              refX='8'
              refY='5'
              orient='auto'
              markerUnits='strokeWidth'
            >
              <path d='M 0 0 L 10 5 L 0 10 z' fill='#57534e' />
            </marker>
          </defs>

          <rect
            x='0'
            y='0'
            width={canvas.width}
            height={canvas.height}
            rx='10'
            fill='#fafaf9'
            stroke='#d6d3d1'
            strokeWidth='2'
          />

          {canvas.fields.map((field) => (
            <g key={field.zone}>
              <rect
                x={field.x}
                y={field.y}
                width={field.width}
                height={field.height}
                rx='10'
                fill={field.tone.fill}
                stroke={field.tone.stroke}
                strokeWidth='1.75'
                fillOpacity='0.58'
              />
              <text
                x={field.x + 18}
                y={field.y + 28}
                fontSize='13'
                fontWeight='700'
                fill={field.tone.text}
              >
                {field.tone.label}
              </text>
            </g>
          ))}

          <rect
            x='48'
            y={canvas.spineY - 34}
            width={canvas.width - 96}
            height='68'
            rx='10'
            fill='#fff7ed'
            stroke='#fdba74'
            strokeWidth='2'
          />
          <line
            x1='72'
            y1={canvas.spineY}
            x2={canvas.width - 72}
            y2={canvas.spineY}
            stroke='#c2410c'
            strokeWidth='4'
            strokeDasharray='16 10'
            opacity='0.92'
          />
          <text
            x='74'
            y={canvas.spineY - 42}
            fontSize='12'
            fontWeight='700'
            fill='#9a3412'
          >
            Primary circulation spine
          </text>

          {canvas.edges.map((edge) => {
            const style = edgeStyle(edge.type);

            return (
              <path
                key={edge.from + "|" + edge.to + "|" + edge.type}
                d={edge.path}
                fill='none'
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.dash}
                markerEnd='url(#layout-arrow-v5)'
                opacity='0.9'
              />
            );
          })}

          {canvas.nodes.map((node) => {
            const tone = nodeTone(node.zone);

            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx='8'
                  fill='#ffffff'
                  stroke={tone.stroke}
                  strokeWidth={node.renderMode === "axis" ? 2.8 : 2}
                />
                <text
                  x={node.x + 12}
                  y={node.y + 24}
                  fontSize={node.renderMode === "axis" ? "15" : "14"}
                  fontWeight='700'
                  fill='#1c1917'
                >
                  {node.term}
                </text>
                <text
                  x={node.x + 12}
                  y={node.y + 44}
                  fontSize='11'
                  fill='#57534e'
                >
                  {node.type || "—"} · {node.privacyLevel || "—"}
                </text>
                <text
                  x={node.x + 12}
                  y={node.y + 62}
                  fontSize='11'
                  fill={tone.text}
                >
                  {tone.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

export default function LayoutPanel({ activeBoard = null }) {
  const entries =
    activeBoard && Array.isArray(activeBoard.entries)
      ? activeBoard.entries
      : [];

  const layout = buildLayout(entries);

  const entriesById = new Map();
  entries.forEach((entry) => {
    if (entry && entry.id) {
      entriesById.set(entry.id, entry);
    }
  });

  if (!activeBoard) {
    return (
      <section className='border border-stone-300 bg-white p-5'>
        {annotationLabel("Layout generator")}
        <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
          Spatial logic engine
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Open a project board to generate spatial sequence, zoning, adjacency,
          circulation, and a visual concept diagram.
        </p>
      </section>
    );
  }

  return (
    <div className='space-y-4'>
      <section className='border border-stone-300 bg-white p-5'>
        <div className='border-b border-stone-200 pb-4'>
          {annotationLabel("Layout generator")}
          <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
            Spatial logic engine
          </h2>

          <p className='mt-2 max-w-3xl text-sm leading-relaxed text-stone-600'>
            Convert the active board into a readable spatial sequence, zoning
            system, circulation logic, adjacency structure, and conceptual
            diagram.
          </p>
        </div>
      </section>

      <Section
        index='01'
        title='Spatial sequence'
        description='Ordered from more exposed conditions toward more protected conditions.'
      >
        <SequenceView sequence={layout.sequence} />
      </Section>

      <VisualLayoutRenderer layout={layout} />

      <Section
        index='02'
        title='Zoning'
        description='Board entries grouped into public, transition, private, and service layers.'
      >
        <ZoningView zones={layout.zones} />
      </Section>

      <Section
        index='03'
        title='Circulation and pattern'
        description='Primary movement reading and overall spatial organization pattern.'
      >
        <CirculationView
          circulation={layout.circulation}
          pattern={layout.pattern}
        />
      </Section>

      <Section
        index='04'
        title='Adjacency logic'
        description='Primary and secondary relationships inferred from sequence and structure.'
      >
        <AdjacencyView layout={layout} entriesById={entriesById} />
      </Section>

      <Section
        index='05'
        title='Branch structure'
        description='Which spaces lead to others inside the generated logic.'
      >
        <BranchView branches={layout.branches} entriesById={entriesById} />
      </Section>

      <Section
        index='06'
        title='Narrative'
        description='Architect-readable summary of the generated layout logic.'
      >
        <NarrativeView layout={layout} />
      </Section>
    </div>
  );
}
