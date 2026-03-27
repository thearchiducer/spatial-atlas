export default function OnboardingHeader() {
  return (
    <div className='border-b border-stone-200 bg-white px-6 py-6'>
      <div className='max-w-5xl'>
        {/* Title */}
        <h1 className='text-xl font-semibold text-stone-900'>Spatial Atlas</h1>

        {/* Description */}
        <p className='mt-2 text-sm text-stone-600 leading-relaxed'>
          Compare architectural directions, preview transformations, and track
          how design thinking evolves.
        </p>
        <div className='mt-3 border border-sky-300 bg-sky-50 px-3 py-2 text-xs text-sky-900'>
          A sample board has been created to help you explore the workflow.
        </div>
        {/* Steps */}
        <div className='mt-4 flex flex-col gap-1 text-xs text-stone-500'>
          <div>1. Select or create two directions</div>
          <div>2. Compare them</div>
          <div>3. Apply a transformation and observe the trajectory</div>
        </div>

        {/* CTA */}
        <div className='mt-4 inline-block border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900'>
          Start with two boards to explore a direction
        </div>
      </div>
      <div className='mt-4 flex gap-2'>
        <button
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          className='border border-stone-300 px-3 py-1 text-xs uppercase tracking-[0.1em] hover:bg-stone-100'
        >
          Browse entries
        </button>

        <button
          onClick={() =>
            alert("Select an entry → then click 'Add to active board'")
          }
          className='border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs uppercase tracking-[0.1em] text-emerald-900'
        >
          How to start
        </button>
      </div>
    </div>
  );
}
