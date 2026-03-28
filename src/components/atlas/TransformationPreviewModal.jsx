function getDelta(beforeValue, afterValue) {
  return afterValue - beforeValue;
}

function DeltaCard({ label, beforeValue, afterValue, invert = false }) {
  const delta = getDelta(beforeValue, afterValue);
  const isPositive = invert ? delta < 0 : delta > 0;

  const toneStyles =
    delta === 0
      ? {
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
          color: "var(--text-primary)",
        }
      : isPositive
        ? {
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#d1fae5",
          }
        : {
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.10)",
            color: "#fef3c7",
          };

  return (
    <div
      className='border px-4 py-3'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      <div className='text-[10px] uppercase tracking-[0.12em] opacity-70'>
        {label}
      </div>

      <div className='mt-1 text-sm font-semibold'>
        {beforeValue} → {afterValue}
      </div>

      <div className='mt-1 text-[11px] uppercase tracking-[0.08em] opacity-75'>
        Δ {delta}
      </div>
    </div>
  );
}

function IdentityShiftRow({ label, beforeValue, afterValue }) {
  const changed = beforeValue !== afterValue;

  return (
    <div
      className='flex flex-wrap items-center gap-2 border px-3 py-2'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.12em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>

      <div className='text-sm' style={{ color: "var(--text-secondary)" }}>
        {beforeValue || "None"}
      </div>

      <div style={{ color: "var(--text-muted)" }}>→</div>

      <div
        className='text-sm font-medium'
        style={{
          color: changed ? "#a7f3d0" : "var(--text-secondary)",
        }}
      >
        {afterValue || "None"}
      </div>

      {changed ? (
        <div
          className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.10)",
            color: "#a7f3d0",
          }}
        >
          Changed
        </div>
      ) : null}
    </div>
  );
}

