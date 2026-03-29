import { useMemo, useState } from "react";
import SemanticChips from "./SemanticChips";
import SemanticExplanationChips from "../semantic/SemanticExplanationChips";

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

function relationTone(relation) {
  switch (relation) {
    case "related":
      return {
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
        color: "var(--tone-info-text)",
      };
    case "same-type":
      return {
        borderColor: "var(--tone-success-border)",
        background: "var(--tone-success-bg)",
        color: "var(--tone-success-text)",
      };
    case "same-domain":
      return {
        borderColor: "var(--tone-warning-border)",
        background: "var(--tone-warning-bg)",
        color: "var(--tone-warning-text)",
      };
    case "same-region":
      return {
        borderColor: "var(--tone-violet-border)",
        background: "var(--tone-violet-bg)",
        color: "var(--tone-violet-text)",
      };
    case "semantic-neighbor":
      return {
        borderColor: "var(--tone-violet-border)",
        background: "var(--tone-violet-bg)",
        color: "var(--tone-violet-text)",
      };
    default:
      return {
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      };
  }
}

function relationColor(relation) {
  switch (relation) {
    case "related":
      return "var(--tone-info-text)";
    case "same-type":
      return "var(--tone-success-text)";
    case "same-domain":
      return "var(--tone-warning-text)";
    case "same-region":
      return "var(--tone-violet-text)";
    case "semantic-neighbor":
      return "var(--tone-violet-text)";
    default:
      return "var(--text-muted)";
  }
}

function strengthTone(strength) {
  switch (strength) {
    case "strong":
      return {
        borderColor: "var(--tone-success-border)",
        background: "var(--tone-success-bg)",
        color: "var(--tone-success-text)",
      };
    case "medium":
      return {
        borderColor: "var(--tone-warning-border)",
        background: "var(--tone-warning-bg)",
        color: "var(--tone-warning-text)",
      };
    default:
      return {
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      };
  }
}

function strengthLabel(strength) {
  if (strength === "strong") return "Strong";
  if (strength === "medium") return "Medium";
  return "Light";
}

function edgeStrokeWidth(strength) {
  if (strength === "strong") return 3.5;
  if (strength === "medium") return 2.4;
  return 1.5;
}

function edgeOpacity(strength) {
  if (strength === "strong") return 0.9;
  if (strength === "medium") return 0.6;
  return 0.35;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function LegendTag({ label, relation }) {
  return (
    <span
      className='inline-flex items-center gap-2 border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
      <span
        className='h-2.5 w-2.5'
        style={{ backgroundColor: relationColor(relation) }}
      />
      {label}
    </span>
  );
}

function GraphCanvasLegend() {
  const items = [
    { label: "Direct relation", relation: "related" },
    { label: "Same type", relation: "same-type" },
    { label: "Same domain", relation: "same-domain" },
    { label: "Same region", relation: "same-region" },
    { label: "Semantic neighbor", relation: "semantic-neighbor" },
  ];

  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <LegendTag
          key={item.relation}
          label={item.label}
          relation={item.relation}
        />
      ))}
    </div>
  );
}

function GraphViewportControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterGraph,
  onCenterSelected,
  hasSelectedNode,
}) {
  function controlStyle(primary = false) {
    return primary
      ? {
          borderColor: "var(--tone-violet-border)",
          background: "var(--tone-violet-bg)",
          color: "var(--tone-violet-text)",
        }
      : {
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-secondary)",
        };
  }

  return (
    <div className='flex flex-wrap gap-2'>
      <button
        type='button'
        onClick={onZoomOut}
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
        style={controlStyle()}
      >
        Zoom out
      </button>

      <button
        type='button'
        onClick={onZoomIn}
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
        style={controlStyle()}
      >
        Zoom in
      </button>

      <button
        type='button'
        onClick={onCenterGraph}
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
        style={controlStyle()}
      >
        Center graph
      </button>

      <button
        type='button'
        onClick={onCenterSelected}
        disabled={!hasSelectedNode}
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
        style={controlStyle()}
      >
        Focus selected node
      </button>

      <button
        type='button'
        onClick={onResetView}
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
        style={controlStyle(true)}
      >
        Reset view
      </button>

      <span
        className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-secondary)",
        }}
      >
        Zoom {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}

