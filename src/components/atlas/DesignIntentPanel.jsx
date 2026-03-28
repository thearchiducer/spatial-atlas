import { useEffect, useMemo, useState } from "react";
import {
  CLIMATE_RESPONSE_OPTIONS,
  CULTURAL_SPECIFICITY_OPTIONS,
  DOMAIN_OPTIONS,
  ENCLOSURE_OPTIONS,
  PRIVACY_OPTIONS,
  REGION_OPTIONS,
  RITUAL_WEIGHT_OPTIONS,
  SCALE_OPTIONS,
  SOCIAL_ROLE_OPTIONS,
  SPATIAL_LOGIC_OPTIONS,
  withAllOption,
  CIRCULATION_ROLE_OPTIONS,
} from "../../constants/semanticVocabulary.js";
import { buildDesignIntentMatches } from "../../lib/buildDesignIntentMatches.js";
import SemanticChips from "./SemanticChips";
import SemanticExplanationChips from "../semantic/SemanticExplanationChips";

function annotationLabel(children) {
  return (
    <div
      className='text-[10px] font-semibold uppercase tracking-[0.16em]'
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className='flex flex-col gap-1'>
      <span
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className='border px-3 py-2 text-sm outline-none transition'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(56,189,248,0.45)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
        }}
      >
        {options.map((option) => (
          <option key={option || "any"} value={option}>
            {option || "Any"}
          </option>
        ))}
      </select>
    </label>
  );
}

function IntentMetric({ label, value }) {
  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
        color: "var(--text-secondary)",
      }}
    >
      {label} · {value}
    </span>
  );
}

function getMatchTone(label) {
  if (label === "Strong fit") {
    return {
      borderColor: "rgba(16,185,129,0.35)",
      background: "rgba(16,185,129,0.08)",
    };
  }

  if (label === "Moderate fit") {
    return {
      borderColor: "rgba(251,191,36,0.30)",
      background: "rgba(251,191,36,0.08)",
    };
  }

  return {
    borderColor: "var(--border-color)",
    background: "rgba(255,255,255,0.03)",
  };
}

function SuggestionCard({ title, description, entries, onSelectEntry }) {
  return (
    <section
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      {annotationLabel("Strategy group")}
      <h3
        className='mt-2 text-base font-semibold tracking-tight'
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      <p
        className='mt-1 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        {description}
      </p>

      <div className='mt-4 flex flex-wrap gap-2'>
        {entries.length ? (
          entries.map((entry) => (
            <button
              key={entry.id}
              type='button'
              onClick={() => onSelectEntry && onSelectEntry(entry.id)}
              className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              {entry.term}
            </button>
          ))
        ) : (
          <span className='text-sm' style={{ color: "var(--text-muted)" }}>
            None
          </span>
        )}
      </div>
    </section>
  );
}

function SequenceCard({ entries, onSelectEntry, onCompareEntry }) {
  return (
    <section
      className='border p-4'
      style={{
        borderColor: "rgba(99,102,241,0.35)",
        background: "rgba(99,102,241,0.08)",
      }}
    >
      {annotationLabel("Proposed order")}
      <h3
        className='mt-2 text-base font-semibold tracking-tight'
        style={{ color: "#e0e7ff" }}
      >
        Suggested spatial sequence
      </h3>
      <p className='mt-1 text-sm leading-relaxed' style={{ color: "#c7d2fe" }}>
        A heuristic order from more public or transitional conditions toward
        more specific, protected, or internally resolved roles.
      </p>

      <div className='mt-4 flex flex-wrap items-center gap-2'>
        {entries.length ? (
          entries.map((entry, index) => (
            <div key={entry.id} className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => onSelectEntry && onSelectEntry(entry.id)}
                className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
                style={{
                  borderColor: "rgba(99,102,241,0.35)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e0e7ff",
                }}
              >
                {entry.term}
              </button>

              {index < entries.length - 1 ? (
                <span
                  className='text-sm font-semibold'
                  style={{ color: "#c7d2fe" }}
                >
                  →
                </span>
              ) : null}
            </div>
          ))
        ) : (
          <span className='text-sm' style={{ color: "#c7d2fe" }}>
            No sequence available.
          </span>
        )}
      </div>

      {entries.length >= 2 ? (
        <div className='mt-4'>
          <button
            type='button'
            onClick={() => onCompareEntry && onCompareEntry(entries[0].id)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "rgba(99,102,241,0.35)",
              background: "rgba(255,255,255,0.06)",
              color: "#e0e7ff",
            }}
          >
            Start compare from first node
          </button>
        </div>
      ) : null}
    </section>
  );
}

