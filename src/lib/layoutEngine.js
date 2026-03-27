function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function uniqueById(entries) {
  const seen = new Set();
  const result = [];

  entries.forEach((entry) => {
    if (!entry || !entry.id || seen.has(entry.id)) return;
    seen.add(entry.id);
    result.push(entry);
  });

  return result;
}

function scoreEntryRole(entry) {
  let score = 0;

  const privacy = normalize(entry.privacyLevel);
  const type = normalize(entry.type);
  const socialRole = normalize(entry.socialRole);
  const circulationRole = normalize(entry.circulationRole);
  const spatialLogic = normalize(entry.spatialLogic);

  if (privacy === "public") score += 0;
  else if (privacy === "semi-public") score += 20;
  else if (privacy === "semi-private") score += 40;
  else if (privacy === "private") score += 60;
  else if (privacy === "restricted") score += 80;
  else score += 50;

  if (type === "threshold") score -= 8;
  if (type === "circulation") score -= 4;
  if (circulationRole === "primary") score -= 6;
  if (circulationRole === "secondary") score -= 3;
  if (circulationRole === "threshold") score -= 5;
  if (socialRole === "reception") score -= 4;
  if (socialRole === "movement") score -= 5;
  if (socialRole === "waiting") score -= 2;
  if (socialRole === "dwelling") score += 4;
  if (socialRole === "ritual") score += 6;
  if (spatialLogic === "transitional") score -= 3;
  if (spatialLogic === "nested") score += 2;

  return score;
}

function sortEntriesForSequence(entries) {
  return [...entries].sort((left, right) => {
    const leftScore = scoreEntryRole(left);
    const rightScore = scoreEntryRole(right);

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return String(left.term || "").localeCompare(String(right.term || ""));
  });
}

function buildZones(entries) {
  const zones = {
    public: [],
    transition: [],
    private: [],
    service: [],
  };

  entries.forEach((entry) => {
    const privacy = normalize(entry.privacyLevel);
    const socialRole = normalize(entry.socialRole);
    const type = normalize(entry.type);

    if (
      socialRole === "service" ||
      type === "service" ||
      type === "technical"
    ) {
      zones.service.push(entry);
      return;
    }

    if (privacy === "public") {
      zones.public.push(entry);
      return;
    }

    if (privacy === "semi-public" || privacy === "semi-private") {
      zones.transition.push(entry);
      return;
    }

    if (privacy === "private" || privacy === "restricted") {
      zones.private.push(entry);
      return;
    }

    zones.transition.push(entry);
  });

  return zones;
}

function detectCirculation(entries) {
  const circulationEntries = entries.filter((entry) => {
    return (
      normalize(entry.type) === "circulation" ||
      normalize(entry.circulationRole) === "primary" ||
      normalize(entry.circulationRole) === "secondary" ||
      normalize(entry.circulationRole) === "threshold"
    );
  });

  const thresholdEntries = entries.filter(
    (entry) => normalize(entry.type) === "threshold",
  );

  if (!circulationEntries.length && !thresholdEntries.length) {
    return {
      type: "implicit",
      description:
        "No explicit circulation system detected. Movement is inferred from sequence order.",
    };
  }

  if (circulationEntries.length <= 1 && thresholdEntries.length <= 1) {
    return {
      type: "linear",
      description:
        "A mostly linear movement spine is suggested by the current board.",
    };
  }

  if (
    entries.some((entry) => normalize(entry.spatialLogic) === "centralized") ||
    entries.some((entry) => normalize(entry.spatialLogic) === "courtyard")
  ) {
    return {
      type: "centralized",
      description:
        "A centralized circulation system is suggested around a core or organizing center.",
    };
  }

  return {
    type: "network",
    description:
      "Multiple movement and threshold elements suggest a branching or networked circulation structure.",
  };
}

function buildSequence(entries) {
  const uniqueEntries = uniqueById(entries);
  return sortEntriesForSequence(uniqueEntries);
}

function buildAdjacencyEdges(sequence, circulation) {
  const edges = [];

  if (!sequence.length) return edges;

  for (let index = 0; index < sequence.length - 1; index += 1) {
    edges.push({
      from: sequence[index].id,
      to: sequence[index + 1].id,
      type: "primary",
      label: "primary adjacency",
      strength: "strong",
    });
  }

  if (circulation && circulation.type === "network") {
    for (let index = 0; index < sequence.length - 2; index += 1) {
      edges.push({
        from: sequence[index].id,
        to: sequence[index + 2].id,
        type: "secondary",
        label: "secondary adjacency",
        strength: "medium",
      });
    }
  }

  if (
    circulation &&
    circulation.type === "centralized" &&
    sequence.length >= 3
  ) {
    const hubIndex = Math.floor(sequence.length / 2);
    const hub = sequence[hubIndex];

    sequence.forEach((entry, index) => {
      if (index === hubIndex) return;

      edges.push({
        from: hub.id,
        to: entry.id,
        type: "hub",
        label: "hub connection",
        strength: "medium",
      });
    });
  }

  return dedupeEdges(edges);
}

