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
      <div className='text-center text-stone-400 py-20'>
        No direction available.
      </div>
    );
  }

  const { summary, identity, translator } = packet;

  return (
    <div>
      {/* Title */}
      <div className='mb-10'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Design Direction
        </h1>
        <p className='text-sm text-stone-500 mt-2'>
          Architectural decision output
        </p>
      </div>

      {/* VERDICT */}
      <div className='mb-12'>
        <h2 className='text-lg uppercase tracking-wide text-stone-500'>
          Final Direction
        </h2>

        <p className='mt-4 text-2xl font-medium leading-relaxed'>
          {identity?.statement || "Define a clear architectural direction."}
        </p>
      </div>

      {/* KEY CHARACTER */}
      <div className='mb-10'>
        <h3 className='text-sm uppercase tracking-wide text-stone-400'>
          Spatial Character
        </h3>

        <p className='mt-2 text-lg text-stone-700'>
          {summary?.boardCharacter || "—"}
        </p>
      </div>

      {/* MOVES */}
      <div className='mb-10'>
        <h3 className='text-sm uppercase tracking-wide text-stone-400'>
          Key Moves
        </h3>

        <ul className='mt-3 space-y-2 text-sm text-stone-700'>
          {(translator?.moves || []).slice(0, 4).map((move, i) => (
            <li key={i}>• {move.title}</li>
          ))}
        </ul>
      </div>

      {/* TOGGLE */}
      <div className='border-t border-stone-200 pt-6'>
        <button
          onClick={() => setShowDetails((v) => !v)}
          className='text-sm text-stone-500 hover:text-stone-900'
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
      <div className='text-xs uppercase tracking-wide text-stone-400'>
        {title}
      </div>
      <div className='mt-1 text-sm text-stone-700'>{children || "—"}</div>
    </div>
  );
}
