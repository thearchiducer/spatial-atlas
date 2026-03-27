import { useEffect, useMemo, useState } from "react";
import { validateEntry } from "../../lib/validateEntry.js";
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
  SOURCE_CATEGORY_OPTIONS,
  SPATIAL_LOGIC_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  CIRCULATION_ROLE_OPTIONS,
} from "../../constants/semanticVocabulary.js";

function normalizeArrayInput(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyRelated(related = []) {
  return related
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item.id || "";
    })
    .filter(Boolean)
    .join(", ");
}

function parseRelated(value) {
  return normalizeArrayInput(value).map((item) => ({
    id: item,
    label: item,
  }));
}

function createDraftFromEntry(entry) {
  if (!entry) {
    return {
      id: "",
      term: "",
      type: TYPE_OPTIONS[0],
      scale: SCALE_OPTIONS[0],
      domain: DOMAIN_OPTIONS[0],
      status: STATUS_OPTIONS[0],
      region: REGION_OPTIONS[0],
      section: "",
      sourceCategory: SOURCE_CATEGORY_OPTIONS[0],
      privacyLevel: PRIVACY_OPTIONS[0],
      enclosureType: ENCLOSURE_OPTIONS[0],
      circulationRole: CIRCULATION_ROLE_OPTIONS[0],
      socialRole: SOCIAL_ROLE_OPTIONS[0],
      spatialLogic: SPATIAL_LOGIC_OPTIONS[0],
      culturalSpecificity: CULTURAL_SPECIFICITY_OPTIONS[0],
      ritualWeight: RITUAL_WEIGHT_OPTIONS[0],
      climateResponse: CLIMATE_RESPONSE_OPTIONS[0],
      description: "",
      notes: "",
      synonymsText: "",
      relatedText: "",
    };
  }

  return {
    ...entry,
    type: entry.type || TYPE_OPTIONS[0],
    scale: entry.scale || SCALE_OPTIONS[0],
    domain: entry.domain || DOMAIN_OPTIONS[0],
    status: entry.status || STATUS_OPTIONS[0],
    region: entry.region || REGION_OPTIONS[0],
    section: entry.section || "",
    sourceCategory: entry.sourceCategory || SOURCE_CATEGORY_OPTIONS[0],
    privacyLevel: entry.privacyLevel || PRIVACY_OPTIONS[0],
    enclosureType: entry.enclosureType || ENCLOSURE_OPTIONS[0],
    circulationRole: entry.circulationRole || CIRCULATION_ROLE_OPTIONS[0],
    socialRole: entry.socialRole || SOCIAL_ROLE_OPTIONS[0],
    spatialLogic: entry.spatialLogic || SPATIAL_LOGIC_OPTIONS[0],
    culturalSpecificity:
      entry.culturalSpecificity || CULTURAL_SPECIFICITY_OPTIONS[0],
    ritualWeight: entry.ritualWeight || RITUAL_WEIGHT_OPTIONS[0],
    climateResponse: entry.climateResponse || CLIMATE_RESPONSE_OPTIONS[0],
    description: entry.description || "",
    notes: entry.notes || "",
    synonymsText: Array.isArray(entry.synonyms)
      ? entry.synonyms.join(", ")
      : "",
    relatedText: stringifyRelated(entry.related || []),
  };
}

function Field({ label, children, hint = "" }) {
  return (
    <label className='block space-y-1.5'>
      <div className='text-xs font-semibold uppercase tracking-[0.12em] text-stone-500'>
        {label}
      </div>
      {children}
      {hint ? <div className='text-xs text-stone-500'>{hint}</div> : null}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className='w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500'
    />
  );
}

function SelectInput({ options, ...props }) {
  return (
    <select
      {...props}
      className='w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500'
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className='min-h-[96px] w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500'
    />
  );
}