function DiffListBlock({ title, items, emptyText, tone = "emerald" }) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "rgba(16,185,129,0.35)",
          background: "rgba(16,185,129,0.08)",
          textColor: "#d1fae5",
        }
      : tone === "amber"
        ? {
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.08)",
            textColor: "#fef3c7",
          }
        : {
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            textColor: "var(--text-primary)",
          };

  return (
    <div
      className='border'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.textColor,
      }}
    >
      <div className='border-b border-current/15 px-4 py-2.5'>
        <div className='text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80'>
          {title}
        </div>
      </div>

      <div className='divide-y divide-current/10'>
        {items.length ? (
          items.map((item) => (
            <div key={item.key || item.label} className='px-4 py-3'>
              <div className='text-sm font-medium'>{item.label}</div>
              {item.note ? (
                <div className='mt-1 text-[12.5px] leading-relaxed opacity-85'>
                  {item.note}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className='px-4 py-3 text-sm opacity-75'>{emptyText}</div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "rgba(16,185,129,0.35)",
          background: "rgba(16,185,129,0.10)",
          color: "#d1fae5",
        }
      : tone === "amber"
        ? {
            borderColor: "rgba(251,191,36,0.30)",
            background: "rgba(251,191,36,0.10)",
            color: "#fef3c7",
          }
        : tone === "sky"
          ? {
              borderColor: "rgba(56,189,248,0.35)",
              background: "rgba(56,189,248,0.10)",
              color: "#e0f2fe",
            }
          : tone === "violet"
            ? {
                borderColor: "rgba(168,85,247,0.35)",
                background: "rgba(168,85,247,0.10)",
                color: "#f3e8ff",
              }
            : {
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-primary)",
              };

  return (
    <div
      className='border px-4 py-3'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      <div className='text-[10px] uppercase tracking-[0.12em] opacity-70'>
        {label}
      </div>
      <div className='mt-1 text-sm font-semibold'>{value}</div>
    </div>
  );
}

export default function TransformationPreviewModal({
  transformation,
  transformationPlan,
  selectedEntryIds,
  applyMode,
  onChangeApplyMode,
  onToggleEntry,
  onSelectAll,
  onClearAll,
  onClose,
  onConfirm,
  simulatedPreview,
}) {
  if (!transformation || !transformationPlan?.weakerBoard) return null;

  const suggestedEntries = Array.isArray(transformation?.suggestedEntries)
    ? transformation.suggestedEntries.filter(Boolean)
    : [];

  const selectedCount = selectedEntryIds.length;
  const resultingEntryCount = simulatedPreview
    ? simulatedPreview.afterEntryCount
    : transformationPlan.weakerBoard.entryCount || 0;

  return (
    <div
      className='fixed inset-0 z-[80] px-4 py-6'
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div
        className='mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border shadow-2xl'
        style={{
          borderColor: "var(--border-color)",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className='sticky top-0 z-10 border-b px-5 py-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div
            className='text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Transformation preview
          </div>

          <h3
            className='mt-2 text-xl font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            {transformation.title}
          </h3>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            This transformation will apply to{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {transformationPlan.weakerBoard.boardName}
            </strong>
            .
          </p>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-4'>
          <div className='space-y-6'>
            <section className='grid gap-4 lg:grid-cols-2'>
              <div
                className='space-y-4 border p-4'
                style={{
                  borderColor: "var(--border-color)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Why
                  </div>
                  <div
                    className='mt-1 text-sm leading-relaxed'
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {transformation.why}
                  </div>
                </div>

                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Action
                  </div>
                  <div
                    className='mt-1 text-sm leading-relaxed'
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {transformation.action}
                  </div>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <MetricCard
                  label='Selected entries'
                  value={selectedCount}
                  tone='emerald'
                />
                <MetricCard
                  label='Resulting entry count'
                  value={resultingEntryCount}
                  tone='sky'
                />
                <MetricCard
                  label='Weaker direction'
                  value={transformationPlan.weakerBoard.boardName}
                />
                <MetricCard
                  label='Stronger direction'
                  value={transformationPlan.strongerBoard?.boardName || "None"}
                />
              </div>
            </section>
            <section className='space-y-3'>
              <div
                className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                style={{ color: "var(--text-muted)" }}
              >
                Apply mode
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => onChangeApplyMode?.("live")}
                  className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
                  style={
                    applyMode === "live"
                      ? {
                          borderColor: "rgba(168,85,247,0.35)",
                          background: "rgba(168,85,247,0.10)",
                          color: "#d8b4fe",
                        }
                      : {
                          borderColor: "var(--border-color)",
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  Apply to weaker direction
                </button>

                <button
                  type='button'
                  onClick={() => onChangeApplyMode?.("copy")}
                  className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
                  style={
                    applyMode === "copy"
                      ? {
                          borderColor: "rgba(168,85,247,0.35)",
                          background: "rgba(168,85,247,0.10)",
                          color: "#d8b4fe",
                        }
                      : {
                          borderColor: "var(--border-color)",
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  Create transformed copy
                </button>
              </div>

              <div
                className='text-sm leading-relaxed'
                style={{ color: "var(--text-secondary)" }}
              >
                {applyMode === "live"
                  ? "This transformation will modify the current weaker direction."
                  : "This transformation will create a new derived board and keep the weaker direction unchanged."}
              </div>
            </section>

            <section className='space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Suggested entries to add
                  </div>
                  <div className='mt-1 text-sm text-stone-600'>
                    Select which entries should be applied to the weaker
                    direction.
                  </div>
                </div>

                {suggestedEntries.length ? (
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={onSelectAll}
                      className='border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition'
                      style={{
                        borderColor: "var(--border-color)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Select all
                    </button>

                    <button
                      type='button'
                      onClick={onClearAll}
                      className='border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition'
                      style={{
                        borderColor: "var(--border-color)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                ) : null}
              </div>

              {suggestedEntries.length ? (
                <div className='space-y-2'>
                  {suggestedEntries.map((entry) => {
                    const isChecked = selectedEntryIds.includes(entry.id);

                    return (
                      <label
                        key={entry.id}
                        className='flex items-center justify-between gap-3 border px-3 py-2 transition'
                        style={
                          isChecked
                            ? {
                                borderColor: "rgba(16,185,129,0.35)",
                                background: "rgba(16,185,129,0.10)",
                              }
                            : {
                                borderColor: "var(--border-color)",
                                background: "rgba(255,255,255,0.03)",
                              }
                        }
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={isChecked}
                            onChange={() => onToggleEntry?.(entry.id)}
                            className='h-4 w-4 accent-stone-900'
                          />

                          <div className='min-w-0'>
                            <div
                              className='text-sm font-medium'
                              style={{ color: "var(--text-primary)" }}
                            >
                              {entry.term}
                            </div>
                            <div
                              className='text-[11px] uppercase tracking-[0.08em]'
                              style={{ color: "var(--text-muted)" }}
                            >
                              {entry.type || "Entry"}
                            </div>
                          </div>
                        </div>

                        <div
                          className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                          style={
                            isChecked
                              ? {
                                  borderColor: "rgba(16,185,129,0.35)",
                                  background: "rgba(16,185,129,0.10)",
                                  color: "#a7f3d0",
                                }
                              : {
                                  borderColor: "var(--border-color)",
                                  background: "rgba(255,255,255,0.03)",
                                  color: "var(--text-muted)",
                                }
                          }
                        >
                          {isChecked ? "Selected" : "Skipped"}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className='text-sm' style={{ color: "var(--text-muted)" }}>
                  This transformation does not require any additional entries.
                </div>
              )}
            </section>

            {transformation.focusTargets?.length ? (
              <section>
                <div
                  className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                  style={{ color: "var(--text-muted)" }}
                >
                  Focus targets inside weaker direction
                </div>

                <div className='mt-2 flex flex-wrap gap-2'>
                  {transformation.focusTargets.map((item) => (
                    <span
                      key={item.id}
                      className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
                      style={{
                        borderColor: "rgba(251,191,36,0.30)",
                        background: "rgba(251,191,36,0.10)",
                        color: "#fde68a",
                      }}
                    >
                      {item.term}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {simulatedPreview ? (
              <section
                className='space-y-5 border-t pt-5'
                style={{ borderColor: "var(--border-color)" }}
              >
                <div
                  className='text-[10px] font-semibold uppercase tracking-[0.16em]'
                  style={{ color: "var(--text-muted)" }}
                >
                  Simulated impact
                </div>

                <div className='grid gap-3 md:grid-cols-5'>
                  <DeltaCard
                    label='Score'
                    beforeValue={simulatedPreview.beforeAnalysis.score}
                    afterValue={simulatedPreview.afterAnalysis.score}
                  />
                  <DeltaCard
                    label='Missing'
                    beforeValue={simulatedPreview.beforeAnalysis.missing.length}
                    afterValue={simulatedPreview.afterAnalysis.missing.length}
                    invert
                  />
                  <DeltaCard
                    label='Tensions'
                    beforeValue={
                      simulatedPreview.beforeAnalysis.tensions.length
                    }
                    afterValue={simulatedPreview.afterAnalysis.tensions.length}
                    invert
                  />
                  <DeltaCard
                    label='Next transformations'
                    beforeValue={
                      simulatedPreview.beforeAnalysis.nextMoves.length
                    }
                    afterValue={simulatedPreview.afterAnalysis.nextMoves.length}
                  />
                  <DeltaCard
                    label='Entries'
                    beforeValue={simulatedPreview.beforeEntryCount}
                    afterValue={simulatedPreview.afterEntryCount}
                  />
                </div>

                <section className='space-y-3'>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Identity shift summary
                  </div>

                  <div className='space-y-2'>
                    <IdentityShiftRow
                      label='Privacy'
                      beforeValue={
                        simulatedPreview.beforeAnalysis.identity.privacyModel
                      }
                      afterValue={
                        simulatedPreview.afterAnalysis.identity.privacyModel
                      }
                    />
                    <IdentityShiftRow
                      label='Circulation'
                      beforeValue={
                        simulatedPreview.beforeAnalysis.identity
                          .circulationModel
                      }
                      afterValue={
                        simulatedPreview.afterAnalysis.identity.circulationModel
                      }
                    />
                    <IdentityShiftRow
                      label='Social'
                      beforeValue={
                        simulatedPreview.beforeAnalysis.identity.socialModel
                      }
                      afterValue={
                        simulatedPreview.afterAnalysis.identity.socialModel
                      }
                    />
                    <IdentityShiftRow
                      label='Climate'
                      beforeValue={
                        simulatedPreview.beforeAnalysis.identity.climateModel
                      }
                      afterValue={
                        simulatedPreview.afterAnalysis.identity.climateModel
                      }
                    />
                    <IdentityShiftRow
                      label='Pattern'
                      beforeValue={
                        simulatedPreview.beforeAnalysis.identity.spatialPattern
                      }
                      afterValue={
                        simulatedPreview.afterAnalysis.identity.spatialPattern
                      }
                    />
                  </div>
                </section>

                <section className='space-y-3'>
                  <div
                    className='text-[10px] font-semibold uppercase tracking-[0.12em]'
                    style={{ color: "var(--text-muted)" }}
                  >
                    Issue changes
                  </div>

                  <div className='grid gap-4 xl:grid-cols-2'>
                    <DiffListBlock
                      title='Missing items resolved'
                      items={simulatedPreview.missingDiff.removed}
                      emptyText='No missing items are resolved.'
                      tone='emerald'
                    />

                    <DiffListBlock
                      title='New missing items introduced'
                      items={simulatedPreview.missingDiff.introduced}
                      emptyText='No new missing items are introduced.'
                      tone='amber'
                    />

                    <DiffListBlock
                      title='Tensions resolved'
                      items={simulatedPreview.tensionDiff.removed}
                      emptyText='No tensions are resolved.'
                      tone='emerald'
                    />

                    <DiffListBlock
                      title='New tensions introduced'
                      items={simulatedPreview.tensionDiff.introduced}
                      emptyText='No new tensions are introduced.'
                      tone='amber'
                    />
                  </div>
                </section>
              </section>
            ) : null}
          </div>
        </div>

        <div
          className='sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-surface)",
          }}
        >
          <div className='text-sm' style={{ color: "var(--text-secondary)" }}>
            {selectedCount} selected
            {suggestedEntries.length ? ` of ${suggestedEntries.length}` : ""}
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>

            <button
              type='button'
              onClick={onConfirm}
              disabled={suggestedEntries.length > 0 && selectedCount === 0}
              className='border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40'
              style={{
                borderColor: "rgba(16,185,129,0.35)",
                background: "rgba(16,185,129,0.10)",
                color: "#a7f3d0",
              }}
            >
              {applyMode === "live"
                ? "Apply to weaker direction"
                : "Create transformed copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