function GraphCanvas({
  canvas,
  activeNodeId,
  focusedNodeId,
  zoom,
  pan,
  onHoverNode,
  onLeaveNode,
  onSelectEntry,
  onPanChange,
}) {
  const [dragState, setDragState] = useState(null);

  if (!canvas) return null;

  const highlightedNodeId = focusedNodeId || activeNodeId || null;

  return (
    <section
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b px-4 py-2 text-[11px]'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-muted)",
        }}
      >
        Drag to pan. Click a node to focus it. Hover to inspect it.
      </div>

      <div className='overflow-x-auto'>
        <svg
          viewBox={`0 0 ${canvas.width} ${canvas.height}`}
          className='h-auto min-w-[920px] w-full touch-none'
          role='img'
          aria-label='Semantic relationship graph'
          onPointerMove={(event) => {
            if (!dragState) return;

            const dx = event.clientX - dragState.startX;
            const dy = event.clientY - dragState.startY;

            onPanChange({
              x: dragState.originPan.x + dx,
              y: dragState.originPan.y + dy,
            });
          }}
          onPointerUp={() => setDragState(null)}
          onPointerLeave={() => setDragState(null)}
          onPointerDown={(event) => {
            if (event.target instanceof SVGSVGElement) {
              setDragState({
                startX: event.clientX,
                startY: event.clientY,
                originPan: pan,
              });
            }
          }}
        >
          <defs>
            <filter
              id='softShadow'
              x='-20%'
              y='-20%'
              width='140%'
              height='140%'
            >
              <feDropShadow
                dx='0'
                dy='2'
                stdDeviation='4'
                floodOpacity='0.18'
              />
            </filter>
          </defs>

          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            {canvas.edges.map((edge, index) => {
              const isActive =
                highlightedNodeId &&
                canvas.nodes.some(
                  (node) =>
                    node.id === highlightedNodeId &&
                    node.x === edge.toX &&
                    node.y === edge.toY,
                );

              return (
                <line
                  key={`${edge.relation}-${index}`}
                  x1={edge.fromX}
                  y1={edge.fromY}
                  x2={edge.toX}
                  y2={edge.toY}
                  stroke={relationColor(edge.relation)}
                  strokeWidth={
                    isActive
                      ? edgeStrokeWidth(edge.strength) + 1.2
                      : edgeStrokeWidth(edge.strength)
                  }
                  opacity={isActive ? 1 : edgeOpacity(edge.strength)}
                />
              );
            })}

            <circle
              cx={canvas.center.x}
              cy={canvas.center.y}
              r={canvas.center.radius + 10}
              fill='var(--bg-muted)'
            />
            <circle
              cx={canvas.center.x}
              cy={canvas.center.y}
              r={canvas.center.radius}
              fill='var(--bg-subtle)'
              filter='url(#softShadow)'
            />
            <text
              x={canvas.center.x}
              y={canvas.center.y - 2}
              textAnchor='middle'
              style={{ fill: "var(--text-primary)" }}
              className='text-[14px] font-semibold'
            >
              {canvas.center.term.length > 18
                ? `${canvas.center.term.slice(0, 18)}…`
                : canvas.center.term}
            </text>
            <text
              x={canvas.center.x}
              y={canvas.center.y + 16}
              textAnchor='middle'
              style={{ fill: "var(--text-muted)" }}
              className='text-[10px]'
            >
              center
            </text>

            {canvas.nodes.map((node) => {
              const isHovered = activeNodeId === node.id;
              const isFocused = focusedNodeId === node.id;

              const radius = isFocused
                ? node.radius + 7
                : isHovered
                  ? node.radius + 5
                  : node.radius;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => onHoverNode(node.id)}
                  onMouseLeave={onLeaveNode}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectEntry?.(node.id);
                  }}
                  className='cursor-pointer'
                >
                  <circle
                    r={radius + 7}
                    fill='var(--bg-surface)'
                    stroke={relationColor(node.relation)}
                    strokeWidth={isFocused ? 4 : isHovered ? 3 : 1.5}
                  />
                  <circle
                    r={radius}
                    fill={relationColor(node.relation)}
                    opacity={0.92}
                    filter='url(#softShadow)'
                  />
                  <text
                    y={3}
                    textAnchor='middle'
                    style={{ fill: "var(--text-primary)" }}
                    className='text-[10px] font-semibold'
                  >
                    {node.term.length > 13
                      ? `${node.term.slice(0, 13)}…`
                      : node.term}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}

