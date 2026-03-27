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
    </div>
  );
}
