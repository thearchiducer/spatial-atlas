function formatValue(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Chip({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "sky"
      ? {
          borderColor: "var(--tone-info-border)",
          background: "var(--tone-info-bg)",
          color: "var(--tone-info-text)",
        }
      : tone === "emerald"
        ? {
            borderColor: "var(--tone-success-border)",
            background: "var(--tone-success-bg)",
            color: "var(--tone-success-text)",
          }
        : tone === "amber"
          ? {
              borderColor: "var(--tone-warning-border)",
              background: "var(--tone-warning-bg)",
              color: "var(--tone-warning-text)",
            }
          : tone === "violet"
            ? {
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }
            : tone === "rose"
              ? {
                  borderColor: "var(--tone-danger-border)",
                  background: "var(--tone-danger-bg)",
                  color: "var(--tone-danger-text)",
                }
              : {
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                };

  return (
    <div
      className='inline-flex min-h-[34px] items-center border'
      style={toneStyles}
    >
      <span
        className='border-r px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]'
        style={{ borderColor: "var(--border-color)" }}
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