function GraphNodeCard({
  node,
  isFocused = false,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
  onFocusNode,
}) {
  return (
    <div
      className={`border p-3 ${isFocused ? "ring-2" : ""}`}
      style={{
        ...relationTone(node.relation),
        ...(isFocused
          ? { boxShadow: `inset 0 0 0 2px var(--border-color)` }
          : {}),
      }}
    >
      <div className='flex items-start justify-between gap-3 border-b border-current/15 pb-4'>
        <button
          type='button'
          onClick={() => onSelectEntry(node.id)}
          className='text-left'
        >
          <div className='font-semibold hover:underline'>{node.term}</div>
          <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-80'>
            {node.type} · {node.domain} · {node.scale}
          </div>
        </button>

        <div
          className='border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'
          style={strengthTone(node.strength)}
        >
          {strengthLabel(node.strength)}
        </div>
      </div>

      <div className='mt-3'>
        <SemanticChips entry={node} compact limit={3} />
      </div>

      <div className='mt-3 text-[11px] uppercase tracking-[0.08em] opacity-80'>
        Score · <strong>{node.edgeScore}</strong>
      </div>

      {node.edgeReasons?.length ? (
        <div className='mt-3'>
          <SemanticExplanationChips
            breakdown={node.edgeReasons.map((reason) => ({
              label: reason,
              points: 2,
            }))}
            compact
            limit={3}
          />
        </div>
      ) : null}

      <div className='mt-3 flex flex-wrap gap-2 border-t border-current/15 pt-3'>
        <button
          type='button'
          onClick={() => onFocusNode?.(node.id)}
          className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            background: "var(--bg-muted)",
            borderColor: "var(--border-color)",
            color: "currentColor",
          }}
        >
          Focus
        </button>

        <button
          type='button'
          onClick={() => onCompareEntry?.(node.id)}
          className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            background: "var(--bg-muted)",
            borderColor: "var(--border-color)",
            color: "currentColor",
          }}
        >
          Compare
        </button>

        <button
          type='button'
          onClick={() => onTogglePinEntry?.(node.id)}
          className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
          style={{
            background: "var(--bg-muted)",
            borderColor: "var(--border-color)",
            color: "currentColor",
          }}
        >
          Pin
        </button>
      </div>
    </div>
  );
}

function GraphGroup({
  group,
  focusedNodeId,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
  onFocusNode,
}) {
  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <h3
          className='text-lg font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          {group.title}
        </h3>
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          {group.description}
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
        {group.nodes.map((node) => (
          <GraphNodeCard
            key={node.id}
            node={node}
            isFocused={focusedNodeId === node.id}
            onSelectEntry={onSelectEntry}
            onCompareEntry={onCompareEntry}
            onTogglePinEntry={onTogglePinEntry}
            onFocusNode={onFocusNode}
          />
        ))}
      </div>
    </section>
  );
}

function HoverInspector({ node, onFocusNode }) {
  if (!node) {
    return (
      <div
        className='border p-4 text-sm'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
          color: "var(--text-muted)",
        }}
      >
        Hover a node in the canvas to inspect its semantic profile.
      </div>
    );
  }

  return (
    <div className='border p-4' style={relationTone(node.relation)}>
      <div className='flex items-start justify-between gap-3 border-b border-current/15 pb-4'>
        <div>
          <div className='text-lg font-semibold'>{node.term}</div>
          <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-80'>
            {node.type} · {node.domain} · {node.scale} · {node.region}
          </div>
        </div>
        <div
          className='border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'
          style={strengthTone(node.strength)}
        >
          {strengthLabel(node.strength)}
        </div>
      </div>

      <div className='mt-3'>
        <SemanticChips entry={node} compact limit={4} />
      </div>

      <div className='mt-3 text-sm'>
        <span className='font-semibold'>Score:</span> {node.edgeScore}
      </div>

      <div className='mt-3'>
        <SemanticExplanationChips
          breakdown={(node.edgeReasons || []).map((reason) => ({
            label: reason,
            points: 2,
          }))}
          compact
          limit={4}
        />
      </div>

      <div className='mt-4 border-t border-current/15 pt-4'>
        <button
          type='button'
          onClick={() => onFocusNode?.(node.id)}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
          style={{
            background: "var(--bg-muted)",
            borderColor: "var(--border-color)",
            color: "currentColor",
          }}
        >
          Focus this node
        </button>
      </div>
    </div>
  );
}

