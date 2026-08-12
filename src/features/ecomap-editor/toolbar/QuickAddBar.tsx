import type { Category, EcomapNode } from '../../../db/types';
import { createNode } from '../../../db/repositories/nodes';
import { nextRadialSlot } from '../layout/radialLayout';
import './toolbar.css';

export function QuickAddBar({
  versionId,
  categories,
  nodes,
  isReadOnly,
  onNodeAdded,
}: {
  versionId: string;
  categories: Category[];
  nodes: EcomapNode[];
  isReadOnly: boolean;
  onNodeAdded: (nodeId: string) => void;
}) {
  if (isReadOnly) return null;

  async function handleQuickAdd(category: Category) {
    const existingInCategory = nodes.filter((n) => n.categoryId === category.id).length;
    const { x, y } = nextRadialSlot(category.id, categories, existingInCategory, false);
    const node = await createNode({
      ecomapVersionId: versionId,
      label: `New ${category.name}`,
      categoryId: category.id,
      x,
      y,
    });
    onNodeAdded(node.id);
  }

  return (
    <div className="quick-add-bar no-print">
      {categories.map((category) => (
        <button key={category.id} type="button" className="quick-add-btn" onClick={() => handleQuickAdd(category)}>
          + {category.name}
        </button>
      ))}
    </div>
  );
}
