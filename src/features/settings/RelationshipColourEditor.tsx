import type { RelationshipType } from '../../db/types';
import { useRelationshipColourMap } from '../../hooks/useRelationshipColours';
import { updateRelationshipColour } from '../../db/repositories/relationshipColours';

const RELATIONSHIP_TYPES: RelationshipType[] = ['strong', 'weak', 'stressful', 'absent'];

const LABELS: Record<RelationshipType, string> = {
  strong: 'Strong / positive',
  weak: 'Tenuous / weak',
  stressful: 'Stressful / conflictual',
  absent: 'Absent / non-existent',
};

export function RelationshipColourEditor() {
  const colours = useRelationshipColourMap();

  return (
    <div className="lookup-editor">
      <h2>Relationship line colours</h2>
      <p className="lookup-editor-hint">
        The four relationship types are fixed by the tool — only their colour is customisable.
      </p>
      <ul className="lookup-list">
        {RELATIONSHIP_TYPES.map((type) => (
          <li key={type} className="lookup-row">
            <input
              type="color"
              className="colour-input"
              value={colours[type]}
              onChange={(e) => updateRelationshipColour(type, e.target.value)}
            />
            <span className="relationship-colour-label">{LABELS[type]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
