import React, { useMemo, useState } from "react";
import { buildDesignDirectionPacket } from "../../lib/designDirectionPacket";

export default function MinimalDirectionView({ activeBoard }) {
  const [showDetails, setShowDetails] = useState(false);

  const packet = useMemo(() => {
    if (!activeBoard) return null;
    return buildDesignDirectionPacket(activeBoard);
  }, [activeBoard]);

  if (!activeBoard || !packet) {
    return (
      <div className='py-20 text-center' style={{ color: "var(--text-muted)" }}>
        No direction available.
      </div>
    );
  }

  const { summary, identity, translator } = packet;

  return (
    <div>
      <div className='mb-10'>
        <h1
          className='text-2xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Design Direction
        </h1>

        <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          Architectural decision output
        </p>
      </div>

      <div className='mb-12'>
        <h2
          className='text-lg uppercase tracking-wide'
          style={{ color: "var(--text-muted)" }}
        >
          Final Direction
        </h2>

        <p
          className='mt-4 text-2xl font-medium leading-relaxed'
          style={{ color: "var(--text-primary)" }}
        >
          {identity?.statement || "Define a clear architectural direction."}
        </p>
      </div>

      <div className='mb-10'>
        <h3
          className='text-sm uppercase tracking-wide'
          style={{ color: "var(--text-muted)" }}
        >
          Spatial Character
        </h3>

        <p className='mt-2 text-lg' style={{ color: "var(--text-secondary)" }}>
          {summary?.boardCharacter || "—"}
        </p>
      </div>

      <div className='mb-10'>
        <h3
          className='text-sm uppercase tracking-wide'
          style={{ color: "var(--text-muted)" }}
        >
          Key Moves
        </h3>

        <ul
          className='mt-3 space-y-2 text-sm'
          style={{ color: "var(--text-secondary)" }}
        >
          {(translator?.moves || []).slice(0, 4).map((move, i) => (
            <li key={i}>• {move.title}</li>
          ))}
        </ul>
      </div>

      <div
        className='border-t pt-6'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={() => setShowDetails((v) => !v)}
          className='border px-3 py-1.5 text-sm transition'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>

        {showDetails && (
          <div className='mt-6 grid gap-6 md:grid-cols-2'>
            <DetailBlock title='Privacy'>{summary?.privacyModel}</DetailBlock>

            <DetailBlock title='Circulation'>
              {summary?.circulationModel}
            </DetailBlock>

            <DetailBlock title='Social'>{summary?.socialModel}</DetailBlock>

            <DetailBlock title='Service'>
              {summary?.serviceStrategy}
            </DetailBlock>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailBlock({ title, children }) {
  return (
    <div>
      <div
        className='text-xs uppercase tracking-wide'
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>

      <div className='mt-1 text-sm' style={{ color: "var(--text-secondary)" }}>
        {children || "—"}
      </div>
    </div>
  );
}
