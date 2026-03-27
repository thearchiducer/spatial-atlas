export default function KeyboardShortcutsHelp({ isOpen, onToggle }) {
  return (
    <>
      {/* Toggle Button */}
      <button
        type='button'
        onClick={onToggle}
        className='fixed bottom-5 right-5 z-50 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm shadow-md transition hover:bg-stone-100'
      >
        ⌨ Shortcuts
      </button>

      {/* Panel */}
      {isOpen && (
        <div className='fixed bottom-20 right-5 z-50 w-80 rounded-2xl border border-stone-300 bg-white p-4 shadow-lg'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold uppercase tracking-[0.12em] text-stone-600'>
              Keyboard Shortcuts
            </h3>

            <button
              type='button'
              onClick={onToggle}
              className='text-xs text-stone-500 hover:underline'
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
    <div className='flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2'>
      <span className='text-stone-700'>{label}</span>
      <span className='rounded-md bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-800'>
        {keys}
      </span>
    </div>
  );
}
