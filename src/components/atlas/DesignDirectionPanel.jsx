import { useMemo, useState } from "react";
import { buildDirectionSummary } from "../../lib/designDirection";
import { buildDirectionIdentity } from "../../lib/directionIdentity";
import { buildSpatialMoves } from "../../lib/spatialMoves";
import SpatialDiagramPanel from "./SpatialDiagramPanel";

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesAny(value, terms) {
  const text = normalize(value);
  return terms.some((term) => text.includes(term));
}

function matchesMove(moveTitle, entry) {
  const title = normalize(moveTitle);
  const term = normalize(entry?.term);
  const type = normalize(entry?.type);
  const privacy = normalize(entry?.privacyLevel);
  const socialRole = normalize(entry?.socialRole);

  if (title.includes("threshold")) {
    return (
      type === "threshold" ||
      includesAny(term, [
        "entry",
        "vestibule",
        "foyer",
        "hall",
        "lobby",
        "gallery",
        "antechamber",
        "reception",
      ])
    );
  }

  if (title.includes("circulation spine")) {
    return (
      type === "circulation" ||
      includesAny(term, ["corridor", "gallery", "hall", "passage", "spine"])
    );
  }

  if (title.includes("private anchor")) {
    return (
      privacy === "private" ||
      privacy === "restricted" ||
      includesAny(term, [
        "bed",
        "master",
        "suite",
        "study",
        "office",
        "library",
      ])
    );
  }

  if (title.includes("social support")) {
    return (
      includesAny(term, ["dining", "breakfast", "family room", "eating"]) ||
      socialRole === "gathering"
    );
  }

  if (title.includes("social anchor")) {
    return (
      socialRole === "gathering" ||
      includesAny(term, [
        "living",
        "majlis",
        "salon",
        "guest",
        "parlor",
        "drawing",
      ])
    );
  }

  if (title.includes("public face")) {
    return (
      privacy === "public" ||
      socialRole === "reception" ||
      includesAny(term, [
        "living",
        "majlis",
        "salon",
        "guest",
        "reception",
        "entry",
      ])
    );
  }

  return false;
}

function buildSuggestionsForMove(moveTitle, availableEntries, activeEntryIds) {
  const safeEntries = Array.isArray(availableEntries) ? availableEntries : [];
  const safeActiveIds = Array.isArray(activeEntryIds) ? activeEntryIds : [];

  return safeEntries
    .filter((entry) => !safeActiveIds.includes(entry.id))
    .filter((entry) => matchesMove(moveTitle, entry))
    .slice(0, 6);
}

function explainSuggestion(moveTitle, entry) {
  const title = normalize(moveTitle);
  const term = normalize(entry?.term);
  const type = normalize(entry?.type);
  const privacy = normalize(entry?.privacyLevel);
  const socialRole = normalize(entry?.socialRole);
  const domain = entry?.domain || "Spatial";
  const reasons = [];

  if (title.includes("threshold")) {
    if (type === "threshold") {
      reasons.push("It is already classified as a threshold element.");
    }

    if (
      includesAny(term, [
        "entry",
        "vestibule",
        "foyer",
        "hall",
        "antechamber",
        "reception",
      ])
    ) {
      reasons.push(
        "It can buffer arrival and reduce abrupt exposure between outside and interior zones.",
      );
    }

    reasons.push("It helps sequence access before the main rooms are reached.");
  }

  if (title.includes("circulation spine")) {
    if (type === "circulation") {
      reasons.push(
        "It is classified as circulation and can organize movement directly.",
      );
    }

    if (
      includesAny(term, ["corridor", "gallery", "hall", "passage", "spine"])
    ) {
      reasons.push(
        "It can act as a movement organizer between multiple rooms.",
      );
    }

    reasons.push(
      "It improves legibility by giving the board a clearer access structure.",
    );
  }

  if (title.includes("private anchor")) {
    if (privacy === "private" || privacy === "restricted") {
      reasons.push("Its privacy level already supports a protected zone.");
    }

    if (includesAny(term, ["bed", "master", "suite"])) {
      reasons.push(
        "It can become a deep private anchor for sleeping or retreat.",
      );
    }

    if (includesAny(term, ["study", "office", "library"])) {
      reasons.push(
        "It can establish a quieter protected destination inside the project.",
      );
    }

    reasons.push("It strengthens the public-to-private gradient of the board.");
  }

  if (title.includes("social support")) {
    if (includesAny(term, ["dining", "breakfast", "family room", "eating"])) {
      reasons.push("It supports gathering and food-related social use.");
    }

    if (socialRole === "gathering") {
      reasons.push("Its social role is already gathering-oriented.");
    }

    reasons.push("It can connect service logic to shared daily activity.");
  }

  if (title.includes("social anchor")) {
    if (
      includesAny(term, [
        "living",
        "majlis",
        "salon",
        "guest",
        "parlor",
        "drawing",
      ])
    ) {
      reasons.push("It can operate as a main receiving or gathering room.");
    }

    if (socialRole === "gathering") {
      reasons.push(
        "Its social role makes it suitable as a public-facing anchor.",
      );
    }

    reasons.push("It helps the board form a clear social center.");
  }

  if (title.includes("public face")) {
    if (privacy === "public") {
      reasons.push("Its privacy level supports a front-facing or shared role.");
    }

    if (socialRole === "reception") {
      reasons.push(
        "Its reception role makes it suitable near arrival and hosting spaces.",
      );
    }

    reasons.push(
      "It can help define how the project meets visitors or collective use.",
    );
  }

  if (!reasons.length) {
    reasons.push(
      "It supports the spatial structure suggested by this next move.",
    );
  }

  return {
    title: entry?.term || "Suggested entry",
    summary:
      reasons[0] ||
      "It supports the spatial structure suggested by this next move.",
    details: reasons,
    meta: [entry?.type || "—", entry?.privacyLevel || "—", domain].join(" · "),
  };
}

