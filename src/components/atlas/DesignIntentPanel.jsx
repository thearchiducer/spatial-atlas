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
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className='border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500'
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
    <span className='border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
      {label} · {value}
    </span>
  );
}

function getMatchTone(label) {
  if (label === "Strong fit") return "border-emerald-300 bg-emerald-50/30";
  if (label === "Moderate fit") return "border-amber-300 bg-amber-50/30";
  return "border-stone-300 bg-stone-50/40";
}

function SuggestionCard({ title, description, entries, onSelectEntry }) {
  return (
    <section className='border border-stone-200 bg-white p-4'>
      {annotationLabel("Strategy group")}
      <h3 className='mt-2 text-base font-semibold tracking-tight text-stone-900'>
        {title}
      </h3>
      <p className='mt-1 text-sm leading-relaxed text-stone-600'>
        {description}
      </p>

      <div className='mt-4 flex flex-wrap gap-2'>
        {entries.length ? (
          entries.map((entry) => (
            <button
              key={entry.id}
              type='button'
              onClick={() => onSelectEntry && onSelectEntry(entry.id)}
              className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
            >
              {entry.term}
            </button>
          ))
        ) : (
          <span className='text-sm text-stone-500'>None</span>
        )}
      </div>
    </section>
  );
}

function SequenceCard({ entries, onSelectEntry, onCompareEntry }) {
  return (
    <section className='border border-indigo-200 bg-indigo-50/30 p-4'>
      {annotationLabel("Proposed order")}
      <h3 className='mt-2 text-base font-semibold tracking-tight text-indigo-950'>
        Suggested spatial sequence
      </h3>
      <p className='mt-1 text-sm leading-relaxed text-indigo-900/80'>
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
                className='border border-indigo-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-indigo-900 transition hover:bg-indigo-100'
              >
                {entry.term}
              </button>

              {index < entries.length - 1 ? (
                <span className='text-sm font-semibold text-indigo-700'>→</span>
              ) : null}
            </div>
          ))
        ) : (
          <span className='text-sm text-indigo-900/70'>
            No sequence available.
          </span>
        )}
      </div>

      {entries.length >= 2 ? (
        <div className='mt-4'>
          <button
            type='button'
            onClick={() => onCompareEntry && onCompareEntry(entries[0].id)}
            className='border border-indigo-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-indigo-900 transition hover:bg-indigo-100'
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
  return (
    <div className={`border p-4 ${getMatchTone(entry.__intentLabel)}`}>
      <div className='flex items-start justify-between gap-3 border-b border-current/15 pb-4'>
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='min-w-0 flex-1 text-left'
        >
          <h3 className='text-base font-semibold tracking-tight text-stone-900 hover:underline'>
            {entry.term}
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            {entry.description}
          </p>
        </button>

        <div className='text-right'>
          <div className='border border-stone-200 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
            {entry.__intentLabel}
          </div>
          <div className='mt-2 text-xl font-semibold text-stone-900'>
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
        <div className='mt-4 border border-red-200 bg-red-50/40 p-3'>
          {annotationLabel("Conflicts reducing fit")}
          <div className='mt-2 flex flex-wrap gap-2'>
            {entry.__intentConflictBreakdown.map((item) => (
              <span
                key={item.label}
                className='border border-red-200 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-red-800'
              >
                {item.label} −{item.penalty}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {entry.__intentRationale && entry.__intentRationale.length ? (
        <div className='mt-4 border border-stone-200 bg-white p-3'>
          {annotationLabel("Why this appears")}
          <ul className='mt-2 space-y-1 text-sm text-stone-700'>
            {entry.__intentRationale.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className='mt-4 flex flex-wrap gap-2 border-t border-stone-200 pt-4'>
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
        >
          Open
        </button>

        <button
          type='button'
          onClick={() => onCompareEntry && onCompareEntry(entry.id)}
          className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
        >
          Compare
        </button>

        <button
          type='button'
          onClick={() => onTogglePinEntry && onTogglePinEntry(entry.id)}
          className='border border-stone-300 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
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
    <section className='border border-stone-300 bg-white p-5'>
      {annotationLabel("Design intent mode v2")}

      <div className='mt-2 border-b border-stone-200 pb-4'>
        <h2 className='text-xl font-semibold tracking-tight text-stone-900'>
          Design intent engine
        </h2>

        <p className='mt-2 max-w-3xl text-sm leading-relaxed text-stone-600'>
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

      <div className='mt-5 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-4'>
        <button
          type='button'
          onClick={clearIntent}
          className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
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

      <div className='mt-6 space-y-3 border-t border-stone-200 pt-4'>
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
          <div className='border border-stone-300 bg-stone-50/60 p-4 text-sm text-stone-600'>
            Add one or more intent fields to generate ranked semantic matches.
          </div>
        )}
      </div>
    </section>
  );
}
