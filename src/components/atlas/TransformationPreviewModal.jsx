function getDelta(beforeValue, afterValue) {
  return afterValue - beforeValue;
}
function DeltaCard({ label, beforeValue, afterValue, invert = false }) {
  const delta = getDelta(beforeValue, afterValue);
  const isPositive = invert ? delta < 0 : delta > 0;

  const toneClasses =
    delta === 0
      ? "border-stone-300 bg-stone-50 text-stone-900"
      : isPositive
        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
        : "border-amber-300 bg-amber-50 text-amber-950";

  return (
    <div className={`border px-4 py-3 ${toneClasses}`}>
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
    <div className='flex flex-wrap items-center gap-2 border border-stone-200 bg-stone-50 px-3 py-2'>
      <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
        {label}
      </div>

      <div className='text-sm text-stone-700'>{beforeValue || "None"}</div>

      <div className='text-stone-400'>→</div>

      <div
        className={`text-sm font-medium ${
          changed ? "text-emerald-700" : "text-stone-700"
        }`}
      >
        {afterValue || "None"}
      </div>

      {changed ? (
        <div className='border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-900'>
          Changed
        </div>
      ) : null}
    </div>
  );
}
function DiffListBlock({ title, items, emptyText, tone = "emerald" }) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : tone === "amber"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : "border-stone-300 bg-stone-50 text-stone-950";

  return (
    <div className={`border ${toneClasses}`}>
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
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : tone === "amber"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : tone === "sky"
          ? "border-sky-300 bg-sky-50 text-sky-950"
          : tone === "violet"
            ? "border-violet-300 bg-violet-50 text-violet-950"
            : "border-stone-300 bg-stone-50 text-stone-900";

  return (
    <div className={`border px-4 py-3 ${toneClasses}`}>
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
    <div className='fixed inset-0 z-[80] bg-stone-950/30 px-4 py-6'>
      <div className='mx-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-stone-300 bg-white shadow-2xl'>
        <div className='sticky top-0 z-10 border-b border-stone-200 bg-white px-5 py-4'>
          <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
            Transformation preview
          </div>

          <h3 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
            {transformation.title}
          </h3>

          <p className='mt-2 text-sm leading-relaxed text-stone-600'>
            This transformation will apply to{" "}
            <strong className='text-stone-900'>
              {transformationPlan.weakerBoard.boardName}
            </strong>
            .
          </p>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-4'>
          <div className='space-y-6'>
            <section className='grid gap-4 lg:grid-cols-2'>
              <div className='space-y-4 border border-stone-200 bg-stone-50 p-4'>
                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
                    Why
                  </div>
                  <div className='mt-1 text-sm leading-relaxed text-stone-600'>
                    {transformation.why}
                  </div>
                </div>

                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
                    Action
                  </div>
                  <div className='mt-1 text-sm leading-relaxed text-stone-600'>
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
              <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
                Apply mode
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => onChangeApplyMode?.("live")}
                  className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition ${
                    applyMode === "live"
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  Apply to weaker direction
                </button>

                <button
                  type='button'
                  onClick={() => onChangeApplyMode?.("copy")}
                  className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition ${
                    applyMode === "copy"
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  Create transformed copy
                </button>
              </div>

              <div className='text-sm leading-relaxed text-stone-600'>
                {applyMode === "live"
                  ? "This transformation will modify the current weaker direction."
                  : "This transformation will create a new derived board and keep the weaker direction unchanged."}
              </div>
            </section>

            <section className='space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
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
                      className='border border-stone-300 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-stone-700 transition hover:bg-stone-100'
                    >
                      Select all
                    </button>

                    <button
                      type='button'
                      onClick={onClearAll}
                      className='border border-stone-300 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-stone-700 transition hover:bg-stone-100'
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
                        className={`flex items-center justify-between gap-3 border px-3 py-2 transition ${
                          isChecked
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-stone-200 bg-stone-50"
                        }`}
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={isChecked}
                            onChange={() => onToggleEntry?.(entry.id)}
                            className='h-4 w-4 accent-stone-900'
                          />

                          <div className='min-w-0'>
                            <div className='text-sm font-medium text-stone-900'>
                              {entry.term}
                            </div>
                            <div className='text-[11px] uppercase tracking-[0.08em] text-stone-500'>
                              {entry.type || "Entry"}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                            isChecked
                              ? "border-emerald-300 bg-white text-emerald-900"
                              : "border-stone-300 bg-white text-stone-500"
                          }`}
                        >
                          {isChecked ? "Selected" : "Skipped"}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className='text-sm text-stone-500'>
                  This transformation does not require any additional entries.
                </div>
              )}
            </section>

            {transformation.focusTargets?.length ? (
              <section>
                <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
                  Focus targets inside weaker direction
                </div>

                <div className='mt-2 flex flex-wrap gap-2'>
                  {transformation.focusTargets.map((item) => (
                    <span
                      key={item.id}
                      className='border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-amber-900'
                    >
                      {item.term}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {simulatedPreview ? (
              <section className='space-y-5 border-t border-stone-200 pt-5'>
                <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
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
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
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
                  <div className='text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500'>
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

        <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-5 py-4'>
          <div className='text-sm text-stone-600'>
            {selectedCount} selected
            {suggestedEntries.length ? ` of ${suggestedEntries.length}` : ""}
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='border border-stone-300 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-stone-700 transition hover:bg-stone-100'
            >
              Cancel
            </button>

            <button
              type='button'
              onClick={onConfirm}
              disabled={suggestedEntries.length > 0 && selectedCount === 0}
              className='border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400'
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
