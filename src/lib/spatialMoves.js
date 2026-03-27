function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function includesAny(value, terms) {
  const text = normalize(value);
  return terms.some((term) => text.includes(term));
}

function countMatchingEntries(entries, matcher) {
  return entries.reduce((count, entry) => {
    return matcher(entry) ? count + 1 : count;
  }, 0);
}

function hasAny(entries, matcher) {
  return countMatchingEntries(entries, matcher) > 0;
}

function detectSignals(entries) {
  return {
    hasThreshold: hasAny(
      entries,
      (entry) =>
        normalize(entry?.type) === "threshold" ||
        includesAny(entry?.term, [
          "entry",
          "vestibule",
          "foyer",
          "narthex",
          "antechamber",
          "engawa",
          "airlock",
        ]),
    ),
    hasCirculation: hasAny(
      entries,
      (entry) =>
        normalize(entry?.type) === "circulation" ||
        includesAny(entry?.term, ["corridor", "gallery", "hall", "passage"]),
    ),
    hasHosting: hasAny(
      entries,
      (entry) =>
        includesAny(entry?.term, [
          "living",
          "majlis",
          "salon",
          "guest",
          "dining",
          "drawing",
          "reception",
        ]) || includesAny(entry?.socialRole, ["gathering", "reception"]),
    ),
    hasRetreat: hasAny(
      entries,
      (entry) =>
        includesAny(entry?.term, [
          "bed",
          "suite",
          "study",
          "office",
          "library",
        ]) || includesAny(entry?.privacyLevel, ["private", "restricted"]),
    ),
    hasService: hasAny(
      entries,
      (entry) =>
        includesAny(entry?.term, [
          "kitchen",
          "pantry",
          "storage",
          "laundry",
          "bath",
          "toilet",
          "wc",
          "service",
          "utility",
          "mechanical",
        ]) || normalize(entry?.zone) === "service",
    ),
    hasCourtyard: hasAny(entries, (entry) =>
      includesAny(entry?.term, ["courtyard", "sahn", "patio"]),
    ),
  };
}

function pushMove(list, move) {
  if (!move || !move.title) return;
  if (list.some((item) => item.title === move.title)) return;
  list.push(move);
}

function buildMove({
  title,
  intent,
  spatialInstruction,
  diagramCue,
  avoid,
  priority = "Core",
}) {
  return {
    title,
    intent,
    spatialInstruction,
    diagramCue,
    avoid,
    priority,
  };
}

function buildIdentityLead(identity, summary) {
  if (!identity || !summary) {
    return "Translate the current direction into a small set of diagram-level spatial moves before developing architectural layouts.";
  }

  return `${identity.title} should be translated as a spatial sequence, not just a list of rooms. Use the moves below to convert the current direction into adjacency, depth, and zonal structure.`;
}

