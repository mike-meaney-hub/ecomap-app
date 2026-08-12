import type { Category, ColourFlag, RelationshipType } from '../../../db/types';
import { useRelationshipColourMap } from '../../../hooks/useRelationshipColours';
import { EMPTY_FILTER, isFilterActive, type EcomapFilterState } from './filterLogic';
import './filters.css';

const RELATIONSHIP_TYPES: RelationshipType[] = ['strong', 'weak', 'stressful', 'absent'];
const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  strong: 'Strong / positive',
  weak: 'Tenuous / weak',
  stressful: 'Stressful / conflictual',
  absent: 'Absent / non-existent',
};

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function FilterControls({
  categories,
  flags,
  filter,
  onChange,
}: {
  categories: Category[];
  flags: ColourFlag[];
  filter: EcomapFilterState;
  onChange: (filter: EcomapFilterState) => void;
}) {
  const relationshipColours = useRelationshipColourMap();

  return (
    <div className="filter-controls">
      <div className="filter-group">
        <h4>Category</h4>
        <ul className="filter-checkbox-list">
          {categories.map((c) => (
            <li key={c.id}>
              <label>
                <input
                  type="checkbox"
                  checked={filter.categoryIds.has(c.id)}
                  onChange={() => onChange({ ...filter, categoryIds: toggle(filter.categoryIds, c.id) })}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h4>Colour flag</h4>
        <ul className="filter-checkbox-list">
          {flags.map((f) => (
            <li key={f.id}>
              <label>
                <input
                  type="checkbox"
                  checked={filter.flagIds.has(f.id)}
                  onChange={() => onChange({ ...filter, flagIds: toggle(filter.flagIds, f.id) })}
                />
                <span className="filter-swatch" style={{ background: f.colour }} />
                {f.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h4>Relationship type</h4>
        <ul className="filter-checkbox-list">
          {RELATIONSHIP_TYPES.map((type) => (
            <li key={type}>
              <label>
                <input
                  type="checkbox"
                  checked={filter.relationshipTypes.has(type)}
                  onChange={() =>
                    onChange({ ...filter, relationshipTypes: toggle(filter.relationshipTypes, type) })
                  }
                />
                <span className="filter-swatch" style={{ background: relationshipColours[type] }} />
                {RELATIONSHIP_LABELS[type]}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <label className="filter-notes-toggle">
        <input
          type="checkbox"
          checked={filter.showNotesIndicators}
          onChange={() => onChange({ ...filter, showNotesIndicators: !filter.showNotesIndicators })}
        />
        Show notes indicators
      </label>

      {isFilterActive(filter) && (
        <button type="button" className="filter-clear-btn" onClick={() => onChange({ ...EMPTY_FILTER, showNotesIndicators: filter.showNotesIndicators })}>
          Clear filters
        </button>
      )}
    </div>
  );
}