function formatDirectionSnapshot(summary) {
  if (!summary) return "";

  return [
    summary.privacyModel,
    summary.socialModel,
    summary.circulationModel,
    summary.serviceStrategy,
  ].join(" · ");
}

function compareCounts(beforeCount, afterCount, label) {
  if (afterCount > beforeCount) {
    return {
      tone: "negative",
      text: `${label} increases`,
    };
  }

  if (afterCount < beforeCount) {
    return {
      tone: "positive",
      text: `${label} reduces`,
    };
  }

  return {
    tone: "neutral",
    text: `${label} stays stable`,
  };
}

function diffByTitle(beforeItems, afterItems) {
  const safeBefore = Array.isArray(beforeItems) ? beforeItems : [];
  const safeAfter = Array.isArray(afterItems) ? afterItems : [];

  const removed = safeBefore.filter(
    (beforeItem) =>
      !safeAfter.some((afterItem) => afterItem.title === beforeItem.title),
  );

  const added = safeAfter.filter(
    (afterItem) =>
      !safeBefore.some((beforeItem) => beforeItem.title === afterItem.title),
  );

  return { removed, added };
}

function buildDecisionConfidence(preview) {
  if (!preview) {
    return {
      label: "Unknown",
      tone: "neutral",
      score: 0,
      reasons: [],
    };
  }

  let score = 0;
  const reasons = [];

  const resolvedGapCount = preview.diff.resolvedGaps.length;
  const newGapCount = preview.diff.newGaps.length;
  const resolvedTensionCount = preview.diff.resolvedTensions.length;
  const newTensionCount = preview.diff.newTensions.length;

  score += resolvedGapCount * 18;
  score += resolvedTensionCount * 20;
  score -= newGapCount * 14;
  score -= newTensionCount * 18;

  if (preview.after.nextMoves.length < preview.before.nextMoves.length) {
    score += 14;
    reasons.push("It reduces the number of corrective next moves.");
  } else if (preview.after.nextMoves.length > preview.before.nextMoves.length) {
    score -= 8;
    reasons.push(
      "It introduces follow-up decisions that still need resolution.",
    );
  }

  const positiveImpacts = preview.impacts.filter(
    (impact) => impact.tone === "positive",
  ).length;
  const negativeImpacts = preview.impacts.filter(
    (impact) => impact.tone === "negative",
  ).length;
  const tradeoffImpacts = preview.impacts.filter(
    (impact) => impact.tone === "tradeoff",
  ).length;

  score += positiveImpacts * 6;
  score -= negativeImpacts * 8;
  score -= tradeoffImpacts * 3;

  if (resolvedGapCount > 0) {
    reasons.push(
      `It resolves ${resolvedGapCount} missing-element issue${
        resolvedGapCount === 1 ? "" : "s"
      }.`,
    );
  }

  if (resolvedTensionCount > 0) {
    reasons.push(
      `It resolves ${resolvedTensionCount} tension${
        resolvedTensionCount === 1 ? "" : "s"
      }.`,
    );
  }

  if (newGapCount > 0) {
    reasons.push(
      `It introduces ${newGapCount} new missing-element issue${
        newGapCount === 1 ? "" : "s"
      }.`,
    );
  }

  if (newTensionCount > 0) {
    reasons.push(
      `It introduces ${newTensionCount} new tension${
        newTensionCount === 1 ? "" : "s"
      }.`,
    );
  }

  if (!reasons.length) {
    reasons.push(
      "It changes the board, but without a strong directional gain yet.",
    );
  }

  if (score >= 28) {
    return {
      label: "High",
      tone: "positive",
      score,
      reasons,
    };
  }

  if (score >= 8) {
    return {
      label: "Medium",
      tone: "tradeoff",
      score,
      reasons,
    };
  }

  return {
    label: "Low",
    tone: "negative",
    score,
    reasons,
  };
}

