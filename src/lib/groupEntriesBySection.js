export function groupEntriesBySection(items, sectionList) {
  return sectionList.map((section) => ({
    ...section,
    entries: items.filter((entry) => entry.section === section.id),
  }));
}
