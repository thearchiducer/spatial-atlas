import { useRef, useState } from "react";

function annotationLabel(children) {
  return (
    <div className='text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled = false,
}) {
  const classes =
    variant === "primary"
      ? "border-stone-900 bg-stone-900 text-white hover:bg-stone-800"
      : variant === "violet"
        ? "border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100"
        : variant === "danger"
          ? "border-red-300 bg-red-50 text-red-900 hover:bg-red-100"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100";

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}
    >
      {children}
    </button>
  );
}

function SmallInfoCard({ label, value }) {
  return (
    <div className='border border-stone-300 bg-white px-4 py-3'>
      <div className='text-[10px] uppercase tracking-[0.12em] text-stone-500'>
        {label}
      </div>
      <div className='mt-1 text-sm font-semibold text-stone-900'>{value}</div>
    </div>
  );
}

export default function DatasetIOPanel({
  overrideCount = 0,
  onExportDataset,
  onExportOverrides,
  onExportIntelligenceState,
  onImportPayload,
  onClearOverrides,
}) {
  const fileInputRef = useRef(null);
  const [pendingMode, setPendingMode] = useState("merge");

  function openFilePicker(mode) {
    setPendingMode(mode);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const text = await file.text();
      onImportPayload?.(text, pendingMode);
    } catch (error) {
      window.alert(
        `Could not read the selected file.\n\n${
          error?.message || "Unknown error."
        }`,
      );
    }
  }

  return (
    <section className='border border-stone-300 bg-white p-5'>
      <div className='border-b border-stone-200 pb-4'>
        {annotationLabel("Dataset I/O")}
        <h2 className='mt-2 text-xl font-semibold tracking-tight text-stone-900'>
          Export / import dataset
        </h2>

        <p className='mt-2 text-sm leading-relaxed text-stone-600'>
          Export the current atlas snapshot, local overrides, or the full
          intelligence workspace state. Import JSON back later to continue the
          authoring workflow.
        </p>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <SmallInfoCard label='Local overrides' value={overrideCount} />
        <SmallInfoCard label='Import mode' value={pendingMode} />
        <SmallInfoCard label='Workspace export' value='Enabled' />
      </div>

      <div className='mt-5 grid gap-4 xl:grid-cols-2'>
        <div className='border border-stone-200 bg-stone-50/60 p-4'>
          {annotationLabel("Export")}

          <div className='mt-3 flex flex-wrap gap-2'>
            <ActionButton onClick={onExportDataset} variant='primary'>
              Export full dataset JSON
            </ActionButton>

            <ActionButton onClick={onExportOverrides}>
              Export overrides JSON
            </ActionButton>

            <ActionButton onClick={onExportIntelligenceState} variant='violet'>
              Export intelligence state
            </ActionButton>
          </div>

          <p className='mt-3 text-sm leading-relaxed text-stone-600'>
            Full dataset export writes the active atlas state. Override export
            writes only local edits. Intelligence state export writes the wider
            workspace context including boards, versions, decision history,
            transformation history, and learned preference profile.
          </p>
        </div>

        <div className='border border-stone-200 bg-stone-50/60 p-4'>
          {annotationLabel("Import")}

          <div className='mt-3 flex flex-wrap gap-2'>
            <ActionButton
              onClick={() => openFilePicker("merge")}
              variant='primary'
            >
              Import and merge
            </ActionButton>

            <ActionButton onClick={() => openFilePicker("replace")}>
              Import and replace
            </ActionButton>

            <ActionButton
              onClick={onClearOverrides}
              variant='danger'
              disabled={overrideCount === 0}
            >
              Clear all overrides
            </ActionButton>
          </div>

          <p className='mt-3 text-sm leading-relaxed text-stone-600'>
            Import accepts a full dataset export, an overrides export, a raw
            entry array, or a raw overrides object keyed by entry id.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='.json,application/json,text/json'
        onChange={handleFileChange}
        className='hidden'
      />
    </section>
  );
}
