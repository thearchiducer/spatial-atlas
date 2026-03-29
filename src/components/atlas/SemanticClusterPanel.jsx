import { useState } from "react";
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

function familyTone(index) {
  const tones = [
    {
      borderColor: "var(--tone-info-border)",
      background: "var(--tone-info-bg)",
      color: "var(--tone-info-text)",
    },
    {
      borderColor: "var(--tone-success-border)",
      background: "var(--tone-success-bg)",
      color: "var(--tone-success-text)",
    },
    {
      borderColor: "var(--tone-violet-border)",
      background: "var(--tone-violet-bg)",
      color: "var(--tone-violet-text)",
    },
    {
      borderColor: "var(--tone-warning-border)",
      background: "var(--tone-warning-bg)",
      color: "var(--tone-warning-text)",
    },
  ];

  return tones[index % tones.length];
}

function MetricChip({ label, value }) {
  return (
    <span
      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-muted)",
        color: "var(--text-secondary)",
      }}
    >
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
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex items-start justify-between gap-3 border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          type='button'
          onClick={() => onSelectEntry && onSelectEntry(entry.id)}
          className='min-w-0 flex-1 text-left'
        >
          <h4
            className='text-base font-semibold tracking-tight hover:underline'
            style={{ color: "var(--text-primary)" }}
          >
            {entry.term}
          </h4>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {entry.description}
          </p>
        </button>

        <div
          className='border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
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
            background: "var(--bg-muted)",
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
            background: "var(--bg-muted)",
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
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
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
    <section
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div>
          {annotationLabel("Cluster")}
          <h3
            className='mt-2 text-base font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {cluster.title}
          </h3>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {cluster.description}
          </p>
          <p
            className='mt-2 text-sm font-medium'
            style={{ color: "var(--text-secondary)" }}
          >
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
        <div
          className='mt-4 border-t pt-4'
          style={{ borderColor: "var(--border-color)" }}
        >
          <button
            type='button'
            onClick={() => setIsExpanded((current) => !current)}
            className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
            }}
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
  const toneStyle = familyTone(index);

  return (
    <section
      className='border p-5'
      style={{
        borderColor: toneStyle.borderColor,
        background: toneStyle.background,
        color: toneStyle.color,
      }}
    >
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
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "rgba(255,255,255,0.18)",
            background: isActive
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.06)",
            color: "currentColor",
          }}
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
      <section
        className='border p-6'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        {annotationLabel("Semantic clusters")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          No semantic clusters available
        </h2>
        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          Adjust your filters or expand the dataset to generate stronger
          semantic groupings.
        </p>
      </section>
    );
  }

  return (
    <div className='space-y-5'>
      <section
        className='border p-6'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='border-b pb-4'
          style={{ borderColor: "var(--border-color)" }}
        >
          {annotationLabel("Semantic clustering layout")}
          <h2
            className='mt-2 text-2xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            Semantic family map
          </h2>

          <p
            className='mt-2 max-w-3xl text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
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

      <section
        className='border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div className='flex flex-wrap gap-2'>
          {families.map((family, index) => {
            const isActive = family.id === resolvedActiveFamilyId;
            const toneStyle = familyTone(index);

            return (
              <button
                key={family.id}
                type='button'
                onClick={() => setActiveFamilyId(family.id)}
                className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition'
                style={
                  isActive
                    ? toneStyle
                    : {
                        borderColor: "var(--border-color)",
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                      }
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
