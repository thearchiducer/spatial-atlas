function navButtonStyle(isActive) {
  return isActive
    ? {
        borderColor: "var(--tone-info-border)",
        background: "var(--tone-info-bg)",
        color: "var(--tone-info-text)",
      }
    : {
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      };
}

function statusChip(label, value) {
  return (
    <div
      className='border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className='mx-1 opacity-50'>·</span>
      <span style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function ViewModeTopNav({
  activeView,
  setActiveView,
  minimalMode,
  setMinimalMode,
  selectedEntry,
  activeBoard,
  onResetView,
  showSecondaryTools,
  setShowSecondaryTools,
}) {
  const modes = [
    { key: "atlas", label: "Atlas", shortcut: "1" },
    { key: "clusters", label: "Cluster", shortcut: "2" },
    { key: "graph", label: "Graph", shortcut: "3" },
  ];

  return (
    <section
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div className='grid gap-3 px-4 py-3 xl:grid-cols-[1.2fr_.8fr] xl:items-center'>
        <div className='flex flex-col gap-3'>
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Workspace navigation
          </div>

          <div className='flex flex-wrap gap-2'>
            {modes.map((mode) => (
              <button
                key={mode.key}
                type='button'
                onClick={() => setActiveView(mode.key)}
                className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
                style={navButtonStyle(activeView === mode.key)}
                title={`${mode.label} view (${mode.shortcut})`}
              >
                <span>{mode.label}</span>
                <span className='ml-2 border-l border-current/20 pl-2 opacity-70'>
                  {mode.shortcut}
                </span>
              </button>
            ))}

            <button
              type='button'
              onClick={() => setMinimalMode((current) => !current)}
              className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
              style={navButtonStyle(minimalMode)}
              title='Toggle minimal mode (M)'
            >
              <span>{minimalMode ? "Minimal on" : "Minimal off"}</span>
              <span className='ml-2 border-l border-current/20 pl-2 opacity-70'>
                M
              </span>
            </button>

            <button
              type='button'
              onClick={() => setShowSecondaryTools((current) => !current)}
              className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
              style={navButtonStyle(showSecondaryTools)}
              title='Toggle secondary tools (T)'
            >
              <span>Tools</span>
              <span className='ml-2 border-l border-current/20 pl-2 opacity-70'>
                {showSecondaryTools ? "ON" : "T"}
              </span>
            </button>

            <button
              type='button'
              onClick={onResetView}
              className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
                color: "var(--text-secondary)",
              }}
              title='Reset view (Shift+R)'
            >
              <span>Reset</span>
              <span className='ml-2 border-l border-current/20 pl-2 opacity-70'>
                ⇧R
              </span>
            </button>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2 xl:justify-end'>
          {statusChip("Mode", activeView)}
          {statusChip("Selection", selectedEntry ? selectedEntry.term : "None")}
          {statusChip("Board", activeBoard ? activeBoard.name : "None")}
        </div>
      </div>
    </section>
  );
}
