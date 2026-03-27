import { useCallback } from "react";
import { getSafeEntryIds } from "../../lib/boardUtils";

function buildProjectBoardPayload(name, description, intentSummaryLabel) {
  const now = new Date().toISOString();

  return {
    id: "board-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    name,
    description,
    notes: "",
    intentSummaryLabel: intentSummaryLabel || "",
    entryIds: [],
    comparePairs: [],
    createdAt: now,
    createdAtLabel: new Date(now).toLocaleString(),
    updatedAt: now,
    updatedAtLabel: new Date(now).toLocaleString(),
  };
}

function touchBoard(board) {
  const now = new Date().toISOString();

  return {
    ...board,
    updatedAt: now,
    updatedAtLabel: new Date(now).toLocaleString(),
  };
}

export default function useAtlasBoardActions({
  setProjectBoards,
  activeProjectBoardId,
  setActiveProjectBoardId,
  lastIntentSummaryLabel,
}) {
  const handleCreateProjectBoard = useCallback(() => {
    const fallbackName = "Project board";
    const fallbackDescription = "Working board for applied spatial research.";

    const namePrompt = window.prompt("Board name", fallbackName);
    const name = namePrompt ? namePrompt.trim() : fallbackName;
    if (!name) return;

    const descriptionPrompt = window.prompt(
      "Board description",
      fallbackDescription,
    );
    const description = descriptionPrompt ? descriptionPrompt.trim() : "";

    const nextBoard = buildProjectBoardPayload(
      name,
      description,
      lastIntentSummaryLabel,
    );

    setProjectBoards((current) => [nextBoard, ...current]);
    setActiveProjectBoardId(nextBoard.id);
  }, [setProjectBoards, setActiveProjectBoardId, lastIntentSummaryLabel]);

  const handleOpenProjectBoard = useCallback(
    (boardId) => {
      setActiveProjectBoardId(boardId);
    },
    [setActiveProjectBoardId],
  );

  const handleDeleteProjectBoard = useCallback(
    (boardId) => {
      setProjectBoards((current) => {
        const remainingBoards = current.filter((board) => board.id !== boardId);

        if (activeProjectBoardId === boardId) {
          setActiveProjectBoardId(
            remainingBoards.length ? remainingBoards[0].id : null,
          );
        }

        return remainingBoards;
      });
    },
    [setProjectBoards, activeProjectBoardId, setActiveProjectBoardId],
  );

  const handleAddEntryToBoard = useCallback(
    (entryId) => {
      if (!activeProjectBoardId || !entryId) return;

      setProjectBoards((current) =>
        current.map((board) => {
          if (board.id !== activeProjectBoardId) return board;

          const entryIds = getSafeEntryIds(board);
          if (entryIds.includes(entryId)) return board;

          return touchBoard({
            ...board,
            entryIds: [...entryIds, entryId],
            intentSummaryLabel:
              lastIntentSummaryLabel || board.intentSummaryLabel,
          });
        }),
      );
    },
    [setProjectBoards, activeProjectBoardId, lastIntentSummaryLabel],
  );

  const handleRemoveEntryFromBoard = useCallback(
    (entryId) => {
      if (!activeProjectBoardId || !entryId) return;

      setProjectBoards((current) =>
        current.map((board) => {
          if (board.id !== activeProjectBoardId) return board;

          return touchBoard({
            ...board,
            entryIds: getSafeEntryIds(board).filter((id) => id !== entryId),
            comparePairs: (Array.isArray(board.comparePairs)
              ? board.comparePairs
              : []
            ).filter((pair) => {
              const ids = Array.isArray(pair?.ids)
                ? pair.ids
                : [pair?.leftId, pair?.rightId].filter(Boolean);

              return !ids.includes(entryId);
            }),
          });
        }),
      );
    },
    [setProjectBoards, activeProjectBoardId],
  );

  const handleAddComparePairToBoard = useCallback(
    (pair) => {
      if (!activeProjectBoardId || !pair) return;

      setProjectBoards((current) =>
        current.map((board) => {
          if (board.id !== activeProjectBoardId) return board;

          const alreadyExists = board.comparePairs.some(
            (item) => item.key === pair.key,
          );
          if (alreadyExists) return board;

          return touchBoard({
            ...board,
            comparePairs: [pair, ...board.comparePairs],
            intentSummaryLabel:
              lastIntentSummaryLabel || board.intentSummaryLabel,
          });
        }),
      );
    },
    [setProjectBoards, activeProjectBoardId, lastIntentSummaryLabel],
  );

  const handleRemoveBoardComparePair = useCallback(
    (pairKey) => {
      if (!activeProjectBoardId || !pairKey) return;

      setProjectBoards((current) =>
        current.map((board) => {
          if (board.id !== activeProjectBoardId) return board;

          return touchBoard({
            ...board,
            comparePairs: board.comparePairs.filter(
              (pair) => pair.key !== pairKey,
            ),
          });
        }),
      );
    },
    [setProjectBoards, activeProjectBoardId],
  );

  const handleUpdateBoardNotes = useCallback(
    (notes) => {
      if (!activeProjectBoardId) return;

      setProjectBoards((current) =>
        current.map((board) => {
          if (board.id !== activeProjectBoardId) return board;

          return touchBoard({
            ...board,
            notes,
            intentSummaryLabel:
              lastIntentSummaryLabel || board.intentSummaryLabel,
          });
        }),
      );
    },
    [setProjectBoards, activeProjectBoardId, lastIntentSummaryLabel],
  );

  return {
    handleCreateProjectBoard,
    handleOpenProjectBoard,
    handleDeleteProjectBoard,
    handleAddEntryToBoard,
    handleRemoveEntryFromBoard,
    handleAddComparePairToBoard,
    handleRemoveBoardComparePair,
    handleUpdateBoardNotes,
  };
}
