function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function tokenizeQuery(query) {
  return normalizeText(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function includesToken(value, token) {
  return normalizeText(value).includes(token);
}

function getEntrySearchCorpus(entry) {
  return [
    entry.term,
    entry.description,
    entry.notes,
    entry.type,
    entry.scale,
    entry.domain,
    entry.status,
    entry.region,
    entry.section,
    entry.sourceCategory,
    ...(entry.synonyms || []),
    ...(entry.related || []).flatMap((item) => [
      item?.id || "",
      item?.label || "",
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSemanticFieldMap(entry) {
  return {
    privacy: entry.privacyLevel,
    enclosure: entry.enclosureType,
    circulation: entry.circulationRole,
    social: entry.socialRole,
    logic: entry.spatialLogic,
    culture: entry.culturalSpecificity,
    ritual: entry.ritualWeight,
    climate: entry.climateResponse,
  };
}

function scoreSemanticToken(entry, token, reasons) {
  let score = 0;
  const semantic = getSemanticFieldMap(entry);

  const semanticChecks = [
    ["privacyLevel", entry.privacyLevel],
    ["enclosureType", entry.enclosureType],
    ["circulationRole", entry.circulationRole],
    ["socialRole", entry.socialRole],
    ["spatialLogic", entry.spatialLogic],
    ["culturalSpecificity", entry.culturalSpecificity],
    ["ritualWeight", entry.ritualWeight],
    ["climateResponse", entry.climateResponse],
  ];

  semanticChecks.forEach(([label, value]) => {
    if (includesToken(value, token)) {
      score += 8;
      reasons.push(`semantic ${label}: ${value}`);
    }
  });

  const semanticAliasGroups = [
    {
      aliases: [
        "private",
        "semi-private",
        "semi-public",
        "public",
        "restricted",
      ],
      value: semantic.privacy,
      reason: "privacy intent",
    },
    {
      aliases: ["open", "semi-open", "enclosed", "edge", "courtyard"],
      value: semantic.enclosure,
      reason: "enclosure intent",
    },
    {
      aliases: ["primary", "secondary", "threshold", "nodal"],
      value: semantic.circulation,
      reason: "circulation intent",
    },
    {
      aliases: [
        "gathering",
        "reception",
        "movement",
        "waiting",
        "ritual",
        "service",
        "dwelling",
        "mixed",
      ],
      value: semantic.social,
      reason: "social intent",
    },
    {
      aliases: [
        "axial",
        "linear",
        "centralized",
        "distributed",
        "nested",
        "transitional",
        "perimeter",
        "courtyard",
      ],
      value: semantic.logic,
      reason: "spatial logic intent",
    },
    {
      aliases: ["generalized", "regional", "specific"],
      value: semantic.culture,
      reason: "cultural specificity intent",
    },
    {
      aliases: ["none", "low", "medium", "high"],
      value: semantic.ritual,
      reason: "ritual weight intent",
    },
    {
      aliases: [
        "shade",
        "ventilation",
        "thermal",
        "courtyard",
        "neutral",
        "buffer",
      ],
      value: semantic.climate,
      reason: "climate intent",
    },
  ];

  semanticAliasGroups.forEach((group) => {
    const aliasMatched = group.aliases.some(
      (alias) => alias.includes(token) || token.includes(alias),
    );
    if (aliasMatched && includesToken(group.value, token)) {
      score += 6;
      reasons.push(`${group.reason}: ${group.value}`);
    }
  });

  return score;
}

function scoreEntryAgainstQuery(entry, query) {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) {
    return {
      score: 0,
      reasons: [],
    };
  }

  const corpus = getEntrySearchCorpus(entry);
  const reasons = [];
  let score = 0;

  tokens.forEach((token) => {
    if (includesToken(entry.term, token)) {
      score += 20;
      reasons.push(`term match: ${entry.term}`);
    }

    if ((entry.synonyms || []).some((item) => includesToken(item, token))) {
      score += 14;
      reasons.push("synonym match");
    }

    if (includesToken(entry.type, token)) {
      score += 10;
      reasons.push(`type match: ${entry.type}`);
    }

    if (includesToken(entry.domain, token)) {
      score += 10;
      reasons.push(`domain match: ${entry.domain}`);
    }

    if (includesToken(entry.region, token)) {
      score += 8;
      reasons.push(`region match: ${entry.region}`);
    }

    if (includesToken(entry.description, token)) {
      score += 6;
      reasons.push("description match");
    }

    if (includesToken(entry.notes, token)) {
      score += 5;
      reasons.push("note match");
    }

    if (corpus.includes(token)) {
      score += 2;
    }

    score += scoreSemanticToken(entry, token, reasons);
  });

  const uniqueReasons = [...new Set(reasons)];

  return {
    score,
    reasons: uniqueReasons,
  };
}

export function searchEntries(entries, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return entries.map((entry) => ({
      ...entry,
      __searchScore: 0,
      __searchWhy: [],
    }));
  }

  return entries
    .map((entry) => {
      const result = scoreEntryAgainstQuery(entry, normalizedQuery);

      return {
        ...entry,
        __searchScore: result.score,
        __searchWhy: result.reasons,
      };
    })
    .filter((entry) => entry.__searchScore > 0)
    .sort((a, b) => {
      if (b.__searchScore !== a.__searchScore) {
        return b.__searchScore - a.__searchScore;
      }
      return a.term.localeCompare(b.term);
    });
}
