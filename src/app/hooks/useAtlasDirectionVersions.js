import { useCallback } from "react";
import { buildDirectionVersionSnapshot } from "../../lib/directionVersions";
import { getSafeComparePairs, getSafeEntryIds } from "../../lib/boardUtils";

export default function useAtlasDirectionVersions({
  directionVersions,
  setDirectionVersions,
  hydratedActiveProjectBoard,
  activeProjectBoardId,
  setProjectBoards,
  setActiveProjectBoardId,
}) {
  const handleSaveDirectionVersion = useCallback(() => {
    if (!hydratedActiveProjectBoard) return;

    const snapshot = buildDirectionVersionSnapshot(hydratedActiveProjectBoard);
    if (!snapshot) return;

    setDirectionVersions((current) => [snapshot, ...current]);
  }, [hydratedActiveProjectBoard, setDirectionVersions]);

  const handleDeleteDirectionVersion = useCallback(
    (snapshotId) => {
      setDirectionVersions((current) =>
        current.filter((snapshot) => snapshot.id !== snapshotId),
      );
    },
    [setDirectionVersions],
  );

  const handleRestoreDirectionVersion = useCallback(
    (snapshotId) => {
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
    },
    [
      directionVersions,
      activeProjectBoardId,
      hydratedActiveProjectBoard,
      setProjectBoards,
      setActiveProjectBoardId,
    ],
  );

  return {
    handleSaveDirectionVersion,
    handleDeleteDirectionVersion,
    handleRestoreDirectionVersion,
  };
}