function IntentMatchCard({
  entry,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  const tone = getMatchTone(entry.__intentLabel);

  return (
    <div
      className='border p-4'
      style={{
        borderColor: tone.borderColor,
        background: tone.background,
      }}
    >
      <div
        className='flex items-start justify-between gap-3 border-b pb-4'
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='min-w-0 flex-1 text-left'
        >
          <h3
            className='text-base font-semibold tracking-tight hover:underline'
            style={{ color: "var(--text-primary)" }}
          >
            {entry.term}
          </h3>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {entry.description}
          </p>
        </button>

        <div className='text-right'>
          <div
            className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            {entry.__intentLabel}
          </div>
          <div
            className='mt-2 text-xl font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {entry.__intentScore}
          </div>
        </div>
      </div>

      <div className='mt-4'>
        {annotationLabel("Semantic profile")}
        <SemanticChips entry={entry} compact limit={4} />
      </div>

      <div className='mt-4'>
        {annotationLabel("Positive alignment")}
        <div className='mt-2'>
          <SemanticExplanationChips
            breakdown={entry.__intentPositiveBreakdown}
            compact
            limit={5}
          />
        </div>
      </div>

      {entry.__intentConflictBreakdown &&
      entry.__intentConflictBreakdown.length ? (
        <div
          className='mt-4 border p-3'
          style={{
            borderColor: "rgba(248,113,113,0.35)",
            background: "rgba(248,113,113,0.08)",
          }}
        >
          {annotationLabel("Conflicts reducing fit")}
          <div className='mt-2 flex flex-wrap gap-2'>
            {entry.__intentConflictBreakdown.map((item) => (
              <span
                key={item.label}
                className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
                style={{
                  borderColor: "rgba(248,113,113,0.35)",
                  background: "rgba(248,113,113,0.10)",
                  color: "#fecaca",
                }}
              >
                {item.label} −{item.penalty}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {entry.__intentRationale && entry.__intentRationale.length ? (
        <div
          className='mt-4 border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Why this appears")}
          <ul
            className='mt-2 space-y-1 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {entry.__intentRationale.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        className='mt-4 flex flex-wrap gap-2 border-t pt-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Open
        </button>

        <button
          type='button'
          onClick={() => onCompareEntry && onCompareEntry(entry.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Compare
        </button>

        <button
          type='button'
          onClick={() => onTogglePinEntry && onTogglePinEntry(entry.id)}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Pin
        </button>
      </div>
    </div>
  );
}

export default function DesignIntentPanel({
  entries,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
  onIntentChange,
}) {
  const [intent, setIntent] = useState({
    domain: "",
    scale: "",
    region: "",
    privacyLevel: "",
    enclosureType: "",
    circulationRole: "",
    socialRole: "",
    spatialLogic: "",
    culturalSpecificity: "",
    ritualWeight: "",
    climateResponse: "",
  });

  const results = useMemo(() => {
    return buildDesignIntentMatches(entries, intent);
  }, [entries, intent]);

  useEffect(() => {
    if (onIntentChange) {
      onIntentChange(results.summaryLabel);
    }
  }, [results.summaryLabel, onIntentChange]);

  function updateIntent(key, value) {
    setIntent((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearIntent() {
    setIntent({
      domain: "",
      scale: "",
      region: "",
      privacyLevel: "",
      enclosureType: "",
      circulationRole: "",
      socialRole: "",
      spatialLogic: "",
      culturalSpecificity: "",
      ritualWeight: "",
      climateResponse: "",
    });
  }

  return (
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      {annotationLabel("Design intent mode v2")}

      <div
        className='mt-2 border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <h2
          className='text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Design intent engine
        </h2>

        <p
          className='mt-2 max-w-3xl text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Define a design intent, then the atlas ranks entries by semantic fit,
          surfaces conflicts, groups strategy options, and proposes a possible
          sequence.
        </p>
      </div>

      <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <SelectField
          label='Domain'
          value={intent.domain}
          onChange={(event) => updateIntent("domain", event.target.value)}
          options={withAllOption(DOMAIN_OPTIONS)}
        />

        <SelectField
          label='Scale'
          value={intent.scale}
          onChange={(event) => updateIntent("scale", event.target.value)}
          options={withAllOption(SCALE_OPTIONS)}
        />

        <SelectField
          label='Region'
          value={intent.region}
          onChange={(event) => updateIntent("region", event.target.value)}
          options={withAllOption(REGION_OPTIONS)}
        />

        <SelectField
          label='Privacy'
          value={intent.privacyLevel}
          onChange={(event) => updateIntent("privacyLevel", event.target.value)}
          options={withAllOption(PRIVACY_OPTIONS)}
        />

        <SelectField
          label='Enclosure'
          value={intent.enclosureType}
          onChange={(event) =>
            updateIntent("enclosureType", event.target.value)
          }
          options={withAllOption(ENCLOSURE_OPTIONS)}
        />

        <SelectField
          label='Circulation'
          value={intent.circulationRole}
          onChange={(event) =>
            updateIntent("circulationRole", event.target.value)
          }
          options={withAllOption(CIRCULATION_ROLE_OPTIONS)}
        />

        <SelectField
          label='Social role'
          value={intent.socialRole}
          onChange={(event) => updateIntent("socialRole", event.target.value)}
          options={withAllOption(SOCIAL_ROLE_OPTIONS)}
        />

        <SelectField
          label='Spatial logic'
          value={intent.spatialLogic}
          onChange={(event) => updateIntent("spatialLogic", event.target.value)}
          options={withAllOption(SPATIAL_LOGIC_OPTIONS)}
        />

        <SelectField
          label='Cultural specificity'
          value={intent.culturalSpecificity}
          onChange={(event) =>
            updateIntent("culturalSpecificity", event.target.value)
          }
          options={withAllOption(CULTURAL_SPECIFICITY_OPTIONS)}
        />

        <SelectField
          label='Ritual weight'
          value={intent.ritualWeight}
          onChange={(event) => updateIntent("ritualWeight", event.target.value)}
          options={withAllOption(RITUAL_WEIGHT_OPTIONS)}
        />

        <SelectField
          label='Climate response'
          value={intent.climateResponse}
          onChange={(event) =>
            updateIntent("climateResponse", event.target.value)
          }
          options={withAllOption(CLIMATE_RESPONSE_OPTIONS)}
        />
      </div>

      <div
        className='mt-5 flex flex-wrap items-center gap-2 border-t pt-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={clearIntent}
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Clear intent
        </button>

        <IntentMetric label='Intent fields' value={results.filledFields} />
        <IntentMetric label='Matches' value={results.matches.length} />
        <IntentMetric label='Intent summary' value={results.summaryLabel} />
      </div>

      <div className='mt-6 grid gap-3 xl:grid-cols-3'>
        <SuggestionCard
          title='Strongest candidates'
          description='Entries with the most direct semantic fit.'
          entries={results.buckets.strongest}
          onSelectEntry={onSelectEntry}
        />

        <SuggestionCard
          title='Adaptable candidates'
          description='Entries that can work with some interpretation or hybridization.'
          entries={results.buckets.adaptable}
          onSelectEntry={onSelectEntry}
        />

        <SuggestionCard
          title='Edge cases'
          description='Entries that partially align but carry more mismatch risk.'
          entries={results.buckets.edgeCases}
          onSelectEntry={onSelectEntry}
        />
      </div>

      <div className='mt-6'>
        <SequenceCard
          entries={results.suggestedSequence}
          onSelectEntry={onSelectEntry}
          onCompareEntry={onCompareEntry}
        />
      </div>

      <div
        className='mt-6 space-y-3 border-t pt-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        {results.matches.length ? (
          results.matches
            .slice(0, 10)
            .map((entry) => (
              <IntentMatchCard
                key={entry.id}
                entry={entry}
                onSelectEntry={onSelectEntry}
                onCompareEntry={onCompareEntry}
                onTogglePinEntry={onTogglePinEntry}
              />
            ))
        ) : (
          <div
            className='border p-4 text-sm'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            Add one or more intent fields to generate ranked semantic matches.
          </div>
        )}
      </div>
    </section>
  );
}