function buildImpactPreview(moveTitle, entry, currentEntries) {
  const safeEntries = Array.isArray(currentEntries) ? currentEntries : [];
  const nextEntries = [...safeEntries, entry];

  const before = buildDirectionSummary(safeEntries);
  const after = buildDirectionSummary(nextEntries);

  const beforeGaps = Array.isArray(before.gapSignals)
    ? before.gapSignals.length
    : 0;
  const afterGaps = Array.isArray(after.gapSignals)
    ? after.gapSignals.length
    : 0;
  const beforeTensions = Array.isArray(before.tensions)
    ? before.tensions.length
    : 0;
  const afterTensions = Array.isArray(after.tensions)
    ? after.tensions.length
    : 0;
  const beforeMoves = Array.isArray(before.nextMoves)
    ? before.nextMoves.length
    : 0;
  const afterMoves = Array.isArray(after.nextMoves)
    ? after.nextMoves.length
    : 0;

  const impacts = [];
  const title = normalize(moveTitle);
  const term = normalize(entry?.term);

  if (title.includes("threshold")) {
    impacts.push({
      tone: "positive",
      text: "Privacy gradient improves through stronger arrival sequencing.",
    });
  }

  if (title.includes("circulation spine")) {
    impacts.push({
      tone: "positive",
      text: "Movement clarity improves because the board gains a stronger organizer.",
    });
  }

  if (title.includes("private anchor")) {
    impacts.push({
      tone: "positive",
      text: "Protected depth improves because the board gains a stronger private destination.",
    });
  }

  if (title.includes("social support")) {
    impacts.push({
      tone: "positive",
      text: "Daily-use and gathering logic become more coherent.",
    });
  }

  if (title.includes("social anchor") || title.includes("public face")) {
    impacts.push({
      tone: "positive",
      text: "The public identity of the board becomes easier to read.",
    });
  }

  if (includesAny(term, ["corridor", "gallery", "hall", "passage"])) {
    impacts.push({
      tone: "tradeoff",
      text: "Circulation length may increase slightly as sequence becomes more explicit.",
    });
  }

  if (includesAny(term, ["vestibule", "foyer", "antechamber", "entry"])) {
    impacts.push({
      tone: "positive",
      text: "Arrival becomes more layered instead of exposing main rooms immediately.",
    });
  }

  if (includesAny(term, ["bed", "suite", "study", "office"])) {
    impacts.push({
      tone: "positive",
      text: "The board gains a clearer protected or retreat-oriented zone.",
    });
  }

  if (includesAny(term, ["living", "majlis", "salon", "guest", "dining"])) {
    impacts.push({
      tone: "positive",
      text: "Social hosting logic becomes more legible and front-facing.",
    });
  }

  impacts.push(
    compareCounts(beforeGaps, afterGaps, "Missing-element pressure"),
  );
  impacts.push(compareCounts(beforeTensions, afterTensions, "Conflict load"));

  if (afterMoves < beforeMoves) {
    impacts.push({
      tone: "positive",
      text: "The board needs fewer corrective next moves after this addition.",
    });
  } else if (afterMoves > beforeMoves) {
    impacts.push({
      tone: "tradeoff",
      text: "This addition opens new decisions, so the board may need one more follow-up move.",
    });
  }

  const gapDiff = diffByTitle(before.gapSignals, after.gapSignals);
  const tensionDiff = diffByTitle(before.tensions, after.tensions);

  const preview = {
    before,
    after,
    impacts,
    beforeSnapshot: formatDirectionSnapshot(before),
    afterSnapshot: formatDirectionSnapshot(after),
    diff: {
      resolvedGaps: gapDiff.removed,
      newGaps: gapDiff.added,
      resolvedTensions: tensionDiff.removed,
      newTensions: tensionDiff.added,
    },
  };

  return {
    ...preview,
    confidence: buildDecisionConfidence(preview),
  };
}

function toneClasses(tone) {
  if (tone === "positive") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#a7f3d0]";
  }

  if (tone === "negative") {
    return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]";
  }

  if (tone === "tradeoff") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]";
  }

  return "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]";
}

