function formatValue(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Chip({ label, value, tone = "stone" }) {
  const toneClasses =
    tone === "sky"
      ? "border-sky-200 bg-sky-50 text-sky-900"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : tone === "violet"
            ? "border-violet-200 bg-violet-50 text-violet-900"
            : tone === "rose"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : "border-stone-200 bg-stone-50 text-stone-800";

  return (
    <div
      className={`inline-flex min-h-[34px] items-center border ${toneClasses}`}
    >
      <span className='border-r border-current/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]'>
        {label}
      </span>

      <span className='px-2.5 py-1 text-[11px] text-current'>
        {formatValue(value)}
      </span>
    </div>
  );
}

export default function SemanticChips({
  entry,
  compact = false,
  limit = null,
  tones = {},
}) {
  if (!entry) return null;

  const chips = [
    {
      key: "privacy",
      label: "Privacy",
      value: entry.privacyLevel,
      tone: tones.privacy || "sky",
    },
    {
      key: "enclosure",
      label: "Enclosure",
      value: entry.enclosureType,
      tone: tones.enclosure || "emerald",
    },
    {
      key: "circulation",
      label: "Circulation",
      value: entry.circulationRole,
      tone: tones.circulation || "amber",
    },
    {
      key: "social",
      label: "Social",
      value: entry.socialRole,
      tone: tones.social || "violet",
    },
    {
      key: "logic",
      label: "Logic",
      value: entry.spatialLogic,
      tone: tones.logic || "rose",
    },
    {
      key: "culture",
      label: "Culture",
      value: entry.culturalSpecificity,
      tone: tones.culture || "stone",
    },
    {
      key: "ritual",
      label: "Ritual",
      value: entry.ritualWeight,
      tone: tones.ritual || "stone",
    },
    {
      key: "climate",
      label: "Climate",
      value: entry.climateResponse,
      tone: tones.climate || "stone",
    },
  ].filter((item) => item.value);

  const visibleChips =
    typeof limit === "number" ? chips.slice(0, limit) : chips;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-3"}`}>
      {visibleChips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          value={chip.value}
          tone={chip.tone}
        />
      ))}
    </div>
  );
}
