export default function OnboardingHeader({ theme = "light" }) {
  return (
    <div
      className='border-b px-6 py-6'
      style={{
        borderColor: "var(--border-color)",
        background: theme === "dark" ? "var(--bg-base)" : "var(--bg-surface)",
      }}
    >
      <div className='max-w-5xl'>
        <h1
          className='text-xl font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Spatial Atlas
        </h1>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Compare architectural directions, preview transformations, and track
          how design thinking evolves.
        </p>

        <div
          className='mt-3 border px-3 py-2 text-xs'
          style={{
            borderColor: "rgba(56,189,248,0.35)",
            background: "rgba(56,189,248,0.10)",
            color: "#bae6fd",
          }}
        >
          A sample board has been created to help you explore the workflow.
        </div>

        <div
          className='mt-4 flex flex-col gap-1 text-xs'
          style={{ color: "var(--text-muted)" }}
        >
          <div>1. Select or create two directions</div>
          <div>2. Compare them</div>
          <div>3. Apply a transformation and observe the trajectory</div>
        </div>

        <div
          className='mt-4 inline-block border px-3 py-2 text-xs font-semibold'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }}
        >
          Start with two boards to explore a direction
        </div>
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          className='border px-3 py-1 text-xs uppercase tracking-[0.1em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Browse entries
        </button>

        <button
          onClick={() =>
            alert("Select an entry → then click 'Add to active board'")
          }
          className='border px-3 py-1 text-xs uppercase tracking-[0.1em] transition'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }}
        >
          How to start
        </button>
      </div>
    </div>
  );
}
