export default function TypeBadge({ type }) {
  const styles = {
    Room: {
      borderColor: "var(--border-color)",
      background: "var(--bg-muted)",
      color: "var(--text-primary)",
    },

    Circulation: {
      borderColor: "var(--tone-violet-border)",
      background: "var(--tone-violet-bg)",
      color: "var(--tone-violet-text)",
    },

    Threshold: {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      color: "var(--tone-success-text)",
    },

    Zone: {
      borderColor: "var(--tone-warning-border)",
      background: "var(--tone-warning-bg)",
      color: "var(--tone-warning-text)",
    },

    "Open Space": {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      color: "var(--tone-success-text)",
    },

    Technical: {
      borderColor: "var(--border-color)",
      background: "var(--bg-subtle)",
      color: "var(--text-secondary)",
    },

    Concept: {
      borderColor: "var(--tone-danger-border)",
      background: "var(--tone-danger-bg)",
      color: "var(--tone-danger-text)",
    },
  };

  const style = styles[type] || {
    borderColor: "var(--border-color)",
    background: "var(--bg-muted)",
    color: "var(--text-primary)",
  };

  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={style}
    >
      {type}
    </span>
  );
}
