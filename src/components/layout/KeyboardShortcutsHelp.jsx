export default function KeyboardShortcutsHelp({ isOpen, onToggle }) {
  return (
    <>
      <button
        type='button'
        onClick={onToggle}
        className='fixed bottom-5 right-5 z-50 rounded-full border px-4 py-2 text-sm shadow-md transition'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-primary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-subtle)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg-muted)";
        }}
      >
        ⌨ Shortcuts
      </button>

      {isOpen && (
        <div
          className='fixed bottom-20 right-5 z-50 w-80 rounded-2xl border p-4 shadow-lg backdrop-blur'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
          }}
        >
          <div className='flex items-center justify-between'>
            <h3
              className='text-sm font-semibold uppercase tracking-[0.12em]'
              style={{ color: "var(--text-secondary)" }}
            >
              Keyboard Shortcuts
            </h3>

            <button
              type='button'
              onClick={onToggle}
              className='text-xs transition hover:underline'
              style={{ color: "var(--text-muted)" }}
            >
              Close
            </button>
          </div>

          <div className='mt-3 space-y-2 text-sm'>
            <ShortcutRow keys='/' label='Focus search' />
            <ShortcutRow keys='Esc' label='Clear selected entry' />
            <ShortcutRow keys='Shift + Esc' label='Clear compare' />
            <ShortcutRow keys='Alt + C / ⌘ + C' label='Toggle compare' />
            <ShortcutRow keys='Alt + P / ⌘ + P' label='Toggle pin' />
          </div>
        </div>
      )}
    </>
  );
}

function ShortcutRow({ keys, label }) {
  return (
    <div
      className='flex items-center justify-between rounded-lg border px-3 py-2'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>

      <span
        className='rounded-md px-2 py-0.5 text-xs font-mono'
        style={{
          background: "var(--bg-subtle)",
          color: "var(--text-primary)",
        }}
      >
        {keys}
      </span>
    </div>
  );
}
