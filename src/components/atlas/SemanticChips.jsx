function formatValue(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Chip({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "rgba(56,189,248,0.35)",
          background: "rgba(56,189,248,0.10)",
          color: "#bae6fd",
        }
      : tone === "emerald"
        ? {
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }
        : tone === "amber"
          ? {
              borderColor: "rgba(251,191,36,0.30)",
              background: "rgba(251,191,36,0.10)",
              color: "#fde68a",
            }
          : tone === "violet"
            ? {
                borderColor: "rgba(168,85,247,0.35)",
                background: "rgba(168,85,247,0.10)",
                color: "#d8b4fe",
              }
            : tone === "rose"
              ? {
                  borderColor: "rgba(244,63,94,0.35)",
                  background: "rgba(244,63,94,0.10)",
                  color: "#fecdd3",
                }
              : {
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-secondary)",
                };

  return (
    <div
      className='inline-flex min-h-[34px] items-center border'
      style={toneStyles}
    >
      <span
        className='border-r px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]'
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        {label}
      </span>

      <span className='px-2.5 py-1 text-[11px]'>{formatValue(value)}</span>
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
