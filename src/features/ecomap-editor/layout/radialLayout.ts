export interface Point {
  x: number;
  y: number;
}

interface LayoutNode {
  id: string;
  categoryId: string | null;
  isCentral: boolean;
  isHouseholdMember: boolean;
}

const BASE_RADIUS = 180;
const RADIUS_STEP = 70;
const HOUSEHOLD_RADIUS_FACTOR = 0.6;
const NODES_PER_RING = 4;

function categoryAngleRange(categoryIndex: number, categoryCount: number) {
  const arc = (2 * Math.PI) / Math.max(categoryCount, 1);
  return { start: categoryIndex * arc, arc };
}

/**
 * Places a single new node into a free-looking slot within its category's arc,
 * without touching any other node's position — safe to call during a live session.
 */
export function nextRadialSlot(
  categoryId: string,
  categories: { id: string }[],
  existingNodesInCategory: number,
  isHouseholdMember: boolean,
): Point {
  const categoryIndex = Math.max(categories.findIndex((c) => c.id === categoryId), 0);
  const { start, arc } = categoryAngleRange(categoryIndex, categories.length);
  const ring = Math.floor(existingNodesInCategory / NODES_PER_RING);
  const posInRing = existingNodesInCategory % NODES_PER_RING;
  const angle = start + (arc * (posInRing + 0.5)) / NODES_PER_RING - Math.PI / 2;
  const radius = (BASE_RADIUS + ring * RADIUS_STEP) * (isHouseholdMember ? HOUSEHOLD_RADIUS_FACTOR : 1);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

/**
 * Recomputes positions for every non-central node, grouped into angular arcs by category.
 * Used once on version creation, and afterward only via an explicit "Reset Layout" action.
 */
export function computeRadialLayout(nodes: LayoutNode[], categories: { id: string }[]): Record<string, Point> {
  const result: Record<string, Point> = {};
  const byCategory = new Map<string, LayoutNode[]>();

  for (const node of nodes) {
    if (node.isCentral) continue;
    const key = node.categoryId ?? '__uncategorised__';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(node);
  }

  for (const [categoryId, catNodes] of byCategory) {
    catNodes.forEach((node, i) => {
      result[node.id] = nextRadialSlot(categoryId, categories, i, node.isHouseholdMember);
    });
  }

  return result;
}
