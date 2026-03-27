import RelationshipGraphPanel from "../../components/atlas/RelationshipGraphPanel";

export default function GraphView({
  entryGraph,
  onSelectEntryInGraph,
  onCompareEntry,
  onTogglePinEntry,
}) {
  return (
    <RelationshipGraphPanel
      graph={entryGraph}
      onSelectEntry={onSelectEntryInGraph}
      onCompareEntry={onCompareEntry}
      onTogglePinEntry={onTogglePinEntry}
    />
  );
}