function confidenceBadgeClasses(tone, selected) {
  const base =
    "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]";

  if (tone === "positive") {
    return `${base} ${
      selected
        ? "border-[rgba(16,185,129,0.45)] bg-[rgba(16,185,129,0.20)] text-[#d1fae5]"
        : "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#a7f3d0]"
    }`;
  }

  if (tone === "negative") {
    return `${base} ${
      selected
        ? "border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.20)] text-[#fee2e2]"
        : "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]"
    }`;
  }

  if (tone === "tradeoff") {
    return `${base} ${
      selected
        ? "border-[rgba(251,191,36,0.40)] bg-[rgba(251,191,36,0.18)] text-[#fef3c7]"
        : "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]"
    }`;
  }

  return `${base} ${
    selected
      ? "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white"
      : "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
  }`;
}

function confidencePanelClasses(tone) {
  if (tone === "positive") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.08)]";
  }

  if (tone === "negative") {
    return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]";
  }

  if (tone === "tradeoff") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.08)]";
  }

  return "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)]";
}

function strengthClasses(strength) {
  if (strength === "Clear") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.10)] text-[#a7f3d0]";
  }

  if (strength === "Developing") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.10)] text-[#fde68a]";
  }

  return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]";
}

function priorityClasses(priority) {
  if (priority === "Critical") {
    return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.10)] text-[#fecaca]";
  }

  if (priority === "Core") {
    return "border-[rgba(56,189,248,0.35)] bg-[rgba(56,189,248,0.10)] text-[#bae6fd]";
  }

  return "border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]";
}

function verdictToneClasses(strength) {
  if (strength === "Clear") {
    return "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.08)]";
  }

  if (strength === "Developing") {
    return "border-[rgba(251,191,36,0.30)] bg-[rgba(251,191,36,0.08)]";
  }

  return "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.08)]";
}

function verdictMessage(identity, summary) {
  if (!identity || !summary) return "";

  if (identity.strength === "Clear") {
    return "This direction is legible enough to act on. The project already has a readable spatial logic and can now be developed through diagram and adjacency decisions.";
  }

  if (identity.strength === "Developing") {
    return "This direction is emerging clearly, but it still needs a few structural decisions before it becomes fully stable.";
  }

  return "This direction exists, but it is still unstable. Resolve the main tensions and missing roles before trusting it as the project’s final spatial logic.";
}

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