export default function EntryEditorPanel({
  entry,
  isOpen,
  isDirty = false,
  hasOverride = false,
  onSave,
  onClose,
  onResetEntry,
  onResetAll,
}) {
  const [draft, setDraft] = useState(() => createDraftFromEntry(entry));

  useEffect(() => {
    setDraft(createDraftFromEntry(entry));
  }, [entry]);

  const previewEntry = useMemo(() => {
    if (!entry) return null;

    return {
      ...entry,
      ...draft,
      synonyms: normalizeArrayInput(draft.synonymsText),
      related: parseRelated(draft.relatedText),
    };
  }, [draft, entry]);

  const issues = useMemo(() => {
    if (!previewEntry) return [];
    return validateEntry(previewEntry);
  }, [previewEntry]);

  if (!isOpen || !entry) {
    return null;
  }

  function updateField(name, value) {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSave() {
    if (!previewEntry) return;
    onSave?.(previewEntry);
  }

  return (
    <section className='rounded-3xl border border-stone-300 bg-white/95 p-6 shadow-sm'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div>
          <div className='mb-2 inline-flex rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-800'>
            Entry editor mode
          </div>
          <h2 className='text-2xl font-semibold tracking-tight text-stone-900'>
            Edit {entry.term}
          </h2>
          <p className='mt-2 text-sm text-stone-600'>
            Changes save to browser storage only and override the imported atlas
            data during local use.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={handleSave}
            className='rounded-full border border-stone-900 bg-stone-900 px-3 py-1.5 text-sm text-white transition hover:bg-stone-800'
          >
            Save entry
          </button>

          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100'
          >
            Close editor
          </button>

          <button
            type='button'
            onClick={() => onResetEntry?.(entry.id)}
            disabled={!hasOverride}
            className='rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Reset this entry
          </button>

          <button
            type='button'
            onClick={onResetAll}
            className='rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100'
          >
            Reset all local edits
          </button>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-2 text-xs'>
        <span
          className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-[0.12em] ${
            isDirty
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {isDirty ? "Unsaved changes" : "Saved state"}
        </span>

        {hasOverride ? (
          <span className='rounded-full bg-sky-100 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-sky-800'>
            Local override active
          </span>
        ) : null}
      </div>

      {issues.length > 0 ? (
        <div className='mt-5 rounded-2xl border border-red-200 bg-red-50 p-4'>
          <div className='text-xs font-semibold uppercase tracking-[0.12em] text-red-700'>
            Validation issues
          </div>
          <ul className='mt-2 space-y-1 text-sm text-red-900'>
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className='mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900'>
          No validation issues detected.
        </div>
      )}

      <div className='mt-6 grid gap-6 xl:grid-cols-2'>
        <div className='space-y-4'>
          <Field label='Term'>
            <TextInput
              value={draft.term}
              onChange={(event) => updateField("term", event.target.value)}
            />
          </Field>

          <Field label='Description'>
            <TextArea
              value={draft.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
          </Field>

          <Field label='Notes'>
            <TextArea
              value={draft.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </Field>

          <Field label='Synonyms' hint='Comma separated'>
            <TextArea
              value={draft.synonymsText}
              onChange={(event) =>
                updateField("synonymsText", event.target.value)
              }
            />
          </Field>

          <Field
            label='Related entry ids'
            hint='Comma separated ids. Labels are auto-filled from ids.'
          >
            <TextArea
              value={draft.relatedText}
              onChange={(event) =>
                updateField("relatedText", event.target.value)
              }
            />
          </Field>
        </div>

        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Field label='Type'>
              <SelectInput
                value={draft.type}
                onChange={(event) => updateField("type", event.target.value)}
                options={TYPE_OPTIONS}
              />
            </Field>

            <Field label='Scale'>
              <SelectInput
                value={draft.scale}
                onChange={(event) => updateField("scale", event.target.value)}
                options={SCALE_OPTIONS}
              />
            </Field>

            <Field label='Domain'>
              <SelectInput
                value={draft.domain}
                onChange={(event) => updateField("domain", event.target.value)}
                options={DOMAIN_OPTIONS}
              />
            </Field>

            <Field label='Status'>
              <SelectInput
                value={draft.status}
                onChange={(event) => updateField("status", event.target.value)}
                options={STATUS_OPTIONS}
              />
            </Field>

            <Field label='Region'>
              <SelectInput
                value={draft.region}
                onChange={(event) => updateField("region", event.target.value)}
                options={REGION_OPTIONS}
              />
            </Field>

            <Field label='Section'>
              <TextInput
                value={draft.section}
                onChange={(event) => updateField("section", event.target.value)}
              />
            </Field>

            <Field label='Source category'>
              <SelectInput
                value={draft.sourceCategory}
                onChange={(event) =>
                  updateField("sourceCategory", event.target.value)
                }
                options={SOURCE_CATEGORY_OPTIONS}
              />
            </Field>
          </div>

          <div className='rounded-2xl border border-stone-200 bg-stone-50/80 p-4'>
            <div className='mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500'>
              Semantic fields
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field label='Privacy'>
                <SelectInput
                  value={draft.privacyLevel}
                  onChange={(event) =>
                    updateField("privacyLevel", event.target.value)
                  }
                  options={PRIVACY_OPTIONS}
                />
              </Field>

              <Field label='Enclosure'>
                <SelectInput
                  value={draft.enclosureType}
                  onChange={(event) =>
                    updateField("enclosureType", event.target.value)
                  }
                  options={ENCLOSURE_OPTIONS}
                />
              </Field>

              <Field label='Circulation role'>
                <SelectInput
                  value={draft.circulationRole}
                  onChange={(event) =>
                    updateField("circulationRole", event.target.value)
                  }
                  options={CIRCULATION_ROLE_OPTIONS}
                />
              </Field>

              <Field label='Social role'>
                <SelectInput
                  value={draft.socialRole}
                  onChange={(event) =>
                    updateField("socialRole", event.target.value)
                  }
                  options={SOCIAL_ROLE_OPTIONS}
                />
              </Field>

              <Field label='Spatial logic'>
                <SelectInput
                  value={draft.spatialLogic}
                  onChange={(event) =>
                    updateField("spatialLogic", event.target.value)
                  }
                  options={SPATIAL_LOGIC_OPTIONS}
                />
              </Field>

              <Field label='Cultural specificity'>
                <SelectInput
                  value={draft.culturalSpecificity}
                  onChange={(event) =>
                    updateField("culturalSpecificity", event.target.value)
                  }
                  options={CULTURAL_SPECIFICITY_OPTIONS}
                />
              </Field>

              <Field label='Ritual weight'>
                <SelectInput
                  value={draft.ritualWeight}
                  onChange={(event) =>
                    updateField("ritualWeight", event.target.value)
                  }
                  options={RITUAL_WEIGHT_OPTIONS}
                />
              </Field>

              <Field label='Climate response'>
                <SelectInput
                  value={draft.climateResponse}
                  onChange={(event) =>
                    updateField("climateResponse", event.target.value)
                  }
                  options={CLIMATE_RESPONSE_OPTIONS}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
