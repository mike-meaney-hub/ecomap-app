import type { EcomapNode, EcomapEdge, Category, RelationshipType } from '../../../db/types';
import { computeCategoryStats } from './statsLogic';
import './stats.css';

const TYPE_LABELS: Record<RelationshipType, string> = {
  strong: 'strong',
  weak: 'weak',
  stressful: 'stressful',
  absent: 'absent',
};

const TYPE_ORDER: RelationshipType[] = ['strong', 'weak', 'stressful', 'absent'];

export function StatsPanel({
  nodes,
  edges,
  categories,
}: {
  nodes: EcomapNode[];
  edges: EcomapEdge[];
  categories: Category[];
}) {
  const stats = computeCategoryStats(nodes, edges, categories);

  if (stats.length === 0) {
    return <p className="muted">No categorised nodes yet.</p>;
  }

  return (
    <ul className="stats-list">
      {stats.map((s) => {
        const parts = TYPE_ORDER.filter((t) => s.countsByType[t] > 0).map(
          (t) => `${s.countsByType[t]} ${TYPE_LABELS[t]}`,
        );
        return (
          <li key={s.categoryId} className="stats-row">
            <div className="stats-row-header">
              <span className="stats-category-name">{s.categoryName}</span>
              {s.isIsolated && <span className="stats-isolated-badge">Isolated — no connections</span>}
            </div>
            {parts.length > 0 && <span className="stats-counts">{parts.join(' · ')}</span>}
          </li>
        );
      })}
    </ul>
  );
}
