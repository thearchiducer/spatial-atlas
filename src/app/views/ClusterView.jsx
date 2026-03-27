import SearchSummaryBar from "../../components/atlas/SearchSummaryBar";
import SemanticClusterPanel from "../../components/atlas/SemanticClusterPanel";

export default function ClusterView({
  atlas,
  topSearchReasons,
  semanticClusters,
  onSelectEntry,
  onCompareEntry,
  onTogglePinEntry,
}) {
  return (
    <>
      <SearchSummaryBar
        filters={{ ...atlas.filters, query: atlas.debouncedQuery }}
        visibleCount={atlas.visibleEntries.length}
        topReasons={topSearchReasons}
      />

      <SemanticClusterPanel
        clusters={semanticClusters}
        onSelectEntry={onSelectEntry}
        onCompareEntry={onCompareEntry}
        onTogglePinEntry={onTogglePinEntry}
      />
    </>
  );
}
