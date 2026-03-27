export default function TypeBadge({ type }) {
  const styles = {
    Room: "border-stone-300 bg-stone-50 text-stone-900",
    Circulation: "border-violet-300 bg-violet-50 text-violet-950",
    Threshold: "border-emerald-300 bg-emerald-50 text-emerald-950",
    Zone: "border-amber-300 bg-amber-50 text-amber-950",
    "Open Space": "border-green-300 bg-green-50 text-green-950",
    Technical: "border-slate-300 bg-slate-50 text-slate-900",
    Concept: "border-rose-300 bg-rose-50 text-rose-950",
  };

  return (
    <span
      className={`border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${
        styles[type] || "border-stone-300 bg-stone-50 text-stone-900"
      }`}
    >
      {type}
    </span>
  );
}
