export function sortEntries(entries, sortBy, query = "") {
  const hasQuery = String(query || "").trim().length > 0;

  const sorted = [...entries];

  if (hasQuery) {
    sorted.sort((a, b) => {
      const scoreA = Number(a.__searchScore || 0);
      const scoreB = Number(b.__searchScore || 0);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      return a.term.localeCompare(b.term);
    });

    return sorted;
  }

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "type":
        return a.type.localeCompare(b.type) || a.term.localeCompare(b.term);

      case "scale":
        return a.scale.localeCompare(b.scale) || a.term.localeCompare(b.term);

      case "domain":
        return a.domain.localeCompare(b.domain) || a.term.localeCompare(b.term);

      case "status":
        return a.status.localeCompare(b.status) || a.term.localeCompare(b.term);

      case "region":
        return a.region.localeCompare(b.region) || a.term.localeCompare(b.term);

      case "term":
      default:
        return a.term.localeCompare(b.term);
    }
  });

  return sorted;
}