function StatCard({ label, value }) {
  return (
    <div
      className='border p-3'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      {annotationLabel(label)}
      <div
        className='mt-1 text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

function FinalVerdictBanner({ identity, summary }) {
  if (!identity || !summary) return null;

  return (
    <div className={`mt-5 border p-5 ${verdictToneClasses(identity.strength)}`}>
      <div className='border-b border-current/15 pb-4'>
        {annotationLabel("Final design verdict")}
        <div
          className='mt-3 text-2xl font-semibold tracking-tight md:text-3xl'
          style={{ color: "var(--text-primary)" }}
        >
          {identity.title}
        </div>
        <p
          className='mt-3 max-w-4xl text-base'
          style={{ color: "var(--text-secondary)" }}
        >
          {identity.sentence}
        </p>
      </div>

      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <span
          className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${strengthClasses(
            identity.strength,
          )}`}
        >
          {identity.strength}
        </span>

        <span
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Privacy · {summary.privacyModel}
        </span>

        <span
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Social · {summary.socialModel}
        </span>

        <span
          className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Circulation · {summary.circulationModel}
        </span>
      </div>

      <p
        className='mt-4 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        {verdictMessage(identity, summary)}
      </p>
    </div>
  );
}

function IdentityPanel({ identity }) {
  if (!identity) return null;

  return (
    <div
      className='mt-5 border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Direction identity")}
          <div
            className='mt-2 text-base font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {identity.title}
          </div>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {identity.sentence}
          </p>
        </div>

        <span
          className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${strengthClasses(
            identity.strength,
          )}`}
        >
          {identity.strength}
        </span>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {identity.tags.map((tag) => (
          <span
            key={identity.title + "-" + tag}
            className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em]'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function SpatialMoveCard({ move, index }) {
  return (
    <div
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
          {annotationLabel(`Spatial move ${index + 1}`)}
          <div
            className='mt-2 text-base font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {move.title}
          </div>
          <p
            className='mt-2 text-sm leading-relaxed'
            style={{ color: "var(--text-secondary)" }}
          >
            {move.intent}
          </p>
        </div>

        <span
          className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${priorityClasses(
            move.priority,
          )}`}
        >
          {move.priority}
        </span>
      </div>

      <div className='mt-4 space-y-3'>
        <div
          className='border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Spatial instruction")}
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {move.spatialInstruction}
          </p>
        </div>

        <div
          className='border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Diagram cue")}
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {move.diagramCue}
          </p>
        </div>

        <div
          className='border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Avoid")}
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {move.avoid}
          </p>
        </div>
      </div>
    </div>
  );
}

function SpatialMovesTranslatorPanel({ translator }) {
  if (!translator) return null;

  return (
    <div
      className='mt-6 border p-5'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='border-b pb-4'
        style={{ borderColor: "var(--border-color)" }}
      >
        {annotationLabel("Spatial moves translator")}
        <h3
          className='mt-2 text-lg font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {translator.translatorLabel}
        </h3>
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          {translator.headline}
        </p>
      </div>

      <SpatialDiagramPanel translator={translator} />

      <div className='mt-4 grid gap-3 xl:grid-cols-2'>
        {translator.moves.map((move, index) => (
          <SpatialMoveCard
            key={translator.translatorLabel + "-" + move.title}
            move={move}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ title, description, implication = null }) {
  return (
    <div
      className='border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='text-sm font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </div>
      <p
        className='mt-2 text-sm leading-relaxed'
        style={{ color: "var(--text-secondary)" }}
      >
        {description}
      </p>
      {implication ? (
        <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          {implication}
        </p>
      ) : null}
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div
      className='border border-dashed p-4 text-sm'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.02)",
        color: "var(--text-muted)",
      }}
    >
      {text}
    </div>
  );
}

function SuggestedEntryChip({
  entry,
  explanation,
  confidence,
  isSelected,
  onSelect,
  onAdd,
}) {
  return (
    <div
      className='flex flex-wrap items-center gap-2 border p-2 transition'
      style={{
        borderColor: isSelected
          ? "rgba(255,255,255,0.18)"
          : "var(--border-color)",
        background: isSelected ? "rgba(255,255,255,0.06)" : "var(--bg-surface)",
        color: isSelected ? "#ffffff" : "var(--text-primary)",
      }}
    >
      <button
        type='button'
        onClick={() => onSelect(isSelected ? null : entry.id)}
        className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
        style={
          isSelected
            ? {
                borderColor: "rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
              }
            : {
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }
        }
        title={explanation.summary}
      >
        {entry.term}
      </button>

      <span className={confidenceBadgeClasses(confidence.tone, isSelected)}>
        {confidence.label}
      </span>

      <button
        type='button'
        onClick={() => onAdd(entry.id)}
        className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
        style={
          isSelected
            ? {
                borderColor: "rgba(16,185,129,0.45)",
                background: "rgba(16,185,129,0.20)",
                color: "#d1fae5",
              }
            : {
                borderColor: "rgba(16,185,129,0.35)",
                background: "rgba(16,185,129,0.10)",
                color: "#a7f3d0",
              }
        }
        title={`Add ${entry.term} to board`}
      >
        Add
      </button>
    </div>
  );
}

function SuggestionExplanationCard({ explanation }) {
  if (!explanation) return null;

  return (
    <div
      className='mt-3 border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div className='flex flex-col gap-1'>
        <div
          className='text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Why {explanation.title}?
        </div>
        <div
          className='text-[11px] uppercase tracking-[0.08em]'
          style={{ color: "var(--text-muted)" }}
        >
          {explanation.meta}
        </div>
      </div>

      <p className='mt-3 text-sm' style={{ color: "var(--text-secondary)" }}>
        {explanation.summary}
      </p>

      <ul
        className='mt-3 space-y-2 pl-5 text-sm'
        style={{ color: "var(--text-secondary)" }}
      >
        {explanation.details.map((item, index) => (
          <li key={explanation.title + "-" + index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DiffList({ title, items, emptyText, tone }) {
  return (
    <div
      className='border p-3'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {annotationLabel(title)}

      {items.length ? (
        <div className='mt-3 flex flex-wrap gap-2'>
          {items.map((item) => (
            <span
              key={title + "-" + item.title}
              className={`border px-3 py-1 text-[11px] uppercase tracking-[0.08em] ${toneClasses(
                tone,
              )}`}
            >
              {item.title}
            </span>
          ))}
        </div>
      ) : (
        <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </p>
      )}
    </div>
  );
}

function DecisionConfidenceCard({ confidence }) {
  if (!confidence) return null;

  return (
    <div
      className={`mt-4 border p-4 ${confidencePanelClasses(confidence.tone)}`}
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          {annotationLabel("Decision confidence")}

          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <span
              className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClasses(
                confidence.tone,
              )}`}
            >
              {confidence.label}
            </span>

            <span
              className='border px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
              style={{
                borderColor: "var(--border-color)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-secondary)",
              }}
            >
              Score · {confidence.score}
            </span>
          </div>
        </div>
      </div>

      <div className='mt-4 space-y-2'>
        {confidence.reasons.map((reason, index) => (
          <div
            key={confidence.label + "-reason-" + index}
            className='border px-3 py-2 text-sm'
            style={{
              borderColor: "var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-secondary)",
            }}
          >
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactPreviewCard({ preview, entryTitle }) {
  if (!preview) return null;

  return (
    <div
      className='mt-3 border p-4'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-surface)",
      }}
    >
      <div
        className='flex flex-col gap-3 border-b pb-4 md:flex-row md:items-start md:justify-between'
        style={{ borderColor: "var(--border-color)" }}
      >
        <div
          className='text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          If you add {entryTitle}
        </div>

        <span
          className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClasses(
            preview.confidence.tone,
          )}`}
        >
          Confidence · {preview.confidence.label}
        </span>
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2'>
        <div
          className='border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("Before")}
          <div
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {preview.beforeSnapshot}
          </div>
        </div>

        <div
          className='border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {annotationLabel("After")}
          <div
            className='mt-2 text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {preview.afterSnapshot}
          </div>
        </div>
      </div>

      <DecisionConfidenceCard confidence={preview.confidence} />

      <div className='mt-4 space-y-2'>
        {preview.impacts.map((impact, index) => (
          <div
            key={entryTitle + "-impact-" + index}
            className={`border px-3 py-2 text-sm ${toneClasses(impact.tone)}`}
          >
            {impact.text}
          </div>
        ))}
      </div>

      <div className='mt-4 grid gap-3 md:grid-cols-2'>
        <DiffList
          title='Resolved missing elements'
          items={preview.diff.resolvedGaps}
          emptyText='No missing-element issues are resolved by this move.'
          tone='positive'
        />
        <DiffList
          title='New missing elements'
          items={preview.diff.newGaps}
          emptyText='No new missing-element issues appear after this move.'
          tone='tradeoff'
        />
        <DiffList
          title='Resolved tensions'
          items={preview.diff.resolvedTensions}
          emptyText='No tensions are resolved directly by this move.'
          tone='positive'
        />
        <DiffList
          title='New tensions'
          items={preview.diff.newTensions}
          emptyText='No new tensions appear after this move.'
          tone='tradeoff'
        />
      </div>
    </div>
  );
}

function NextMoveCard({
  move,
  isExpanded,
  onToggle,
  suggestions,
  selectedSuggestionId,
  suggestionPreviewMap,
  onSelectSuggestion,
  onAddEntry,
  isBoardActive,
}) {
  const selectedSuggestion = suggestions.find(
    (entry) => entry.id === selectedSuggestionId,
  );
  const selectedExplanation = selectedSuggestion
    ? explainSuggestion(move.title, selectedSuggestion)
    : null;
  const impactPreview = selectedSuggestion
    ? suggestionPreviewMap[selectedSuggestion.id]
    : null;

  return (
    <div
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
        <div className='min-w-0 flex-1'>
          <div
            className='text-sm font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            {move.title}
          </div>
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            {move.description}
          </p>
        </div>

        <button
          type='button'
          onClick={onToggle}
          className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          {isExpanded ? "Hide suggestions" : "Show suggestions"}
        </button>
      </div>

      {isExpanded ? (
        <div
          className='mt-4 border p-3'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
            {annotationLabel("Suggested entries")}

            <div
              className='text-[11px] uppercase tracking-[0.08em]'
              style={{ color: "var(--text-muted)" }}
            >
              Confidence is shown on each option
            </div>
          </div>

          {!isBoardActive ? (
            <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
              Open a board first to add suggested entries.
            </p>
          ) : suggestions.length ? (
            <>
              <div className='mt-3 flex flex-wrap gap-2'>
                {suggestions.map((entry) => {
                  const preview = suggestionPreviewMap[entry.id];

                  return (
                    <SuggestedEntryChip
                      key={entry.id}
                      entry={entry}
                      explanation={explainSuggestion(move.title, entry)}
                      confidence={preview.confidence}
                      isSelected={selectedSuggestionId === entry.id}
                      onSelect={onSelectSuggestion}
                      onAdd={onAddEntry}
                    />
                  );
                })}
              </div>

              <SuggestionExplanationCard explanation={selectedExplanation} />

              <ImpactPreviewCard
                preview={impactPreview}
                entryTitle={selectedSuggestion?.term}
              />
            </>
          ) : (
            <p className='mt-2 text-sm' style={{ color: "var(--text-muted)" }}>
              No matching entry suggestions are currently available outside this
              board.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function RemovableEntryRow({ entry, onRemove }) {
  return (
    <div
      className='flex items-center gap-2 border px-3 py-2'
      style={{
        borderColor: "var(--border-color)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className='min-w-0 flex-1'>
        <div
          className='truncate text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {entry.term}
        </div>

        <div
          className='truncate text-[11px] uppercase tracking-[0.08em]'
          style={{ color: "var(--text-muted)" }}
        >
          {entry.type || "—"} · {entry.privacyLevel || "—"} ·{" "}
          {entry.domain || "—"}
        </div>
      </div>

      <button
        type='button'
        onClick={() => onRemove(entry.id)}
        className='border px-3 py-1 text-[11px] uppercase tracking-[0.08em] transition'
        style={{
          borderColor: "rgba(248,113,113,0.35)",
          background: "rgba(248,113,113,0.10)",
          color: "#fecaca",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(248,113,113,0.16)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(248,113,113,0.10)";
        }}
      >
        Remove
      </button>
    </div>
  );
}

function BoardEntryManagementPanel({ entries, onRemoveEntry }) {
  return (
    <div className='mt-6'>
      <h3
        className='text-base font-semibold'
        style={{ color: "var(--text-primary)" }}
      >
        Remove board entries
      </h3>

      <p className='mt-1 text-sm' style={{ color: "var(--text-secondary)" }}>
        Remove entries directly here to test how the board character, tensions,
        and next moves change.
      </p>

      <div className='mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3'>
        {entries.length ? (
          entries.map((entry) => (
            <RemovableEntryRow
              key={entry.id}
              entry={entry}
              onRemove={onRemoveEntry}
            />
          ))
        ) : (
          <EmptyCard text='No entries are currently in this board.' />
        )}
      </div>
    </div>
  );
}

export default function DesignDirectionPanel({
  activeBoard = null,
  availableEntries = [],
  onAddEntryToBoard,
  onRemoveEntryFromBoard,
}) {
  const [expandedMoveTitle, setExpandedMoveTitle] = useState(null);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState({});

  const entries = useMemo(() => {
    return Array.isArray(activeBoard?.entries) ? activeBoard.entries : [];
  }, [activeBoard]);

  const activeEntryIds = useMemo(() => {
    return Array.isArray(activeBoard?.entryIds) ? activeBoard.entryIds : [];
  }, [activeBoard]);

  const summary = useMemo(() => {
    if (!activeBoard) return null;
    return buildDirectionSummary(entries);
  }, [activeBoard, entries]);

  const identity = useMemo(() => {
    if (!summary) return null;
    return buildDirectionIdentity(summary, entries);
  }, [summary, entries]);

  const spatialTranslator = useMemo(() => {
    if (!summary || !identity) return null;
    return buildSpatialMoves(summary, identity, entries);
  }, [summary, identity, entries]);

  const suggestionMap = useMemo(() => {
    if (!summary) return {};

    return Object.fromEntries(
      summary.nextMoves.map((move) => [
        move.title,
        buildSuggestionsForMove(move.title, availableEntries, activeEntryIds),
      ]),
    );
  }, [summary, availableEntries, activeEntryIds]);

  const suggestionPreviewMap = useMemo(() => {
    if (!summary) return {};

    return Object.fromEntries(
      summary.nextMoves.map((move) => {
        const suggestions = suggestionMap[move.title] || [];
        const previews = Object.fromEntries(
          suggestions.map((entry) => [
            entry.id,
            buildImpactPreview(move.title, entry, entries),
          ]),
        );

        return [move.title, previews];
      }),
    );
  }, [summary, suggestionMap, entries]);

  function handleToggleMove(title) {
    setExpandedMoveTitle((current) => (current === title ? null : title));

    setSelectedSuggestionIds((current) => {
      if (current[title]) return current;

      const suggestions = suggestionMap[title] || [];
      if (!suggestions.length) return current;

      const highConfidence = suggestions.find((entry) => {
        const preview = suggestionPreviewMap[title]?.[entry.id];
        return preview?.confidence?.label === "High";
      });

      return {
        ...current,
        [title]: (highConfidence || suggestions[0]).id,
      };
    });
  }

  function handleSelectSuggestion(moveTitle, entryId) {
    setSelectedSuggestionIds((current) => ({
      ...current,
      [moveTitle]: entryId,
    }));
  }

  function handleAddSuggestedEntry(entryId) {
    if (!activeBoard || !onAddEntryToBoard || !entryId) return;
    onAddEntryToBoard(entryId);
  }

  function handleRemoveEntry(entryId) {
    if (!activeBoard || !onRemoveEntryFromBoard || !entryId) return;
    onRemoveEntryFromBoard(activeBoard.id, entryId);
  }

  if (!activeBoard) {
    return (
      <section
        className='rounded-3xl border p-5 shadow-sm'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <div
          className='mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Design direction
        </div>

        <h2
          className='text-xl font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Project direction summary
        </h2>

        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          Open a board to see what kind of project logic is forming, what is
          missing, and what to do next.
        </p>

        <div className='mt-5'>
          <EmptyCard text='No active board selected yet.' />
        </div>
      </section>
    );
  }

  return (
    <section
      className='border p-6'
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-base)", // IMPORTANT: not surface
      }}
    >
      {annotationLabel("Design direction")}

      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <h2
            className='text-xl font-semibold'
            style={{ color: "var(--text-primary)" }}
          >
            Project direction summary
          </h2>
          <p
            className='mt-2 text-sm'
            style={{ color: "var(--text-secondary)" }}
          >
            This panel turns the active board into a final design verdict,
            conceptual identity, diagram-level spatial moves, and
            decision-tested next actions.
          </p>
        </div>

        <span
          className='rounded-full border px-3 py-1.5 text-xs'
          style={{
            borderColor: "var(--border-color)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-secondary)",
          }}
        >
          Active board: {activeBoard.name || "Untitled board"}
        </span>
      </div>

      <FinalVerdictBanner identity={identity} summary={summary} />

      <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard label='Privacy model' value={summary.privacyModel} />
        <StatCard label='Social model' value={summary.socialModel} />
        <StatCard label='Circulation model' value={summary.circulationModel} />
        <StatCard label='Service strategy' value={summary.serviceStrategy} />
      </div>

      <IdentityPanel identity={identity} />

      <SpatialMovesTranslatorPanel translator={spatialTranslator} />

      <div
        className='mt-5 rounded-2xl border p-4'
        style={{
          borderColor: "var(--border-color)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          className='text-xs font-semibold uppercase tracking-[0.12em]'
          style={{ color: "var(--text-muted)" }}
        >
          Board character
        </div>
        <div
          className='mt-2 text-sm font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          {summary.boardCharacter}
        </div>
        <p className='mt-2 text-sm' style={{ color: "var(--text-secondary)" }}>
          {summary.spatialPattern}
        </p>
      </div>

      <div className='mt-6'>
        <h3
          className='text-base font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Next moves
        </h3>
        <p className='mt-1 text-sm' style={{ color: "var(--text-secondary)" }}>
          Open a move to see suggested entries, why they matter, how the board
          changes if you add them, which exact issues are resolved or
          introduced, and how confident the system is about each option.
        </p>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {summary.nextMoves.length ? (
            summary.nextMoves.map((move) => (
              <NextMoveCard
                key={move.title}
                move={move}
                isExpanded={expandedMoveTitle === move.title}
                onToggle={() => handleToggleMove(move.title)}
                suggestions={suggestionMap[move.title] || []}
                selectedSuggestionId={selectedSuggestionIds[move.title] || null}
                suggestionPreviewMap={suggestionPreviewMap[move.title] || {}}
                onSelectSuggestion={(entryId) =>
                  handleSelectSuggestion(move.title, entryId)
                }
                onAddEntry={handleAddSuggestedEntry}
                isBoardActive={Boolean(activeBoard)}
              />
            ))
          ) : (
            <EmptyCard text='No next moves detected.' />
          )}
        </div>
      </div>

      <BoardEntryManagementPanel
        entries={entries}
        onRemoveEntry={handleRemoveEntry}
      />

      <div className='mt-6'>
        <h3
          className='text-base font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Missing elements
        </h3>
        <p className='mt-1 text-sm' style={{ color: "var(--text-secondary)" }}>
          Gaps that weaken spatial logic or sequencing.
        </p>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {summary.gapSignals.length ? (
            summary.gapSignals.map((signal) => (
              <SignalCard
                key={signal.title}
                title={signal.title}
                description={signal.description}
                implication={signal.implication}
              />
            ))
          ) : (
            <EmptyCard text='No major missing elements detected.' />
          )}
        </div>
      </div>

      <div className='mt-6'>
        <h3
          className='text-base font-semibold'
          style={{ color: "var(--text-primary)" }}
        >
          Tensions
        </h3>
        <p className='mt-1 text-sm' style={{ color: "var(--text-secondary)" }}>
          Conflicts that need a design decision before the board becomes a
          strong brief.
        </p>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {summary.tensions.length ? (
            summary.tensions.map((tension) => (
              <SignalCard
                key={tension.title}
                title={tension.title}
                description={tension.description}
              />
            ))
          ) : (
            <EmptyCard text='No major tensions detected in the current board.' />
          )}
        </div>
      </div>
    </section>
  );
}
