export function getSafeEntryIds(board) {
  return Array.isArray(board?.entryIds) ? board.entryIds : [];
}

export function getSafeComparePairs(board) {
  return Array.isArray(board?.comparePairs) ? board.comparePairs : [];
}

export function normalizeEntryIds(board) {
  if (!board) return [];

  if (Array.isArray(board.entryIds)) {
    return board.entryIds.filter(Boolean);
  }

  if (Array.isArray(board.entries)) {
    return board.entries
      .map((entry) => (typeof entry === "string" ? entry : entry?.id))
      .filter(Boolean);
  }

  return [];
}
