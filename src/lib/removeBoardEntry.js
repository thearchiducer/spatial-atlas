export function removeEntryFromBoard(board, entryId) {
  if (!board || !entryId) return board;

  const nextEntries = Array.isArray(board.entries)
    ? board.entries.filter((entry) => entry && entry.id !== entryId)
    : [];

  const nextComparePairs = Array.isArray(board.comparePairs)
    ? board.comparePairs.filter((pair) => {
        const leftId = pair?.left?.id || pair?.leftId || null;
        const rightId = pair?.right?.id || pair?.rightId || null;

        return leftId !== entryId && rightId !== entryId;
      })
    : [];

  return {
    ...board,
    entries: nextEntries,
    comparePairs: nextComparePairs,
    updatedAt: new Date().toISOString(),
  };
}

export function removeEntryFromBoards(boards, boardId, entryId) {
  if (!Array.isArray(boards) || !boardId || !entryId) {
    return Array.isArray(boards) ? boards : [];
  }

  return boards.map((board) => {
    if (!board || board.id !== boardId) return board;
    return removeEntryFromBoard(board, entryId);
  });
}
