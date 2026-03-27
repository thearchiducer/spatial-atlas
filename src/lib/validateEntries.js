import { validateEntry } from "./validateEntry.js";

export function validateEntries(entries) {
  const errors = [];
  const seenIds = new Map();
  const seenTerms = new Map();

  entries.forEach((entry, index) => {
    const location = `Entry ${index + 1}${entry?.id ? ` (${entry.id})` : ""}`;

    const entryIssues = validateEntry(entry);
    entryIssues.forEach((issue) => {
      errors.push(`${location}: ${issue.toLowerCase()}`);
    });

    if (entry?.id) {
      if (seenIds.has(entry.id)) {
        errors.push(
          `${location}: duplicate id "${entry.id}" also used by ${seenIds.get(entry.id)}`,
        );
      } else {
        seenIds.set(entry.id, location);
      }
    }

    if (entry?.term) {
      const normalizedTerm = entry.term.trim().toLowerCase();

      if (seenTerms.has(normalizedTerm)) {
        errors.push(
          `${location}: duplicate term "${entry.term}" also used by ${seenTerms.get(normalizedTerm)}`,
        );
      } else {
        seenTerms.set(normalizedTerm, location);
      }
    }
  });

  return errors;
}
