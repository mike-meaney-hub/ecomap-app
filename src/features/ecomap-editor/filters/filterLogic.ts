import type { EcomapNode, EcomapEdge, RelationshipType } from '../../../db/types';

export interface EcomapFilterState {
  categoryIds: Set<string>;
  flagIds: Set<string>;
  relationshipTypes: Set<RelationshipType>;
  showNotesIndicators: boolean;
}

export const EMPTY_FILTER: EcomapFilterState = {
  categoryIds: new Set(),
  flagIds: new Set(),
  relationshipTypes: new Set(),
  showNotesIndicators: false,
};

export function isFilterActive(filter: EcomapFilterState): boolean {
  return filter.categoryIds.size > 0 || filter.flagIds.size > 0 || filter.relationshipTypes.size > 0;
}

/** Central node always matches — it's structural, not categorised. */
export function nodeMatchesFilter(node: EcomapNode, filter: EcomapFilterState): boolean {
  if (node.isCentral) return true;
  if (filter.categoryIds.size > 0 && !(node.categoryId && filter.categoryIds.has(node.categoryId))) return false;
  if (filter.flagIds.size > 0 && !(node.flagId && filter.flagIds.has(node.flagId))) return false;
  return true;
}

/**
 * The relationship-type filter affects edges only — it must never dim a node
 * just because none of its edges match the selected type.
 */
export function edgeMatchesFilter(
  edge: EcomapEdge,
  nodeById: Map<string, EcomapNode>,
  filter: EcomapFilterState,
): boolean {
  if (filter.relationshipTypes.size > 0 && !filter.relationshipTypes.has(edge.relationshipType)) return false;
  const fromNode = nodeById.get(edge.fromNodeId);
  const toNode = nodeById.get(edge.toNodeId);
  if (!fromNode || !toNode) return false;
  return nodeMatchesFilter(fromNode, filter) && nodeMatchesFilter(toNode, filter);
}
