import { useEffect, useMemo, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { entries as baseEntries } from "../data/entries";
import { sections } from "../data/sections";
import { useAtlasSearch } from "../hooks/useAtlasSearch";
import { validateEntries } from "../lib/validateEntries";
import { buildSemanticClusters } from "../lib/buildSemanticClusters";
import { buildEntryGraph } from "../lib/buildEntryGraph";
import { buildDesignDirectionPacket } from "../lib/designDirectionPacket";
import HeroHeader from "../components/hero/HeroHeader";
import FilterToolbar from "../components/filters/FilterToolbar";
import Sidebar from "../components/layout/Sidebar";
import AtlasUtilityBar from "../components/layout/AtlasUtilityBar";
import AtlasQuickDrawer from "../components/layout/AtlasQuickDrawer";
import KeyboardShortcutsHelp from "../components/layout/KeyboardShortcutsHelp";
import DebugPanel from "../components/debug/DebugPanel";
import ViewModeTopNav from "../components/layout/ViewModeTopNav";
import { buildDirectionVersionSnapshot } from "../lib/directionVersions";
import AtlasView from "./views/AtlasView";
import ClusterView from "./views/ClusterView";
import GraphView from "./views/GraphView";
import MinimalView from "./views/MinimalView";
import useAtlasKeyboardShortcuts from "./hooks/useAtlasKeyboardShortcuts";
import useAtlasPersistence from "./hooks/useAtlasPersistence";
import useAtlasBoardActions from "./hooks/useAtlasBoardActions";
import {
  createDecisionEvent,
  getDecisionLogForBoard,
  mergeDecisionProfiles,
  summarizeDecisionProfile,
} from "../lib/userDecisionLearning";
import SecondaryToolsDock from "./panels/SecondaryToolsDock";
import { getEntryPreferenceBoost } from "../lib/preferenceScoring";
import {
  getSafeComparePairs,
  getSafeEntryIds,
  normalizeEntryIds,
} from "../lib/boardUtils";
import OnboardingHeader from "../components/hero/OnboardingHeader";

const PINNED_STORAGE_KEY = "architectural-atlas-pinned-entries";
const COMPARE_HISTORY_STORAGE_KEY = "architectural-atlas-compare-history";
const ENTRY_OVERRIDES_STORAGE_KEY = "architectural-atlas-entry-overrides";
const SAVED_COLLECTIONS_STORAGE_KEY = "architectural-atlas-saved-collections";
const PROJECT_BOARDS_STORAGE_KEY = "architectural-atlas-project-boards";
const ACTIVE_PROJECT_BOARD_STORAGE_KEY =
  "architectural-atlas-active-project-board";
const DIRECTION_VERSIONS_STORAGE_KEY = "architectural-atlas-direction-versions";
const MAX_COMPARE_HISTORY = 12;
const DECISION_LOG_STORAGE_KEY = "architectural-atlas-decision-log";

function countSharedValues(listA = [], listB = []) {
  const setB = new Set(listB.map((item) => String(item).toLowerCase()));

  return listA.reduce((count, item) => {
    return setB.has(String(item).toLowerCase()) ? count + 1 : count;
  }, 0);
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function scoreOrdinalCloseness(left, right, orderedValues, pointsMap) {
  const leftIndex = orderedValues.indexOf(normalizeValue(left));
  const rightIndex = orderedValues.indexOf(normalizeValue(right));

  if (leftIndex === -1 || rightIndex === -1) return 0;

  const distance = Math.abs(leftIndex - rightIndex);
  return pointsMap[distance] || 0;
}

function scoreSetCompatibility(left, right, compatibilityMap) {
  const leftKey = normalizeValue(left);
  const rightKey = normalizeValue(right);

  if (leftKey === rightKey) {
    return compatibilityMap.exact || 0;
  }

  const forward = compatibilityMap[leftKey + "|" + rightKey];
  const backward = compatibilityMap[rightKey + "|" + leftKey];

  return forward || backward || 0;
}

function getSemanticBreakdown(baseEntry, candidate) {
  const breakdown = [];

  function push(label, points) {
    if (points > 0) {
      breakdown.push({ label, points });
    }
  }

  const privacyPoints = scoreOrdinalCloseness(
    baseEntry.privacyLevel,
    candidate.privacyLevel,
    ["public", "semi-public", "semi-private", "private", "restricted"],
    { 0: 8, 1: 5, 2: 2 },
  );
  push("privacy alignment", privacyPoints);

  const enclosurePoints = scoreSetCompatibility(
    baseEntry.enclosureType,
    candidate.enclosureType,
    {
      exact: 7,
      "open|semi-open": 4,
      "semi-open|edge-conditioned": 4,
      "enclosed|linear-enclosed": 4,
      "enclosed|edge-conditioned": 2,
    },
  );
  push("enclosure alignment", enclosurePoints);

  const circulationPoints = scoreSetCompatibility(
    baseEntry.circulationRole,
    candidate.circulationRole,
    {
      exact: 7,
      "primary|secondary": 4,
      "threshold|nodal": 4,
      "primary|threshold": 2,
      "secondary|threshold": 2,
    },
  );
  push("circulation compatibility", circulationPoints);

  const socialRolePoints = scoreSetCompatibility(
    baseEntry.socialRole,
    candidate.socialRole,
    {
      exact: 8,
      "reception|gathering": 4,
      "gathering|mixed": 4,
      "reception|mixed": 4,
      "movement|waiting": 3,
      "service|dwelling": 1,
      "ritual|gathering": 3,
      "ritual|mixed": 2,
    },
  );
  push("social role alignment", socialRolePoints);

  const spatialLogicPoints = scoreSetCompatibility(
    baseEntry.spatialLogic,
    candidate.spatialLogic,
    {
      exact: 7,
      "axial|linear": 4,
      "centralized|courtyard": 4,
      "perimeter|courtyard": 5,
      "transitional|nested": 3,
      "transitional|perimeter": 2,
      "distributed|centralized": 1,
    },
  );
  push("spatial logic alignment", spatialLogicPoints);

  const culturePoints = scoreOrdinalCloseness(
    baseEntry.culturalSpecificity,
    candidate.culturalSpecificity,
    ["generalized", "regional", "highly-specific"],
    { 0: 5, 1: 3 },
  );
  push("cultural specificity alignment", culturePoints);

  const ritualPoints = scoreOrdinalCloseness(
    baseEntry.ritualWeight,
    candidate.ritualWeight,
    ["none", "low", "medium", "high"],
    { 0: 5, 1: 3, 2: 1 },
  );
  push("ritual alignment", ritualPoints);

  const climatePoints = scoreSetCompatibility(
    baseEntry.climateResponse,
    candidate.climateResponse,
    {
      exact: 5,
      "thermal-buffer|shade-oriented": 2,
      "thermal-buffer|ventilation-oriented": 2,
      "courtyard-tempered|shade-oriented": 3,
      "courtyard-tempered|ventilation-oriented": 3,
    },
  );
  push("climate alignment", climatePoints);

  return breakdown;
}

function getEntryScore(baseEntry, candidate) {
  let score = 0;

  if (candidate.type === baseEntry.type) score += 10;
  if (candidate.domain === baseEntry.domain) score += 8;
  if (candidate.region === baseEntry.region) score += 6;
  if (candidate.section === baseEntry.section) score += 4;
  if (candidate.scale === baseEntry.scale) score += 4;
  if (candidate.status === baseEntry.status) score += 2;
  if (candidate.sourceCategory === baseEntry.sourceCategory) score += 3;

  score += countSharedValues(baseEntry.synonyms, candidate.synonyms) * 2;

  const semanticBreakdown = getSemanticBreakdown(baseEntry, candidate);
  score += semanticBreakdown.reduce((sum, item) => sum + item.points, 0);

  return score;
}

function rankEntries(baseEntry, pool, reason, decisionProfile) {
  return [...pool]
    .map((entry) => {
      const semanticBreakdown = getSemanticBreakdown(baseEntry, entry);
      const baseScore = getEntryScore(baseEntry, entry);
      const preferenceBoost = getEntryPreferenceBoost(entry, decisionProfile);

      return {
        ...entry,
        __score: baseScore + preferenceBoost,
        __baseScore: baseScore,
        __preferenceBoost: preferenceBoost,
        __semanticBreakdown: semanticBreakdown,
        recommendationReason: reason,
      };
    })
    .sort((a, b) => {
      if (b.__score !== a.__score) return b.__score - a.__score;
      return a.term.localeCompare(b.term);
    });
}

function takeUnique(items, seenIds, limit = 6) {
  const result = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    result.push(item);
    if (result.length >= limit) break;
  }

  return result;
}

function getInitialUrlState(entriesDataset) {
  const params = new URLSearchParams(window.location.search);

  const entryId = params.get("entry");
  const selectedEntryId =
    entryId && entriesDataset.some((entry) => entry.id === entryId)
      ? entryId
      : null;

  const compareParam = params.get("compare") || "";
  const compareEntryIds = compareParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .filter((id) => entriesDataset.some((entry) => entry.id === id))
    .slice(0, 2);

  const view = params.get("view") || "atlas";

  return {
    selectedEntryId,
    compareEntryIds,
    view: ["atlas", "clusters", "graph"].includes(view) ? view : "atlas",
    filters: {
      query: params.get("query") || "",
      type: params.get("type") || "",
      scale: params.get("scale") || "",
      domain: params.get("domain") || "",
      status: params.get("status") || "",
      region: params.get("region") || "",
      privacyLevel: params.get("privacyLevel") || "",
      enclosureType: params.get("enclosureType") || "",
      circulationRole: params.get("circulationRole") || "",
      socialRole: params.get("socialRole") || "",
      spatialLogic: params.get("spatialLogic") || "",
      culturalSpecificity: params.get("culturalSpecificity") || "",
      ritualWeight: params.get("ritualWeight") || "",
      climateResponse: params.get("climateResponse") || "",
      sortBy: params.get("sortBy") || "term",
    },
  };
}

function writeUrlState({
  selectedEntryId,
  compareEntryIds,
  filters,
  activeView,
}) {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (selectedEntryId) params.set("entry", selectedEntryId);
  else params.delete("entry");

  if (compareEntryIds && compareEntryIds.length) {
    params.set("compare", compareEntryIds.join(","));
  } else {
    params.delete("compare");
  }

  if (activeView && activeView !== "atlas") {
    params.set("view", activeView);
  } else {
    params.delete("view");
  }

  const filterKeys = [
    "query",
    "type",
    "scale",
    "domain",
    "status",
    "region",
    "privacyLevel",
    "enclosureType",
    "circulationRole",
    "socialRole",
    "spatialLogic",
    "culturalSpecificity",
    "ritualWeight",
    "climateResponse",
  ];

  filterKeys.forEach((key) => {
    if (filters[key]) params.set(key, filters[key]);
    else params.delete(key);
  });

  if (filters.sortBy && filters.sortBy !== "term") {
    params.set("sortBy", filters.sortBy);
  } else {
    params.delete("sortBy");
  }

  window.history.replaceState({}, "", url);
}

function getInitialPinnedIds(entriesDataset) {
  try {
    const raw = window.localStorage.getItem(PINNED_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((id) =>
      entriesDataset.some((entry) => entry.id === id),
    );
  } catch {
    return [];
  }
}

function getInitialCompareHistory() {
  try {
    const raw = window.localStorage.getItem(COMPARE_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

function getInitialEntryOverrides() {
  try {
    const raw = window.localStorage.getItem(ENTRY_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getInitialSavedCollections() {
  try {
    const raw = window.localStorage.getItem(SAVED_COLLECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInitialProjectBoards() {
  try {
    const raw = window.localStorage.getItem(PROJECT_BOARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInitialActiveProjectBoardId() {
  try {
    return (
      window.localStorage.getItem(ACTIVE_PROJECT_BOARD_STORAGE_KEY) || null
    );
  } catch {
    return null;
  }
}
function getInitialDirectionVersions() {
  try {
    const raw = window.localStorage.getItem(DIRECTION_VERSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function mergeEntriesWithOverrides(entriesDataset, overrides) {
  return entriesDataset.map((entry) => {
    const override = overrides[entry.id];
    if (!override) return entry;
    return {
      ...entry,
      ...override,
      synonyms: Array.isArray(override.synonyms)
        ? override.synonyms
        : entry.synonyms,
      related: Array.isArray(override.related)
        ? override.related
        : entry.related,
    };
  });
}

function getCompareSemanticSnapshot(leftEntry, rightEntry) {
  let score = 0;

  if (leftEntry.type === rightEntry.type) score += 12;
  if (leftEntry.domain === rightEntry.domain) score += 10;
  if (leftEntry.region === rightEntry.region) score += 6;
  if (leftEntry.section === rightEntry.section) score += 4;
  if (leftEntry.scale === rightEntry.scale) score += 4;
  if (leftEntry.sourceCategory === rightEntry.sourceCategory) score += 3;

  score += countSharedValues(leftEntry.synonyms, rightEntry.synonyms) * 2;

  const semanticBreakdown = getSemanticBreakdown(leftEntry, rightEntry);
  score += semanticBreakdown.reduce((sum, item) => sum + item.points, 0);

  score = Math.min(score, 100);

  let label = "Distinct concepts";
  if (score >= 70) label = "Same family";
  else if (score >= 45) label = "Adjacent family";

  return { score, label };
}

function buildCompareHistoryItem(ids, entriesDataset) {
  if (!Array.isArray(ids) || ids.length !== 2) return null;

  const leftEntry = entriesDataset.find((entry) => entry.id === ids[0]);
  const rightEntry = entriesDataset.find((entry) => entry.id === ids[1]);

  if (!leftEntry || !rightEntry) return null;

  const snapshot = getCompareSemanticSnapshot(leftEntry, rightEntry);
  const savedAt = new Date().toISOString();

  return {
    key: ids.join("__"),
    ids,
    terms: [leftEntry.term, rightEntry.term],
    score: snapshot.score,
    label: snapshot.label,
    savedAt,
    savedAtLabel: new Date(savedAt).toLocaleString(),
  };
}

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

function buildCollectionPayload(name, description, entryIds, entriesDataset) {
  const uniqueIds = [...new Set(entryIds.filter(Boolean))].filter((id) =>
    entriesDataset.some((entry) => entry.id === id),
  );

  if (!uniqueIds.length) return null;

  const entryTerms = uniqueIds
    .map((id) => {
      const entry = entriesDataset.find((item) => item.id === id);
      return entry ? entry.term : null;
    })
    .filter(Boolean);

  const createdAt = new Date().toISOString();

  return {
    id:
      "collection-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    name,
    description,
    entryIds: uniqueIds,
    entryTerms,
    createdAt,
    createdAtLabel: new Date(createdAt).toLocaleString(),
  };
}

function getInitialDecisionLog() {
  try {
    const raw = window.localStorage.getItem(DECISION_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [entryOverrides, setEntryOverrides] = useState(() =>
    getInitialEntryOverrides(),
  );
  const [theme, setTheme] = useState("dark");
  const boardIdCounterRef = useRef(1);
  const historyIdCounterRef = useRef(1);
  const snapshotIdCounterRef = useRef(1);
  const hasInitializedDemoRef = useRef(false);
  const entries = useMemo(() => {
    return mergeEntriesWithOverrides(baseEntries, entryOverrides);
  }, [entryOverrides]);

  const initialUrlState = useMemo(() => getInitialUrlState(entries), [entries]);
  const atlas = useAtlasSearch(entries, sections, initialUrlState.filters);

  const [highlightedEntryId, setHighlightedEntryId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(
    initialUrlState.selectedEntryId,
  );
  const [appliedTransformationHistory, setAppliedTransformationHistory] =
    useState([]);
  const [undoneTransformationHistory, setUndoneTransformationHistory] =
    useState([]);
  const [compareEntryIds, setCompareEntryIds] = useState(
    initialUrlState.compareEntryIds,
  );
  const [activeView, setActiveView] = useState(initialUrlState.view);

  const [pinnedEntryIds, setPinnedEntryIds] = useState(() =>
    getInitialPinnedIds(entries),
  );
  const [compareHistory, setCompareHistory] = useState(() => {
    const initial = getInitialCompareHistory();
    return Array.isArray(initial) ? initial : [];
  });
  const [decisionLog, setDecisionLog] = useState(() => getInitialDecisionLog());

  const [savedCollections, setSavedCollections] = useState(() =>
    getInitialSavedCollections(),
  );
  const [projectBoards, setProjectBoards] = useState(() =>
    getInitialProjectBoards(),
  );
  const [activeProjectBoardId, setActiveProjectBoardId] = useState(() =>
    getInitialActiveProjectBoardId(),
  );

  const [directionVersions, setDirectionVersions] = useState(() =>
    getInitialDirectionVersions(),
  );
  const [lastIntentSummaryLabel, setLastIntentSummaryLabel] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [compareLinkCopied, setCompareLinkCopied] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [minimalMode, setMinimalMode] = useState(false);
  const [showSecondaryTools, setShowSecondaryTools] = useState(false);
  const [secondaryToolsDockWidth, setSecondaryToolsDockWidth] = useState(720);
  const validationErrors = useMemo(() => validateEntries(entries), [entries]);

  const semanticClusters = useMemo(() => {
    return buildSemanticClusters(atlas.visibleEntries);
  }, [atlas.visibleEntries]);

  const selectedEntry = useMemo(() => {
    if (!selectedEntryId) return null;
    return entries.find((entry) => entry.id === selectedEntryId) || null;
  }, [selectedEntryId, entries]);

  const editingEntry = useMemo(() => {
    if (!editingEntryId) return null;
    return entries.find((entry) => entry.id === editingEntryId) || null;
  }, [editingEntryId, entries]);

  const entryGraph = useMemo(() => {
    return buildEntryGraph(atlas.visibleEntries, selectedEntry);
  }, [atlas.visibleEntries, selectedEntry]);

  const compareEntries = useMemo(() => {
    return entries.filter((entry) => compareEntryIds.includes(entry.id));
  }, [compareEntryIds, entries]);

  const pinnedEntries = useMemo(() => {
    return entries.filter((entry) => pinnedEntryIds.includes(entry.id));
  }, [pinnedEntryIds, entries]);

  const activeProjectBoard = useMemo(() => {
    if (!activeProjectBoardId) return null;
    return (
      projectBoards.find((board) => board.id === activeProjectBoardId) || null
    );
  }, [activeProjectBoardId, projectBoards]);

  const activeProjectBoardEntries = useMemo(() => {
    if (!activeProjectBoard) return [];
    const boardEntryIds = getSafeEntryIds(activeProjectBoard);
    return entries.filter((entry) => boardEntryIds.includes(entry.id));
  }, [activeProjectBoard, entries]);

  const hydratedActiveProjectBoard = useMemo(() => {
    if (!activeProjectBoard) return null;
    return {
      ...activeProjectBoard,
      entries: activeProjectBoardEntries,
    };
  }, [activeProjectBoard, activeProjectBoardEntries]);

  const activeBoardEntryIds = useMemo(() => {
    if (!activeProjectBoard) return [];
    return getSafeEntryIds(activeProjectBoard);
  }, [activeProjectBoard]);

  const globalDecisionProfile = useMemo(() => {
    return summarizeDecisionProfile(decisionLog);
  }, [decisionLog]);

  const activeBoardDecisionLog = useMemo(() => {
    return getDecisionLogForBoard(decisionLog, activeProjectBoardId);
  }, [decisionLog, activeProjectBoardId]);

  const activeBoardDecisionProfile = useMemo(() => {
    return summarizeDecisionProfile(activeBoardDecisionLog);
  }, [activeBoardDecisionLog]);

  const decisionProfile = useMemo(() => {
    return mergeDecisionProfiles(
      activeBoardDecisionProfile,
      globalDecisionProfile,
    );
  }, [activeBoardDecisionProfile, globalDecisionProfile]);

  const recommendedEntries = useMemo(() => {
    if (!selectedEntry) {
      return {
        sameType: [],
        sameDomain: [],
        sameRegion: [],
      };
    }

    const relatedIds = new Set(
      (selectedEntry.related || []).map((item) =>
        typeof item === "string" ? item : item.id,
      ),
    );

    const basePool = entries.filter(
      (entry) => entry.id !== selectedEntry.id && !relatedIds.has(entry.id),
    );

    const seenIds = new Set();

    const sameTypePool = rankEntries(
      selectedEntry,
      basePool.filter((entry) => entry.type === selectedEntry.type),
      "same type",
      decisionProfile,
    );

    const sameDomainPool = rankEntries(
      selectedEntry,
      basePool.filter((entry) => entry.domain === selectedEntry.domain),
      "same domain",
      decisionProfile,
    );

    const sameRegionPool = rankEntries(
      selectedEntry,
      basePool.filter((entry) => entry.region === selectedEntry.region),
      "same region",
      decisionProfile,
    );
    return {
      sameType: takeUnique(sameTypePool, seenIds, 6),
      sameDomain: takeUnique(sameDomainPool, seenIds, 6),
      sameRegion: takeUnique(sameRegionPool, seenIds, 6),
    };
  }, [selectedEntry, entries, decisionProfile]);

  const topSearchReasons = useMemo(() => {
    if (!atlas.debouncedQuery.trim()) return [];

    const reasonCounts = new Map();

    atlas.visibleEntries.slice(0, 12).forEach((entry) => {
      const reasons = Array.isArray(entry.__searchWhy) ? entry.__searchWhy : [];

      reasons.forEach((reason) => {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      });
    });

    return [...reasonCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map((item) => item[0]);
  }, [atlas.debouncedQuery, atlas.visibleEntries]);

  const isEditingDirty = useMemo(() => {
    if (!editingEntryId) return false;
    return Boolean(entryOverrides[editingEntryId]);
  }, [editingEntryId, entryOverrides]);

  const isAtlasView = activeView === "atlas";
  const isClusterView = activeView === "clusters";
  const isGraphView = activeView === "graph";

  const hasSelection = Boolean(selectedEntry);
  const hasBoard = Boolean(hydratedActiveProjectBoard);
  const hasSavedCollectionsFlag = savedCollections.length > 0;
  const hasOverridesFlag = Object.keys(entryOverrides).length > 0;
  const hasCompareHistoryFlag = compareHistory.length > 0;
  const hasPinnedEntries = pinnedEntries.length > 0;
  const secondaryToolsOpen = isAtlasView && showSecondaryTools;
  const secondaryToolsCount =
    (projectBoards.length >= 2 ? 1 : 0) +
    (hasBoard ? 1 : 0) +
    (hasSavedCollectionsFlag ? 1 : 0) +
    (hasCompareHistoryFlag ? 1 : 0) +
    (hasOverridesFlag ? 1 : 0) +
    (hasSelection ? 1 : 0);

  function createBoardId() {
    const id = "board_" + boardIdCounterRef.current;
    boardIdCounterRef.current += 1;
    return id;
  }

  function createHistoryId() {
    const id = "applied_" + historyIdCounterRef.current;
    historyIdCounterRef.current += 1;
    return id;
  }

  function createSnapshotId() {
    const id = "version_" + snapshotIdCounterRef.current;
    snapshotIdCounterRef.current += 1;
    return id;
  }

  function saveCompareHistoryForIds(ids) {
    const nextItem = buildCompareHistoryItem(ids, entries);
    if (!nextItem) return;

    setCompareHistory((current) => {
      const safeCurrent = Array.isArray(current) ? current : [];
      const withoutDuplicate = safeCurrent.filter(
        (item) => item.key !== nextItem.key,
      );
      return [nextItem, ...withoutDuplicate].slice(0, MAX_COMPARE_HISTORY);
    });
  }

  function logDecision(type, payload = {}) {
    setDecisionLog((current) =>
      [createDecisionEvent(type, payload), ...current].slice(0, 400),
    );
  }

  function handleAddEntryToBoardWithLogging(entryId) {
    const entry = entries.find((item) => item.id === entryId);

    if (!activeProjectBoard) {
      alert("No active board selected");
      return;
    }

    if (entry) {
      logDecision("added_entry_to_board", {
        boardId: activeProjectBoardId || null,
        entryId: entry.id,
        entryType: entry.type,
      });

      handleAddEntryToBoard(entryId);

      alert(`Added "${entry.term}" to ${activeProjectBoard.name}`);
    }
  }
  function handleExportIntelligenceState() {
    const payload = buildIntelligenceStateExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `architectural-atlas-intelligence-state-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function createDirectionSnapshot(board, transformation = null) {
    if (!board?.id) return null;

    return {
      id: createSnapshotId(),
      boardId: board.id,
      boardName: board.name || "Untitled board",
      entryIds: [...getSafeEntryIds(board)],
      timestamp: Date.now(),
      transformationTitle: transformation?.title || null,
      type: transformation ? "transformation" : "manual",
    };
  }
  function saveDirectionSnapshot(board, transformation) {
    const snapshot = createDirectionSnapshot(board, transformation);

    setDirectionVersions((prev) => [snapshot, ...prev]);

    return snapshot;
  }
  function handleRestoreDirectionVersionWithLogging(snapshotId) {
    const snapshot = directionVersions.find((item) => item.id === snapshotId);

    if (snapshot) {
      logDecision("restored_direction_version", {
        boardId:
          snapshot.boardId ||
          activeProjectBoardId ||
          hydratedActiveProjectBoard?.id ||
          null,
        versionId: snapshot.id,
        identity: snapshot.identity || null,
      });
    }

    handleRestoreDirectionVersion(snapshotId);
  }

  function handleAcceptRecommendation(recommendation) {
    if (!recommendation) return;

    logDecision("accepted_recommendation", {
      boardId: activeProjectBoardId || null,
      recommendationKey: recommendation.key,
      category: recommendation.category,
      priority: recommendation.priority,
    });

    const suggestedEntries = Array.isArray(recommendation.suggestedEntries)
      ? recommendation.suggestedEntries
      : [];

    suggestedEntries.forEach((entry) => {
      if (!entry?.id) return;

      const fullEntry = entries.find((item) => item.id === entry.id);

      if (fullEntry) {
        logDecision("added_entry_to_board", {
          boardId: activeProjectBoardId || null,
          entryId: fullEntry.id,
          entryType: fullEntry.type,
        });
      }

      handleAddEntryToBoard(entry.id);
    });
  }
  function buildIntelligenceStateExport() {
    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      type: "architectural-atlas-direction-state",
      projectBoards,
      activeProjectBoardId,
      directionVersions,
      decisionLog,
      decisionProfile,
      appliedTransformationHistory,
      undoneTransformationHistory,
      savedCollections,
      compareHistory,
      entryOverrides,
    };
  }
  function handleIgnoreRecommendation(recommendation) {
    if (!recommendation) return;

    logDecision("ignored_recommendation", {
      boardId: activeProjectBoardId || null,
      recommendationKey: recommendation.key,
      category: recommendation.category,
      priority: recommendation.priority,
    });
  }
  function buildTransformedBoardName(
    projectBoards,
    boardName,
    transformationTitle,
  ) {
    const safeBoardName = boardName || "Untitled board";
    const safeTransformationTitle = transformationTitle || "Transformed";
    const baseName = `${safeBoardName} — ${safeTransformationTitle}`;

    const existingNames = new Set(
      projectBoards.map((board) => String(board.name || "").trim()),
    );

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 2;
    let nextName = `${baseName} ${counter}`;

    while (existingNames.has(nextName)) {
      counter += 1;
      nextName = `${baseName} ${counter}`;
    }

    return nextName;
  }
  function handleApplyTransformation(
    transformation,
    transformationPlan,
    options = {},
  ) {
    if (!transformation || !transformationPlan) return;

    const weakerBoardId = transformationPlan.weakerBoard?.boardId;
    if (!weakerBoardId) return;

    const applyMode = options.applyMode || "live";
    const deselectedEntries = Array.isArray(options.deselectedEntries)
      ? options.deselectedEntries
      : [];

    const targetBoard = projectBoards.find(
      (board) => board.id === weakerBoardId,
    );
    if (!targetBoard) return;

    const selectedEntryIds = normalizeEntryIds({
      entries: transformation?.suggestedEntries,
    });

    const uniqueSelectedEntryIds = [...new Set(selectedEntryIds)];
    if (!uniqueSelectedEntryIds.length) return;

    handleLogPreviewDeselections(
      transformation,
      deselectedEntries,
      weakerBoardId,
    );

    if (applyMode === "copy") {
      saveDirectionSnapshot(targetBoard, {
        key: transformation.key,
        title: `${transformation.title} (copy source)`,
      });

      const currentIds = getSafeEntryIds(targetBoard);

      const nextIds = [...currentIds];

      uniqueSelectedEntryIds.forEach((id) => {
        if (!nextIds.includes(id)) {
          nextIds.push(id);
        }
      });

      const newBoardId = createBoardId();
      const newBoard = {
        ...targetBoard,
        id: newBoardId,
        name: buildTransformedBoardName(
          projectBoards,
          targetBoard.name,
          transformation.title,
        ),
        entryIds: nextIds,
        createdAt: new Date().toISOString(),
        derivedFromBoardId: targetBoard.id,
        derivedFromBoardName: targetBoard.name,
        derivedFromTransformationKey: transformation.key,
        derivedFromTransformationTitle: transformation.title,
        boardCreationMode: "transformation-copy",
      };

      setProjectBoards((current) => [newBoard, ...current]);
      setActiveProjectBoardId(newBoardId);

      logDecision("accepted_recommendation", {
        boardId: newBoardId,
        sourceBoardId: targetBoard.id,
        recommendationKey: transformation.key,
        category: "transformation-copy",
        priority: transformation.priority,
      });

      return;
    }

    saveDirectionSnapshot(targetBoard, transformation);

    const addedEntryIds = [];

    setProjectBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== weakerBoardId) return board;

        const currentIds = getSafeEntryIds(board);
        const newEntryIds = [...currentIds];

        const suggestedEntries = Array.isArray(transformation?.suggestedEntries)
          ? transformation.suggestedEntries.filter(Boolean)
          : [];

        suggestedEntries.forEach((entry) => {
          if (!entry?.id) return;
          if (!newEntryIds.includes(entry.id)) {
            newEntryIds.push(entry.id);
            addedEntryIds.push(entry.id);
          }
        });

        return {
          ...board,
          entryIds: newEntryIds,
        };
      }),
    );

    const historyItem = {
      id: createHistoryId(),
      boardId: weakerBoardId,
      transformationKey: transformation.key,
      transformationTitle: transformation.title,
      addedEntryIds,
      createdAt: new Date().toISOString(),
    };

    setAppliedTransformationHistory((current) => [historyItem, ...current]);
    setUndoneTransformationHistory([]);

    setActiveProjectBoardId(weakerBoardId);

    logDecision("accepted_recommendation", {
      boardId: weakerBoardId,
      recommendationKey: transformation.key,
      category: "transformation",
      priority: transformation.priority,
    });
  }

  function handleUndoLastTransformation() {
    const latest = appliedTransformationHistory[0];
    if (!latest?.boardId || !latest?.addedEntryIds?.length) return;

    const { boardId, addedEntryIds, transformationKey } = latest;

    setProjectBoards((current) =>
      current.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          entryIds: getSafeEntryIds(board).filter(
            (id) => !addedEntryIds.includes(id),
          ),
        };
      }),
    );

    setAppliedTransformationHistory((current) => current.slice(1));
    setUndoneTransformationHistory((current) => [latest, ...current]);

    logDecision("ignored_recommendation", {
      boardId,
      recommendationKey: transformationKey,
      category: "transformation-undo",
      priority: "support",
    });

    setActiveProjectBoardId(boardId);
  }
  function handleRedoLastTransformation() {
    const latestUndone = undoneTransformationHistory[0];
    if (!latestUndone?.boardId || !latestUndone?.addedEntryIds?.length) return;

    const { boardId, addedEntryIds, transformationKey, transformationTitle } =
      latestUndone;

    setProjectBoards((current) =>
      current.map((board) => {
        if (board.id !== boardId) return board;

        const currentIds = getSafeEntryIds(board);
        const nextIds = [...currentIds];

        addedEntryIds.forEach((id) => {
          if (!nextIds.includes(id)) {
            nextIds.push(id);
          }
        });

        return {
          ...board,
          entryIds: nextIds,
        };
      }),
    );

    setUndoneTransformationHistory((current) => current.slice(1));
    setAppliedTransformationHistory((current) => [latestUndone, ...current]);

    logDecision("accepted_recommendation", {
      boardId,
      recommendationKey: transformationKey,
      category: "transformation-redo",
      priority: "support",
    });

    setActiveProjectBoardId(boardId);

    const targetBoard = projectBoards.find((board) => board.id === boardId);
    if (targetBoard) {
      saveDirectionSnapshot(targetBoard, {
        key: transformationKey,
        title: transformationTitle,
      });
    }
  }

  function handleSelectEntry(entryId) {
    if (activeView === "clusters" || activeView === "graph") {
      setActiveView("atlas");
    }

    const entry = entries.find((item) => item.id === entryId);

    if (entry) {
      logDecision("selected_entry", {
        boardId: activeProjectBoardId || null,
        entryId: entry.id,
        entryType: entry.type,
        privacyLevel: entry.privacyLevel,
        circulationRole: entry.circulationRole,
        socialRole: entry.socialRole,
        climateResponse: entry.climateResponse,
      });
    }

    setSelectedEntryId(entryId);
    setHighlightedEntryId(entryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectEntryInGraph(entryId) {
    setActiveView("graph");
    setSelectedEntryId(entryId);
    setHighlightedEntryId(null);
  }

  function handleCompareEntry(entryId) {
    setCompareLinkCopied(false);

    setCompareEntryIds((current) => {
      let next;

      if (current.includes(entryId)) {
        next = current.filter((id) => id !== entryId);
      } else if (current.length >= 2) {
        next = [current[1], entryId];
      } else {
        next = [...current, entryId];
      }

      if (next.length === 2) {
        saveCompareHistoryForIds(next);
      }

      return next;
    });
  }

  function handleRemoveCompareEntry(entryId) {
    setCompareLinkCopied(false);
    setCompareEntryIds((current) => current.filter((id) => id !== entryId));
  }

  function handleClearCompare() {
    setCompareLinkCopied(false);
    setCompareEntryIds([]);
  }

  function handleOpenCompareHistoryItem(ids) {
    const nextIds = ids
      .filter((id) => entries.some((entry) => entry.id === id))
      .slice(0, 2);

    setActiveView("atlas");
    setCompareLinkCopied(false);
    setCompareEntryIds(nextIds);

    if (nextIds[0]) {
      setSelectedEntryId(nextIds[0]);
      setHighlightedEntryId(nextIds[0]);
    }

    if (nextIds.length === 2) {
      saveCompareHistoryForIds(nextIds);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemoveCompareHistoryItem(key) {
    setCompareHistory((current) => current.filter((item) => item.key !== key));
  }

  function handleClearCompareHistory() {
    setCompareHistory([]);
  }

  function handleTogglePinEntry(entryId) {
    setPinnedEntryIds((current) => {
      if (current.includes(entryId)) {
        return current.filter((id) => id !== entryId);
      }

      return [...current, entryId];
    });
  }

  function handleRemovePinnedEntry(entryId) {
    setPinnedEntryIds((current) => current.filter((id) => id !== entryId));
  }

  function handleClearPinned() {
    setPinnedEntryIds([]);
  }

  function handleClearSelection() {
    setSelectedEntryId(null);
    setHighlightedEntryId(null);
  }

  function handleResetView() {
    setActiveView("atlas");
    setSelectedEntryId(null);
    setHighlightedEntryId(null);
    setCompareEntryIds([]);
    setCompareLinkCopied(false);
    setEditingEntryId(null);
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useAtlasKeyboardShortcuts({
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
    handleResetView,
    setShowSecondaryTools,
  });
  useAtlasPersistence({
    entries,
    atlas,
    activeView,
    setActiveView,
    selectedEntryId,
    setSelectedEntryId,
    compareEntryIds,
    setCompareEntryIds,
    highlightedEntryId,
    setHighlightedEntryId,
    pinnedEntryIds,
    compareHistory,
    entryOverrides,
    savedCollections,
    projectBoards,
    activeProjectBoardId,
    directionVersions,
    writeUrlState,
    getInitialUrlState,
    PINNED_STORAGE_KEY,
    COMPARE_HISTORY_STORAGE_KEY,
    ENTRY_OVERRIDES_STORAGE_KEY,
    SAVED_COLLECTIONS_STORAGE_KEY,
    PROJECT_BOARDS_STORAGE_KEY,
    ACTIVE_PROJECT_BOARD_STORAGE_KEY,
    DIRECTION_VERSIONS_STORAGE_KEY,
  });
  const {
    handleCreateProjectBoard,
    handleOpenProjectBoard,
    handleDeleteProjectBoard,
    handleAddEntryToBoard,
    handleRemoveEntryFromBoard: removeEntryFromActiveBoard,
    handleAddComparePairToBoard,
    handleRemoveBoardComparePair,
    handleUpdateBoardNotes,
  } = useAtlasBoardActions({
    projectBoards,
    setProjectBoards,
    activeProjectBoardId,
    setActiveProjectBoardId,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DECISION_LOG_STORAGE_KEY,
        JSON.stringify(decisionLog),
      );
    } catch {
      // ignore storage errors
    }
  }, [decisionLog]);

  useEffect(() => {
    if (hasInitializedDemoRef.current) return;
    if (!projectBoards || projectBoards.length > 0) return;

    hasInitializedDemoRef.current = true;
    handleCreateProjectBoard();
  }, [projectBoards, handleCreateProjectBoard]);

  useEffect(() => {
    if (!activeProjectBoardId) return;
    if (!atlas.visibleEntries.length) return;

    const activeBoard = projectBoards.find(
      (board) => board.id === activeProjectBoardId,
    );

    if (!activeBoard) return;

    const existingEntryIds = Array.isArray(activeBoard.entryIds)
      ? activeBoard.entryIds
      : [];

    if (existingEntryIds.length > 0) return;

    const sampleEntries = atlas.visibleEntries.slice(0, 3);

    sampleEntries.forEach((entry) => {
      handleAddEntryToBoard(entry.id);
    });
  }, [
    activeProjectBoardId,
    atlas.visibleEntries,
    projectBoards,
    handleAddEntryToBoard,
  ]);

  function handleAddSelectedEntryToBoard() {
    if (!selectedEntry) return;
    handleAddEntryToBoard(selectedEntry.id);
  }

  function handleRemoveBoardEntry(entryId) {
    if (!entryId) return;
    removeEntryFromActiveBoard(entryId);
  }

  function handleRemoveEntryFromBoard(boardId, entryId) {
    if (!boardId || !entryId) return;
    if (!activeProjectBoard || activeProjectBoard.id !== boardId) return;
    removeEntryFromActiveBoard(entryId);
  }
  function handleRelatedClick(relatedId) {
    setActiveView("atlas");
    setSelectedEntryId(relatedId);

    const visibleEntry = atlas.visibleEntries.find(
      (entry) => entry.id === relatedId,
    );

    if (visibleEntry) {
      setHighlightedEntryId(relatedId);
      return;
    }

    atlas.updateFilter("query", relatedId);
    setHighlightedEntryId(relatedId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleShortcuts() {
    setShowShortcuts((prev) => !prev);
  }

  async function handleCopyCompareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCompareLinkCopied(true);
      setTimeout(() => setCompareLinkCopied(false), 1800);
    } catch {
      setCompareLinkCopied(false);
    }
  }

  function handleOpenEditor(entryId) {
    setActiveView("atlas");
    setSelectedEntryId(entryId);
    setEditingEntryId(entryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCloseEditor() {
    setEditingEntryId(null);
  }

  function handleSaveEntryOverride(updatedEntry) {
    setEntryOverrides((current) => ({
      ...current,
      [updatedEntry.id]: {
        ...updatedEntry,
      },
    }));
    setSelectedEntryId(updatedEntry.id);
    setEditingEntryId(updatedEntry.id);
  }

  function handleResetEntryOverride(entryId) {
    setEntryOverrides((current) => {
      const next = { ...current };
      delete next[entryId];
      return next;
    });
  }

  function handleResetAllEntryOverrides() {
    setEntryOverrides({});
  }

  function handleExportDataset() {
    downloadJsonFile("architectural-atlas-dataset.json", {
      exportType: "architectural-atlas-dataset",
      exportedAt: new Date().toISOString(),
      entryCount: entries.length,
      entries,
    });
  }

  function handleExportOverrides() {
    downloadJsonFile("architectural-atlas-overrides.json", {
      exportType: "architectural-atlas-overrides",
      exportedAt: new Date().toISOString(),
      overrideCount: Object.keys(entryOverrides).length,
      overrides: entryOverrides,
    });
  }

  function handleImportPayload(rawText, mode) {
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
  }

  function handleCreateCollection(entryIds, fallbackName, fallbackDescription) {
    const namePrompt = window.prompt("Collection name", fallbackName);
    const name = namePrompt ? namePrompt.trim() : fallbackName;

    if (!name) return;

    const descriptionPrompt = window.prompt(
      "Collection description",
      fallbackDescription,
    );
    const description = descriptionPrompt ? descriptionPrompt.trim() : "";

    const nextCollection = buildCollectionPayload(
      name,
      description,
      entryIds,
      entries,
    );

    if (!nextCollection) {
      window.alert("No valid entries were available for this collection.");
      return;
    }

    setSavedCollections((current) => [nextCollection, ...current]);
  }

  function handleCreateCollectionFromPinned() {
    handleCreateCollection(
      pinnedEntryIds,
      "Pinned research board",
      "Saved from current pinned entries.",
    );
  }

  function handleCreateCollectionFromCompare() {
    handleCreateCollection(
      compareEntryIds,
      "Compare board",
      "Saved from the current compare set.",
    );
  }

  function handleCreateCollectionFromSelectedAndPinned() {
    const ids = [
      ...(selectedEntry ? [selectedEntry.id] : []),
      ...pinnedEntryIds,
    ];

    handleCreateCollection(
      ids,
      "Selected + pinned board",
      "Saved from the selected entry and current pinned entries.",
    );
  }
  function handleLogPreviewDeselections(
    transformation,
    deselectedEntries = [],
    boardId = null,
  ) {
    if (!Array.isArray(deselectedEntries) || !deselectedEntries.length) return;

    deselectedEntries.forEach((entry) => {
      if (!entry?.id) return;

      logDecision("deselected_preview_entry", {
        boardId: boardId || activeProjectBoardId || null,
        transformationKey: transformation?.key || null,
        transformationTitle: transformation?.title || null,
        entryId: entry.id,
        entryType: entry.type || null,
      });
    });
  }
  function handleOpenCollection(collection) {
    const validIds = (collection.entryIds || []).filter((id) =>
      entries.some((entry) => entry.id === id),
    );

    if (!validIds.length) {
      window.alert("This collection no longer contains valid entry ids.");
      return;
    }

    setPinnedEntryIds(validIds);

    if (validIds[0]) {
      setSelectedEntryId(validIds[0]);
      setHighlightedEntryId(validIds[0]);
    }

    if (validIds.length >= 2) {
      setCompareEntryIds(validIds.slice(0, 2));
    } else {
      setCompareEntryIds([]);
    }

    setActiveView("atlas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteCollection(collectionId) {
    setSavedCollections((current) =>
      current.filter((item) => item.id !== collectionId),
    );
  }

  function handleDesignIntentChange(summaryLabel) {
    setLastIntentSummaryLabel(summaryLabel || "");
  }

  function handleSaveDirectionVersion() {
    if (!hydratedActiveProjectBoard) return;

    const snapshot = buildDirectionVersionSnapshot(hydratedActiveProjectBoard);
    if (!snapshot) return;

    setDirectionVersions((current) => [snapshot, ...current]);
  }

  function handleDeleteDirectionVersion(snapshotId) {
    setDirectionVersions((current) =>
      current.filter((snapshot) => snapshot.id !== snapshotId),
    );
  }

  function handleRestoreDirectionVersion(snapshotId) {
    const snapshot = directionVersions.find((item) => item.id === snapshotId);
    if (!snapshot) return;

    const targetBoardId =
      snapshot.boardId ||
      activeProjectBoardId ||
      hydratedActiveProjectBoard?.id;

    if (!targetBoardId) return;

    setProjectBoards((current) =>
      current.map((board) => {
        if (board.id !== targetBoardId) return board;

        const now = new Date().toISOString();

        return {
          ...board,
          entryIds: Array.isArray(snapshot.board?.entryIds)
            ? snapshot.board.entryIds
            : getSafeEntryIds(board),
          comparePairs: Array.isArray(snapshot.board?.comparePairs)
            ? snapshot.board.comparePairs
            : getSafeComparePairs(board),
          notes:
            typeof snapshot.board?.notes === "string"
              ? snapshot.board.notes
              : board.notes,
          intentSummaryLabel:
            typeof snapshot.board?.intentSummaryLabel === "string"
              ? snapshot.board.intentSummaryLabel
              : board.intentSummaryLabel,
          updatedAt: now,
          updatedAtLabel: new Date(now).toLocaleString(),
        };
      }),
    );

    setActiveProjectBoardId(targetBoardId);
  }

  function handleExportBoardSheet() {
    if (!hydratedActiveProjectBoard) return;

    const board = hydratedActiveProjectBoard;
    const packet = buildDesignDirectionPacket(board);

    const printWindow = window.open("", "_blank", "width=1280,height=980");

    if (!printWindow) {
      window.alert(
        "Board sheet export was blocked by the browser. Please allow pop-ups for this site and try again.",
      );
      return;
    }

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const formatListBlocks = (items, emptyText) => {
      if (!Array.isArray(items) || !items.length) {
        return `<div class="minimal-block"><p>${escapeHtml(emptyText)}</p></div>`;
      }

      return items
        .map(
          (item) => `
          <div class="minimal-block">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description || "")}</p>
            ${
              item.implication
                ? `<p class="subtle-note">${escapeHtml(item.implication)}</p>`
                : ""
            }
          </div>
        `,
        )
        .join("");
    };

    const entryCardsHtml =
      board.entries && board.entries.length
        ? board.entries
            .map(
              (entry) => `
              <article class="entry-card">
                <div class="entry-card-top">
                  <h3>${escapeHtml(entry.term)}</h3>
                  <span class="tiny-tag">${escapeHtml(entry.type || "—")}</span>
                </div>

                <p class="entry-meta">
                  ${escapeHtml(entry.domain || "—")} ·
                  ${escapeHtml(entry.scale || "—")} ·
                  ${escapeHtml(entry.region || "—")}
                </p>

                <p class="entry-description">${escapeHtml(entry.description || "No description.")}</p>

                <div class="tag-row">
                  <span class="tag">${escapeHtml(entry.privacyLevel || "—")}</span>
                  <span class="tag">${escapeHtml(entry.socialRole || "—")}</span>
                  <span class="tag">${escapeHtml(entry.spatialLogic || "—")}</span>
                  <span class="tag">${escapeHtml(entry.climateResponse || "—")}</span>
                </div>
              </article>
            `,
            )
            .join("")
        : `<div class="minimal-block"><p>No entries added.</p></div>`;

    const comparePairsHtml =
      packet.comparePairs && packet.comparePairs.length
        ? packet.comparePairs
            .map(
              (pair) => `
              <article class="minimal-block">
                <h3>${escapeHtml(pair.terms?.[0] || "—")} ↔ ${escapeHtml(
                  pair.terms?.[1] || "—",
                )}</h3>
                <p>${escapeHtml(pair.label || "No label")} · ${escapeHtml(
                  pair.score || 0,
                )}/100</p>
              </article>
            `,
            )
            .join("")
        : `<div class="minimal-block"><p>No compare pairs stored.</p></div>`;

    const nextMovesHtml = formatListBlocks(
      packet.summary.nextMoves,
      "No next moves detected.",
    );

    const tensionsHtml = formatListBlocks(
      packet.summary.tensions,
      "No major tensions detected.",
    );

    const missingElementsHtml = formatListBlocks(
      packet.summary.gapSignals,
      "No major missing elements detected.",
    );

    const spatialMovesHtml = packet.spatialTranslator?.moves?.length
      ? packet.spatialTranslator.moves
          .map(
            (move, index) => `
              <article class="move-card">
                <div class="move-header">
                  <div>
                    <div class="section-index">${String(index + 1).padStart(
                      2,
                      "0",
                    )}</div>
                    <h3>${escapeHtml(move.title)}</h3>
                  </div>
                  <span class="tag">${escapeHtml(move.priority || "—")}</span>
                </div>

                <div class="move-body">
                  <div class="move-line">
                    <div class="move-label">Intent</div>
                    <p>${escapeHtml(move.intent)}</p>
                  </div>

                  <div class="move-line">
                    <div class="move-label">Instruction</div>
                    <p>${escapeHtml(move.spatialInstruction)}</p>
                  </div>

                  <div class="move-line">
                    <div class="move-label">Diagram cue</div>
                    <p>${escapeHtml(move.diagramCue)}</p>
                  </div>

                  <div class="move-line">
                    <div class="move-label">Avoid</div>
                    <p>${escapeHtml(move.avoid)}</p>
                  </div>
                </div>
              </article>
            `,
          )
          .join("")
      : `<div class="minimal-block"><p>No spatial moves generated.</p></div>`;

    const identityTagsHtml = packet.identity?.tags?.length
      ? packet.identity.tags
          .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
          .join("")
      : `<span class="tag">No tags</span>`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(board.name)} — Design Direction Packet</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          :root {
            --ink: #111111;
            --muted: #666666;
            --soft: #a8a8a8;
            --line: #d8d8d8;
            --line-strong: #b8b8b8;
            --paper: #ffffff;
            --panel: #fafafa;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: var(--paper);
            color: var(--ink);
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .sheet {
            max-width: 190mm;
            margin: 0 auto;
            padding: 0;
          }

          .print-actions {
            display: flex;
            gap: 8px;
            margin: 0 0 16px;
            padding-top: 4px;
          }

          .print-actions button {
            appearance: none;
            border: 1px solid var(--ink);
            background: var(--paper);
            color: var(--ink);
            padding: 8px 12px;
            font-size: 12px;
            letter-spacing: 0.04em;
            cursor: pointer;
          }

          .cover {
            border-top: 2px solid var(--ink);
            padding-top: 16px;
            margin-bottom: 24px;
          }

          .eyebrow {
            font-size: 10px;
            letter-spacing: 0.24em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 14px;
          }

          .cover-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 20px;
            align-items: end;
          }

          .title {
            font-size: 34px;
            line-height: 1.02;
            font-weight: 500;
            letter-spacing: -0.03em;
            margin: 0 0 10px;
          }

          .subtitle {
            font-size: 13px;
            line-height: 1.5;
            color: var(--muted);
            max-width: 90%;
            margin: 0;
          }

          .cover-meta {
            border-left: 1px solid var(--line);
            padding-left: 16px;
          }

          .meta-item {
            padding: 6px 0;
            border-bottom: 1px solid var(--line);
          }

          .meta-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .meta-value {
            font-size: 12px;
            line-height: 1.45;
          }

          .verdict-panel {
            margin-top: 22px;
            padding: 18px 0 0;
            border-top: 1px solid var(--line-strong);
          }

          .verdict-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.24em;
            color: var(--muted);
            margin-bottom: 10px;
          }

          .verdict-title {
            font-size: 28px;
            line-height: 1.05;
            font-weight: 500;
            letter-spacing: -0.03em;
            margin: 0 0 10px;
          }

          .verdict-sentence {
            font-size: 14px;
            line-height: 1.6;
            max-width: 92%;
            margin: 0 0 14px;
          }

          .tag-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
          }

          .tag,
          .tiny-tag {
            display: inline-flex;
            align-items: center;
            border: 1px solid var(--line-strong);
            border-radius: 999px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--ink);
            background: var(--paper);
          }

          .tag {
            padding: 5px 9px;
          }

          .tiny-tag {
            padding: 4px 8px;
          }

          section {
            margin-top: 24px;
            page-break-inside: avoid;
          }

          .section-heading {
            display: grid;
            grid-template-columns: 90px 1fr;
            gap: 14px;
            align-items: start;
            padding-top: 8px;
            border-top: 1px solid var(--line);
            margin-bottom: 12px;
          }

          .section-index {
            font-size: 11px;
            color: var(--muted);
            letter-spacing: 0.18em;
            text-transform: uppercase;
            padding-top: 3px;
          }

          .section-title {
            font-size: 18px;
            line-height: 1.2;
            font-weight: 500;
            letter-spacing: -0.02em;
            margin: 0;
          }

          .section-intro {
            font-size: 12px;
            line-height: 1.55;
            color: var(--muted);
            margin-top: 6px;
          }

          .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .four-col {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }

          .stat-card,
          .minimal-block,
          .move-card,
          .entry-card {
            border: 1px solid var(--line);
            background: var(--paper);
            page-break-inside: avoid;
          }

          .stat-card {
            padding: 10px;
          }

          .stat-label {
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 6px;
          }

          .stat-value {
            font-size: 13px;
            line-height: 1.4;
          }

          .minimal-block {
            padding: 12px;
            margin-bottom: 10px;
          }

          .minimal-block h3,
          .move-card h3,
          .entry-card h3 {
            font-size: 14px;
            line-height: 1.3;
            margin: 0 0 6px;
            font-weight: 500;
          }

          .minimal-block p,
          .move-card p,
          .entry-card p {
            font-size: 12px;
            line-height: 1.55;
            margin: 0;
          }

          .subtle-note {
            color: var(--muted);
            margin-top: 8px !important;
          }

          .move-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .move-card {
            padding: 12px;
          }

          .move-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: start;
            margin-bottom: 10px;
          }

          .move-body {
            display: grid;
            gap: 10px;
          }

          .move-line {
            padding-top: 8px;
            border-top: 1px solid var(--line);
          }

          .move-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .entry-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .entry-card {
            padding: 12px;
          }

          .entry-card-top {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: start;
            margin-bottom: 8px;
          }

          .entry-meta {
            color: var(--muted);
            margin-bottom: 8px !important;
          }

          .entry-description {
            margin-bottom: 10px !important;
          }

          .notes-block {
            border: 1px solid var(--line);
            padding: 12px;
            white-space: pre-wrap;
            font-size: 12px;
            line-height: 1.6;
          }

          .footer-note {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid var(--line);
            font-size: 10px;
            color: var(--muted);
            letter-spacing: 0.06em;
          }

          @media print {
            .print-actions {
              display: none;
            }

            .sheet {
              max-width: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="sheet">
          <div class="print-actions">
            <button onclick="window.print()">Print / Save PDF</button>
            <button onclick="window.close()">Close</button>
          </div>

          <section class="cover">
            <div class="eyebrow">Architectural Atlas · Design Direction Packet</div>

            <div class="cover-grid">
              <div>
                <h1 class="title">${escapeHtml(board.name)}</h1>
                <p class="subtitle">${escapeHtml(
                  board.description || "Design direction packet.",
                )}</p>
              </div>

              <div class="cover-meta">
                <div class="meta-item">
                  <div class="meta-label">Entries</div>
                 <div class="meta-value">
  ${escapeHtml(getSafeEntryIds(board).length)}
</div>
                </div>

                <div class="meta-item">
                  <div class="meta-label">Compare pairs</div>
                  <div class="meta-value">${escapeHtml(
                    Array.isArray(packet.comparePairs)
                      ? packet.comparePairs.length
                      : 0,
                  )}</div>
                </div>

                <div class="meta-item">
                  <div class="meta-label">Intent summary</div>
                  <div class="meta-value">${escapeHtml(
                    board.intentSummaryLabel || "None",
                  )}</div>
                </div>

                <div class="meta-item">
                  <div class="meta-label">Updated</div>
                  <div class="meta-value">${escapeHtml(board.updatedAtLabel)}</div>
                </div>
              </div>
            </div>

            <div class="verdict-panel">
              <div class="verdict-label">Final design verdict</div>
              <h2 class="verdict-title">${escapeHtml(packet.identity.title)}</h2>
              <p class="verdict-sentence">${escapeHtml(
                packet.identity.sentence,
              )}</p>

              <div class="tag-row">
                <span class="tag">${escapeHtml(packet.identity.strength)}</span>
                <span class="tag">${escapeHtml(packet.summary.privacyModel)}</span>
                <span class="tag">${escapeHtml(packet.summary.socialModel)}</span>
                <span class="tag">${escapeHtml(packet.summary.circulationModel)}</span>
                <span class="tag">${escapeHtml(packet.summary.serviceStrategy)}</span>
              </div>

              <div class="tag-row">
                ${identityTagsHtml}
              </div>
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">01</div>
              <div>
                <h2 class="section-title">Direction summary</h2>
                <p class="section-intro">
                  The board is summarized as an architectural reading rather than a room list.
                </p>
              </div>
            </div>

            <div class="four-col">
              <div class="stat-card">
                <div class="stat-label">Privacy</div>
                <div class="stat-value">${escapeHtml(packet.summary.privacyModel)}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">Social</div>
                <div class="stat-value">${escapeHtml(packet.summary.socialModel)}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">Circulation</div>
                <div class="stat-value">${escapeHtml(
                  packet.summary.circulationModel,
                )}</div>
              </div>

              <div class="stat-card">
                <div class="stat-label">Service</div>
                <div class="stat-value">${escapeHtml(packet.summary.serviceStrategy)}</div>
              </div>
            </div>

            <div class="minimal-block" style="margin-top: 12px;">
              <h3>Board character</h3>
              <p>${escapeHtml(packet.summary.boardCharacter)}</p>
              <p class="subtle-note">${escapeHtml(packet.summary.spatialPattern)}</p>
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">02</div>
              <div>
                <h2 class="section-title">Spatial moves</h2>
                <p class="section-intro">
                  Diagram-level instructions that translate the direction into spatial action.
                </p>
              </div>
            </div>

            <div class="minimal-block">
              <p>${escapeHtml(packet.spatialTranslator.headline || "")}</p>
            </div>

            <div class="move-grid">
              ${spatialMovesHtml}
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">03</div>
              <div>
                <h2 class="section-title">Next moves</h2>
                <p class="section-intro">
                  The strongest design actions suggested by the current board condition.
                </p>
              </div>
            </div>

            ${nextMovesHtml}
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">04</div>
              <div>
                <h2 class="section-title">Tensions and missing elements</h2>
                <p class="section-intro">
                  Friction points and absent structural roles that still affect stability.
                </p>
              </div>
            </div>

            <div class="two-col">
              <div>
                <div class="minimal-block">
                  <h3>Tensions</h3>
                </div>
                ${tensionsHtml}
              </div>

              <div>
                <div class="minimal-block">
                  <h3>Missing elements</h3>
                </div>
                ${missingElementsHtml}
              </div>
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">05</div>
              <div>
                <h2 class="section-title">Board notes and intent</h2>
                <p class="section-intro">
                  User-defined intent, commentary, and framing attached to the board.
                </p>
              </div>
            </div>

            <div class="two-col">
              <div>
                <div class="minimal-block">
                  <h3>Intent summary</h3>
                  <p>${escapeHtml(board.intentSummaryLabel || "No intent saved yet.")}</p>
                </div>
              </div>

              <div>
                <div class="minimal-block">
                  <h3>Board notes</h3>
                  <div class="notes-block">${escapeHtml(
                    board.notes || "No notes added yet.",
                  )}</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">06</div>
              <div>
                <h2 class="section-title">Selected entries</h2>
                <p class="section-intro">
                  Core entries currently composing the board and influencing the direction.
                </p>
              </div>
            </div>

            <div class="entry-grid">
              ${entryCardsHtml}
            </div>
          </section>

          <section>
            <div class="section-heading">
              <div class="section-index">07</div>
              <div>
                <h2 class="section-title">Compare pairs</h2>
                <p class="section-intro">
                  Saved conceptual comparisons attached to this board.
                </p>
              </div>
            </div>

            <div class="two-col">
              ${comparePairsHtml}
            </div>
          </section>

          <div class="footer-note">
            Generated from Architectural Atlas · Design Direction Packet
          </div>
        </div>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }

  function handlePrintEntrySheet() {
    if (!selectedEntry) return;

    const printWindow = window.open("", "_blank", "width=1000,height=900");

    if (!printWindow) {
      window.alert(
        "Print / export was blocked by the browser. Please allow pop-ups for this site and try again.",
      );
      return;
    }

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const synonymHtml =
      selectedEntry.synonyms && selectedEntry.synonyms.length
        ? selectedEntry.synonyms.map((item) => escapeHtml(item)).join(", ")
        : "None";

    const relatedHtml =
      selectedEntry.related && selectedEntry.related.length
        ? selectedEntry.related
            .map((item) =>
              escapeHtml(
                typeof item === "string" ? item : item.label || item.id,
              ),
            )
            .join(", ")
        : "None";

    const recommendations = [
      ...(recommendedEntries.sameType || []),
      ...(recommendedEntries.sameDomain || []),
      ...(recommendedEntries.sameRegion || []),
    ];

    const uniqueRecommendations = recommendations.filter(
      (entry, index, array) => {
        return array.findIndex((item) => item.id === entry.id) === index;
      },
    );

    const recommendationHtml = uniqueRecommendations.length
      ? "<ul>" +
        uniqueRecommendations
          .map((entry) => "<li>" + escapeHtml(entry.term) + "</li>")
          .join("") +
        "</ul>"
      : "<p>No adjacent recommendations available.</p>";

    const html =
      "<!DOCTYPE html>" +
      "<html lang='en'>" +
      "<head>" +
      "<meta charset='UTF-8' />" +
      "<title>Entry Sheet - " +
      escapeHtml(selectedEntry.term) +
      "</title>" +
      "<style>" +
      "@page { size: A4; margin: 14mm; }" +
      "body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; margin: 0; padding: 0; }" +
      ".sheet { max-width: 190mm; margin: 0 auto; padding: 0; }" +
      ".eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }" +
      "h1 { font-size: 30px; margin: 0 0 8px; }" +
      "h2 { font-size: 18px; margin: 0 0 10px; }" +
      "p, li { font-size: 12px; line-height: 1.45; }" +
      "section { margin-bottom: 18px; page-break-inside: avoid; }" +
      ".header { border-bottom: 1px solid #111; padding-bottom: 12px; margin-bottom: 18px; }" +
      ".block { border: 1px solid #aaa; padding: 10px; margin-top: 8px; }" +
      "table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }" +
      "th, td { border: 1px solid #111; padding: 6px; vertical-align: top; font-size: 12px; text-align: left; word-wrap: break-word; }" +
      ".label-cell { width: 24%; font-weight: bold; }" +
      "ul { margin: 8px 0 0 18px; padding: 0; }" +
      ".print-actions { margin: 12px 0 18px; }" +
      ".print-actions button { padding: 8px 12px; margin-right: 8px; border: 1px solid #111; background: #fff; cursor: pointer; }" +
      "@media print { .print-actions { display: none; } }" +
      "</style>" +
      "</head>" +
      "<body>" +
      "<div class='sheet'>" +
      "<div class='print-actions'>" +
      "<button onclick='window.print()'>Print / Save PDF</button>" +
      "<button onclick='window.close()'>Close</button>" +
      "</div>" +
      "<section class='header'>" +
      "<div class='eyebrow'>Architectural Space Atlas</div>" +
      "<h1>" +
      escapeHtml(selectedEntry.term) +
      "</h1>" +
      "<p>" +
      escapeHtml(selectedEntry.description) +
      "</p>" +
      "</section>" +
      "<section>" +
      "<h2>Taxonomy fields</h2>" +
      "<table><tbody>" +
      "<tr><td class='label-cell'>Type</td><td>" +
      escapeHtml(selectedEntry.type || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Scale</td><td>" +
      escapeHtml(selectedEntry.scale || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Domain</td><td>" +
      escapeHtml(selectedEntry.domain || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Status</td><td>" +
      escapeHtml(selectedEntry.status || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Region</td><td>" +
      escapeHtml(selectedEntry.region || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Section</td><td>" +
      escapeHtml(selectedEntry.section || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Source</td><td>" +
      escapeHtml(selectedEntry.sourceCategory || "—") +
      "</td></tr>" +
      "<tr><td class='label-cell'>Note</td><td>" +
      escapeHtml(selectedEntry.notes || "—") +
      "</td></tr>" +
      "</tbody></table>" +
      "</section>" +
      "<section><h2>Synonyms</h2><div class='block'><p>" +
      synonymHtml +
      "</p></div></section>" +
      "<section><h2>Related entries</h2><div class='block'><p>" +
      relatedHtml +
      "</p></div></section>" +
      "<section><h2>Adjacent recommendations</h2><div class='block'>" +
      recommendationHtml +
      "</div></section>" +
      "</div>" +
      "</body>" +
      "</html>";

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }

  useEffect(() => {
    if (!highlightedEntryId || activeView !== "atlas") return;

    const timeout = setTimeout(() => {
      const element = document.getElementById("entry-" + highlightedEntryId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [highlightedEntryId, atlas.visibleEntries, activeView]);

  useEffect(() => {
    if (!highlightedEntryId) return;

    const timeout = setTimeout(() => {
      setHighlightedEntryId(null);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [highlightedEntryId]);

  const isCompareMode = compareEntries.length >= 2;
  const boardContext = {
    projectBoards,
    activeProjectBoardId,
    hydratedActiveProjectBoard,
    entries,
    selectedEntry,
    compareEntries,
    recommendedEntries,
    pinnedEntryIds,
  };

  const decisionContext = {
    decisionProfile,
    globalDecisionProfile,
    activeBoardDecisionProfile,
    onSelectEntry: handleSelectEntry,
    onAcceptRecommendation: handleAcceptRecommendation,
    onIgnoreRecommendation: handleIgnoreRecommendation,
    onApplyTransformation: handleApplyTransformation,
  };

  const historyContext = {
    directionVersions,
    compareHistory,
    savedCollections,
    lastAppliedTransformation: appliedTransformationHistory[0] || null,
    appliedTransformationHistory,
    undoneTransformationHistory,
  };

  const historyActions = {
    handleSaveDirectionVersion,
    handleDeleteDirectionVersion,
    handleRestoreDirectionVersion,
    handleCreateCollectionFromPinned,
    handleCreateCollectionFromCompare,
    handleCreateCollectionFromSelectedAndPinned,
    handleOpenCollection,
    handleDeleteCollection,
    handleOpenCompareHistoryItem,
    handleRemoveCompareHistoryItem,
    handleClearCompareHistory,
    onUndoLastTransformation: handleUndoLastTransformation,
    onRedoLastTransformation: handleRedoLastTransformation,
  };

  const datasetContext = {
    entryOverrides,
    handleExportDataset,
    handleExportOverrides,
    handleExportIntelligenceState,
    handleImportPayload,
    handleResetAllEntryOverrides,
  };

  const uiContext = {
    secondaryToolsOpen: showSecondaryTools,
    secondaryToolsCount,
    setShowSecondaryTools,
  };

  return (
    <div data-theme={theme} className={theme === "dark" ? "dark" : ""}>
      <div
        className='min-h-screen px-4 py-5 md:px-6'
        style={{
          background: "var(--bg-page)",
          color: "var(--text-primary)",
        }}
      >
        <div className='mx-auto flex max-w-7xl flex-col gap-5'>
          <OnboardingHeader theme={theme} />

          {activeProjectBoard ? (
            <div
              className='border px-3 py-2 text-xs font-semibold'
              style={{
                borderColor: "var(--tone-violet-border)",
                background: "var(--tone-violet-bg)",
                color: "var(--tone-violet-text)",
              }}
            >
              Active board: {activeProjectBoard.name}
            </div>
          ) : (
            <div
              className='border px-3 py-2 text-xs font-semibold'
              style={{
                borderColor: "var(--tone-warning-border)",
                background: "var(--tone-warning-bg)",
                color: "var(--tone-warning-text)",
              }}
            >
              No active board — open or create one to start
            </div>
          )}

          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
              className='ui-button px-3 py-1.5 text-[11px] uppercase tracking-[0.08em]'
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </div>

          {!minimalMode ? (
            <HeroHeader metrics={atlas.metrics} theme={theme} />
          ) : null}
          {minimalMode && (
            <div className='border border-sky-300 bg-sky-50 px-3 py-2 text-xs text-sky-900'>
              Focus mode — simplified view for step-by-step use
            </div>
          )}
          <FilterToolbar
            filters={atlas.filters}
            updateFilter={atlas.updateFilter}
            clearFilters={atlas.clearFilters}
            resetView={handleResetView}
          />

          <ViewModeTopNav
            activeView={activeView}
            setActiveView={setActiveView}
            minimalMode={minimalMode}
            setMinimalMode={setMinimalMode}
            selectedEntry={selectedEntry}
            activeBoard={activeProjectBoard}
            onResetView={handleResetView}
            showSecondaryTools={showSecondaryTools}
            setShowSecondaryTools={setShowSecondaryTools}
          />

          {!minimalMode ? (
            <>
              <AtlasUtilityBar
                theme={theme}
                activeBoard={activeProjectBoard}
                selectedEntry={selectedEntry}
                compareEntries={compareEntries}
                pinnedEntries={pinnedEntries}
                onSelectEntry={handleSelectEntry}
                onClearSelection={handleClearSelection}
                onClearCompare={handleClearCompare}
                onClearPinned={handleClearPinned}
              />
              <AtlasQuickDrawer
                compareEntries={compareEntries}
                pinnedEntries={pinnedEntries}
                onSelectEntry={handleSelectEntry}
                onRemoveCompareEntry={handleRemoveCompareEntry}
                onRemovePinnedEntry={handleRemovePinnedEntry}
                onClearCompare={handleClearCompare}
                onClearPinned={handleClearPinned}
              />
            </>
          ) : null}

          {minimalMode ? (
            <MinimalView
              atlas={atlas}
              topSearchReasons={topSearchReasons}
              handleRelatedClick={handleRelatedClick}
              handleSelectEntry={handleSelectEntry}
              handleCompareEntry={handleCompareEntry}
              handleTogglePinEntry={handleTogglePinEntry}
              handleAddEntryToBoard={handleAddEntryToBoardWithLogging}
              highlightedEntryId={highlightedEntryId}
              compareEntryIds={compareEntryIds}
              pinnedEntryIds={pinnedEntryIds}
              activeBoardEntryIds={activeBoardEntryIds}
              activeProjectBoard={activeProjectBoard}
            />
          ) : (
            <div className='grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]'>
              <Sidebar groupedSections={atlas.groupedSections} />

              <main className='space-y-5'>
                <DebugPanel validationErrors={validationErrors} />

                {isAtlasView ? (
                  <AtlasView
                    theme={theme}
                    atlas={atlas}
                    topSearchReasons={topSearchReasons}
                    hasPinnedEntries={hasPinnedEntries}
                    pinnedEntries={pinnedEntries}
                    isCompareMode={isCompareMode}
                    compareEntries={compareEntries}
                    compareLinkCopied={compareLinkCopied}
                    highlightedEntryId={highlightedEntryId}
                    compareEntryIds={compareEntryIds}
                    pinnedEntryIds={pinnedEntryIds}
                    activeBoardEntryIds={activeBoardEntryIds}
                    activeProjectBoard={activeProjectBoard}
                    selectedEntry={selectedEntry}
                    recommendedEntries={recommendedEntries}
                    editingEntry={editingEntry}
                    isEditingDirty={isEditingDirty}
                    entryOverrides={entryOverrides}
                    hasSelection={hasSelection}
                    projectBoards={projectBoards}
                    hydratedActiveProjectBoard={hydratedActiveProjectBoard}
                    lastIntentSummaryLabel={lastIntentSummaryLabel}
                    hasBoard={hasBoard}
                    activeProjectBoardId={activeProjectBoardId}
                    directionVersions={directionVersions}
                    hasSavedCollectionsFlag={hasSavedCollectionsFlag}
                    savedCollections={savedCollections}
                    hasCompareHistoryFlag={hasCompareHistoryFlag}
                    compareHistory={compareHistory}
                    hasOverridesFlag={hasOverridesFlag}
                    entries={entries}
                    secondaryToolsOpen={secondaryToolsOpen}
                    secondaryToolsCount={secondaryToolsCount}
                    handleSelectEntry={handleSelectEntry}
                    handleRemovePinnedEntry={handleRemovePinnedEntry}
                    handleClearPinned={handleClearPinned}
                    handleRemoveCompareEntry={handleRemoveCompareEntry}
                    handleClearCompare={handleClearCompare}
                    handleCopyCompareLink={handleCopyCompareLink}
                    handleRelatedClick={handleRelatedClick}
                    handleCompareEntry={handleCompareEntry}
                    handleTogglePinEntry={handleTogglePinEntry}
                    handleAddEntryToBoard={handleAddEntryToBoardWithLogging}
                    handleClearSelection={handleClearSelection}
                    handlePrintEntrySheet={handlePrintEntrySheet}
                    handleOpenEditor={handleOpenEditor}
                    handleSaveEntryOverride={handleSaveEntryOverride}
                    handleCloseEditor={handleCloseEditor}
                    handleResetEntryOverride={handleResetEntryOverride}
                    handleResetAllEntryOverrides={handleResetAllEntryOverrides}
                    handleDesignIntentChange={handleDesignIntentChange}
                    handleCreateProjectBoard={handleCreateProjectBoard}
                    handleOpenProjectBoard={handleOpenProjectBoard}
                    handleDeleteProjectBoard={handleDeleteProjectBoard}
                    handleAddSelectedEntryToBoard={
                      handleAddSelectedEntryToBoard
                    }
                    handleAddComparePairToBoard={handleAddComparePairToBoard}
                    handleRemoveBoardEntry={handleRemoveBoardEntry}
                    handleRemoveEntryFromBoard={handleRemoveEntryFromBoard}
                    handleRemoveBoardComparePair={handleRemoveBoardComparePair}
                    handleOpenCompareHistoryItem={handleOpenCompareHistoryItem}
                    handleUpdateBoardNotes={handleUpdateBoardNotes}
                    handleExportBoardSheet={handleExportBoardSheet}
                    handleSaveDirectionVersion={handleSaveDirectionVersion}
                    handleDeleteDirectionVersion={handleDeleteDirectionVersion}
                    handleRestoreDirectionVersion={
                      handleRestoreDirectionVersionWithLogging
                    }
                    decisionProfile={decisionProfile}
                    onAcceptRecommendation={handleAcceptRecommendation}
                    onIgnoreRecommendation={handleIgnoreRecommendation}
                    onSelectEntry={handleSelectEntry}
                    handleCreateCollectionFromPinned={
                      handleCreateCollectionFromPinned
                    }
                    handleCreateCollectionFromCompare={
                      handleCreateCollectionFromCompare
                    }
                    handleCreateCollectionFromSelectedAndPinned={
                      handleCreateCollectionFromSelectedAndPinned
                    }
                    handleOpenCollection={handleOpenCollection}
                    handleDeleteCollection={handleDeleteCollection}
                    handleRemoveCompareHistoryItem={
                      handleRemoveCompareHistoryItem
                    }
                    handleClearCompareHistory={handleClearCompareHistory}
                    handleExportDataset={handleExportDataset}
                    handleExportOverrides={handleExportOverrides}
                    handleImportPayload={handleImportPayload}
                    setShowSecondaryTools={setShowSecondaryTools}
                  />
                ) : isClusterView ? (
                  <ClusterView
                    atlas={atlas}
                    topSearchReasons={topSearchReasons}
                    semanticClusters={semanticClusters}
                    onSelectEntry={handleSelectEntry}
                    onCompareEntry={handleCompareEntry}
                    onTogglePinEntry={handleTogglePinEntry}
                  />
                ) : isGraphView ? (
                  <GraphView
                    entryGraph={entryGraph}
                    onSelectEntryInGraph={handleSelectEntryInGraph}
                    onCompareEntry={handleCompareEntry}
                    onTogglePinEntry={handleTogglePinEntry}
                  />
                ) : null}
              </main>
            </div>
          )}
        </div>

        <SecondaryToolsDock
          isOpen={showSecondaryTools}
          onClose={() => setShowSecondaryTools(false)}
          width={secondaryToolsDockWidth}
          setWidth={setSecondaryToolsDockWidth}
          boardContext={boardContext}
          decisionContext={decisionContext}
          historyContext={historyContext}
          historyActions={historyActions}
          datasetContext={datasetContext}
          uiContext={uiContext}
          hasBoard={hasBoard}
          hasSavedCollectionsFlag={hasSavedCollectionsFlag}
          hasCompareHistoryFlag={hasCompareHistoryFlag}
          hasOverridesFlag={hasOverridesFlag}
          hasSelection={hasSelection}
        />
        <KeyboardShortcutsHelp
          isOpen={showShortcuts}
          onToggle={toggleShortcuts}
        />
        <Analytics />
      </div>
    </div>
  );
}
