import { useRef, useState } from "react";

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

function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled = false,
}) {
  const style =
    variant === "primary"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
        }
      : variant === "violet"
        ? {
            borderColor: "var(--tone-violet-border)",
            background: "var(--tone-violet-bg)",
            color: "var(--tone-violet-text)",
          }
        : variant === "danger"
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
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50'
      style={style}
    >
      {children}
    </button>
  );
}

function SmallInfoCard({ label, value }) {
  return (
    <div
      className='border px-4 py-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='text-[10px] uppercase tracking-[0.12em]'
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      <div
        className='mt-1 text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
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
    <section
      className='border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        {annotationLabel("Dataset I/O")}
        <h2
          className='mt-2 text-xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          Export / import dataset
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
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
        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
          }}
        >
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

          <p
            className='mt-3 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            Full dataset export writes the active atlas state. Override export
            writes only local edits. Intelligence state export writes the wider
            workspace context including boards, versions, decision history,
            transformation history, and learned preference profile.
          </p>
        </div>

        <div
          className='border p-4'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
          }}
        >
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

          <p
            className='mt-3 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
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
