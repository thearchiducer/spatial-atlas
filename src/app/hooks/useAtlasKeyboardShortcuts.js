import { useEffect } from "react";

export default function useAtlasKeyboardShortcuts({
  atlas,
  activeView,
  setActiveView,
  minimalMode,
  setMinimalMode,
  showShortcuts,
  setShowShortcuts,
  setShowSecondaryTools,
  selectedEntry,
  editingEntryId,
  handleClearSelection,
  handleResetView,
}) {
  useEffect(() => {
    function isTypingTarget(target) {
      if (!target) return false;

      const tag = target.tagName ? target.tagName.toLowerCase() : "";

      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    }

    function handleKeyDown(event) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        atlas.setQuery("");
        const searchInput = document.getElementById("atlas-search-input");
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShowShortcuts((current) => !current);
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        setActiveView("atlas");
        return;
      }

      if (event.key === "2") {
        event.preventDefault();
        setActiveView("clusters");
        return;
      }

      if (event.key === "3") {
        event.preventDefault();
        setActiveView("graph");
        return;
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        setMinimalMode((current) => !current);
        return;
      }

      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        handleResetView();
        return;
      }
      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        setShowSecondaryTools((current) => !current);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (editingEntryId) {
          return;
        }

        if (selectedEntry) {
          handleClearSelection();
          return;
        }

        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    atlas,
    activeView,
    setActiveView,
    minimalMode,
    setMinimalMode,
    showShortcuts,
    setShowShortcuts,
    selectedEntry,
    editingEntryId,
    handleClearSelection,
    setShowSecondaryTools,
    handleResetView,
  ]);
}
