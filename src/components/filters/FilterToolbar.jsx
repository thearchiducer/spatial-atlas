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
  SORT_OPTIONS,
  SPATIAL_LOGIC_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  withAllOption,
  CIRCULATION_ROLE_OPTIONS,
} from "../../constants/semanticVocabulary.js";

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
          e.currentTarget.style.borderColor = "var(--tone-info-border)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
        }}
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option || "All" : option.label;

          return (
            <option key={`${optionLabel}-${optionValue}`} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ActiveFilterTag({ children, tone = "neutral" }) {
  const style =
    tone === "accent"
      ? {
          borderColor: "var(--tone-warning-border)",
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
        }
      : {
          borderColor: "var(--border-color)",
          background: "var(--bg-muted)",
          color: "var(--text-secondary)",
        };

  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={style}
    >
      {children}
    </span>
  );
}

export default function FilterToolbar({
  filters,
  updateFilter,
  clearFilters,
  resetView,
}) {
  const regionOptions = withAllOption(
    [...REGION_OPTIONS, filters.region].filter(
      (value, index, array) => value && array.indexOf(value) === index,
    ),
  );

  const hasSemanticFilters =
    filters.privacyLevel ||
    filters.enclosureType ||
    filters.circulationRole ||
    filters.socialRole ||
    filters.spatialLogic ||
    filters.culturalSpecificity ||
    filters.ritualWeight ||
    filters.climateResponse;

  const hasAnyFilters =
    filters.query ||
    filters.type ||
    filters.scale ||
    filters.domain ||
    filters.status ||
    filters.region ||
    hasSemanticFilters ||
    (filters.sortBy && filters.sortBy !== "term");

  return (
    <section
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div className='space-y-4'>
        <div
          className='border-b pb-4'
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end'>
            <div>
              <label className='flex flex-col gap-1'>
                <span
                  className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                  style={{ color: "var(--text-muted)" }}
                >
                  Search atlas
                </span>

                <input
                  id='atlas-search'
                  type='text'
                  value={filters.query}
                  onChange={(event) =>
                    updateFilter("query", event.target.value)
                  }
                  placeholder='Search by term, synonym, concept, or semantic intent'
                  className='w-full border px-4 py-3 text-sm outline-none transition'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--tone-info-border)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                  }}
                />
              </label>
            </div>

            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={clearFilters}
                className='border px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition'
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }}
              >
                Clear filters
              </button>

              <button
                type='button'
                onClick={resetView}
                className='border px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition'
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }}
              >
                Reset view
              </button>
            </div>
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <SelectField
            label='Type'
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
            options={withAllOption(TYPE_OPTIONS)}
          />

          <SelectField
            label='Scale'
            value={filters.scale}
            onChange={(event) => updateFilter("scale", event.target.value)}
            options={withAllOption(SCALE_OPTIONS)}
          />

          <SelectField
            label='Domain'
            value={filters.domain}
            onChange={(event) => updateFilter("domain", event.target.value)}
            options={withAllOption(DOMAIN_OPTIONS)}
          />

          <SelectField
            label='Status'
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            options={withAllOption(STATUS_OPTIONS)}
          />

          <SelectField
            label='Region'
            value={filters.region}
            onChange={(event) => updateFilter("region", event.target.value)}
            options={regionOptions}
          />

          <SelectField
            label='Sort'
            value={filters.sortBy}
            onChange={(event) => updateFilter("sortBy", event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
          }}
        >
          <div className='flex flex-col gap-2 md:flex-row md:items-start md:justify-between'>
            <div>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                style={{ color: "var(--text-muted)" }}
              >
                Semantic filters
              </div>
              <p
                className='mt-1 text-sm leading-relaxed'
                style={{ color: "var(--text-secondary)" }}
              >
                Filter by privacy, enclosure, circulation, social role, spatial
                logic, ritual weight, climate response, and cultural
                specificity.
              </p>
            </div>

            {hasSemanticFilters ? (
              <span
                className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
                style={{
                  borderColor: "var(--tone-warning-border)",
                  background: "var(--tone-warning-bg)",
                  color: "var(--tone-warning-text)",
                }}
              >
                Active
              </span>
            ) : null}
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <SelectField
              label='Privacy'
              value={filters.privacyLevel}
              onChange={(event) =>
                updateFilter("privacyLevel", event.target.value)
              }
              options={withAllOption(PRIVACY_OPTIONS)}
            />

            <SelectField
              label='Enclosure'
              value={filters.enclosureType}
              onChange={(event) =>
                updateFilter("enclosureType", event.target.value)
              }
              options={withAllOption(ENCLOSURE_OPTIONS)}
            />

            <SelectField
              label='Circulation'
              value={filters.circulationRole}
              onChange={(event) =>
                updateFilter("circulationRole", event.target.value)
              }
              options={withAllOption(CIRCULATION_ROLE_OPTIONS)}
            />

            <SelectField
              label='Social role'
              value={filters.socialRole}
              onChange={(event) =>
                updateFilter("socialRole", event.target.value)
              }
              options={withAllOption(SOCIAL_ROLE_OPTIONS)}
            />

            <SelectField
              label='Spatial logic'
              value={filters.spatialLogic}
              onChange={(event) =>
                updateFilter("spatialLogic", event.target.value)
              }
              options={withAllOption(SPATIAL_LOGIC_OPTIONS)}
            />

            <SelectField
              label='Cultural specificity'
              value={filters.culturalSpecificity}
              onChange={(event) =>
                updateFilter("culturalSpecificity", event.target.value)
              }
              options={withAllOption(CULTURAL_SPECIFICITY_OPTIONS)}
            />

            <SelectField
              label='Ritual weight'
              value={filters.ritualWeight}
              onChange={(event) =>
                updateFilter("ritualWeight", event.target.value)
              }
              options={withAllOption(RITUAL_WEIGHT_OPTIONS)}
            />

            <SelectField
              label='Climate response'
              value={filters.climateResponse}
              onChange={(event) =>
                updateFilter("climateResponse", event.target.value)
              }
              options={withAllOption(CLIMATE_RESPONSE_OPTIONS)}
            />
          </div>
        </div>

        {hasAnyFilters ? (
          <div
            className='border-t pt-3'
            style={{ borderColor: "var(--border-color)" }}
          >
            <div
              className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
              style={{ color: "var(--text-muted)" }}
            >
              Active filters
            </div>

            <div className='flex flex-wrap gap-2'>
              {filters.type ? (
                <ActiveFilterTag>{`Type · ${filters.type}`}</ActiveFilterTag>
              ) : null}

              {filters.scale ? (
                <ActiveFilterTag>{`Scale · ${filters.scale}`}</ActiveFilterTag>
              ) : null}

              {filters.domain ? (
                <ActiveFilterTag>{`Domain · ${filters.domain}`}</ActiveFilterTag>
              ) : null}

              {filters.status ? (
                <ActiveFilterTag>{`Status · ${filters.status}`}</ActiveFilterTag>
              ) : null}

              {filters.region ? (
                <ActiveFilterTag>{`Region · ${filters.region}`}</ActiveFilterTag>
              ) : null}

              {filters.privacyLevel ? (
                <ActiveFilterTag tone='accent'>
                  {`Privacy · ${filters.privacyLevel}`}
                </ActiveFilterTag>
              ) : null}

              {filters.enclosureType ? (
                <ActiveFilterTag tone='accent'>
                  {`Enclosure · ${filters.enclosureType}`}
                </ActiveFilterTag>
              ) : null}

              {filters.circulationRole ? (
                <ActiveFilterTag tone='accent'>
                  {`Circulation · ${filters.circulationRole}`}
                </ActiveFilterTag>
              ) : null}

              {filters.socialRole ? (
                <ActiveFilterTag tone='accent'>
                  {`Social · ${filters.socialRole}`}
                </ActiveFilterTag>
              ) : null}

              {filters.spatialLogic ? (
                <ActiveFilterTag tone='accent'>
                  {`Logic · ${filters.spatialLogic}`}
                </ActiveFilterTag>
              ) : null}

              {filters.culturalSpecificity ? (
                <ActiveFilterTag tone='accent'>
                  {`Culture · ${filters.culturalSpecificity}`}
                </ActiveFilterTag>
              ) : null}

              {filters.ritualWeight ? (
                <ActiveFilterTag tone='accent'>
                  {`Ritual · ${filters.ritualWeight}`}
                </ActiveFilterTag>
              ) : null}

              {filters.climateResponse ? (
                <ActiveFilterTag tone='accent'>
                  {`Climate · ${filters.climateResponse}`}
                </ActiveFilterTag>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