export function buildSpatialMoves(summary, identity, entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const moves = [];
  const signals = detectSignals(safeEntries);

  const privacyModel = summary?.privacyModel || "";
  const socialModel = summary?.socialModel || "";
  const circulationModel = summary?.circulationModel || "";
  const serviceStrategy = summary?.serviceStrategy || "";
  const identityTitle = normalize(identity?.title);

  if (privacyModel === "Layered" || identityTitle.includes("layered")) {
    pushMove(
      moves,
      buildMove({
        title: "Build a depth gradient",
        intent:
          "Turn the board into a readable progression from exposed arrival to protected retreat.",
        spatialInstruction:
          "Place the most public receiving or arrival spaces at the front, use one or two threshold spaces as a buffer, and place private rooms at the deepest end of the sequence.",
        diagramCue:
          "Draw three bands or nested layers: front/public → middle/threshold → back/private.",
        avoid:
          "Do not let private rooms open directly onto the first point of entry.",
        priority: "Core",
      }),
    );
  }

  if (circulationModel === "Controlled" || signals.hasCirculation) {
    pushMove(
      moves,
      buildMove({
        title: "Establish a primary movement spine",
        intent:
          "Give the direction a legible organizing path rather than scattered access.",
        spatialInstruction:
          "Select one main hall, gallery, or corridor as the primary access line, then attach major rooms to it in a clear order instead of allowing room-to-room drift.",
        diagramCue:
          "Draw one strong axis or bent spine first, then attach zones on either side.",
        avoid:
          "Avoid multiple equal circulation paths competing for dominance.",
        priority: "Core",
      }),
    );
  }

  if (signals.hasThreshold || privacyModel === "Layered") {
    pushMove(
      moves,
      buildMove({
        title: "Thicken the threshold",
        intent:
          "Make arrival transitional rather than abrupt so the project controls exposure.",
        spatialInstruction:
          "Insert a vestibule, foyer, narthex, engawa, or antechamber between the outside edge and the main social or domestic rooms.",
        diagramCue:
          "Represent entry as a small zone of compression before the first major room.",
        avoid:
          "Do not let the entrance door expose the whole internal hierarchy at once.",
        priority: "Core",
      }),
    );
  }

  if (socialModel === "Guest-centered" || signals.hasHosting) {
    pushMove(
      moves,
      buildMove({
        title: "Anchor a public-facing social room",
        intent:
          "Give the board a clear front-facing space for reception, gathering, or formal use.",
        spatialInstruction:
          "Place the main living, majlis, salon, guest, or dining space near the front of the sequence, but still after a threshold layer if privacy matters.",
        diagramCue:
          "Draw one dominant hosting room near entry, then route deeper family or retreat spaces behind it.",
        avoid: "Do not bury the main receiving space behind private rooms.",
        priority: "Core",
      }),
    );
  }

  if (socialModel === "Family-centered" || identityTitle.includes("domestic")) {
    pushMove(
      moves,
      buildMove({
        title: "Protect the family core",
        intent:
          "Keep daily domestic life legible and protected from the public edge.",
        spatialInstruction:
          "Cluster family-use rooms such as living, dining, kitchen, bedroom, study, or office into a more internal zone with limited direct exposure from entry.",
        diagramCue:
          "Draw a protected interior cluster, then place public-facing rooms at the perimeter of access.",
        avoid:
          "Avoid forcing everyday family circulation through formal reception space.",
        priority: "Core",
      }),
    );
  }

  if (
    signals.hasService ||
    serviceStrategy === "Attached" ||
    serviceStrategy === "Integrated"
  ) {
    pushMove(
      moves,
      buildMove({
        title: "Attach service to served rooms",
        intent:
          "Make support spaces reinforce the primary spatial order rather than float independently.",
        spatialInstruction:
          "Place kitchen near dining or family gathering, place bath near retreat rooms, and keep storage or utility spaces on the back or side edge of the main sequence.",
        diagramCue:
          "Draw primary rooms first, then pin service pockets to their logical host rooms.",
        avoid:
          "Do not let service rooms become the main organizers of the whole plan.",
        priority: "Support",
      }),
    );
  }

  if (signals.hasCourtyard || identityTitle.includes("courtyard")) {
    pushMove(
      moves,
      buildMove({
        title: "Use the courtyard as a stabilizing field",
        intent:
          "Let the open center mediate light, privacy, and shared orientation.",
        spatialInstruction:
          "Orient major rooms toward the courtyard and use it as the common reference field rather than treating it as leftover exterior space.",
        diagramCue:
          "Draw the courtyard first, then ring or edge the rooms around it by degree of privacy.",
        avoid:
          "Avoid making the courtyard visually disconnected from the rooms it is supposed to organize.",
        priority: "Core",
      }),
    );
  }

  if (summary?.tensions?.length) {
    pushMove(
      moves,
      buildMove({
        title: "Separate conflicting worlds",
        intent:
          "Resolve the strongest current tension by giving opposing uses different positional logic.",
        spatialInstruction:
          "If the board mixes open social space with deep privacy, use thresholds, offsets, or separate branches so these worlds do not collapse into one undifferentiated cluster.",
        diagramCue:
          "Split the diagram into a main sequence plus a protected branch or back layer.",
        avoid: "Do not solve every tension by simple adjacency alone.",
        priority: "Critical",
      }),
    );
  }

  if (summary?.gapSignals?.length) {
    pushMove(
      moves,
      buildMove({
        title: "Fill the missing structural role",
        intent:
          "Add the spatial role the board is currently lacking before refining geometry.",
        spatialInstruction:
          "Read the missing-element list and add the absent organizer first: threshold, circulation, public anchor, or private anchor.",
        diagramCue:
          "Treat the missing role as a diagram piece, not as a decorative room.",
        avoid:
          "Avoid refining proportions before the missing role exists in the diagram.",
        priority: "Critical",
      }),
    );
  }

  if (moves.length < 5) {
    pushMove(
      moves,
      buildMove({
        title: "Differentiate front, middle, and back",
        intent:
          "Ensure the diagram has positional hierarchy even before detailed planning.",
        spatialInstruction:
          "Assign each space to one of three positional roles: front-facing, mediating, or protected. Then test whether the order feels intentional.",
        diagramCue:
          "Sketch a three-part sequence before drawing precise room sizes.",
        avoid:
          "Do not keep all rooms on one flat level of access and exposure.",
        priority: "Support",
      }),
    );
  }

  return {
    headline: buildIdentityLead(identity, summary),
    translatorLabel: identity?.title || "Spatial direction",
    moves: moves.slice(0, 6),
  };
}
