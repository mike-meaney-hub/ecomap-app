import type { EcomapNode, EcomapEdge, EdgeDirection } from '../../db/types';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface NodeDiffEntry {
  key: string;
  status: DiffStatus;
  nodeA: EcomapNode | null;
  nodeB: EcomapNode | null;
}

export interface EdgeDiffEntry {
  key: string;
  status: DiffStatus;
  edgeA: EcomapEdge | null;
  edgeB: EcomapEdge | null;
}

export interface EcomapDiff {
  nodes: NodeDiffEntry[];
  edges: EdgeDiffEntry[];
}

/**
 * Nodes get fresh random UUIDs whenever a version is duplicated, so there's
 * no FK linking "the same" node across two versions. Matching is heuristic:
 * label + category. Accepted limitation: renaming a node or changing its
 * category is indistinguishable from delete+add under this heuristic.
 */
export function nodeIdentityKey(node: EcomapNode): string {
  if (node.isCentral) return '__central__';
  return `${node.label.trim().toLowerCase()}::${node.categoryId ?? ''}`;
}

function buildNodeKeyMap(nodes: EcomapNode[]): Map<string, EcomapNode> {
  const map = new Map<string, EcomapNode>();
  for (const node of nodes) {
    const key = nodeIdentityKey(node);
    if (!map.has(key)) map.set(key, node); // first wins on rare duplicate labels
  }
  return map;
}

function diffNodes(nodesA: EcomapNode[], nodesB: EcomapNode[]): NodeDiffEntry[] {
  const mapA = buildNodeKeyMap(nodesA);
  const mapB = buildNodeKeyMap(nodesB);
  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);

  const entries: NodeDiffEntry[] = [];
  for (const key of allKeys) {
    const nodeA = mapA.get(key) ?? null;
    const nodeB = mapB.get(key) ?? null;
    let status: DiffStatus;
    if (nodeA && !nodeB) status = 'removed';
    else if (!nodeA && nodeB) status = 'added';
    else {
      status =
        nodeA!.flagId !== nodeB!.flagId || nodeA!.isHouseholdMember !== nodeB!.isHouseholdMember
          ? 'changed'
          : 'unchanged';
    }
    entries.push({ key, status, nodeA, nodeB });
  }
  return entries;
}

/**
 * Edges are matched by the sorted pair of their endpoints' node identity
 * keys (not raw ids, which differ across versions) — so the same
 * relationship matches even if which side is "from" changed. Direction is
 * normalized relative to that canonical sorted order before comparing, so a
 * from/to swap alone never false-positives as "changed".
 */
function edgePairKey(fromKey: string, toKey: string): { pairKey: string; swapped: boolean } {
  const sorted = [fromKey, toKey].sort();
  return { pairKey: sorted.join('|'), swapped: sorted[0] !== fromKey };
}

function normalizeDirection(direction: EdgeDirection, swapped: boolean): EdgeDirection {
  if (!swapped) return direction;
  if (direction === 'oneWayAToB') return 'oneWayBToA';
  if (direction === 'oneWayBToA') return 'oneWayAToB';
  return direction;
}

interface MatchedEdge {
  edge: EcomapEdge;
  normalizedDirection: EdgeDirection;
}

function buildEdgeKeyMap(edges: EcomapEdge[], nodeIdToKey: Map<string, string>): Map<string, MatchedEdge> {
  const map = new Map<string, MatchedEdge>();
  for (const edge of edges) {
    const fromKey = nodeIdToKey.get(edge.fromNodeId);
    const toKey = nodeIdToKey.get(edge.toNodeId);
    if (!fromKey || !toKey) continue; // defensive — shouldn't happen given FK invariants
    const { pairKey, swapped } = edgePairKey(fromKey, toKey);
    if (!map.has(pairKey)) {
      map.set(pairKey, { edge, normalizedDirection: normalizeDirection(edge.direction, swapped) });
    }
  }
  return map;
}

function diffEdges(
  nodesA: EcomapNode[],
  edgesA: EcomapEdge[],
  nodesB: EcomapNode[],
  edgesB: EcomapEdge[],
): EdgeDiffEntry[] {
  const nodeIdToKeyA = new Map(nodesA.map((n) => [n.id, nodeIdentityKey(n)]));
  const nodeIdToKeyB = new Map(nodesB.map((n) => [n.id, nodeIdentityKey(n)]));
  const mapA = buildEdgeKeyMap(edgesA, nodeIdToKeyA);
  const mapB = buildEdgeKeyMap(edgesB, nodeIdToKeyB);
  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);

  const entries: EdgeDiffEntry[] = [];
  for (const key of allKeys) {
    const a = mapA.get(key) ?? null;
    const b = mapB.get(key) ?? null;
    let status: DiffStatus;
    if (a && !b) status = 'removed';
    else if (!a && b) status = 'added';
    else {
      status =
        a!.edge.relationshipType !== b!.edge.relationshipType ||
        a!.normalizedDirection !== b!.normalizedDirection ||
        a!.edge.label !== b!.edge.label
          ? 'changed'
          : 'unchanged';
    }
    entries.push({ key, status, edgeA: a?.edge ?? null, edgeB: b?.edge ?? null });
  }
  return entries;
}

export function computeEcomapDiff(
  nodesA: EcomapNode[],
  edgesA: EcomapEdge[],
  nodesB: EcomapNode[],
  edgesB: EcomapEdge[],
): EcomapDiff {
  return {
    nodes: diffNodes(nodesA, nodesB),
    edges: diffEdges(nodesA, edgesA, nodesB, edgesB),
  };
}