function RelationshipGraphWorkspace({
  graph,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const activeNode = useMemo(() => {
    if (!activeNodeId || !graph?.allNodes?.length) return null;
    return graph.allNodes.find((node) => node.id === activeNodeId) || null;
  }, [activeNodeId, graph]);

  const focusedNode = useMemo(() => {
    if (!focusedNodeId || !graph?.allNodes?.length) return null;
    return graph.allNodes.find((node) => node.id === focusedNodeId) || null;
  }, [focusedNodeId, graph]);

  function handleZoomIn() {
    setZoom((current) => clamp(Number((current + 0.15).toFixed(2)), 0.55, 2.4));
  }

  function handleZoomOut() {
    setZoom((current) => clamp(Number((current - 0.15).toFixed(2)), 0.55, 2.4));
  }

  function handleResetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFocusedNodeId(null);
    setActiveNodeId(null);
  }

  function handleCenterGraph() {
    setPan({ x: 0, y: 0 });
  }

  function handleFocusNode(nodeId) {
    setFocusedNodeId(nodeId);

    const node = graph?.canvas?.nodes?.find((item) => item.id === nodeId);
    const canvasCenterX = (graph?.canvas?.width || 0) / 2;
    const canvasCenterY = (graph?.canvas?.height || 0) / 2;

    if (node) {
      setPan({
        x: canvasCenterX - node.x * zoom,
        y: canvasCenterY - node.y * zoom,
      });
    }
  }

  function handleCenterSelected() {
    if (!focusedNodeId) return;
    handleFocusNode(focusedNodeId);
  }

  return (
    <>
      <section
        className='border p-5'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='flex flex-col gap-3 border-b pb-4 xl:flex-row xl:items-start xl:justify-between'
          style={{ borderColor: "var(--border-color)" }}
        >
          <div>
            {annotationLabel("Node + edge canvas")}
            <h3
              className='mt-2 text-xl font-semibold tracking-tight'
              style={{ color: "var(--text-primary)" }}
            >
              Relational field canvas
            </h3>
            <p
              className='mt-2 text-sm'
              style={{ color: "var(--text-secondary)" }}
            >
              Use zoom, pan, and focus controls to navigate dense semantic
              neighborhoods.
            </p>
          </div>

          <GraphViewportControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onCenterGraph={handleCenterGraph}
            onCenterSelected={handleCenterSelected}
            hasSelectedNode={Boolean(focusedNodeId)}
          />
        </div>

        <div className='mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <GraphCanvasLegend />

          {focusedNode ? (
            <div
              className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
              style={{
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }}
            >
              Focused node · <strong>{focusedNode.term}</strong>
            </div>
          ) : (
            <div
              className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
                color: "var(--text-muted)",
              }}
            >
              No focused node
            </div>
          )}
        </div>

        <div className='mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]'>
          <GraphCanvas
            canvas={graph.canvas}
            activeNodeId={activeNodeId}
            focusedNodeId={focusedNodeId}
            zoom={zoom}
            pan={pan}
            onHoverNode={setActiveNodeId}
            onLeaveNode={() => setActiveNodeId(null)}
            onSelectEntry={(nodeId) => {
              setFocusedNodeId(nodeId);
              onSelectEntry?.(nodeId);
            }}
            onPanChange={setPan}
          />

          <section
            className='border p-4'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-surface)",
            }}
          >
            {annotationLabel("Inspector")}
            <h3
              className='mt-2 text-lg font-semibold tracking-tight'
              style={{ color: "var(--text-primary)" }}
            >
              Node inspector
            </h3>

            <div className='mt-4'>
              <HoverInspector
                node={focusedNode || activeNode}
                onFocusNode={handleFocusNode}
              />
            </div>
          </section>
        </div>
      </section>

      {graph.groups.map((group) => (
        <GraphGroup
          key={group.id}
          group={group}
          focusedNodeId={focusedNodeId}
          onSelectEntry={onSelectEntry}
          onCompareEntry={onCompareEntry}
          onTogglePinEntry={onTogglePinEntry}
          onFocusNode={handleFocusNode}
        />
      ))}
    </>
  );
}

export default function RelationshipGraphPanel({
  graph,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  if (!graph?.center) {
    return (
      <section
        className='border p-6'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        {annotationLabel("Spatial relationship analysis")}
        <h2
          className='mt-2 text-2xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Select an entry to build its relationship map
        </h2>
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          The graph view uses direct relations plus weighted semantic neighbors.
        </p>
      </section>
    );
  }

  return (
    <div className='space-y-6'>
      <section
        className='border p-6'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='border-b pb-4'
          style={{ borderColor: "var(--border-color)" }}
        >
          {annotationLabel("Spatial relationship analysis")}
          <h2
            className='mt-2 text-3xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {graph.center.term}
          </h2>

          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            Explore direct relations and weighted semantic neighbors around the
            selected entry.
          </p>
        </div>

        <div
          className='mt-5 border p-5'
          style={{
            borderColor: "var(--tone-violet-border)",
            background: "var(--tone-violet-bg)",
          }}
        >
          {annotationLabel("Center node")}
          <div
            className='mt-2 text-2xl font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {graph.center.term}
          </div>
          <div
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {graph.center.type} · {graph.center.domain} · {graph.center.scale} ·{" "}
            {graph.center.region}
          </div>
          <div className='mt-3'>
            <SemanticChips entry={graph.center} compact limit={4} />
          </div>
        </div>
      </section>

      <RelationshipGraphWorkspace
        key={graph.center.id}
        graph={graph}
        onSelectEntry={onSelectEntry}
        onCompareEntry={onCompareEntry}
        onTogglePinEntry={onTogglePinEntry}
      />
    </div>
  );
}
