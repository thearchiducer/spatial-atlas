import { useEffect, useState } from "react";
import TypeBadge from "./TypeBadge";
import EntryValidationBadge from "../debug/EntryValidationBadge";
import { validateEntry } from "../../lib/validateEntry.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenizeQuery(query) {
  return String(query || "")
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function HighlightedText({ text, query }) {
  const value = String(text || "");
  const tokens = tokenizeQuery(query);

  if (!value || tokens.length === 0) {
    return value;
  }

  const pattern = tokens.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = value.split(regex);

  return parts.map((part, index) => {
    const isMatch = tokens.some(
      (token) => part.toLowerCase() === token.toLowerCase(),
    );

    if (!isMatch) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    return (
      <mark
        key={`${part}-${index}`}
        style={{
          background: "var(--tone-warning-bg)",
          color: "var(--tone-warning-text)",
          padding: "0 2px",
          borderRadius: "2px",
        }}
      >
        {part}
      </mark>
    );
  });
}

function annotationLabel(children) {
  return (
    <span
      className='text-[10px] font-semibold uppercase tracking-[0.14em]'
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </span>
  );
}

export default function EntryCard({
  entry,
  onRelatedClick,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
  onAddToBoard,
  onRemoveFromBoard,
  isHighlighted = false,
  searchQuery = "",
  isCompared = false,
  isPinned = false,
  isInActiveBoard = false,
  activeBoardName = "",
  boardEntryCount = 0,
}) {
  const validationIssues = validateEntry(entry);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchWhy = Array.isArray(entry.__searchWhy) ? entry.__searchWhy : [];
  const searchScore =
    typeof entry.__searchScore === "number" ? entry.__searchScore : null;

  function handleRelatedClick(relatedId) {
    if (!onRelatedClick) return;
    onRelatedClick(relatedId);
  }

  function handleSelectEntry() {
    if (!onSelectEntry) return;
    onSelectEntry(entry.id);
  }

  function handleCompareClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!onCompareEntry) return;
    onCompareEntry(entry.id);
  }

  function handlePinClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!onTogglePinEntry) return;
    onTogglePinEntry(entry.id);
  }

  function handleAddToBoardClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!onAddToBoard) return;
    onAddToBoard(entry.id);
  }
  function handleRemoveFromBoardClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!onRemoveFromBoard) return;
    onRemoveFromBoard(entry.id);
  }
  useEffect(() => {
    if (!isHighlighted) return;

    const timeout = setTimeout(() => {
      const element = document.getElementById(`entry-${entry.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [isHighlighted, entry.id]);

  const stateStyle = isHighlighted
    ? {
        borderColor: "var(--tone-warning-border)",
        boxShadow:
          "0 0 0 1px var(--tone-warning-border), 0 10px 18px rgba(0,0,0,0.35)",
      }
    : isCompared
      ? {
          borderColor: "var(--tone-info-border)",
          boxShadow:
            "0 0 0 1px var(--tone-info-border), 0 10px 18px rgba(0,0,0,0.35)",
        }
      : isPinned
        ? {
            borderColor: "var(--tone-warning-border)",
            boxShadow:
              "0 0 0 1px var(--tone-warning-border), 0 8px 16px rgba(0,0,0,0.30)",
          }
        : isInActiveBoard
          ? {
              borderColor: "var(--tone-violet-border)",
              boxShadow:
                "0 0 0 1px var(--tone-violet-border), 0 8px 16px rgba(0,0,0,0.30)",
            }
          : {
              borderColor: "var(--border-color)",
              boxShadow: "var(--shadow-card)",
            };

  return (
    <article
      id={`entry-${entry.id}`}
      onClick={handleSelectEntry}
      className='flex cursor-pointer flex-col gap-3 border px-4 py-4 transition'
      style={{
        background: "var(--bg-surface)",
        borderColor: stateStyle.borderColor,
        color: "var(--text-primary)",
        boxShadow: stateStyle.boxShadow,
      }}
      onMouseEnter={(e) => {
        if (isHighlighted || isCompared || isPinned || isInActiveBoard) return;
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = stateStyle.boxShadow;
      }}
    >
      <div
        className='flex items-start justify-between gap-4 border-b pb-3'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className='min-w-0 flex-1'>
          <div
            className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]'
            style={{ color: "var(--text-muted)" }}
          >
            Spatial entry
          </div>

          <h3
            className='text-lg font-semibold tracking-tight'
            style={{ color: "var(--text-primary)" }}
          >
            <HighlightedText text={entry.term} query={searchQuery} />
          </h3>

          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            <HighlightedText text={entry.description} query={searchQuery} />
          </p>
        </div>

        <div className='flex flex-col items-end gap-2'>
          <TypeBadge type={entry.type} />
          <EntryValidationBadge issues={validationIssues} />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 mt-1'>
        <button
          type='button'
          onClick={handleCompareClick}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.1em] transition'
          style={
            isCompared
              ? {
                  borderColor: "var(--tone-info-border)",
                  background: "var(--tone-info-bg)",
                  color: "var(--tone-info-text)",
                }
              : {
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }
          }
        >
          {isCompared ? "In compare" : "Add to compare"}
        </button>

        <button
          type='button'
          onClick={handlePinClick}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.1em] transition'
          style={
            isPinned
              ? {
                  borderColor: "var(--tone-warning-border)",
                  background: "var(--tone-warning-bg)",
                  color: "var(--tone-warning-text)",
                }
              : {
                  borderColor: "var(--border-color)",
                  background: "var(--bg-muted)",
                  color: "var(--text-secondary)",
                }
          }
        >
          {isPinned ? "Pinned" : "Pin"}
        </button>

        <button
          type='button'
          onClick={handleAddToBoardClick}
          disabled={!onAddToBoard}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-60'
          style={{
            background: "var(--tone-success-bg)",
            borderColor: "var(--tone-success-border)",
            color: "var(--tone-success-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--tone-success-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--tone-success-bg)";
          }}
        >
          Add to active board
        </button>

        <button
          type='button'
          onClick={handleRemoveFromBoardClick}
          disabled={!onRemoveFromBoard || boardEntryCount < 1}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-60'
          style={{
            background: "var(--tone-warning-bg)",
            borderColor: "var(--tone-warning-border)",
            color: "var(--tone-warning-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--tone-warning-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--tone-warning-bg)";
          }}
        >
          Remove from active board
        </button>

        {boardEntryCount > 0 ? (
          <span
            className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{
              background: "var(--tone-violet-bg)",
              borderColor: "var(--tone-violet-border)",
              color: "var(--tone-violet-text)",
            }}
          >
            In board · {boardEntryCount}
          </span>
        ) : null}

        <button
          type='button'
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsExpanded((current) => !current);
          }}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.1em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          {isExpanded ? "Less" : "More"}
        </button>

        {isCompared && (
          <span
            className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
              color: "var(--tone-info-text)",
            }}
          >
            Comparing
          </span>
        )}

        {isPinned && (
          <span
            className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{
              borderColor: "var(--tone-warning-border)",
              background: "var(--tone-warning-bg)",
              color: "var(--tone-warning-text)",
            }}
          >
            Favorite
          </span>
        )}

        {isInActiveBoard && (
          <span
            className='border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
            style={{
              background: "var(--tone-violet-bg)",
              borderColor: "var(--tone-violet-border)",
              color: "var(--tone-violet-text)",
            }}
          >
            {activeBoardName ? `Board · ${activeBoardName}` : "In active board"}
          </span>
        )}
      </div>

      {searchWhy.length > 0 && (
        <div
          className='border px-3 py-2 text-sm'
          style={{
            borderColor: "var(--tone-info-border)",
            background: "var(--tone-info-bg)",
            color: "var(--tone-info-text)",
          }}
        >
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            <strong style={{ color: "var(--tone-info-text)" }}>
              Matched by
            </strong>

            {searchWhy.map((reason) => (
              <span
                key={reason}
                className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]'
                style={{
                  borderColor: "var(--tone-info-border)",
                  background: "var(--bg-muted)",
                  color: "var(--tone-info-text)",
                }}
              >
                {reason}
              </span>
            ))}

            {searchScore !== null && (
              <span
                className='ml-auto text-[10px] font-semibold uppercase tracking-[0.14em]'
                style={{ color: "var(--tone-info-text)" }}
              >
                Score {searchScore}
              </span>
            )}
          </div>
        </div>
      )}
      {isExpanded && (
        <>
          <div
            className='border-t pt-3'
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className='mb-2'>{annotationLabel("Synonyms")}</div>
            <div
              className='text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {entry.synonyms.length
                ? entry.synonyms.map((synonym, index) => (
                    <span key={`${synonym}-${index}`}>
                      {index > 0 ? ", " : ""}
                      <HighlightedText text={synonym} query={searchQuery} />
                    </span>
                  ))
                : "—"}
            </div>
          </div>

          <div
            className='grid gap-x-4 gap-y-2 border-t pt-3 text-sm md:grid-cols-2'
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            <div>
              {annotationLabel("Scale")}
              <div className='mt-1' style={{ color: "var(--text-primary)" }}>
                {entry.scale}
              </div>
            </div>

            <div>
              {annotationLabel("Domain")}
              <div className='mt-1' style={{ color: "var(--text-primary)" }}>
                {entry.domain}
              </div>
            </div>

            <div>
              {annotationLabel("Status")}
              <div className='mt-1' style={{ color: "var(--text-primary)" }}>
                {entry.status}
              </div>
            </div>

            <div>
              {annotationLabel("Region")}
              <div className='mt-1' style={{ color: "var(--text-primary)" }}>
                {entry.region}
              </div>
            </div>

            <div className='md:col-span-2'>
              {annotationLabel("Source")}
              <div className='mt-1' style={{ color: "var(--text-primary)" }}>
                {entry.sourceCategory}
              </div>
            </div>
          </div>

          {entry.related && entry.related.length > 0 && (
            <div
              className='border-t pt-3'
              style={{ borderColor: "var(--border-color)" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className='mb-2'>{annotationLabel("Related")}</div>

              <div className='inline-flex flex-wrap gap-2'>
                {entry.related.map((item) => (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleRelatedClick(item.id)}
                    className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition'
                    style={{
                      borderColor: "var(--border-color)",
                      background: "var(--bg-muted)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className='border-t pt-3'
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className='mb-2'>{annotationLabel("Note")}</div>
            <p
              className='text-sm leading-relaxed'
              style={{ color: "var(--text-secondary)" }}
            >
              {entry.notes}
            </p>
          </div>
        </>
      )}
    </article>
  );
}
