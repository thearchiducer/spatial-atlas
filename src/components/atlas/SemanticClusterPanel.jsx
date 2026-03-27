import { useState } from "react";
import SemanticChips from "./SemanticChips";
import SemanticExplanationChips from "../semantic/SemanticExplanationChips";

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function familyTone(index) {
  const tones = [
    "border-sky-300 bg-sky-50/40 text-sky-950",
    "border-emerald-300 bg-emerald-50/40 text-emerald-950",
    "border-violet-300 bg-violet-50/40 text-violet-950",
    "border-amber-300 bg-amber-50/40 text-amber-950",
  ];

  return tones[index % tones.length];
}

function MetricChip({ label, value }) {
  return (
    <span className='border border-stone-300 bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-stone-700'>
      {label} · {value}
    </span>
  );
}

function ClusterEntryCard({
  entry,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  return (
    <div className='border border-stone-200 bg-white p-4'>
      <div className='flex items-start justify-between gap-3 border-b border-stone-200 pb-4'>
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='min-w-0 flex-1 text-left'
        >
          <h4 className='text-base font-semibold tracking-tight text-stone-900 hover:underline'>
            {entry.term}
          </h4>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            {entry.description}
          </p>
        </button>

        <div className='border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700'>
          {entry.__clusterScore || 0}
        </div>
      </div>

      <div className='mt-4'>
        {annotationLabel("Semantic profile")}
        <SemanticChips entry={entry} compact limit={4} />
      </div>

      {entry.__clusterReasons && entry.__clusterReasons.length ? (
        <div className='mt-4'>
          {annotationLabel("Cluster reasons")}
          <div className='mt-2'>
            <SemanticExplanationChips
              breakdown={entry.__clusterReasons.map((reason) => ({
                label: reason,
                points: 2,
              }))}
              compact
              limit={4}
            />
          </div>
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

function ClusterCard({
  cluster,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleEntries = isExpanded
    ? cluster.entries
    : cluster.entries.slice(0, 4);

  return (
    <section className='border border-stone-200 bg-white p-4'>
      <div className='flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Cluster")}
          <h3 className='mt-2 text-base font-semibold tracking-tight text-stone-900'>
            {cluster.title}
          </h3>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            {cluster.description}
          </p>
          <p className='mt-2 text-sm font-medium text-stone-700'>
            {cluster.summaryLabel}
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <MetricChip label='Entries' value={cluster.metrics.count} />
          <MetricChip label='Types' value={cluster.metrics.types} />
          <MetricChip label='Domains' value={cluster.metrics.domains} />
          <MetricChip label='Regions' value={cluster.metrics.regions} />
        </div>
      </div>

      <div className='mt-4 grid gap-3 xl:grid-cols-2'>
        {visibleEntries.map((entry) => (
          <ClusterEntryCard
            key={entry.id}
            entry={entry}
            onSelectEntry={onSelectEntry}
            onCompareEntry={onCompareEntry}
            onTogglePinEntry={onTogglePinEntry}
          />
        ))}
      </div>

      {cluster.entries.length > 4 ? (
        <div className='mt-4 border-t border-stone-200 pt-4'>
          <button
            type='button'
            onClick={() => setIsExpanded((current) => !current)}
            className='border border-stone-300 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-stone-700 transition hover:bg-stone-100'
          >
            {isExpanded
              ? "Show less"
              : "Show all " + cluster.entries.length + " entries"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function FamilyPanel({
  family,
  index,
  activeFamilyId,
  onActivateFamily,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  const isActive = family.id === activeFamilyId;

  return (
    <section className={"border p-5 " + familyTone(index)}>
      <div className='flex flex-col gap-3 border-b border-current/15 pb-4 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Semantic family")}
          <h2 className='mt-2 text-xl font-semibold tracking-tight'>
            {family.title}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-relaxed opacity-80'>
            {family.description}
          </p>
        </div>

        <button
          type='button'
          onClick={() => onActivateFamily && onActivateFamily(family.id)}
          className='border border-current/20 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition hover:bg-white/80'
        >
          {isActive ? "Active family" : "Focus family"}
        </button>
      </div>

      <div className='mt-5 space-y-4'>
        {family.clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            onSelectEntry={onSelectEntry}
            onCompareEntry={onCompareEntry}
            onTogglePinEntry={onTogglePinEntry}
          />
        ))}
      </div>
    </section>
  );
}

export default function SemanticClusterPanel({
  clusters,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  let families = [];
  if (clusters && Array.isArray(clusters.families)) {
    families = clusters.families;
  }

  let layout = null;
  if (clusters && clusters.layout) {
    layout = clusters.layout;
  }

  const [activeFamilyId, setActiveFamilyId] = useState(null);

  let resolvedActiveFamilyId = null;
  if (
    activeFamilyId &&
    families.some((family) => family.id === activeFamilyId)
  ) {
    resolvedActiveFamilyId = activeFamilyId;
  } else if (families.length > 0) {
    resolvedActiveFamilyId = families[0].id;
  }

  let activeFamilies = families;
  if (resolvedActiveFamilyId) {
    const active = families.find(
      (family) => family.id === resolvedActiveFamilyId,
    );

    if (active) {
      activeFamilies = [
        active,
        ...families.filter((family) => family.id !== resolvedActiveFamilyId),
      ];
    }
  }

  if (!families.length) {
    return (
      <section className='border border-stone-300 bg-white p-6'>
        {annotationLabel("Semantic clusters")}
        <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
          No semantic clusters available
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Adjust your filters or expand the dataset to generate stronger
          semantic groupings.
        </p>
      </section>
    );
  }

  return (
    <div className='space-y-5'>
      <section className='border border-stone-300 bg-white p-6'>
        <div className='border-b border-stone-200 pb-4'>
          {annotationLabel("Semantic clustering layout")}
          <h2 className='mt-2 text-2xl font-semibold tracking-tight text-stone-900'>
            Semantic family map
          </h2>

          <p className='mt-2 max-w-3xl text-sm leading-relaxed text-stone-600'>
            Entries are grouped into multiple family systems: by domain, by
            social role plus spatial logic, by privacy plus climate behavior,
            and by region plus cultural specificity.
          </p>
        </div>

        {layout ? (
          <div className='mt-4 flex flex-wrap gap-2'>
            <MetricChip label='Families' value={layout.familyCount} />
            <MetricChip label='Clusters' value={layout.clusterCount} />
            <MetricChip label='Entries' value={layout.entryCount} />
          </div>
        ) : null}
      </section>

      <section className='border border-stone-300 bg-white p-4'>
        <div className='flex flex-wrap gap-2'>
          {families.map((family, index) => {
            const isActive = family.id === resolvedActiveFamilyId;

            return (
              <button
                key={family.id}
                type='button'
                onClick={() => setActiveFamilyId(family.id)}
                className={
                  "border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition " +
                  (isActive
                    ? familyTone(index)
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100")
                }
              >
                {family.title}
              </button>
            );
          })}
        </div>
      </section>

      <div className='space-y-5'>
        {activeFamilies.map((family, index) => (
          <FamilyPanel
            key={family.id}
            family={family}
            index={index}
            activeFamilyId={resolvedActiveFamilyId}
            onActivateFamily={setActiveFamilyId}
            onSelectEntry={onSelectEntry}
            onCompareEntry={onCompareEntry}
            onTogglePinEntry={onTogglePinEntry}
          />
        ))}
      </div>
    </div>
  );
}
