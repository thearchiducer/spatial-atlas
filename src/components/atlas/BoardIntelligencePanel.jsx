import { buildBoardIntelligence } from "../../lib/buildBoardIntelligence";
import {
  getDecisionProfileMaturity,
  personalizeRecommendations,
} from "../../lib/userDecisionLearning";

function SmallCard({ label, value, tone = "stone" }) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }
        : tone === "sky"
          ? {
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
              color: "var(--tone-info-text)",
            }
          : tone === "violet"
            ? {
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }
            : {
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
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

function ListBlock({ title, items, tone = "stone", emptyText = "No items." }) {
  const containerStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
          }
        : tone === "sky"
          ? {
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
            }
          : {
              borderColor: "var(--border-color)",
              background: "var(--bg-surface)",
            };

  return (
    <div
      className='border'
      style={{
        borderColor: containerStyles.borderColor,
        background: containerStyles.background,
      }}
    >
      <div
        className='border-b px-4 py-3'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      </div>

      <div className='space-y-3 p-4'>
        {items.length ? (
          items.map((item) => (
            <div
              key={item.key}
              className='border px-3 py-3'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
              }}
            >
              <div
                className='text-sm font-semibold'
                style={{ color: "var(--text-primary)" }}
              >
                {item.label || item.title}
              </div>
              <div
                className='mt-1 text-sm leading-relaxed'
                style={{ color: "var(--text-secondary)" }}
              >
                {item.note}
              </div>
            </div>
          ))
        ) : (
          <div className='text-sm' style={{ color: "var(--text-muted)" }}>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryChipList({
  title,
  items,
  emptyText = "None.",
  onSelectEntry,
  tone = "stone",
}) {
  const toneStyles =
    tone === "emerald"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
          hover: "var(--tone-success-bg)",
        }
      : tone === "amber"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
            hover: "var(--tone-warning-bg)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
            hover: "var(--bg-subtle)",
          };

  return (
    <div className='mt-3'>
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.12em]'
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </div>
      <div className='mt-1 text-xs' style={{ color: "var(--text-muted)" }}>
        Click to inspect or focus this entry.
      </div>
      {items.length ? (
        <div className='mt-2 flex flex-wrap gap-2'>
          {items.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => {
                onSelectEntry?.(item.id);
              }}
              className='border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] transition transform active:scale-95 hover:shadow-sm'
              style={{
                borderColor: toneStyles.borderColor,
                background: toneStyles.background,
                color: toneStyles.color,
              }}
              title={`Open ${item.term}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = toneStyles.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = toneStyles.background;
              }}
            >
              {item.term}
            </button>
          ))}
        </div>
      ) : (
        <div className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </div>
      )}
    </div>
  );
}

function RecommendationBlock({
  title,
  items,
  emptyText = "No recommendations.",
  onSelectEntry,
  onAcceptRecommendation,
  onIgnoreRecommendation,
}) {
  return (
    <div
      className='border'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b px-4 py-3'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </div>
      </div>

      <div className='space-y-3 p-4'>
        {items.length ? (
          items.map((item) => (
            <div
              key={item.key}
              className='border px-3 py-3'
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-muted)",
              }}
            >
              <div className='flex flex-wrap items-center gap-2'>
                <div
                  className='text-sm font-semibold'
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </div>

                <div
                  className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.priority}
                </div>

                <div
                  className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.category}
                </div>

                {typeof item.learningScore === "number" ? (
                  <div
                    className='border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'
                    style={{
                      borderColor: "var(--tone-violet-border)",
                      background: "var(--tone-violet-bg)",
                      color: "var(--tone-violet-text)",
                    }}
                  >
                    Learning {item.learningScore}
                  </div>
                ) : null}
              </div>

              <div
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "var(--text-secondary)" }}
              >
                <strong style={{ color: "var(--text-primary)" }}>Why:</strong>{" "}
                {item.why}
              </div>

              <div
                className='mt-2 text-sm leading-relaxed'
                style={{ color: "var(--text-secondary)" }}
              >
                <strong style={{ color: "var(--text-primary)" }}>
                  Action:
                </strong>{" "}
                {item.action}
              </div>

              <EntryChipList
                title='Suggested entries'
                items={item.suggestedEntries || []}
                emptyText='No specific entry suggestions.'
                onSelectEntry={onSelectEntry}
                tone='emerald'
              />

              <EntryChipList
                title='Focus targets'
                items={item.focusTargets || []}
                emptyText='No immediate focus targets.'
                onSelectEntry={onSelectEntry}
                tone='amber'
              />

              <div
                className='mt-2 text-xs'
                style={{ color: "var(--text-muted)" }}
              >
                Applying this will update the board structure.
              </div>

              <div className='mt-3 flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => onAcceptRecommendation?.(item)}
                  className='border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition'
                  style={{
                    borderColor: "var(--tone-success-border)",
                    background: "var(--tone-success-bg)",
                    color: "var(--tone-success-text)",
                  }}
                >
                  Apply recommendation
                </button>

                <button
                  type='button'
                  onClick={() => onIgnoreRecommendation?.(item)}
                  className='border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition'
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-muted)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className='text-sm' style={{ color: "var(--text-muted)" }}>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function PreferenceProfileBlock({ decisionProfile }) {
  if (!decisionProfile) return null;

  return (
    <div
      className='border px-4 py-4'
      style={{
        borderColor: "var(--tone-violet-border)",
        background: "var(--tone-violet-bg)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--tone-violet-text)" }}
      >
        Learned preference profile
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <SmallCard
          label='Privacy bias'
          value={decisionProfile?.privacyBias || "None"}
        />
        <SmallCard
          label='Circulation bias'
          value={decisionProfile?.circulationBias || "None"}
        />
        <SmallCard
          label='Social bias'
          value={decisionProfile?.socialBias || "None"}
        />
        <SmallCard
          label='Climate bias'
          value={decisionProfile?.climateBias || "None"}
        />
      </div>
    </div>
  );
}

function DecisionProfileSourceBlock({
  decisionProfile,
  activeBoardDecisionProfile,
}) {
  const boardHasData =
    (activeBoardDecisionProfile?.totals?.selectedEntries || 0) > 0 ||
    (activeBoardDecisionProfile?.totals?.addedEntriesToBoard || 0) > 0 ||
    (activeBoardDecisionProfile?.totals?.acceptedRecommendations || 0) > 0 ||
    (activeBoardDecisionProfile?.totals?.restoredVersions || 0) > 0;

  return (
    <div
      className='border px-4 py-4'
      style={{
        borderColor: "var(--tone-violet-border)",
        background: "var(--tone-violet-bg)",
      }}
    >
      <div
        className='text-[10px] font-semibold uppercase tracking-[0.16em]'
        style={{ color: "var(--tone-violet-text)" }}
      >
        Learning scope
      </div>

      <div
        className='mt-2 text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {boardHasData
          ? "Board-specific profile active"
          : "Global fallback profile active"}
      </div>

      <div
        className='mt-2 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        {boardHasData
          ? "This board has enough interaction history to generate its own learned preference profile."
          : "This board does not yet have enough local history, so the system is using broader global behavior as fallback."}
      </div>

      <div className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <SmallCard
          label='Privacy bias'
          value={decisionProfile?.privacyBias || "None"}
        />
        <SmallCard
          label='Circulation bias'
          value={decisionProfile?.circulationBias || "None"}
        />
        <SmallCard
          label='Social bias'
          value={decisionProfile?.socialBias || "None"}
        />
        <SmallCard
          label='Climate bias'
          value={decisionProfile?.climateBias || "None"}
        />
      </div>
    </div>
  );
}

function DecisionProfileMaturityBlock({ decisionProfile }) {
  const maturity = getDecisionProfileMaturity(decisionProfile);

  const toneStyles =
    maturity.level === "established"
      ? {
          borderColor: "var(--tone-success-border)",
          background: "var(--tone-success-bg)",
          color: "var(--tone-success-text)",
        }
      : maturity.level === "emerging"
        ? {
            borderColor: "var(--tone-warning-border)",
            background: "var(--tone-warning-bg)",
            color: "var(--tone-warning-text)",
          }
        : {
            borderColor: "var(--border-color)",
            background: "var(--bg-muted)",
            color: "var(--text-primary)",
          };

  return (
    <div
      className='border px-4 py-4'
      style={{
        borderColor: toneStyles.borderColor,
        background: toneStyles.background,
        color: toneStyles.color,
      }}
    >
      <div className='text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75'>
        Learning maturity
      </div>

      <div className='mt-2 flex flex-wrap items-center gap-2'>
        <div className='text-sm font-semibold'>{maturity.label}</div>
        <div className='border border-current/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]'>
          Activity {maturity.activityScore}
        </div>
      </div>

      <div className='mt-2 text-sm leading-relaxed opacity-85'>
        {maturity.note}
      </div>
    </div>
  );
}

function DecisionProfileTotalsBlock({ decisionProfile }) {
  const totals = decisionProfile?.totals || {};

  return (
    <div className='grid gap-3 md:grid-cols-3 xl:grid-cols-6'>
      <SmallCard
        label='Selections'
        value={totals.selectedEntries || 0}
        tone='stone'
      />
      <SmallCard
        label='Deselected'
        value={totals.deselectedPreviewEntries || 0}
        tone='amber'
      />
      <SmallCard
        label='Added to board'
        value={totals.addedEntriesToBoard || 0}
        tone='stone'
      />
      <SmallCard
        label='Accepted'
        value={totals.acceptedRecommendations || 0}
        tone='emerald'
      />
      <SmallCard
        label='Ignored'
        value={totals.ignoredRecommendations || 0}
        tone='amber'
      />
      <SmallCard
        label='Restores'
        value={totals.restoredVersions || 0}
        tone='sky'
      />
    </div>
  );
}
export default function BoardIntelligencePanel({
  board,
  entries,
  comparisonBoard = null,
  onSelectEntry,
  decisionProfile,
  onAcceptRecommendation,
  onIgnoreRecommendation,
  globalDecisionProfile,
  activeBoardDecisionProfile,
}) {
  if (!board) return null;

  const intelligence = buildBoardIntelligence({
    board,
    entries,
    comparisonBoard,
    decisionProfile,
  });

  const analysis = intelligence.analysis;
  const resolvedComparison = intelligence.comparison;
  const personalizedRecommendations = personalizeRecommendations(
    intelligence.recommendations || [],
    decisionProfile,
  );

  const groupedRecommendations = {
    critical: personalizedRecommendations.filter(
      (item) => item.priority === "critical",
    ),
    core: personalizedRecommendations.filter(
      (item) => item.priority === "core",
    ),
    support: personalizedRecommendations.filter(
      (item) => item.priority === "support",
    ),
    refinement: personalizedRecommendations.filter(
      (item) => item.priority === "refinement",
    ),
  };

  return (
    <section
      className='space-y-5 rounded-3xl border p-5 shadow-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-subtle)",
      }}
    >
      <div>
        <div
          className='inline-flex border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{
            borderColor: "var(--tone-info-border)",
            background: "var(--tone-info-bg)",
            color: "var(--tone-info-text)",
          }}
        >
          Board intelligence
        </div>

        <h2
          className='mt-3 text-2xl font-semibold tracking-tight'
          style={{ color: "var(--text-primary)" }}
        >
          {analysis.boardName}
        </h2>

        <p
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          {analysis.summary}
        </p>
      </div>

      <div className='grid gap-3 md:grid-cols-3 xl:grid-cols-6'>
        <SmallCard label='Score' value={analysis.score} tone='sky' />
        <SmallCard label='Entries' value={analysis.entryCount} />
        <SmallCard label='Privacy' value={analysis.identity.privacyModel} />
        <SmallCard
          label='Circulation'
          value={analysis.identity.circulationModel}
        />
        <SmallCard label='Social' value={analysis.identity.socialModel} />
        <SmallCard label='Pattern' value={analysis.identity.spatialPattern} />
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <SmallCard
          label='Strength score'
          value={analysis.scoreBreakdown.strengthScore}
          tone='emerald'
        />
        <SmallCard
          label='Missing penalty'
          value={analysis.scoreBreakdown.missingPenalty}
          tone='amber'
        />
        <SmallCard
          label='Tension penalty'
          value={analysis.scoreBreakdown.tensionPenalty}
          tone='amber'
        />
      </div>
      <div className='grid gap-5 xl:grid-cols-2'>
        <ListBlock
          title='Strengths'
          items={analysis.strengths}
          tone='emerald'
        />
        <ListBlock
          title='Missing elements'
          items={analysis.missing}
          tone='amber'
        />
        <ListBlock title='Tensions' items={analysis.tensions} tone='amber' />
        <ListBlock title='Next moves' items={analysis.nextMoves} tone='sky' />
      </div>
      <div
        className='border px-4 py-4'
        style={{
          borderColor: "var(--tone-violet-border)",
          background: "var(--tone-violet-bg)",
        }}
      >
        <div
          className='text-[10px] font-semibold uppercase tracking-[0.16em]'
          style={{ color: "var(--tone-violet-text)" }}
        >
          Directional recommendations
        </div>
        {resolvedComparison ? (
          <div
            className='mt-3 border px-3 py-2 text-sm leading-relaxed'
            style={{
              borderColor: "var(--tone-info-border)",
              background: "var(--tone-info-bg)",
              color: "var(--tone-info-text)",
            }}
          >
            Recommendations currently include comparison-aware guidance derived
            from the stronger/weaker board relationship.
          </div>
        ) : null}
        <div
          className='mt-2 text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {personalizedRecommendations.length
            ? `${personalizedRecommendations.length} personalized recommendations available.`
            : "No urgent recommendations."}
        </div>
        <div
          className='mt-2 text-sm leading-relaxed'
          style={{ color: "var(--text-secondary)" }}
        >
          These recommendations are actionable, clickable, and re-ordered by the
          learned preference profile for this board.
        </div>
      </div>
      <div className='grid gap-5 xl:grid-cols-2'>
        <RecommendationBlock
          title='Critical recommendations'
          items={groupedRecommendations.critical}
          emptyText='No critical actions.'
          onSelectEntry={onSelectEntry}
          onAcceptRecommendation={onAcceptRecommendation}
          onIgnoreRecommendation={onIgnoreRecommendation}
        />

        <RecommendationBlock
          title='Core recommendations'
          items={groupedRecommendations.core}
          emptyText='No core actions.'
          onSelectEntry={onSelectEntry}
          onAcceptRecommendation={onAcceptRecommendation}
          onIgnoreRecommendation={onIgnoreRecommendation}
        />

        <RecommendationBlock
          title='Support recommendations'
          items={groupedRecommendations.support}
          emptyText='No support actions.'
          onSelectEntry={onSelectEntry}
          onAcceptRecommendation={onAcceptRecommendation}
          onIgnoreRecommendation={onIgnoreRecommendation}
        />

        <RecommendationBlock
          title='Refinement recommendations'
          items={groupedRecommendations.refinement}
          emptyText='No refinement actions.'
          onSelectEntry={onSelectEntry}
          onAcceptRecommendation={onAcceptRecommendation}
          onIgnoreRecommendation={onIgnoreRecommendation}
        />
      </div>
      <DecisionProfileMaturityBlock decisionProfile={decisionProfile} />

      <DecisionProfileSourceBlock
        decisionProfile={decisionProfile}
        globalDecisionProfile={globalDecisionProfile}
        activeBoardDecisionProfile={activeBoardDecisionProfile}
      />

      <DecisionProfileTotalsBlock decisionProfile={decisionProfile} />

      <PreferenceProfileBlock decisionProfile={decisionProfile} />
    </section>
  );
}
