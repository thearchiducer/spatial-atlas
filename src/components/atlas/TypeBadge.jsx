export default function TypeBadge({ type }) {
  const styles = {
    Room: {
      borderColor: "var(--border-color)",
      background: "rgba(255,255,255,0.03)",
      color: "var(--text-primary)",
    },
    Circulation: {
      borderColor: "rgba(168,85,247,0.35)",
      background: "rgba(168,85,247,0.10)",
      color: "#d8b4fe",
    },
    Threshold: {
      borderColor: "rgba(16,185,129,0.35)",
      background: "rgba(16,185,129,0.10)",
      color: "#a7f3d0",
    },
    Zone: {
      borderColor: "rgba(251,191,36,0.30)",
      background: "rgba(251,191,36,0.10)",
      color: "#fde68a",
    },
    "Open Space": {
      borderColor: "rgba(34,197,94,0.35)",
      background: "rgba(34,197,94,0.10)",
      color: "#bbf7d0",
    },
    Technical: {
      borderColor: "rgba(148,163,184,0.35)",
      background: "rgba(148,163,184,0.10)",
      color: "#cbd5e1",
    },
    Concept: {
      borderColor: "rgba(244,63,94,0.35)",
      background: "rgba(244,63,94,0.10)",
      color: "#fecdd3",
    },
  };

  const style = styles[type] || {
    borderColor: "var(--border-color)",
    background: "rgba(255,255,255,0.03)",
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
