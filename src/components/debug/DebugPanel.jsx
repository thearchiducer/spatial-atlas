import { useState } from "react";

export default function DebugPanel({ validationErrors }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!validationErrors || validationErrors.length === 0) {
    return null;
  }

  return (
    <section
      className='rounded-3xl border shadow-sm'
      style={{
        borderColor: "var(--tone-warning-border)",
        background: "var(--tone-warning-bg)",
      }}
    >
      <button
        type='button'
        onClick={() => setIsOpen((current) => !current)}
        className='flex w-full items-center justify-between rounded-3xl px-6 py-4 text-left'
      >
        <div>
          <h2
            className='text-lg font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Dataset validation issues
          </h2>

          <p
            className='mt-1 text-sm'
            style={{ color: "var(--tone-warning-text)" }}
          >
            {validationErrors.length} issue
            {validationErrors.length === 1 ? "" : "s"} detected
          </p>
        </div>

        <span
          className='text-sm font-medium'
          style={{ color: "var(--text-primary)" }}
        >
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen && (
        <div
          className='border-t px-6 pb-6 pt-4'
          style={{ borderColor: "var(--tone-warning-border)" }}
        >
          <p
            className='mb-4 text-sm'
            style={{ color: "var(--tone-warning-text)" }}
          >
            Your atlas still renders, but these entries should be corrected.
          </p>

          <ul
            className='list-disc space-y-2 pl-5 text-sm'
            style={{ color: "var(--text-primary)" }}
          >
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
