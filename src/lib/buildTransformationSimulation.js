import { evaluateBoardDirection } from "./evaluateBoardDirection";
import { getSafeEntryIds } from "./boardUtils";

function normalizeLabel(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

function diffIssueLists(beforeItems = [], afterItems = []) {
  const beforeMap = new Map(
    beforeItems.map((item) => [item.key || normalizeLabel(item.label), item]),
  );
  const afterMap = new Map(
    afterItems.map((item) => [item.key || normalizeLabel(item.label), item]),
  );

  const removed = [...beforeMap.keys()]
    .filter((key) => !afterMap.has(key))
    .map((key) => beforeMap.get(key));

  const introduced = [...afterMap.keys()]
    .filter((key) => !beforeMap.has(key))
    .map((key) => afterMap.get(key));

  return {
    removed,
    introduced,
  };
}

function buildSimulatedBoard(baseBoard, selectedEntryIds) {
  if (!baseBoard) return null;

  const currentIds = getSafeEntryIds(baseBoard);
  const mergedIds = [...currentIds];

  selectedEntryIds.forEach((id) => {
    if (!mergedIds.includes(id)) {
      mergedIds.push(id);
    }
  });

  return {
    ...baseBoard,
    entryIds: mergedIds,
  };
}

export function buildTransformationSimulation({
  previewedTransformation,
  transformationPlan,
  previewSelectedEntryIds,
  boardA,
  boardB,
  entries,
}) {
  if (
    !previewedTransformation ||
    !transformationPlan?.weakerBoard?.boardId ||
    !previewSelectedEntryIds.length
  ) {
    return null;
  }

  const weakerSourceBoard =
    transformationPlan.weakerBoard.boardId === boardA?.id ? boardA : boardB;

  if (!weakerSourceBoard) return null;

  const simulatedBoard = buildSimulatedBoard(
    weakerSourceBoard,
    previewSelectedEntryIds,
  );

  const beforeAnalysis = evaluateBoardDirection(weakerSourceBoard, entries);
  const afterAnalysis = evaluateBoardDirection(simulatedBoard, entries);

  return {
    beforeAnalysis,
    afterAnalysis,
    beforeEntryCount: getSafeEntryIds(weakerSourceBoard).length,
    afterEntryCount: getSafeEntryIds(simulatedBoard).length,
    missingDiff: diffIssueLists(beforeAnalysis.missing, afterAnalysis.missing),
    tensionDiff: diffIssueLists(
      beforeAnalysis.tensions,
      afterAnalysis.tensions,
    ),
  };
}
