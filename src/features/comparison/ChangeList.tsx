import type { EcomapEdge, EcomapNode, Category, RelationshipType } from '../../db/types';
import type { EcomapDiff, EdgeDiffEntry } from './diffLogic';

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  strong: 'strong',
  weak: 'weak',
  stressful: 'stressful',
  absent: 'absent',
};

function edgeSummary(edge: EcomapEdge, nodeById: Map<string, EcomapNode>): string {
  const from = nodeById.get(edge.fromNodeId)?.label ?? '?';
  const to = nodeById.get(edge.toNodeId)?.label ?? '?';
  return `${from} ↔ ${to}`;
}

function edgeChangeDetail(entry: EdgeDiffEntry): string {
  if (!entry.edgeA || !entry.edgeB) return '';
  const parts: string[] = [];
  if (entry.edgeA.relationshipType !== entry.edgeB.relationshipType) {
    parts.push(`${RELATIONSHIP_LABELS[entry.edgeA.relationshipType]} → ${RELATIONSHIP_LABELS[entry.edgeB.relationshipType]}`);
  }
  if (entry.edgeA.direction !== entry.edgeB.direction) {
    parts.push('direction changed');
  }
  if (entry.edgeA.label !== entry.edgeB.label) {
    parts.push('note changed');
  }
  return parts.join(', ');
}

export function ChangeList({
  diff,
  categories,
  nodesA,
  nodesB,
}: {
  diff: EcomapDiff;
  categories: Category[];
  nodesA: EcomapNode[];
  nodesB: EcomapNode[];
}) {
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Uncategorised';
  const nodeByIdA = new Map(nodesA.map((n) => [n.id, n]));
  const nodeByIdB = new Map(nodesB.map((n) => [n.id, n]));

  const addedNodes = diff.nodes.filter((n) => n.status === 'added');
  const removedNodes = diff.nodes.filter((n) => n.status === 'removed');
  const changedNodes = diff.nodes.filter((n) => n.status === 'changed');
  const addedEdges = diff.edges.filter((e) => e.status === 'added');
  const removedEdges = diff.edges.filter((e) => e.status === 'removed');
  const changedEdges = diff.edges.filter((e) => e.status === 'changed');

  const nothingChanged =
    addedNodes.length === 0 &&
    removedNodes.length === 0 &&
    changedNodes.length === 0 &&
    addedEdges.length === 0 &&
    removedEdges.length === 0 &&
    changedEdges.length === 0;

  if (nothingChanged) {
    return <p className="muted">No differences between these two versions.</p>;
  }

  function nodeLine(node: EcomapNode) {
    return `${node.label} (${categoryName(node.categoryId)})`;
  }

  return (
    <div className="change-list">
      {(addedNodes.length > 0 || addedEdges.length > 0) && (
        <div className="change-group change-group-added">
          <h3>Added</h3>
          <ul>
            {addedNodes.map((n) => <li key={`n-${n.key}`}>{nodeLine(n.nodeB!)}</li>)}
            {addedEdges.map((e) => <li key={`e-${e.key}`}>{edgeSummary(e.edgeB!, nodeByIdB)}</li>)}
          </ul>
        </div>
      )}

      {(removedNodes.length > 0 || removedEdges.length > 0) && (
        <div className="change-group change-group-removed">
          <h3>Removed</h3>
          <ul>
            {removedNodes.map((n) => <li key={`n-${n.key}`}>{nodeLine(n.nodeA!)}</li>)}
            {removedEdges.map((e) => <li key={`e-${e.key}`}>{edgeSummary(e.edgeA!, nodeByIdA)}</li>)}
          </ul>
        </div>
      )}

      {(changedNodes.length > 0 || changedEdges.length > 0) && (
        <div className="change-group change-group-changed">
          <h3>Changed</h3>
          <ul>
            {changedNodes.map((n) => <li key={`n-${n.key}`}>{n.nodeB!.label} — colour flag or household status changed</li>)}
            {changedEdges.map((e) => (
              <li key={`e-${e.key}`}>{edgeSummary(e.edgeB!, nodeByIdB)} — {edgeChangeDetail(e)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
