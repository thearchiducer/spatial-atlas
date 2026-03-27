import { useCallback } from "react";

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toOverrideMapFromEntries(entriesArray) {
  return Object.fromEntries(
    entriesArray
      .filter((entry) => entry && entry.id)
      .map((entry) => [entry.id, { ...entry }]),
  );
}

function normalizeImportedPayload(rawText) {
  const parsed = JSON.parse(rawText);

  if (Array.isArray(parsed)) {
    return {
      kind: "entries-array",
      overrides: toOverrideMapFromEntries(parsed),
    };
  }

  if (
    parsed &&
    parsed.exportType === "architectural-atlas-dataset" &&
    Array.isArray(parsed.entries)
  ) {
    return {
      kind: "dataset-export",
      overrides: toOverrideMapFromEntries(parsed.entries),
    };
  }

  if (
    parsed &&
    parsed.exportType === "architectural-atlas-overrides" &&
    parsed.overrides &&
    typeof parsed.overrides === "object" &&
    !Array.isArray(parsed.overrides)
  ) {
    return {
      kind: "overrides-export",
      overrides: parsed.overrides,
    };
  }

  if (parsed && Array.isArray(parsed.entries)) {
    return {
      kind: "entries-wrapper",
      overrides: toOverrideMapFromEntries(parsed.entries),
    };
  }

  if (
    parsed &&
    parsed.overrides &&
    typeof parsed.overrides === "object" &&
    !Array.isArray(parsed.overrides)
  ) {
    return {
      kind: "overrides-wrapper",
      overrides: parsed.overrides,
    };
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return {
      kind: "override-map",
      overrides: parsed,
    };
  }

  throw new Error("Unsupported JSON structure.");
}

export default function useAtlasEntryOverrides({
  entries,
  entryOverrides,
  setEntryOverrides,
  setSelectedEntryId,
  setEditingEntryId,
  setActiveView,
  mergeEntriesWithOverrides,
  baseEntries,
  validateEntries,
}) {
  const handleOpenEditor = useCallback(
    (entryId) => {
      setActiveView("atlas");
      setSelectedEntryId(entryId);
      setEditingEntryId(entryId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setActiveView, setSelectedEntryId, setEditingEntryId],
  );

  const handleCloseEditor = useCallback(() => {
    setEditingEntryId(null);
  }, [setEditingEntryId]);

  const handleSaveEntryOverride = useCallback(
    (updatedEntry) => {
      setEntryOverrides((current) => ({
        ...current,
        [updatedEntry.id]: {
          ...updatedEntry,
        },
      }));
      setSelectedEntryId(updatedEntry.id);
      setEditingEntryId(updatedEntry.id);
    },
    [setEntryOverrides, setSelectedEntryId, setEditingEntryId],
  );

  const handleResetEntryOverride = useCallback(
    (entryId) => {
      setEntryOverrides((current) => {
        const next = { ...current };
        delete next[entryId];
        return next;
      });
    },
    [setEntryOverrides],
  );

  const handleResetAllEntryOverrides = useCallback(() => {
    setEntryOverrides({});
  }, [setEntryOverrides]);

  const handleExportDataset = useCallback(() => {
    downloadJsonFile("architectural-atlas-dataset.json", {
      exportType: "architectural-atlas-dataset",
      exportedAt: new Date().toISOString(),
      entryCount: entries.length,
      entries,
    });
  }, [entries]);

  const handleExportOverrides = useCallback(() => {
    downloadJsonFile("architectural-atlas-overrides.json", {
      exportType: "architectural-atlas-overrides",
      exportedAt: new Date().toISOString(),
      overrideCount: Object.keys(entryOverrides).length,
      overrides: entryOverrides,
    });
  }, [entryOverrides]);

  const handleImportPayload = useCallback(
    (rawText, mode) => {
      const importMode = mode || "merge";

      try {
        const normalized = normalizeImportedPayload(rawText);
        const nextOverrides =
          importMode === "replace"
            ? normalized.overrides
            : { ...entryOverrides, ...normalized.overrides };

        const mergedEntries = mergeEntriesWithOverrides(
          baseEntries,
          nextOverrides,
        );
        const issues = validateEntries(mergedEntries);

        if (issues.length > 0) {
          window.alert(
            "Import blocked because validation failed.\n\n" +
              issues.slice(0, 20).join("\n") +
              (issues.length > 20 ? "\n\n..." : ""),
          );
          return;
        }

        setEntryOverrides(nextOverrides);

        const importedIds = Object.keys(normalized.overrides || {});
        if (importedIds.length > 0) {
          setSelectedEntryId(importedIds[0]);
          setEditingEntryId(importedIds[0]);
          setActiveView("atlas");
        }

        window.alert(
          "Import successful.\n\nMode: " +
            importMode +
            "\nSource: " +
            normalized.kind +
            "\nImported entries: " +
            importedIds.length,
        );
      } catch (error) {
        window.alert(
          "Import failed.\n\n" +
            (error && error.message ? error.message : "Unsupported JSON file."),
        );
      }
    },
    [
      entryOverrides,
      setEntryOverrides,
      setSelectedEntryId,
      setEditingEntryId,
      setActiveView,
      mergeEntriesWithOverrides,
      baseEntries,
      validateEntries,
    ],
  );

  return {
    handleOpenEditor,
    handleCloseEditor,
    handleSaveEntryOverride,
    handleResetEntryOverride,
    handleResetAllEntryOverrides,
    handleExportDataset,
    handleExportOverrides,
    handleImportPayload,
  };
}