function dedupeEdges(edges) {
  const seen = new Set();
  const result = [];

  edges.forEach((edge) => {
    const key = [edge.from, edge.to, edge.type].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    result.push(edge);
  });

  return result;
}

function detectSpatialPattern(entries, circulation, zones) {
  const spatialLogics = entries.map((entry) => normalize(entry.spatialLogic));
  const logicSet = new Set(spatialLogics);

  if (circulation && circulation.type === "centralized") {
    return {
      type: "centralized",
      description:
        "The board reads as a centralized system, with one core or anchor organizing surrounding entries.",
    };
  }

  if (logicSet.has("courtyard")) {
    return {
      type: "courtyard",
      description:
        "The board suggests courtyard-tempered organization, where surrounding spaces are oriented around an open internal anchor.",
    };
  }

  if (logicSet.has("nested")) {
    return {
      type: "nested",
      description:
        "The board suggests a nested structure, where inner protected spaces are reached through outer layers.",
    };
  }

  if ((zones.transition || []).length >= 2) {
    return {
      type: "sequenced-gradient",
      description:
        "The board reads as a sequenced privacy gradient with multiple transitional steps between public and protected space.",
    };
  }

  return {
    type: "linear",
    description:
      "The board reads as a linear sequence, with entries primarily arranged in a forward progression.",
  };
}

function buildBranches(sequence, edges) {
  const bySource = new Map();

  edges.forEach((edge) => {
    if (!bySource.has(edge.from)) {
      bySource.set(edge.from, []);
    }
    bySource.get(edge.from).push(edge.to);
  });

  return sequence.map((entry) => {
    return {
      id: entry.id,
      term: entry.term,
      nextIds: bySource.get(entry.id) || [],
    };
  });
}

function buildNarrative(sequence, circulation, pattern) {
  if (!sequence.length) {
    return "No layout narrative available.";
  }

  const terms = sequence.map((entry) => entry.term).join(" → ");

  return (
    "Spatial sequence: " +
    terms +
    ". Circulation reads as " +
    (circulation ? circulation.type : "implicit") +
    ", while the overall pattern reads as " +
    (pattern ? pattern.type : "linear") +
    "."
  );
}

function buildZoneSummary(zones) {
  function mapTerms(items) {
    return items.map((entry) => entry.term);
  }

  return {
    public: mapTerms(zones.public || []),
    transition: mapTerms(zones.transition || []),
    private: mapTerms(zones.private || []),
    service: mapTerms(zones.service || []),
  };
}

function buildWarnings(sequence, zones, circulation) {
  const warnings = [];

  if (!(zones.public || []).length) {
    warnings.push("No clear public zone detected.");
  }

  if (!(zones.private || []).length) {
    warnings.push("No clear private zone detected.");
  }

  if (!(zones.transition || []).length && sequence.length >= 3) {
    warnings.push(
      "No transition zone detected between exposed and protected spaces.",
    );
  }

  if (circulation && circulation.type === "implicit" && sequence.length >= 4) {
    warnings.push("Sequence is long, but circulation remains implicit.");
  }

  return warnings;
}

function buildDiagramNodes(sequence, zones) {
  const zoneById = new Map();

  (zones.public || []).forEach((entry) => zoneById.set(entry.id, "public"));
  (zones.transition || []).forEach((entry) =>
    zoneById.set(entry.id, "transition"),
  );
  (zones.private || []).forEach((entry) => zoneById.set(entry.id, "private"));
  (zones.service || []).forEach((entry) => zoneById.set(entry.id, "service"));

  return sequence.map((entry, index) => {
    return {
      id: entry.id,
      term: entry.term,
      zone: zoneById.get(entry.id) || "transition",
      order: index + 1,
      privacyLevel: entry.privacyLevel || "",
      type: entry.type || "",
    };
  });
}

export function buildLayout(entries) {
  const safeEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];

  if (!safeEntries.length) {
    return {
      sequence: [],
      edges: [],
      zones: {
        public: [],
        transition: [],
        private: [],
        service: [],
      },
      circulation: null,
      pattern: null,
      branches: [],
      narrative: "No layout narrative available.",
      zoneSummary: {
        public: [],
        transition: [],
        private: [],
        service: [],
      },
      warnings: [],
      diagramNodes: [],
    };
  }

  const sequence = buildSequence(safeEntries);
  const zones = buildZones(safeEntries);
  const circulation = detectCirculation(safeEntries);
  const pattern = detectSpatialPattern(safeEntries, circulation, zones);
  const edges = buildAdjacencyEdges(sequence, circulation);
  const branches = buildBranches(sequence, edges);
  const narrative = buildNarrative(sequence, circulation, pattern);
  const zoneSummary = buildZoneSummary(zones);
  const warnings = buildWarnings(sequence, zones, circulation);
  const diagramNodes = buildDiagramNodes(sequence, zones);

  return {
    sequence,
    edges,
    zones,
    circulation,
    pattern,
    branches,
    narrative,
    zoneSummary,
    warnings,
    diagramNodes,
  };
}
