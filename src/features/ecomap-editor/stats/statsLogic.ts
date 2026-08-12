import type { EcomapNode, EcomapEdge, Category, RelationshipType } from '../../../db/types';

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  nodeCount: number;
  countsByType: Record<RelationshipType, number>;
  isIsolated: boolean;
}

function emptyCounts(): Record<RelationshipType, number> {
  return { strong: 0, weak: 0, stressful: 0, absent: 0 };
}

/**
 * Per-category connection counts and an "isolated" flag (has nodes, but none
 * of them carry any edge). Categories with zero nodes are omitted entirely —
 * that's "not relevant to this case," not a gap worth flagging.
 */
export function computeCategoryStats(
  nodes: EcomapNode[],
  edges: EcomapEdge[],
  categories: Category[],
): CategoryStats[] {
  const nodeIdsWithAnyEdge = new Set<string>();
  for (const edge of edges) {
    nodeIdsWithAnyEdge.add(edge.fromNodeId);
    nodeIdsWithAnyEdge.add(edge.toNodeId);
  }

  const nonCentralNodes = nodes.filter((n) => !n.isCentral);

  return categories
    .map((category): CategoryStats => {
      const catNodes = nonCentralNodes.filter((n) => n.categoryId === category.id);
      const catNodeIds = new Set(catNodes.map((n) => n.id));
      const countsByType = emptyCounts();

      for (const edge of edges) {
        if (catNodeIds.has(edge.fromNodeId) || catNodeIds.has(edge.toNodeId)) {
          countsByType[edge.relationshipType] += 1;
        }
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        nodeCount: catNodes.length,
        countsByType,
        isIsolated: catNodes.length > 0 && !catNodes.some((n) => nodeIdsWithAnyEdge.has(n.id)),
      };
    })
    .filter((stats) => stats.nodeCount > 0);
}
